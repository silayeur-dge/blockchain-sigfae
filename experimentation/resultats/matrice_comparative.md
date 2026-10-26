# Matrice comparative expérimentale

## 1. Objet

Comparer une architecture blockchain permissionnée
Hyperledger Fabric et un prototype centralisé SQLite
pour le circuit fictif de validation des projets d'actes
issus du SIGFAE.

Cette matrice repose exclusivement sur les expériences
réalisées. Elle ne constitue pas une preuve de supériorité
générale d'une architecture.

## 2. Résultats comparatifs

| Critère | Hyperledger Fabric | Centralisée SQLite |
|---|---|---|
| Circuit métier | Quatre transitions exécutées | Quatre transitions exécutées |
| Autorisations | Refus Org1 pour visa CF observé | Refus FP pour visa CF dans le module d'audit |
| Traçabilité | Historique interrogé depuis trois organisations | Quatre événements SHA-256 chaînés |
| Intégrité | Chaînage des en-têtes de blocs contrôlé | Modification isolée détectée |
| Confidentialité | Lecture intégrale identique depuis trois organisations | Contrôle de lecture fin non testé |
| Atomicité | Non testée séparément | Rollback après erreur applicative vérifié |
| Performance | 90 lectures CLI séquentielles mesurées | Non mesurée |
| Réplication interinstitutionnelle | Trois organisations Fabric participantes | Non implémentée |
| Résistance à une réécriture privilégiée | Non démontrée | Non démontrée |

## 3. Références expérimentales

### Hyperledger Fabric

- EXP-END-01 : endossement.
- EXP-TRA-01 : traçabilité.
- EXP-AUT-01 : autorisations.
- EXP-INT-01 : intégrité.
- EXP-CONF-01 : confidentialité.
- EXP-PERF-01 : performances.

### Architecture centralisée

- EXP-CENT-01 : circuit métier, journal d'audit et intégrité.
- EXP-CENT-02 : atomicité transactionnelle.

## 4. Précautions méthodologiques

### Équivalence fonctionnelle

Les deux prototypes reproduisent les mêmes transitions
administratives, mais ne présentent pas encore une
équivalence complète des interfaces et des mécanismes
de sécurité.

Les transitions du prototype centralisé ont été exécutées
par scripts Python, et non par son API FastAPI.

### Autorisations

Le refus centralisé a été observé dans la fonction d'audit.
Cela ne démontre pas l'efficacité de l'authentification
ni des contrôles d'accès de l'API en conditions réelles.

### Intégrité

La détection d'une altération isolée ne démontre pas
l'impossibilité de réécrire un historique complet.

Les modèles de confiance et les privilèges administratifs
doivent être pris en compte.

### Confidentialité

Le fait que les trois organisations Fabric puissent lire
les mêmes données ne constitue pas automatiquement
une violation de politique de confidentialité.

Il faut définir les droits attendus avant de conclure.

### Performance

Les mesures Fabric comprennent le démarrage du processus
CLI et les communications nécessaires à la requête.

Aucune comparaison quantitative de latence avec SQLite
n'est encore justifiée.

### Limites générales

Les résultats proviennent de prototypes locaux, de
données fictives et d'un périmètre expérimental limité.

Ils ne démontrent ni la conformité juridique complète
ni les performances d'un déploiement institutionnel réel.

## 5. Conclusion provisoire

Les expériences montrent que les deux architectures
peuvent assurer plusieurs propriétés utiles au circuit
administratif étudié.

La contribution potentielle de Fabric doit être appréciée
principalement au regard du partage interinstitutionnel
des preuves, du modèle de gouvernance et des contraintes
de confiance entre les acteurs.

Cette contribution doit être confrontée aux coûts,
à la complexité, à la confidentialité et aux contraintes
d'exploitation, sans présumer de sa supériorité.
