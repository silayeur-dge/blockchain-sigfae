# EXP-PERF-01 — Évaluation expérimentale des performances de lecture

## 1. Objectif

Mesurer les durées de consultation d'un acte administratif
fictif depuis trois organisations participant au réseau
Hyperledger Fabric SIGFAE.

## 2. Environnement

- Plateforme : Hyperledger Fabric v2.5.16
- Système : Linux AMD64, environnement WSL et Docker
- Déploiement : trois organisations sur un même ordinateur
- Canal : sigfae
- Chaincode : gestionactes
- Fonction : ReadAct
- Acte fictif : PROMO-2026-002

## 3. Question expérimentale

Quels temps de réponse sont observés lors de lectures
séquentielles depuis les trois organisations ?

## 4. Protocole

1. Sélectionner successivement Org1, Org2 et Org3.
2. Exécuter 30 lectures par organisation.
3. Mesurer la durée totale de chaque commande cliente
   avec Python et time.perf_counter_ns().
4. Vérifier le succès de chaque requête.
5. Vérifier le numéro de l'acte retourné.
6. Enregistrer les durées dans des fichiers CSV.
7. Calculer les statistiques descriptives.
8. Archiver les fichiers et leurs empreintes SHA-256.

Une première série exploratoire de 30 lectures Org1
a également été réalisée avec /usr/bin/time.

## 5. Résultats

| Indicateur | Org1 | Org2 | Org3 |
|---|---:|---:|---:|
| Lectures réussies | 30 | 30 | 30 |
| Moyenne (ms) | 63,234 | 64,450 | 82,986 |
| Médiane (ms) | 57,303 | 59,800 | 81,456 |
| Minimum (ms) | 52,664 | 51,812 | 72,170 |
| Maximum (ms) | 96,665 | 101,046 | 101,484 |
| Écart-type (ms) | 11,650 | 11,653 | 7,983 |
| P95 (ms) | 86,686 | 91,297 | 100,763 |

Total : 90 lectures réussies.

Le P95 est calculé selon la méthode du rang supérieur.

## 6. Analyse

Les temps moyens observés sont compris entre
63,234 ms et 82,986 ms.

Org1 et Org2 présentent des moyennes proches.

La moyenne d'Org3 est supérieure d'environ 31,2 %
à celle d'Org1.

Cet écart descriptif ne démontre pas qu'une organisation
est intrinsèquement moins performante.

Les écarts-types montrent une variabilité des mesures,
notamment pour Org1 et Org2.

## 7. Portée des mesures

Les durées incluent le lancement du client peer,
les communications et le traitement de la requête.

Elles ne représentent pas exclusivement le temps
d'exécution du chaincode.

Les lectures ont été réalisées séquentiellement,
sans charge concurrente.

## 8. Limites méthodologiques

- Réseau exécuté sur un ordinateur unique.
- Environnement WSL et Docker.
- Absence de latence interinstitutionnelle réelle.
- Campagnes Org1, Org2 et Org3 exécutées successivement.
- Absence de contrôle systématique de la charge système.
- Un seul acte fictif consulté.
- Seulement 30 mesures par organisation.
- Absence de mesure du débit sous charge.
- Absence de mesure de latence de validation des écritures.
- Absence de comparaison expérimentale avec une
  architecture centralisée équivalente.

Les résultats ne doivent pas être généralisés
à un déploiement institutionnel réel.

## 9. Conclusion expérimentale

Dans les conditions du prototype, les 90 lectures
ont réussi, avec des temps moyens compris entre
63,234 ms et 82,986 ms selon l'organisation.

Ces observations constituent une première référence
quantitative pour l'étude du prototype.

Elles ne permettent pas, à elles seules, de conclure
à une supériorité ou à une infériorité de la blockchain
par rapport à une architecture centralisée.

## 10. Pièces justificatives

- lectures_org1.csv
- lectures_org1_precises.csv
- lectures_org2_precises.csv
- lectures_org3_precises.csv
- statistiques_lectures.json
- SHA256SUMS.txt
