# EXP-END-01 — Vérification des endossements et de la validation

## 1. Objectif

Vérifier que la transaction de prise en compte d'un acte fictif
par la Solde présente les endossements requis par la politique
du canal SIGFAE et qu'elle est marquée valide dans le registre.

## 2. Environnement

- Plateforme : Hyperledger Fabric
- Canal : sigfae
- Organisations : Org1MSP, Org2MSP, Org3MSP
- Chaincode : gestionactes
- Version du chaincode observée : 1.3, séquence 4
- Données : entièrement fictives

## 3. Données expérimentales

- Acte : PROMO-2026-002
- Opération : prise en compte par la Solde
- Bloc : 26
- Transaction :
  99620f0442d3332f5e56a9799b46b0276ed02e80ca3ba08990d35689fe04897b

## 4. Protocole

1. Extraire le bloc contenant la transaction.
2. Décoder le bloc au format JSON.
3. Identifier les endossements présents.
4. Identifier les organisations MSP des endosseurs.
5. Extraire la politique d'endossement du canal.
6. Examiner le code de validation de la transaction.
7. Archiver les fichiers et calculer leurs empreintes SHA-256.

## 5. Résultats

- Politique du canal : MAJORITY.
- Organisations participantes : 3.
- Majorité requise : 2 organisations.
- Nombre d'endossements observés : 2.
- Organisations endosseuses : Org2MSP et Org3MSP.
- Code de validation : 0 (VALID).
- Vérification SHA-256 des trois fichiers : OK.

## 6. Interprétation

Les endossements observés satisfont la politique majoritaire
du canal. La transaction est marquée VALID dans les métadonnées
du bloc récupéré.

L'expérience confirme le fonctionnement de l'endossement
distribué pour cette transaction particulière.

## 7. Limites

- Une seule transaction métier est examinée.
- L'expérience ne démontre pas la validité juridique du visa.
- L'endossement technique ne constitue pas une signature
  administrative de l'autorité compétente.
- Les résultats ne permettent pas de conclure à une supériorité
  générale sur une architecture centralisée.
- Les empreintes SHA-256 permettent de contrôler la cohérence
  des fichiers archivés, mais ne constituent pas seules
  une preuve indépendante de leur authenticité.

## 8. Pièces justificatives

- bloc_26.json
- configuration_canal.json
- synthese_endossement.json
- SHA256SUMS.txt
