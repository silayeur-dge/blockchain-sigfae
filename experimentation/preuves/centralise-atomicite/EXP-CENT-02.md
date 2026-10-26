# EXP-CENT-02 — Atomicité transactionnelle SQLite

## 1. Objectif

Vérifier qu'une mise à jour métier et son événement d'audit
peuvent être exécutés dans une transaction SQLite unique,
avec annulation de la mise à jour en cas d'échec.

## 2. Environnement

- Architecture : centralisée
- Technologie : Python 3 et SQLite
- Base de données : SQLite en mémoire
- Acte fictif : EXP-ATOMICITE-001
- Date de génération du rapport : 2026-10-23
- Script : test_atomicite.py
- Sortie enregistrée : resultat_atomicite.txt

## 3. Protocole expérimental

1. Créer une base SQLite temporaire en mémoire.
2. Insérer un acte fictif au statut CREE.
3. Ouvrir une transaction avec BEGIN IMMEDIATE.
4. Modifier provisoirement son statut en VISE_CF.
5. Tenter d'enregistrer un visa CF avec l'institution FP.
6. Intercepter le refus de la fonction d'audit.
7. Exécuter ROLLBACK.
8. Vérifier le statut final et le nombre d'événements.

## 4. Résultats observés

- Modification provisoire du statut : effectuée.
- Erreur d'autorisation : déclenchée.
- ROLLBACK : exécuté.
- Statut final : CREE.
- Événements d'audit persistants : 0.
- Assertions du script : satisfaites.

**Résultat : atomicité vérifiée dans le scénario testé.**

## 5. Interprétation scientifique

Le résultat montre qu'une architecture centralisée
utilisant SQLite peut assurer l'atomicité locale entre
une modification métier et une écriture d'audit, lorsque
les deux opérations appartiennent à une même transaction
et que les erreurs entraînent son annulation.

L'atomicité transactionnelle n'est donc pas une
propriété exclusive d'une blockchain permissionnée.

## 6. Limites

- L'expérience utilise une base SQLite en mémoire.
- Elle ne mesure pas la durabilité après panne matérielle.
- Elle ne simule pas une interruption brutale du processus.
- Elle ne teste pas plusieurs transactions concurrentes.
- L'erreur est déclenchée par une validation applicative,
  avant l'insertion effective de l'événement d'audit.
- Elle ne démontre pas la résistance à un administrateur
  disposant de privilèges sur la base.
- Elle ne mesure pas les performances.
- Elle ne démontre pas l'intégration transactionnelle
  de l'API FastAPI existante.

## 7. Conclusion partielle

Dans les conditions expérimentales définies, SQLite
préserve la cohérence de l'état métier lorsqu'une erreur
provoque l'annulation de la transaction.

La comparaison avec Hyperledger Fabric devra donc
porter sur les différences effectivement observables,
notamment le partage interinstitutionnel des preuves,
la gouvernance, la traçabilité, la confidentialité,
les coûts et les performances.

## 8. Fichiers de reproductibilité

- test_atomicite.py
- resultat_atomicite.txt
- SHA256SUMS.txt

Les empreintes SHA-256 du manifeste permettent de
contrôler l'intégrité des fichiers conservés, sous
réserve de disposer d'une référence fiable du manifeste.
