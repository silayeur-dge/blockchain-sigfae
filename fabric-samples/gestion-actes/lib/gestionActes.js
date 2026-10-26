
'use strict';

const { Contract } = require('fabric-contract-api');

class GestionActes extends Contract {

    // Horodatage déterministe de la transaction Fabric.
    getTransactionDate(ctx) {
        const timestamp = ctx.stub.getTxTimestamp();

        const seconds = Number(timestamp.seconds.toString());
        const nanos = timestamp.nanos;

        return new Date(
            seconds * 1000 + Math.floor(nanos / 1000000)
        ).toISOString();
    }

    // Lecture centralisée avec vérification d'existence.
    async getActe(ctx, numeroActe) {
        const data = await ctx.stub.getState(numeroActe);

        if (!data || data.length === 0) {
            throw new Error(
                `Acte ${numeroActe} introuvable`
            );
        }

        return JSON.parse(data.toString());
    }

    // 1. Création du projet d'acte
    async CreateAct(
        ctx,
        numeroActe,
        matricule,
        nomAgent,
        typeActe
    ) {
        this.verifierOrganisation(ctx, 'Org1MSP');
        if (!numeroActe || !matricule || !nomAgent || !typeActe) {
            throw new Error('Tous les champs sont obligatoires');
        }

        const existing = await ctx.stub.getState(numeroActe);

        if (existing && existing.length > 0) {
            throw new Error(
                `L'acte ${numeroActe} existe déjà`
            );
        }

        const acte = {
            numeroActe,
            matricule,
            nomAgent,
            typeActe,
            statut: 'CREE',
            dateCreation: this.getTransactionDate(ctx)
        };

        await ctx.stub.putState(
            numeroActe,
            Buffer.from(JSON.stringify(acte))
        );

        return JSON.stringify(acte);
    }

    // 2. Consultation d'un acte
    async ReadAct(ctx, numeroActe) {
        const acte = await this.getActe(ctx, numeroActe);
        return JSON.stringify(acte);
    }

    // 3. Visa du Contrôle financier
    async ApproveByCF(ctx, numeroActe) {
        this.verifierOrganisation(ctx, 'Org2MSP');
        const acte = await this.getActe(ctx, numeroActe);

        if (acte.statut !== 'CREE') {
            throw new Error(
                `Visa CF impossible : statut actuel ${acte.statut}`
            );
        }

        acte.statut = 'VISE_CF';
        acte.dateVisaCF = this.getTransactionDate(ctx);

        await ctx.stub.putState(
            numeroActe,
            Buffer.from(JSON.stringify(acte))
        );

        return JSON.stringify(acte);
    }

    // 4. Validation par la Fonction publique
    async ValidateByFP(ctx, numeroActe) {
        this.verifierOrganisation(ctx, 'Org1MSP');
        const acte = await this.getActe(ctx, numeroActe);

        if (acte.statut !== 'VISE_CF') {
            throw new Error(
                `Validation FP impossible : statut actuel ${acte.statut}`
            );
        }

        acte.statut = 'VALIDE_FP';
        acte.dateValidationFP = this.getTransactionDate(ctx);

        await ctx.stub.putState(
            numeroActe,
            Buffer.from(JSON.stringify(acte))
        );

        return JSON.stringify(acte);
    }

    // 5. Prise en compte par la Solde
    async PayAct(ctx, numeroActe) {
        this.verifierOrganisation(ctx, 'Org3MSP');
        const acte = await this.getActe(ctx, numeroActe);

        if (acte.statut !== 'VALIDE_FP') {
            throw new Error(
                `Prise en compte impossible : statut ${acte.statut}`
            );
        }

        acte.statut = 'PRIS_EN_COMPTE_SOLDE';
        acte.datePriseEnCompte = this.getTransactionDate(ctx);

        await ctx.stub.putState(
            numeroActe,
            Buffer.from(JSON.stringify(acte))
        );

        return JSON.stringify(acte);
    }


    // Consultation de l'historique des modifications d'un acte.
    async GetActHistory(ctx, numeroActe) {
        if (!numeroActe) {
            throw new Error('Le numéro d acte est obligatoire');
        }

        const historique = [];
        const iterateur = await ctx.stub.getHistoryForKey(numeroActe);

        try {
            while (true) {
                const resultat = await iterateur.next();

                if (resultat.value) {
                    const modification = resultat.value;
                    const timestamp = modification.timestamp;

                    const seconds = Number(timestamp.seconds.toString());
                    const nanos = timestamp.nanos;

                    let valeur = null;

                    if (!modification.isDelete) {
                        valeur = JSON.parse(
                            modification.value.toString('utf8')
                        );
                    }

                    historique.push({
                        txId: modification.txId,
                        timestamp: new Date(
                            seconds * 1000 + Math.floor(nanos / 1000000)
                        ).toISOString(),
                        isDelete: modification.isDelete,
                        statut: valeur ? valeur.statut : null,
                        value: valeur
                    });
                }

                if (resultat.done) {
                    break;
                }
            }
        } finally {
            await iterateur.close();
        }

        return JSON.stringify(historique);
    }

    verifierOrganisation(ctx, mspAutorise) {
        const mspAppelant = ctx.clientIdentity.getMSPID();

        if (mspAppelant !== mspAutorise) {
            throw new Error(
                `Accès refusé : organisation ${mspAppelant}. ` +
                `Organisation autorisée : ${mspAutorise}`
            );
        }
    }
}

module.exports = GestionActes;
