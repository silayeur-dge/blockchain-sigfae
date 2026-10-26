import hashlib
import json
import sqlite3
from datetime import datetime, timezone

ACTIONS = {
    "CREATION": (None, "CREE", "FP"),
    "VISA_CF": ("CREE", "VISE_CF", "CF"),
    "VALIDATION_FP": ("VISE_CF", "VALIDE_FP", "FP"),
    "PRISE_EN_COMPTE_SOLDE": (
        "VALIDE_FP",
        "PRIS_EN_COMPTE_SOLDE",
        "SOLDE"
    ),
}


def calculer_empreinte(evenement):
    contenu = json.dumps(
        evenement,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False
    )
    return hashlib.sha256(
        contenu.encode("utf-8")
    ).hexdigest()


def enregistrer_evenement(
    connexion,
    numero_acte,
    institution,
    action,
    ancien_statut,
    nouveau_statut
):
    """
    Insère un événement dans une transaction SQLite
    déjà ouverte par l'appelant.

    Cette fonction ne réalise aucun commit.
    """

    if action not in ACTIONS:
        raise ValueError("Action inconnue")

    ancien_attendu, nouveau_attendu, institution_attendue = (
        ACTIONS[action]
    )

    if (
        institution != institution_attendue
        or ancien_statut != ancien_attendu
        or nouveau_statut != nouveau_attendu
    ):
        raise ValueError(
            "Institution ou transition non autorisée"
        )

    precedent = connexion.execute("""
        SELECT empreinte_evenement
        FROM audit_evenements
        WHERE numero_acte = ?
        ORDER BY id DESC
        LIMIT 1
    """, (numero_acte,)).fetchone()

    if precedent:
        empreinte_precedente = precedent[0]
    else:
        empreinte_precedente = "GENESIS"

    horodatage = datetime.now(
        timezone.utc
    ).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )

    evenement = {
        "numero_acte": numero_acte,
        "institution": institution,
        "action": action,
        "ancien_statut": ancien_statut,
        "nouveau_statut": nouveau_statut,
        "horodatage": horodatage,
        "empreinte_precedente": empreinte_precedente
    }

    empreinte = calculer_empreinte(evenement)

    connexion.execute("""
        INSERT INTO audit_evenements (
            numero_acte,
            institution,
            action,
            ancien_statut,
            nouveau_statut,
            horodatage,
            empreinte_precedente,
            empreinte_evenement
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        numero_acte,
        institution,
        action,
        ancien_statut,
        nouveau_statut,
        horodatage,
        empreinte_precedente,
        empreinte
    ))

    return {
        **evenement,
        "empreinte_evenement": empreinte
    }
