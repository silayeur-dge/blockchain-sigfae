# Consolidation expérimentale — Matrice V2

## Objet

Conserver les références vérifiables des résultats
expérimentaux utilisés dans la matrice comparative V2.

## Campagnes de performance

| Architecture | Mesures | Moyenne |
|---|---:|---:|
| FastAPI/SQLite | 90 | 1.254 ms |
| Hyperledger Fabric Gateway | 90 | 7.394 ms |

Total : 180 observations.

## Limite de comparabilité

Les mesures FastAPI utilisent HTTPX ASGITransport
en mémoire, tandis que Fabric Gateway utilise gRPC/TLS.

Ces résultats ne constituent pas une comparaison
strictement équivalente des performances réseau
ou une preuve de supériorité générale.

## Conservation

Le manifeste SHA-256 référence la matrice V2,
les deux fichiers de mesures et ce rapport.

Les empreintes permettent de vérifier la
correspondance des fichiers avec le manifeste.
Elles ne garantissent pas à elles seules
l'authenticité de leur origine.
