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

const RUNS = 10;

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
        endorseOptions: () => ({
            deadline: Date.now() + 15000
        }),
        submitOptions: () => ({
            deadline: Date.now() + 15000
        }),
        commitStatusOptions: () => ({
            deadline: Date.now() + 15000
        }),
        evaluateOptions: () => ({
            deadline: Date.now() + 10000
        })
    });

    const results = [];
    const campaign = new Date().toISOString()
        .replace(/[-:.TZ]/g, '')
        + '-' + crypto.randomBytes(3).toString('hex');

    const output = path.resolve(
        __dirname,
        `../resultats/ecriture_fabric_gateway_${campaign}.csv`
    );

    function saveResults() {
        fs.mkdirSync(path.dirname(output), { recursive: true });

        const csv = [
            'iteration,numero_acte,duree_ms,statut',
            ...results.map(r =>
                `${r.iteration},${r.numero},${r.duree.toFixed(6)},${r.statut}`
            )
        ].join('\n') + '\n';

        fs.writeFileSync(output, csv);
    }

    try {
        const contract = gateway
            .getNetwork('sigfae')
            .getContract('gestionactes');

        console.log('=== CAMPAGNE ÉCRITURE FABRIC ===');
        console.log('Transactions :', RUNS);
        console.log('Campagne :', campaign);
        console.log('Mode : Gateway gRPC persistant');
        console.log('BatchTimeout actif : 2s (vérifié précédemment)');
        console.log();

        for (let i = 1; i <= RUNS; i++) {
            const numero = `PROMO-FAB-BENCH-${campaign}-${String(i).padStart(2, '0')}`;

            console.log(`Écriture ${i}/${RUNS} : ${numero}`);

            const start = performance.now();

            await contract.submitTransaction(
                'CreateAct',
                numero,
                `FICTIF-BENCH-${String(i).padStart(3, '0')}`,
                `Agent Fictif Benchmark ${i}`,
                'Promotion'
            );

            const duree = performance.now() - start;

            const response = await contract.evaluateTransaction(
                'ReadAct',
                numero
            );

            const acte = JSON.parse(
                Buffer.from(response).toString('utf8')
            );

            if (acte.numeroActe !== numero || acte.statut !== 'CREE') {
                throw new Error(`Vérification échouée pour ${numero}`);
            }

            results.push({
                iteration: i,
                numero,
                duree,
                statut: 'CONFIRME'
            });

            saveResults();

            console.log(`  Confirmée : ${duree.toFixed(3)} ms\n`);
        }

        const durations = results.map(r => r.duree);
        const sorted = [...durations].sort((a, b) => a - b);

        const mean = durations.reduce((a, b) => a + b, 0) / RUNS;
        const median = (sorted[4] + sorted[5]) / 2;

        console.log('=== RÉSULTATS ===');
        console.log(`Écritures confirmées : ${results.length}/${RUNS}`);
        console.log(`Moyenne : ${mean.toFixed(3)} ms`);
        console.log(`Médiane : ${median.toFixed(3)} ms`);
        console.log(`Minimum : ${sorted[0].toFixed(3)} ms`);
        console.log(`Maximum : ${sorted[RUNS - 1].toFixed(3)} ms`);
        console.log(`CSV : ${output}`);

    } finally {
        saveResults();
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('Erreur :', error);
    process.exitCode = 1;
});
