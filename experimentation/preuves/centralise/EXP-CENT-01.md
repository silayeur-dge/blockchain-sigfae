# EXP-CENT-01 — Circuit centralisé et intégrité

## Objectif
Évaluer la traçabilité et la détection d'une altération
dans un prototype centralisé SQLite.

## Environnement
- Prototype : SQLite et module Python expérimental
- Base : copie expérimentale
- Acte : EXP-CENT-2026-001
- Données : entièrement fictives
- Date du rapport : 2026-10-23

## Protocole
1. Création de l'acte par FP.
2. Refus d'un visa CF demandé avec l'identité FP.
3. Visa par CF.
4. Validation par FP.
5. Prise en compte par SOLDE.
6. Vérification des quatre empreintes et de leur chaînage.
7. Altération simulée de l'institution dans le deuxième
   événement, sur une copie en mémoire.

## Résultats observés
- Statut final : PRIS_EN_COMPTE_SOLDE
- Événements d'audit : 4
- Chaînage cryptographique : cohérent
- Altération simulée : détectée
- Base originale du prototype : non modifiée

## Limites
- Les transitions ont été exécutées par scripts Python
  expérimentaux, sans passer par l'API FastAPI.
- Le refus testé concerne la fonction d'audit et ne constitue
  pas une preuve complète de sécurité de l'API.
- Le chaînage SHA-256 ne protège pas contre la réécriture
  complète du journal suivie du recalcul des empreintes.
- Le contrôle ne fournit pas de preuve indépendante
  de l'antériorité des événements.
- L'atomicité en cas d'échec après une mise à jour métier
  reste à tester explicitement.
- Ces résultats ne constituent pas une mesure de performance.

## Conclusion partielle
Le prototype centralisé expérimental permet de conserver
un historique chaîné et de détecter une modification isolée
d'un événement lorsque son empreinte n'est pas recalculée.
Il ne démontre pas une immutabilité absolue du journal.
