import os
import secrets

from dotenv import load_dotenv
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

load_dotenv()

api_key_header = APIKeyHeader(
    name="X-API-Key",
    auto_error=False
)

INSTITUTIONS = {
    "FP": os.getenv("API_KEY_FP"),
    "CF": os.getenv("API_KEY_CF"),
    "SOLDE": os.getenv("API_KEY_SOLDE")
}


def get_institution(api_key: str = Security(api_key_header)):
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Clé API manquante"
        )

    for institution, expected_key in INSTITUTIONS.items():
        if expected_key and secrets.compare_digest(
            api_key, expected_key
        ):
            return institution

    raise HTTPException(
        status_code=401,
        detail="Clé API invalide"
    )
