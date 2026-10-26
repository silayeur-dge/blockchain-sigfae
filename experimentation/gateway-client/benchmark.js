'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');
const { performance } = require('perf_hooks');
const { connect, signers } = require('@hyperledger/fabric-gateway');

const NETWORK = path.resolve(__dirname, '../../fabric-samples/test-network');
const ORG = path.join(
    NETWORK,
    'organizations/peerOrganizations/org1.example.com'
);
const ADMIN = path.join(ORG, 'users/Admin@org1.example.com/msp');

const WARMUP = 10;
const RUNS = 100;
const ACT = 'PROMO-2026-002';

function percentile(sorted, p) {
    return sorted[Math.ceil((p / 100) * sorted.length) - 1];
}

async function main() {
    const certificate = fs.readFileSync(
        path.join(ADMIN, 'signcerts/Admin@org1.example.com-cert.pem')
    );

    const keyDir = path.join(ADMIN, 'keystore');
    const keyFile = fs.readdirSync(keyDir).find(
        name => fs.statSync(path.join(keyDir, name)).isFile()
    );

    if (!keyFile) throw new Error('Clé privée introuvable');

    const privateKey = crypto.createPrivateKey(
        fs.readFileSync(path.join(keyDir, keyFile))
    );

    const tlsCertificate = fs.readFileSync(
        path.join(ORG, 'peers/peer0.org1.example.com/tls/ca.crt')
    );

    const client = new grpc.Client(
        'localhost:7051',
        grpc.credentials.createSsl(tlsCertificate),
        {
            'grpc.ssl_target_name_override': 'peer0.org1.example.com'
        }
    );

    const gateway = connect({
        client,
        identity: {
            mspId: 'Org1MSP',
            credentials: certificate
        },
        signer: signers.newPrivateKeySigner(privateKey),
        evaluateOptions: () => ({
            deadline: Date.now() + 10000
        })
    });

    try {
        const contract = gateway
            .getNetwork('sigfae')
            .getContract('gestionactes');

        async function readAct() {
            const start = performance.now();

            const result = await contract.evaluateTransaction(
                'ReadAct',
                ACT
            );

            const duration = performance.now() - start;
            const act = JSON.parse(Buffer.from(result).toString('utf8'));

            if (act.numeroActe !== ACT ||
                act.statut !== 'PRIS_EN_COMPTE_SOLDE') {
                throw new Error('Réponse Fabric inattendue');
            }

            return duration;
        }

        console.log('Échauffement en cours...');

        for (let i = 0; i < WARMUP; i++) {
            await readAct();
        }

        console.log('Mesures en cours...');

        const durations = [];

        for (let i = 0; i < RUNS; i++) {
            durations.push(await readAct());

            if ((i + 1) % 20 === 0) {
                console.log(`${i + 1}/${RUNS} lectures effectuées`);
            }
        }

        const sorted = [...durations].sort((a, b) => a - b);
        const mean = durations.reduce((a, b) => a + b, 0) / RUNS;
        const median = (sorted[49] + sorted[50]) / 2;

        const output = path.resolve(
            __dirname,
            '../resultats/lecture_fabric_gateway.csv'
        );

        fs.mkdirSync(path.dirname(output), { recursive: true });

        const csv = [
            'iteration,duree_ms',
            ...durations.map((value, i) =>
                `${i + 1},${value.toFixed(6)}`
            )
        ].join('\n') + '\n';

        fs.writeFileSync(output, csv);

        console.log('\nArchitecture : Hyperledger Fabric');
        console.log('Mode : Gateway gRPC persistant');
        console.log(`Échauffement : ${WARMUP}`);
        console.log(`Mesures : ${RUNS}`);
        console.log(`Moyenne : ${mean.toFixed(3)} ms`);
        console.log(`Médiane : ${median.toFixed(3)} ms`);
        console.log(`P95 : ${percentile(sorted, 95).toFixed(3)} ms`);
        console.log(`Minimum : ${sorted[0].toFixed(3)} ms`);
        console.log(`Maximum : ${sorted[RUNS - 1].toFixed(3)} ms`);
        console.log(`CSV : ${output}`);

    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('Erreur :', error);
    process.exitCode = 1;
});
