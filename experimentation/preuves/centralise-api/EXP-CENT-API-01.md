# EXP-CENT-API-01 — Circuit administratif FastAPI

## Objectif

Vérifier le fonctionnement du circuit administratif
centralisé FP → CF → FP → SOLDE et sa persistance SQLite.

## Environnement

- Application : FastAPI
- Base : SQLite expérimentale isolée
- Acte : EXP-API-2026-001
- Données : fictives

## Résultats HTTP observés

| Opération | Institution | HTTP |
|---|---|---|
| Création | FP | 201 |
| Visa | CF | 200 |
| Validation | FP | 200 |
| Prise en compte | SOLDE | 200 |
| Consultation | FP | 200 |

## Vérification SQLite

- Actes présents dans la base : 1
- Statut final : PRIS_EN_COMPTE_SOLDE
- Horodatages métier présents : 4/4
- PRAGMA integrity_check : ok
- Vérification effectuée après la fin du processus API

## Limites

- Tests HTTP exécutés via HTTPX ASGITransport,
  sans serveur réseau externe.
- Les horodatages sont des données applicatives,
  pas des preuves d'horodatage qualifié.
- Le journal d'audit expérimental n'est pas intégré
  aux routes FastAPI.
- Le test ne démontre ni résistance à un administrateur
  malveillant ni continuité de service.
- Les résultats ne constituent pas une mesure
  comparative de performance.
