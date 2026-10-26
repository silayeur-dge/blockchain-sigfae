# EXP-INT-01 — Vérification du chaînage cryptographique

## 1. Objectif

Vérifier le chaînage cryptographique de deux blocs consécutifs
du canal SIGFAE et observer l'effet d'une modification fictive
sur l'empreinte d'un en-tête.

## 2. Environnement

- Plateforme : Hyperledger Fabric
- Canal : sigfae
- Organisation interrogée : Org1MSP
- Blocs examinés : 40 et 41
- Algorithme de hachage : SHA-256
- Encodage des en-têtes : ASN.1 DER
- Données utilisées : environnement expérimental fictif

## 3. Hypothèse expérimentale

L'empreinte SHA-256 de l'en-tête du bloc 40 doit correspondre
au champ previous_hash du bloc 41.

Une modification simulée de l'en-tête du bloc 40 doit
produire une empreinte différente.

## 4. Protocole

1. Extraire les blocs 40 et 41 du canal sigfae.
2. Conserver les blocs au format Protocol Buffers.
3. Décoder les deux blocs au format JSON.
4. Extraire les champs number, previous_hash et data_hash.
5. Encoder l'en-tête du bloc 40 en ASN.1 DER.
6. Calculer son empreinte SHA-256.
7. Comparer cette empreinte au previous_hash du bloc 41.
8. Modifier fictivement data_hash dans une copie en mémoire.
9. Recalculer l'empreinte de cette copie.
10. Comparer la nouvelle empreinte à la référence du bloc 41.
11. Archiver les résultats et leurs empreintes SHA-256.

## 5. Résultats observés

| Critère | Résultat |
|---|---|
| Bloc source | 40 |
| Bloc suivant | 41 |
| Empreinte originale conforme | Oui |
| Empreinte après modification conforme | Non |
| Altération simulée détectée | Oui |
| Modification du registre réel | Non |
| Vérification SHA-256 des fichiers | 5/5 OK |

Empreinte originale du bloc 40, en Base64 :

pm0ZnrF7MyMpUuKS0V2T51WOJPrdB62qk26zQDfa0Mk=

Cette valeur correspond au champ previous_hash du bloc 41.

## 6. Interprétation scientifique

L'expérience confirme que le bloc 41 référence
cryptographiquement l'en-tête du bloc 40.

La modification fictive du champ data_hash entraîne
une empreinte incompatible avec cette référence.

Ce mécanisme permet de détecter une incohérence
dans le chaînage cryptographique examiné.

## 7. Limites

- Deux blocs consécutifs seulement ont été examinés.
- La modification a été simulée en mémoire.
- Aucune transaction réelle n'a été altérée.
- Le test ne démontre pas la résistance à toutes les attaques.
- Il ne vérifie pas à lui seul les signatures, le consensus,
  la gouvernance ou l'intégrité complète du registre.
- La comparaison avec une architecture centralisée
  nécessite une expérimentation distincte.

## 8. Pièces justificatives

- bloc_40.pb
- bloc_40.json
- bloc_41.pb
- bloc_41.json
- resultat_integrite.json
- SHA256SUMS.txt
