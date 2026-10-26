# EXP-CENT-API-PERF-01 — Performances FastAPI

## Objectif

Caractériser la latence de consultation d'un acte fictif
dans le prototype centralisé FastAPI + SQLite.

## Protocole

- Route : GET /actes/EXP-API-2026-001
- Transport : HTTPX ASGITransport
- Exécution : séquentielle, dans un processus Python
- Échauffement : 5 requêtes par institution
- Mesures : 30 requêtes par institution
- Total : 90 mesures
- Unité : millisecondes

## Résultats

| Institution | N | Moyenne (ms) | Médiane (ms) | Min (ms) | Max (ms) |
|---|---:|---:|---:|---:|---:|
| FP | 30 | 1.261 | 1.230 | 1.147 | 1.452 |
| CF | 30 | 1.218 | 1.185 | 1.056 | 1.509 |
| SOLDE | 30 | 1.284 | 1.252 | 1.011 | 1.607 |

Moyenne globale : 1.254 ms.

## Limites méthodologiques

- Le transport ASGI est exécuté dans le processus de test.
- Aucun réseau HTTP externe n'est traversé.
- Les mesures portent uniquement sur des lectures.
- Aucun test de concurrence ou de montée en charge.
- Les temps Fabric mesurés avec le CLI peer incluent
  des coûts différents et ne sont pas directement comparables.
- Ces mesures ne démontrent aucune supériorité architecturale.

## Traçabilité

Les 90 valeurs individuelles sont conservées dans
resultats/performances_centralise_api.json.
