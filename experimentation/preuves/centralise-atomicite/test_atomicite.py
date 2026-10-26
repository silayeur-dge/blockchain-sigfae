import sqlite3
import sys
from pathlib import Path

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[2] / "scripts")
)

from audit_centralise import enregistrer_evenement

conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")

try:
    conn.executescript("""
        CREATE TABLE actes (
            numero_acte TEXT PRIMARY KEY,
            statut TEXT NOT NULL
        );

        CREATE TABLE audit_evenements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_acte TEXT NOT NULL,
            institution TEXT NOT NULL,
            action TEXT NOT NULL,
            ancien_statut TEXT,
            nouveau_statut TEXT NOT NULL,
            horodatage TEXT NOT NULL,
            empreinte_precedente TEXT,
            empreinte_evenement TEXT NOT NULL,
            FOREIGN KEY (numero_acte)
                REFERENCES actes(numero_acte)
        );
    """)

    numero = "EXP-ATOMICITE-001"

    conn.execute(
        "INSERT INTO actes VALUES (?, 'CREE')",
        (numero,)
    )
    conn.commit()

    print("===== ETAT INITIAL =====")
    print("Statut : CREE")
    print("Événements d'audit : 0")

    conn.execute("BEGIN IMMEDIATE")

    resultat = conn.execute("""
        UPDATE actes
        SET statut = 'VISE_CF'
        WHERE numero_acte = ?
          AND statut = 'CREE'
    """, (numero,))

    assert resultat.rowcount == 1

    print()
    print("===== INJECTION D'ERREUR =====")
    print("Mise à jour métier effectuée dans la transaction")

    try:
        enregistrer_evenement(
            conn,
            numero,
            "FP",
            "VISA_CF",
            "CREE",
            "VISE_CF"
        )
    except ValueError as erreur:
        print("Erreur provoquée :", erreur)
        conn.rollback()
        print("Rollback exécuté : OUI")
    else:
        conn.rollback()
        raise AssertionError("Erreur attendue non déclenchée")

    statut = conn.execute(
        "SELECT statut FROM actes WHERE numero_acte = ?",
        (numero,)
    ).fetchone()[0]

    nombre = conn.execute(
        "SELECT COUNT(*) FROM audit_evenements"
    ).fetchone()[0]

    assert statut == "CREE"
    assert nombre == 0

    print()
    print("===== VERIFICATION FINALE =====")
    print("Statut après rollback :", statut)
    print("Événements d'audit :", nombre)
    print("Atomicité testée : VALIDE")
    print("Base expérimentale sur disque modifiée : NON")

finally:
    conn.close()
