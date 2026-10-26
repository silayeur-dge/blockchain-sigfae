import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "sigfae.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS actes (
                numero_acte TEXT PRIMARY KEY,
                matricule TEXT NOT NULL,
                nom_agent TEXT NOT NULL,
                type_acte TEXT NOT NULL,
                statut TEXT NOT NULL DEFAULT 'CREE',
                date_creation TEXT NOT NULL,
                date_visa_cf TEXT,
                date_validation_fp TEXT,
                date_prise_en_compte TEXT
            )
        """)
        connection.commit()


if __name__ == "__main__":
    init_db()
    print("Base SQLite initialisée :", DB_PATH)
