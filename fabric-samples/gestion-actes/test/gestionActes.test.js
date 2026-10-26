'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const GestionActes = require('../lib/gestionActes');

describe('GestionActes - Autorisations MSP', () => {
    let contrat;
    let ctx;

    beforeEach(() => {
        contrat = new GestionActes();

        ctx = {
            clientIdentity: {
                getMSPID: sinon.stub()
            },
            stub: {
                getState: sinon.stub(),
                putState: sinon.stub()
            }
        };
    });

    it('refuse la création par le Contrôle financier', async () => {
        ctx.clientIdentity.getMSPID.returns('Org2MSP');

        try {
            await contrat.CreateAct(
                ctx,
                'TEST-001',
                'MAT001',
                'Agent Fictif',
                'Promotion'
            );

            throw new Error('Le test aurait dû être refusé');
        } catch (erreur) {
            expect(erreur.message).to.equal(
                'Accès refusé : organisation Org2MSP. ' +
                'Organisation autorisée : Org1MSP'
            );
        }
        sinon.assert.notCalled(ctx.stub.getState);
        sinon.assert.notCalled(ctx.stub.putState);
    });

    it('autorise la création par la Fonction publique', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        ctx.stub.getState.resolves(Buffer.alloc(0));
        ctx.stub.putState.resolves();

        ctx.stub.getTxTimestamp = sinon.stub().returns({
            seconds: { toString: () => '1792411200' },
            nanos: 0
        });

        const resultat = await contrat.CreateAct(
            ctx,
            'TEST-002',
            'MAT002',
            'Agent Fictif',
            'Promotion'
        );

        const acte = JSON.parse(resultat);

        expect(acte.numeroActe).to.equal('TEST-002');
        expect(acte.statut).to.equal('CREE');

        sinon.assert.calledOnce(ctx.stub.putState);
        const [cle, donnees] = ctx.stub.putState.firstCall.args;

        expect(cle).to.equal('TEST-002');

        const acteEnregistre = JSON.parse(donnees.toString());

        expect(acteEnregistre).to.deep.equal(acte);

        expect(acteEnregistre.matricule).to.equal('MAT002');
        expect(acteEnregistre.nomAgent).to.equal('Agent Fictif');
        expect(acteEnregistre.typeActe).to.equal('Promotion');
        expect(acteEnregistre.statut).to.equal('CREE');
        expect(acteEnregistre.dateCreation).to.be.a('string');
    });

    it('refuse le visa CF par la Fonction publique', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        let erreur;

        try {
            await contrat.ApproveByCF(ctx, 'TEST-003');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('Accès refusé');

        sinon.assert.notCalled(ctx.stub.putState);
    });

    it('autorise le visa CF sur un acte créé', async () => {
        ctx.clientIdentity.getMSPID.returns('Org2MSP');

        const acteInitial = {
            numeroActe: 'TEST-003',
            matricule: 'MAT003',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'CREE'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        ctx.stub.putState.resolves();

        ctx.stub.getTxTimestamp = sinon.stub().returns({
            seconds: { toString: () => '1792411200' },
            nanos: 0
        });

        const resultat = await contrat.ApproveByCF(
            ctx,
            'TEST-003'
        );

        const acte = JSON.parse(resultat);

        expect(acte.statut).to.equal('VISE_CF');
        expect(acte.dateVisaCF).to.be.a('string');

        sinon.assert.calledOnce(ctx.stub.putState);
        const [cle, donnees] = ctx.stub.putState.firstCall.args;

        expect(cle).to.equal('TEST-003');

        const acteEnregistre = JSON.parse(donnees.toString());

        expect(acteEnregistre).to.deep.equal(acte);
        expect(acteEnregistre.numeroActe).to.equal('TEST-003');
        expect(acteEnregistre.matricule).to.equal('MAT003');
        expect(acteEnregistre.nomAgent).to.equal('Agent Fictif');
        expect(acteEnregistre.typeActe).to.equal('Promotion');
        expect(acteEnregistre.statut).to.equal('VISE_CF');
        expect(acteEnregistre.dateVisaCF).to.be.a('string');
    });
    it('refuse la validation FP par le Contrôle financier', async () => {
        ctx.clientIdentity.getMSPID.returns('Org2MSP');

        let erreur;

        try {
            await contrat.ValidateByFP(ctx, 'TEST-004');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('Accès refusé');

        sinon.assert.notCalled(ctx.stub.putState);
    });

    it('autorise la validation FP après le visa CF', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        const acteInitial = {
            numeroActe: 'TEST-004',
            matricule: 'MAT004',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'VISE_CF'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        ctx.stub.putState.resolves();

        ctx.stub.getTxTimestamp = sinon.stub().returns({
            seconds: { toString: () => '1792411200' },
            nanos: 0
        });

        const resultat = await contrat.ValidateByFP(
            ctx,
            'TEST-004'
        );

        const acte = JSON.parse(resultat);

        expect(acte.statut).to.equal('VALIDE_FP');
        expect(acte.dateValidationFP).to.be.a('string');

        sinon.assert.calledOnce(ctx.stub.putState);
        const [cle, donnees] = ctx.stub.putState.firstCall.args;

        expect(cle).to.equal('TEST-004');

        const acteEnregistre = JSON.parse(donnees.toString());

        expect(acteEnregistre).to.deep.equal(acte);

        expect(acteEnregistre.numeroActe).to.equal('TEST-004');
        expect(acteEnregistre.matricule).to.equal('MAT004');
        expect(acteEnregistre.nomAgent).to.equal('Agent Fictif');
        expect(acteEnregistre.typeActe).to.equal('Promotion');

        expect(acteEnregistre.statut).to.equal('VALIDE_FP');
        expect(acteEnregistre.dateValidationFP).to.be.a('string');
    });
    it('refuse la prise en compte par la Fonction publique', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        let erreur;

        try {
            await contrat.PayAct(ctx, 'TEST-005');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('Accès refusé');

        sinon.assert.notCalled(ctx.stub.putState);
    });

    it('autorise la prise en compte par la Solde après validation FP', async () => {
        ctx.clientIdentity.getMSPID.returns('Org3MSP');

        const acteInitial = {
            numeroActe: 'TEST-005',
            matricule: 'MAT005',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'VALIDE_FP'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        ctx.stub.putState.resolves();

        ctx.stub.getTxTimestamp = sinon.stub().returns({
            seconds: { toString: () => '1792411200' },
            nanos: 0
        });

        const resultat = await contrat.PayAct(
            ctx,
            'TEST-005'
        );

        const acte = JSON.parse(resultat);

        expect(acte.statut).to.equal('PRIS_EN_COMPTE_SOLDE');
        expect(acte.datePriseEnCompte).to.be.a('string');

        sinon.assert.calledOnce(ctx.stub.putState);
        const [cle, donnees] = ctx.stub.putState.firstCall.args;

        expect(cle).to.equal('TEST-005');

        const acteEnregistre = JSON.parse(donnees.toString());

        expect(acteEnregistre).to.deep.equal(acte);

        expect(acteEnregistre.numeroActe).to.equal('TEST-005');
        expect(acteEnregistre.matricule).to.equal('MAT005');
        expect(acteEnregistre.nomAgent).to.equal('Agent Fictif');
        expect(acteEnregistre.typeActe).to.equal('Promotion');

        expect(acteEnregistre.statut).to.equal(
            'PRIS_EN_COMPTE_SOLDE'
        );

        expect(acteEnregistre.datePriseEnCompte).to.be.a('string');
    });
    it('refuse le visa CF sur un acte déjà validé', async () => {
        ctx.clientIdentity.getMSPID.returns('Org2MSP');

        const acteInitial = {
            numeroActe: 'TEST-006',
            matricule: 'MAT006',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'VALIDE_FP'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        let erreur;

        try {
            await contrat.ApproveByCF(ctx, 'TEST-006');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('statut');

        sinon.assert.notCalled(ctx.stub.putState);
    });
    it('refuse la validation FP sans visa préalable du CF', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        const acteInitial = {
            numeroActe: 'TEST-007',
            matricule: 'MAT007',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'CREE'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        let erreur;

        try {
            await contrat.ValidateByFP(ctx, 'TEST-007');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('statut');

        sinon.assert.notCalled(ctx.stub.putState);
    });
    it('refuse la prise en compte Solde sans validation FP', async () => {
        ctx.clientIdentity.getMSPID.returns('Org3MSP');

        const acteInitial = {
            numeroActe: 'TEST-008',
            matricule: 'MAT008',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'VISE_CF'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        let erreur;

        try {
            await contrat.PayAct(ctx, 'TEST-008');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('statut');

        sinon.assert.notCalled(ctx.stub.putState);
    });
    it('refuse la création d’un acte déjà existant', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        const acteExistant = {
            numeroActe: 'TEST-009',
            matricule: 'MAT009',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'CREE'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteExistant))
        );

        let erreur;

        try {
            await contrat.CreateAct(
                ctx,
                'TEST-009',
                'MAT009',
                'Agent Fictif',
                'Promotion'
            );
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);
        expect(erreur.message).to.include('existe');

        sinon.assert.calledOnceWithExactly(
            ctx.stub.getState,
            'TEST-009'
        );

        sinon.assert.notCalled(ctx.stub.putState);
    });
    it('refuse le visa CF sur un acte inexistant', async () => {
        ctx.clientIdentity.getMSPID.returns('Org2MSP');

        // Simulation d'une recherche sans résultat
        ctx.stub.getState.resolves(Buffer.alloc(0));

        let erreur;

        try {
            await contrat.ApproveByCF(ctx, 'TEST-010');
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);

        sinon.assert.calledOnceWithExactly(
            ctx.stub.getState,
            'TEST-010'
        );

        sinon.assert.notCalled(ctx.stub.putState);
    });
    it('refuse la création sans matricule', async () => {
        ctx.clientIdentity.getMSPID.returns('Org1MSP');

        let erreur;

        try {
            await contrat.CreateAct(
                ctx,
                'TEST-011',
                '',
                'Agent Fictif',
                'Promotion'
            );
        } catch (e) {
            erreur = e;
        }

        expect(erreur).to.be.instanceOf(Error);

        expect(erreur.message).to.equal(
            'Tous les champs sont obligatoires'
        );

        sinon.assert.notCalled(ctx.stub.getState);
        sinon.assert.notCalled(ctx.stub.putState);
    });
    it('permet de consulter un acte existant', async () => {
        const acteInitial = {
            numeroActe: 'TEST-012',
            matricule: 'MAT012',
            nomAgent: 'Agent Fictif',
            typeActe: 'Promotion',
            statut: 'VISE_CF'
        };

        ctx.stub.getState.resolves(
            Buffer.from(JSON.stringify(acteInitial))
        );

        const resultat = await contrat.ReadAct(
            ctx,
            'TEST-012'
        );

        const acte = JSON.parse(resultat);

        expect(acte).to.deep.equal(acteInitial);

        sinon.assert.calledOnceWithExactly(
            ctx.stub.getState,
            'TEST-012'
        );

        sinon.assert.notCalled(ctx.stub.putState);
    });
});
