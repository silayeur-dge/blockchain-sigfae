# Résultats expérimentaux et discussion

## 1. Présentation des expérimentations

Cette étude examine deux architectures destinées à
assurer la traçabilité du circuit de validation des
projets d'actes administratifs issus du SIGFAE :

- une architecture centralisée FastAPI/SQLite ;
- une blockchain permissionnée Hyperledger Fabric.

Les expérimentations utilisent des données fictives
et reproduisent les interventions de trois institutions :
la Fonction publique, le Contrôle financier et la Solde.

Les résultats présentés correspondent aux opérations
effectivement testées dans un environnement local.
Ils ne constituent pas une évaluation en production.

## 2. Résultats fonctionnels

### 2.1. Exécution du circuit administratif

Les deux architectures ont permis de reproduire
les quatre états du circuit expérimental :

CREE → VISE_CF → VALIDE_FP → PRIS_EN_COMPTE_SOLDE.

Dans l'architecture centralisée, ce circuit a été
exécuté par scripts Python et, séparément,
à travers les routes FastAPI.

Dans Fabric, les transitions ont été exécutées
à travers le smart contract gestionactes.

Ces résultats établissent la faisabilité
fonctionnelle du circuit dans les deux prototypes.

### 2.2. Autorisations institutionnelles

Des tentatives de transitions non autorisées ont
été rejetées dans les expérimentations Fabric.

Dans FastAPI, les tests ont notamment montré
des réponses HTTP 403 pour certaines opérations
réservées à d'autres institutions et HTTP 401
pour une clé d'authentification invalide.

Ces observations confirment le fonctionnement
des contrôles testés, sans démontrer une sécurité
complète des deux architectures.

### 2.3. Traçabilité et intégrité

Dans Fabric, l'historique d'un acte a été consulté
depuis trois organisations. Le chaînage des
en-têtes de deux blocs consécutifs a été contrôlé.

Dans le prototype centralisé expérimental,
quatre événements ont été enregistrés dans un
journal d'audit utilisant des empreintes SHA-256
chaînées. Une modification isolée a été détectée.

Ces expériences montrent deux mécanismes distincts
de conservation et de vérification des traces.

Elles ne démontrent pas une résistance absolue
à la réécriture privilégiée des historiques.

Le journal d'audit centralisé expérimental
n'est pas intégré aux routes FastAPI utilisées
dans la campagne de tests de l'API.

### 2.4. Confidentialité et atomicité

Les trois organisations Fabric ont pu consulter
les mêmes données complètes dans le scénario testé.
Ce résultat appelle une définition explicite
des règles de visibilité institutionnelle.

Dans SQLite, un test transactionnel en mémoire
a confirmé qu'une erreur pendant la journalisation
pouvait provoquer l'annulation d'un changement
de statut non validé.

Ce test ne démontre pas à lui seul la résistance
aux pannes matérielles ni l'atomicité de toutes
les opérations de l'API FastAPI.

## 3. Résultats de performance

Deux campagnes de 90 consultations séquentielles
ont été réalisées, à raison de 30 mesures par
institution et par architecture.

| Institution | FastAPI/SQLite (ms) | Fabric Gateway (ms) |
|---|---:|---:|
| Fonction publique | 1,261 | 7,424 |
| Contrôle financier | 1,218 | 6,807 |
| Solde | 1,284 | 7,951 |
| Moyenne globale | 1,254 | 7,394 |

Les moyennes sont arrondies à trois décimales.

Les mesures FastAPI ont été obtenues avec HTTPX
ASGITransport, sans transport réseau HTTP externe.

Les mesures Fabric ont été réalisées via le SDK
Fabric Gateway, avec des connexions gRPC/TLS
persistantes pendant les consultations.

Ces protocoles ne sont pas strictement équivalents.
L'écart observé ne peut donc pas être attribué
à la seule technologie blockchain.

Les expériences ne mesurent pas le débit en
concurrence, les performances en production
ou le coût complet des transactions d'écriture.

## 4. Discussion scientifique

### 4.1. Apports de l'architecture centralisée

Le prototype centralisé montre qu'un circuit
administratif comportant plusieurs validations
peut être reproduit avec une application classique.

Des mécanismes d'authentification, d'autorisation,
de transactions SQL et de journalisation peuvent
contribuer à sa sécurisation.

Toutefois, la journalisation expérimentale n'a
pas été intégrée au circuit FastAPI évalué.

La centralisation de l'administration et des
données soulève également des questions de
confiance et de contrôle entre institutions.

### 4.2. Apports de la blockchain permissionnée

Le prototype Fabric a permis de faire participer
trois organisations à un réseau partagé,
d'exécuter les transitions administratives
et de consulter l'historique d'un acte.

Ces observations illustrent l'intérêt potentiel
d'un registre partagé pour la continuité des
preuves entre plusieurs institutions.

Cet intérêt dépend toutefois de la gouvernance,
de la répartition effective des responsabilités
et des politiques d'accès aux données.

La participation de plusieurs organisations
dans un prototype local ne démontre pas,
à elle seule, une gouvernance institutionnelle
réellement décentralisée.

### 4.3. Conditions de pertinence

L'adoption d'une blockchain permissionnée
pour le circuit SIGFAE serait davantage
justifiée si les institutions concernées
avaient besoin de partager un historique
vérifiable sans dépendre exclusivement
d'un administrateur central unique.

En revanche, lorsque les institutions acceptent
une autorité technique commune et des mécanismes
d'audit indépendants, une architecture centralisée
renforcée peut constituer une alternative pertinente.

Le choix doit intégrer les coûts d'exploitation,
la confidentialité, l'interopérabilité,
la gouvernance et les contraintes juridiques.

## 5. Limites de l'étude

Les principales limites sont les suivantes :

- utilisation de données fictives ;
- environnement expérimental local ;
- nombre limité d'actes et de scénarios ;
- absence de test de charge concurrente ;
- transports différents pour les benchmarks ;
- absence de déploiement institutionnel réel ;
- absence de validation juridique complète ;
- absence de démonstration d'une résistance
  absolue aux modifications privilégiées.

Ces limites restreignent la portée des conclusions.

## 6. Conclusion partielle

Les résultats montrent que les deux architectures
peuvent reproduire le circuit administratif fictif
étudié et mettre en œuvre plusieurs mécanismes
de contrôle et de traçabilité.

La principale question ne réside donc pas
uniquement dans la faisabilité technique,
mais dans la valeur ajoutée d'un registre
partagé entre institutions.

Les observations disponibles ne démontrent
pas une supériorité générale de Fabric.

Elles conduisent plutôt à considérer la
blockchain permissionnée comme une option
dont la pertinence dépend des exigences
de confiance interinstitutionnelle,
de gouvernance et de continuité des preuves.

## 7. Références expérimentales internes

Les résultats s'appuient sur :

- la matrice comparative V2 ;
- les expériences Fabric EXP-END-01,
  EXP-TRA-01, EXP-AUT-01, EXP-INT-01,
  EXP-CONF-01 et EXP-PERF-01 ;
- l'expérience Fabric Gateway EXP-FAB-GW-01 ;
- les expériences centralisées EXP-CENT-01
  et EXP-CENT-02 ;
- les expériences FastAPI EXP-CENT-API-01
  et EXP-CENT-API-PERF-01 ;
- le dossier de consolidation comparative V2.
