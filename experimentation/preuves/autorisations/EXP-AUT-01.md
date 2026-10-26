# EXP-AUT-01 — Contrôle des autorisations interinstitutionnelles

## 1. Objectif

Vérifier qu'une organisation non autorisée ne peut pas
exécuter une opération métier réservée à une autre institution
et que son refus ne modifie pas l'acte concerné.

## 2. Environnement expérimental

- Plateforme : Hyperledger Fabric
- Canal : sigfae
- Chaincode : gestionactes
- Version : 1.3, séquence 4
- Organisation appelante : Org1MSP
- Organisation autorisée : Org2MSP
- Fonction testée : ApproveByCF
- Acte fictif : PROMO-2026-002

## 3. Hypothèse expérimentale

Une demande de visa du Contrôle financier exécutée
avec l'identité Org1MSP doit être rejetée par le chaincode.

Ce rejet ne doit pas modifier l'état ni l'historique
de l'acte fictif.

## 4. Protocole

1. Examiner la fonction verifierOrganisation du chaincode.
2. Sélectionner l'identité Org1MSP.
3. Exécuter ApproveByCF via peer chaincode query.
4. Enregistrer le message d'erreur et le code de retour.
5. Interroger l'état courant de l'acte avec ReadAct.
6. Extraire son historique après le refus.
7. Comparer cet historique avec la référence antérieure.
8. Archiver les preuves et vérifier leurs empreintes SHA-256.

## 5. Résultats observés

| Critère | Résultat |
|---|---|
| Organisation appelante | Org1MSP |
| Organisation requise | Org2MSP |
| Opération | ApproveByCF |
| Code de retour | 1 |
| Réponse | Accès refusé |
| Statut après refus | PRIS_EN_COMPTE_SOLDE |
| Comparaison des historiques | Identiques |
| Vérification SHA-256 | 2 fichiers OK |

Le contrôle d'autorisation est effectué à partir
de l'identifiant MSP de l'organisation appelante.

## 6. Interprétation scientifique

Le chaincode a rejeté la tentative de visa effectuée
par une organisation non autorisée.

L'état courant et l'historique de l'acte sont restés
inchangés lors des vérifications effectuées.

Le résultat confirme le fonctionnement du contrôle
d'autorisation métier dans ce scénario.

## 7. Limites

- Une seule combinaison d'organisation et d'opération
  non autorisées a été testée.
- Le test utilise peer chaincode query, sans soumission
  d'une transaction à l'orderer.
- Il ne démontre pas le comportement de tous les chemins
  de soumission de transactions.
- Il ne constitue pas un audit complet des identités,
  certificats, politiques Fabric et permissions.
- Le contrôle d'autorisation du chaincode est distinct
  de la politique d'endossement du canal.
- Le résultat ne démontre pas la supériorité de Fabric
  sur un système centralisé disposant de contrôles équivalents.

## 8. Pièces justificatives

- refus_org1_visa_cf.txt
- historique_apres_refus.json
- SHA256SUMS.txt
- Référence : ../tracabilite/historique_org1.json
