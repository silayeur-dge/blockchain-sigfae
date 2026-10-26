from fastapi import FastAPI

app = FastAPI(
    title="SIGFAE - Prototype centralisé",
    description="Simulation centralisée du circuit de validation des actes administratifs",
    version="1.0.0"
)

@app.get("/")
def accueil():
    return {
        "application": "SIGFAE - Prototype centralisé",
        "architecture": "Centralisée",
        "institutions": [
            "Fonction publique",
            "Contrôle financier",
            "Direction de la Solde"
        ],
        "statut": "operationnel"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# --- Gestion des actes administratifs ---

import sqlite3
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from pydantic import BaseModel, Field

from database import get_connection, init_db
from security import get_institution


class ActeCreate(BaseModel):
    numeroActe: str = Field(min_length=1)
    matricule: str = Field(min_length=1)
    nomAgent: str = Field(min_length=1)
    typeActe: str = Field(min_length=1)


@app.post("/actes", status_code=status.HTTP_201_CREATED)
def creer_acte(
    acte: ActeCreate,
    institution: str = Depends(get_institution)
):
    if institution != "FP":
        raise HTTPException(
            status_code=403,
            detail="Seule la Fonction publique peut créer un acte"
        )

    donnees = {
        nom: valeur.strip()
        for nom, valeur in acte.model_dump().items()
    }

    if not all(donnees.values()):
        raise HTTPException(
            status_code=422,
            detail="Tous les champs sont obligatoires"
        )

    date_creation = datetime.now(timezone.utc).isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")

    try:
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO actes (
                    numero_acte,
                    matricule,
                    nom_agent,
                    type_acte,
                    statut,
                    date_creation
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    donnees["numeroActe"],
                    donnees["matricule"],
                    donnees["nomAgent"],
                    donnees["typeActe"],
                    "CREE",
                    date_creation
                )
            )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Ce numéro d'acte existe déjà"
        )

    return {
        **donnees,
        "statut": "CREE",
        "dateCreation": date_creation
    }


init_db()


@app.post("/actes/{numero_acte}/visa-cf")
def viser_acte_cf(
    numero_acte: str,
    institution: str = Depends(get_institution)
):
    if institution != "CF":
        raise HTTPException(
            status_code=403,
            detail="Seul le Contrôle financier peut viser un acte"
        )

    date_visa = datetime.now(timezone.utc).isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")

    with get_connection() as conn:
        # Mise à jour conditionnelle pour empêcher un double visa.
        cursor = conn.execute(
            """
            UPDATE actes
            SET statut = 'VISE_CF',
                date_visa_cf = ?
            WHERE numero_acte = ?
              AND statut = 'CREE'
            """,
            (date_visa, numero_acte)
        )

        if cursor.rowcount == 0:
            acte = conn.execute(
                "SELECT statut FROM actes WHERE numero_acte = ?",
                (numero_acte,)
            ).fetchone()

            if acte is None:
                raise HTTPException(
                    status_code=404,
                    detail="Acte introuvable"
                )

            raise HTTPException(
                status_code=409,
                detail=f"Visa impossible : statut actuel {acte['statut']}"
            )

    return {
        "numeroActe": numero_acte,
        "statut": "VISE_CF",
        "dateVisaCF": date_visa
    }


@app.post("/actes/{numero_acte}/validation-fp")
def valider_acte_fp(
    numero_acte: str,
    institution: str = Depends(get_institution)
):
    if institution != "FP":
        raise HTTPException(
            status_code=403,
            detail="Seule la Fonction publique peut valider un acte"
        )

    date_validation = datetime.now(timezone.utc).isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")

    with get_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE actes
            SET statut = 'VALIDE_FP',
                date_validation_fp = ?
            WHERE numero_acte = ?
              AND statut = 'VISE_CF'
            """,
            (date_validation, numero_acte)
        )

        if cursor.rowcount == 0:
            acte = conn.execute(
                "SELECT statut FROM actes WHERE numero_acte = ?",
                (numero_acte,)
            ).fetchone()

            if acte is None:
                raise HTTPException(
                    status_code=404,
                    detail="Acte introuvable"
                )

            raise HTTPException(
                status_code=409,
                detail=f"Validation impossible : statut actuel {acte['statut']}"
            )

    return {
        "numeroActe": numero_acte,
        "statut": "VALIDE_FP",
        "dateValidationFP": date_validation
    }


@app.post("/actes/{numero_acte}/prise-en-compte")
def prendre_en_compte_acte(
    numero_acte: str,
    institution: str = Depends(get_institution)
):
    if institution != "SOLDE":
        raise HTTPException(
            status_code=403,
            detail="Seule la Direction de la Solde peut prendre en compte un acte"
        )

    date_prise_en_compte = datetime.now(timezone.utc).isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")

    with get_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE actes
            SET statut = 'PRIS_EN_COMPTE_SOLDE',
                date_prise_en_compte = ?
            WHERE numero_acte = ?
              AND statut = 'VALIDE_FP'
            """,
            (date_prise_en_compte, numero_acte)
        )

        if cursor.rowcount == 0:
            acte = conn.execute(
                "SELECT statut FROM actes WHERE numero_acte = ?",
                (numero_acte,)
            ).fetchone()

            if acte is None:
                raise HTTPException(
                    status_code=404,
                    detail="Acte introuvable"
                )

            raise HTTPException(
                status_code=409,
                detail=f"Prise en compte impossible : statut actuel {acte['statut']}"
            )

    return {
        "numeroActe": numero_acte,
        "statut": "PRIS_EN_COMPTE_SOLDE",
        "datePriseEnCompte": date_prise_en_compte
    }


@app.get("/actes/{numero_acte}")
def consulter_acte(
    numero_acte: str,
    institution: str = Depends(get_institution)
):
    with get_connection() as conn:
        acte = conn.execute(
            """
            SELECT numero_acte, matricule, nom_agent,
                   type_acte, statut, date_creation,
                   date_visa_cf, date_validation_fp,
                   date_prise_en_compte
            FROM actes
            WHERE numero_acte = ?
            """,
            (numero_acte,)
        ).fetchone()

    if acte is None:
        raise HTTPException(
            status_code=404,
            detail="Acte introuvable"
        )

    return {
        "numeroActe": acte["numero_acte"],
        "matricule": acte["matricule"],
        "nomAgent": acte["nom_agent"],
        "typeActe": acte["type_acte"],
        "statut": acte["statut"],
        "dateCreation": acte["date_creation"],
        "dateVisaCF": acte["date_visa_cf"],
        "dateValidationFP": acte["date_validation_fp"],
        "datePriseEnCompte": acte["date_prise_en_compte"]
    }
