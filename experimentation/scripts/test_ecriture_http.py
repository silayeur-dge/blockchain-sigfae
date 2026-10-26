import os
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

RACINE = Path(__file__).resolve().parents[2]
load_dotenv(RACINE / "prototype-centralise/.env")

URL = "http://127.0.0.1:8000"
NUMERO = "PROMO-CENT-ECR-001"

headers = {
    "X-API-Key": os.environ["API_KEY_FP"]
}

acte = {
    "numeroActe": NUMERO,
    "matricule": "FICTIF-ECR-001",
    "nomAgent": "Agent Fictif Écriture",
    "typeActe": "Promotion"
}

with httpx.Client(timeout=15.0) as client:
    debut = time.perf_counter_ns()

    response = client.post(
        f"{URL}/actes",
        headers=headers,
        json=acte
    )

    duree_ms = (time.perf_counter_ns() - debut) / 1_000_000

    if response.status_code not in (200, 201):
        print("Échec :", response.status_code, response.text)
        raise SystemExit(1)

    print("Création HTTP réussie.")
    print(f"Durée écriture : {duree_ms:.3f} ms")

    verification = client.get(
        f"{URL}/actes/{NUMERO}",
        headers=headers
    )
    verification.raise_for_status()

    print("\n=== ACTE ENREGISTRÉ ===")
    print(verification.json())
