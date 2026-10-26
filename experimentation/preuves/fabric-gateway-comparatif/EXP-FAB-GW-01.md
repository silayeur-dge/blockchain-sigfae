# EXP-FAB-GW-01 — Performances de consultation Fabric Gateway

## Objectif

Mesurer le temps de consultation d'un acte fictif depuis trois
organisations d'une blockchain permissionnée Hyperledger Fabric.

## Protocole

- Canal : `sigfae`.
- Chaincode : `gestionactes`.
- Fonction : `ReadAct`.
- Acte fictif : `PROMO-2026-002`.
- Client : SDK Fabric Gateway pour Node.js.
- Transport : gRPC avec TLS.
- Connexion persistante par organisation.
- 5 consultations d'échauffement et 30 mesures par organisation.
- Consultations séquentielles, sans modification du registre.
- Durée chronométrée autour de `evaluateTransaction()`.

## Résultats

| Institution | Mesures | Moyenne (ms) | Médiane (ms) | Min (ms) | Max (ms) |
|---|---:|---:|---:|---:|---:|
| FP | 30 | 7.424 | 6.605 | 5.349 | 18.061 |
| CF | 30 | 6.807 | 6.729 | 5.454 | 8.446 |
| SOLDE | 30 | 7.951 | 7.244 | 5.597 | 12.530 |

**Moyenne globale : 7.394 ms.**
**Médiane globale : 6.924 ms.**

## Interprétation et limites

Ces durées correspondent à des consultations réussies dans
l'environnement expérimental observé. Le chronométrage exclut
l'établissement initial de la connexion et l'échauffement.

La comparaison directe avec les mesures FastAPI/HTTPX ASGITransport
n'est pas méthodologiquement équivalente : Fabric utilise ici
gRPC/TLS, tandis que FastAPI a été testé avec un transport ASGI
en mémoire. Les différences de protocole, d'architecture et
de chemin d'exécution doivent être prises en compte.

Les 90 observations proviennent d'une seule campagne séquentielle.
Elles ne suffisent pas à établir la stabilité à long terme,
le débit sous concurrence ou la performance en production.

Le protocole ne mesure pas l'écriture, le consensus,
l'endossement d'une transaction ni sa finalisation.

## Conservation des preuves

Les empreintes SHA-256 permettent de détecter une modification
ultérieure des fichiers par comparaison avec ce manifeste.
Elles ne prouvent pas, à elles seules, leur authenticité
ni leur immutabilité.
