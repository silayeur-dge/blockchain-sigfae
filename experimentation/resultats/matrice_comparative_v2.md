# Matrice comparative expérimentale — Version 2

## 1. Objet

Comparer une architecture blockchain permissionnée Hyperledger
Fabric et une architecture centralisée FastAPI/SQLite dans le
cadre d'un circuit fictif de validation de projets d'actes
issus du SIGFAE.

Cette matrice présente des observations expérimentales.
Elle ne démontre pas la supériorité générale d'une architecture.

## 2. Résultats fonctionnels

| Critère | Hyperledger Fabric | FastAPI/SQLite |
|---|---|---|
| Circuit métier | Quatre transitions réalisées | Quatre transitions réalisées par scripts et via API |
| Autorisations | Refus d'une transition non autorisée observé | Refus HTTP 403 pour des opérations interdites ; clé invalide HTTP 401 |
| Traçabilité | Historique consulté depuis trois organisations | Quatre événements d'audit SHA-256 chaînés dans le prototype expérimental |
| Intégrité | Chaînage des en-têtes de blocs vérifié | Altération isolée détectée par vérification du journal |
| Confidentialité | Lecture intégrale identique depuis trois organisations | Contrôle de lecture fin non évalué |
| Atomicité | Non évaluée séparément | Rollback vérifié dans un test SQLite en mémoire |
| Réplication interinstitutionnelle | Trois organisations Fabric participantes | Non implémentée |
| Résistance à une réécriture privilégiée | Non démontrée expérimentalement | Non démontrée |
| Intégration du journal d'audit à l'API | Sans objet dans cette configuration | Non réalisée : module d'audit expérimental distinct |

## 3. Résultats de performance

### 3.1. Consultations applicatives

| Institution | Fabric Gateway : moyenne (ms) | FastAPI ASGITransport : moyenne (ms) |
|---|---:|---:|
| Fonction publique | 7,424 | 1,261 |
| Contrôle financier | 6,807 | 1,218 |
| Solde | 7,951 | 1,284 |
| **Moyenne globale** | **7,394** | **1,254 environ** |

Chaque architecture a fait l'objet de 90 consultations
séquentielles : 30 par institution.

Pour Fabric Gateway, cinq consultations d'échauffement
ont précédé les 30 mesures de chaque institution.
Les connexions gRPC étaient persistantes pendant
les mesures de chaque organisation.

Le benchmark FastAPI utilisait HTTPX ASGITransport,
c'est-à-dire un transport ASGI en mémoire.

### 3.2. Anciennes mesures Fabric CLI

Une campagne antérieure de 90 consultations Fabric,
réalisées avec le CLI `peer chaincode query`, a donné
les moyennes suivantes :

- Org1 : 63,234 ms.
- Org2 : 64,450 ms.
- Org3 : 82,986 ms.

Ces mesures incluent des coûts liés au lancement
du processus CLI et ne sont pas directement
comparables aux consultations Gateway ou FastAPI.

### 3.3. Limites de comparaison

Les mesures Fabric Gateway et FastAPI ne représentent
pas un protocole de transport équivalent.

Fabric Gateway utilise gRPC/TLS vers un peer,
tandis que FastAPI a été testé avec ASGITransport
en mémoire.

L'écart de latence observé ne peut donc pas être
attribué uniquement à la technologie blockchain.

Les mesures ne permettent pas de conclure sur :
- les performances en production ;
- le débit sous charge concurrente ;
- la stabilité à long terme ;
- les coûts complets d'exploitation ;
- les performances comparées des écritures.

## 4. Références expérimentales

### Hyperledger Fabric

- EXP-END-01 : endossement.
- EXP-TRA-01 : traçabilité.
- EXP-AUT-01 : autorisations.
- EXP-INT-01 : intégrité.
- EXP-CONF-01 : confidentialité.
- EXP-PERF-01 : performances via CLI.
- EXP-FAB-GW-01 : performances via Fabric Gateway.

### Architecture centralisée

- EXP-CENT-01 : circuit métier, journal d'audit et intégrité.
- EXP-CENT-02 : atomicité transactionnelle.
- EXP-CENT-API-01 : circuit métier et contrôles via FastAPI.
- EXP-CENT-API-PERF-01 : performances de consultation FastAPI.

## 5. Limites scientifiques et techniques

### Équivalence fonctionnelle

Les deux architectures reproduisent les mêmes étapes
administratives, mais leurs interfaces et mécanismes
de sécurité ne sont pas strictement équivalents.

Le journal d'audit SHA-256 expérimental du système
centralisé n'est pas intégré aux routes FastAPI
testées lors de la campagne API.

### Modèle de confiance

Les tests d'intégrité ne démontrent pas une
résistance absolue à la modification des données
par des administrateurs disposant de privilèges élevés.

La gouvernance, les droits d'administration et
la répartition des responsabilités institutionnelles
doivent être étudiés séparément.

### Confidentialité

L'accès observé aux mêmes données depuis les trois
organisations Fabric ne démontre pas, à lui seul,
une violation d'une politique de confidentialité.

Une politique explicite de visibilité des données
doit être définie et évaluée.

### Portée des expérimentations

Les essais ont été réalisés dans un environnement
local avec des données fictives.

Ils ne démontrent ni la conformité juridique complète,
ni la capacité à fonctionner à l'échelle institutionnelle.

Les résultats expérimentaux ne doivent pas être
confondus avec une certification de sécurité.

## 6. Conclusion provisoire

Les deux architectures ont permis d'exécuter le
circuit administratif fictif étudié.

La solution centralisée a démontré la faisabilité
d'un traitement applicatif avec contrôles d'accès
et transactions SQLite dans les périmètres testés.

Hyperledger Fabric a permis de réaliser des opérations
et de consulter un historique au sein d'un réseau
composé de trois organisations participantes.

La valeur ajoutée potentielle de Fabric doit être
appréciée au regard du partage interinstitutionnel
des preuves, de la gouvernance, du modèle de confiance
et des exigences de traçabilité.

Cette valeur doit être confrontée à la complexité
technique, aux coûts d'exploitation, aux exigences
de confidentialité et aux besoins réels des institutions.

Aucune supériorité générale n'est démontrée.
