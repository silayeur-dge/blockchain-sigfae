# EXP-CONF-01 — Évaluation de la confidentialité interinstitutionnelle

## 1. Objectif

Évaluer si le prototype Hyperledger Fabric SIGFAE applique
une différenciation des données consultables selon
l'organisation participante.

## 2. Environnement expérimental

- Plateforme : Hyperledger Fabric
- Canal : sigfae
- Chaincode : gestionactes
- Fonction testée : ReadAct
- Acte fictif : PROMO-2026-002
- Org1MSP : Fonction publique
- Org2MSP : Contrôle financier
- Org3MSP : Solde

## 3. Question expérimentale

Les trois institutions obtiennent-elles des informations
différentes lorsqu'elles consultent le même acte ?

## 4. Hypothèse

Dans l'implémentation actuelle, la fonction ReadAct
ne comporte pas de restriction de lecture selon le MSP.

Les trois organisations devraient donc pouvoir consulter
le même contenu pour l'acte étudié.

## 5. Protocole

1. Examiner le code de ReadAct et getActe.
2. Vérifier les restrictions MSP présentes dans le chaincode.
3. Sélectionner successivement les identités Org1, Org2 et Org3.
4. Exécuter ReadAct sur PROMO-2026-002.
5. Enregistrer les réponses dans trois fichiers JSON.
6. Vérifier leur validité syntaxique.
7. Comparer les réponses octet par octet.
8. Calculer et vérifier les empreintes SHA-256.

## 6. Résultats observés

| Critère | Org1 | Org2 | Org3 |
|---|---|---|---|
| Lecture de l'acte | Réussie | Réussie | Réussie |
| Matricule accessible | Oui | Oui | Oui |
| Nom fictif accessible | Oui | Oui | Oui |
| Statut accessible | Oui | Oui | Oui |
| Dates accessibles | Oui | Oui | Oui |

Les trois réponses sont identiques octet par octet.

Empreinte SHA-256 commune :

ff0c1351d9dfe5392fc1501a83539221d1beaae3ac1018a9ccefe3352b3c8e63

Les trois fichiers ont passé la vérification
sha256sum -c SHA256SUMS.txt.

## 7. Interprétation scientifique

Le prototype distingue les organisations autorisées
à exécuter certaines opérations métier.

En revanche, la fonction ReadAct retourne
le même acte complet aux trois organisations.

Le caractère permissionné du réseau ne garantit donc pas,
à lui seul, une confidentialité différenciée
des données dans cette implémentation.

## 8. Limites de l'expérience

- Une seule fonction de lecture a été testée.
- Un seul acte fictif a été interrogé.
- Les trois organisations sont membres autorisés du réseau.
- Aucun acteur extérieur au réseau n'a été testé.
- Les règles institutionnelles de confidentialité
  n'ont pas été formalisées dans une matrice d'habilitation.
- Le test ne permet pas de conclure à une violation
  effective des règles métier.
- Les empreintes SHA-256 des fichiers ne prouvent pas
  indépendamment l'identité des organisations interrogées.

## 9. Pistes d'amélioration

Une architecture destinée à la production devrait
définir les habilitations de chaque institution.

Plusieurs mécanismes pourraient être étudiés :

- Contrôle d'accès explicite dans le chaincode.
- Réponses adaptées aux droits de consultation.
- Private Data Collections de Hyperledger Fabric.
- Conservation hors chaîne des données personnelles.
- Partage sur chaîne des seules empreintes nécessaires.
- Gestion des identités et journalisation des consultations.

Ces pistes devront être évaluées selon les exigences
de confidentialité, d'interopérabilité et de gouvernance.

## 10. Pièces justificatives

- lecture_org1.json
- lecture_org2.json
- lecture_org3.json
- SHA256SUMS.txt
