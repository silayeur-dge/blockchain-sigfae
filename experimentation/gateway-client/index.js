'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');

const {
    connect,
    signers
} = require('@hyperledger/fabric-gateway');

const NETWORK = path.resolve(
    __dirname,
    '../../fabric-samples/test-network'
);

const ORG = path.join(
    NETWORK,
    'organizations/peerOrganizations/org1.example.com'
);

const ADMIN = path.join(
    ORG,
    'users/Admin@org1.example.com/msp'
);

async function main() {
    const certPath = path.join(
        ADMIN,
        'signcerts/Admin@org1.example.com-cert.pem'
    );

    const keyDir = path.join(ADMIN, 'keystore');

    const keyFile = fs.readdirSync(keyDir)
        .find(file => fs.statSync(path.join(keyDir, file)).isFile());

    if (!keyFile) {
        throw new Error('Clé privée administrateur introuvable');
    }

    const tlsPath = path.join(
        ORG,
        'peers/peer0.org1.example.com/tls/ca.crt'
    );

    const certificate = fs.readFileSync(certPath);

    const privateKey = crypto.createPrivateKey(
        fs.readFileSync(path.join(keyDir, keyFile))
    );

    const tlsCertificate = fs.readFileSync(tlsPath);

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
        const network = gateway.getNetwork('sigfae');

        const contract = network.getContract('gestionactes');

        console.log('Connexion Gateway établie.');
        console.log('Lecture de PROMO-2026-002...');

        const result = await contract.evaluateTransaction(
            'ReadAct',
            'PROMO-2026-002'
        );

        const acte = JSON.parse(
            Buffer.from(result).toString('utf8')
        );

        console.log('\n=== ACTE RETROUVÉ ===');
        console.log(JSON.stringify(acte, null, 2));

    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('Erreur Gateway :', error.message);
    process.exitCode = 1;
});
