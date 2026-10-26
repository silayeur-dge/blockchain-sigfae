'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');
const { performance } = require('perf_hooks');
const { connect, signers } = require('@hyperledger/fabric-gateway');

const NETWORK = path.resolve(
    __dirname, '../../fabric-samples/test-network'
);

const ACT = 'PROMO-2026-002';
const WARMUP = 5;
const RUNS = 30;

const ORGANISATIONS = [
    { institution: 'FP', org: 'org1', msp: 'Org1MSP',
      peer: 'peer0.org1.example.com', port: 7051 },
    { institution: 'CF', org: 'org2', msp: 'Org2MSP',
      peer: 'peer0.org2.example.com', port: 9051 },
    { institution: 'SOLDE', org: 'org3', msp: 'Org3MSP',
      peer: 'peer0.org3.example.com', port: 11051 }
];

async function mesurer(config) {
    const orgPath = path.join(
        NETWORK,
        'organizations/peerOrganizations',
        `${config.org}.example.com`
    );

    const admin = path.join(
        orgPath,
        'users',
        `Admin@${config.org}.example.com`,
        'msp'
    );

    const certificat = fs.readFileSync(
        path.join(
            admin,
            'signcerts',
            `Admin@${config.org}.example.com-cert.pem`
        )
    );

    const repertoireCles = path.join(admin, 'keystore');
    const cle = fs.readdirSync(repertoireCles).find(
        nom => fs.statSync(
            path.join(repertoireCles, nom)
        ).isFile()
    );

    if (!cle) throw new Error('Clé privée introuvable');

    const privateKey = crypto.createPrivateKey(
        fs.readFileSync(path.join(repertoireCles, cle))
    );

    const tls = fs.readFileSync(
        path.join(
            orgPath, 'peers', config.peer, 'tls', 'ca.crt'
        )
    );

    const client = new grpc.Client(
        `localhost:${config.port}`,
        grpc.credentials.createSsl(tls),
        {
            'grpc.ssl_target_name_override': config.peer
        }
    );

    let gateway;

    try {
        gateway = connect({
            client,
            identity: {
                mspId: config.msp,
                credentials: certificat
            },
            signer: signers.newPrivateKeySigner(privateKey),
            evaluateOptions: () => ({
                deadline: Date.now() + 10000
            })
        });

        const contract = gateway
            .getNetwork('sigfae')
            .getContract('gestionactes');

        async function lire() {
            const debut = performance.now();

            const reponse = await contract.evaluateTransaction(
                'ReadAct', ACT
            );

            const duree = performance.now() - debut;

            const acte = JSON.parse(
                Buffer.from(reponse).toString('utf8')
            );

            if (
                acte.numeroActe !== ACT ||
                acte.statut !== 'PRIS_EN_COMPTE_SOLDE'
            ) {
                throw new Error(
                    'Réponse blockchain inattendue'
                );
            }

            return duree;
        }

        for (let i = 0; i < WARMUP; i++) {
            await lire();
        }

        const durees = [];

        for (let i = 0; i < RUNS; i++) {
            durees.push(await lire());
        }

        const triees = [...durees].sort((a, b) => a - b);
        const moyenne = durees.reduce(
            (total, valeur) => total + valeur, 0
        ) / durees.length;

        const mediane = (
            triees[14] + triees[15]
        ) / 2;

        console.log(
            `${config.institution} : ` +
            `${RUNS} lectures réussies | ` +
            `moyenne ${moyenne.toFixed(3)} ms | ` +
            `médiane ${mediane.toFixed(3)} ms`
        );

        return {
            institution: config.institution,
            msp: config.msp,
            peer: config.peer,
            port: config.port,
            echauffement: WARMUP,
            mesures: RUNS,
            durees_ms: durees,
            moyenne_ms: moyenne,
            mediane_ms: mediane,
            minimum_ms: triees[0],
            maximum_ms: triees[triees.length - 1]
        };
    } finally {
        if (gateway) gateway.close();
        client.close();
    }
}

async function main() {
    const destination = path.resolve(
        __dirname,
        '../resultats/performances_fabric_gateway_comparatif.json'
    );

    if (fs.existsSync(destination)) {
        throw new Error(
            'Fichier de résultats déjà présent : aucun écrasement'
        );
    }

    const resultats = [];

    for (const organisation of ORGANISATIONS) {
        resultats.push(await mesurer(organisation));
    }

    const document = {
        architecture: 'Hyperledger Fabric',
        methode: 'Gateway gRPC persistant',
        canal: 'sigfae',
        chaincode: 'gestionactes',
        fonction: 'ReadAct',
        acte: ACT,
        resultats
    };

    fs.writeFileSync(
        destination,
        JSON.stringify(document, null, 2) + '\n',
        { flag: 'wx' }
    );

    console.log('\nMesures totales :', RUNS * resultats.length);
    console.log('Résultats enregistrés :', destination);
}

main().catch(error => {
    console.error('ERREUR :', error.message);
    process.exitCode = 1;
});
