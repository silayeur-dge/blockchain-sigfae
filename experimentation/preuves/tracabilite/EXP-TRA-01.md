# EXP-TRA-01 — Traçabilité interinstitutionnelle des actes

## 1. Objectif

Vérifier que trois organisations d'un réseau Hyperledger Fabric
peuvent consulter un historique identique des changements d'état
d'un projet d'acte administratif fictif.

## 2. Environnement expérimental

- Plateforme : Hyperledger Fabric
- Canal : sigfae
- Chaincode : gestionactes
- Organisations : Org1MSP, Org2MSP, Org3MSP
- Acte fictif : PROMO-2026-002
- Méthode interrogée : GetActHistory

## 3. Protocole

1. Sélectionner successivement les identités Org1, Org2 et Org3.
2. Exécuter GetActHistory pour PROMO-2026-002.
3. Enregistrer chaque réponse dans un fichier JSON distinct.
4. Comparer les fichiers avec cmp.
5. Calculer et vérifier les empreintes SHA-256.

## 4. Résultats observés

Quatre transitions historiques ont été retrouvées :

| Ordre | Statut | Horodatage UTC |
|---|---|---|
| 1 | CREE | 2026-10-20T14:48:08.150Z |
| 2 | VISE_CF | 2026-10-20T15:22:34.881Z |
| 3 | VALIDE_FP | 2026-10-20T15:27:34.645Z |
| 4 | PRIS_EN_COMPTE_SOLDE | 2026-10-20T15:45:02.117Z |

Chaque transition comporte un identifiant de transaction.

Comparaisons :
- Org1 et Org2 : fichiers identiques.
- Org1 et Org3 : fichiers identiques.
- Vérification SHA-256 : trois fichiers OK.

Durée observée du circuit simulé : environ 56 min 54 s.

## 5. Interprétation scientifique

Les trois organisations ont retourné un historique identique
pour l'acte étudié.

Cette observation confirme la cohérence des réponses obtenues
sur les trois pairs interrogés et la possibilité de reconstituer
les changements d'état de cet acte fictif.

## 6. Limites

- L'expérience porte sur un seul acte fictif.
- La cohérence des réponses ne prouve pas à elle seule
  l'intégrité cryptographique de l'ensemble du registre.
- La durée observée n'est pas une mesure du délai réel
  de traitement administratif.
- Les horodatages enregistrés ne démontrent pas la date
  d'une validation juridique par une autorité administrative.
- La présence d'un historique partagé ne garantit pas
  la confidentialité des données.
- La comparaison avec une architecture centralisée nécessite
  des critères et des expériences complémentaires.

## 7. Pièces justificatives

- historique_org1.json
- historique_org2.json
- historique_org3.json
- SHA256SUMS.txt
