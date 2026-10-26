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


        const numero = 'PROMO-FAB-BENCH-20261022144538396-580d7e-01';

        async function lireActe() {
            const resultat = await contract.evaluateTransaction(
                'ReadAct',
                numero
            );
            return JSON.parse(Buffer.from(resultat).toString('utf8'));
        }

        const avant = await lireActe();

        console.log('=== TEST DE CONTRÔLE DES ACCÈS ===');
        console.log('Institution appelante : Org1MSP');
        console.log('Opération demandée : ApproveByCF');
        console.log('Institution autorisée : Org2MSP');
        console.log('Statut avant :', avant.statut);

        if (avant.statut !== 'CREE') {
            throw new Error('Précondition non satisfaite : acte non CREE');
        }

        let refusObserve = false;

        try {
            await contract.submitTransaction('ApproveByCF', numero);
            console.log('ÉCHEC DU TEST : visa accepté par Org1MSP');
        } catch (erreur) {
            const message = String(erreur.message || erreur);
            console.log('Refus reçu :', message);
            console.log('Nom de l erreur :', erreur.name);
            console.log('Code gRPC :', erreur.code);
            console.log(
                'Détails Gateway :',
                JSON.stringify(erreur.details || [], null, 2)
            );

            const details = Array.isArray(erreur.details)
                ? erreur.details.map(d => d.message || '').join(' ')
                : '';

            if (
                details.includes('Accès refusé') &&
                details.includes('Org1MSP') &&
                details.includes('Org2MSP')
            ) {
                refusObserve = true;
            }
        }

        const apres = await lireActe();

        console.log('Statut après :', apres.statut);

        if (
            refusObserve &&
            avant.statut === apres.statut &&
            JSON.stringify(avant) === JSON.stringify(apres)
        ) {
            console.log('RÉSULTAT : TEST RÉUSSI');
            console.log('Accès refusé et état inchangé.');
        } else {
            throw new Error(
                'TEST ÉCHOUÉ : refus non confirmé ou état modifié'
            );
        }

    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('Erreur Gateway :', error.message);
    process.exitCode = 1;
});
