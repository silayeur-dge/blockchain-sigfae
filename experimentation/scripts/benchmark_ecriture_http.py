import csv
import os
import statistics
import time
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv

RACINE = Path(__file__).resolve().parents[2]
load_dotenv(RACINE / "prototype-centralise/.env")

URL = "http://127.0.0.1:8000"
RUNS = 10
CAMPAGNE = uuid.uuid4().hex[:10]
SORTIE = (
    RACINE / "experimentation/resultats"
    / f"ecriture_centralisee_http_{CAMPAGNE}.csv"
)

headers = {"X-API-Key": os.environ["API_KEY_FP"]}
resultats = []

def sauvegarder():
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    with SORTIE.open("w", newline="", encoding="utf-8") as fichier:
        writer = csv.writer(fichier)
        writer.writerow(["iteration", "numero_acte", "duree_ms", "statut"])
        writer.writerows(resultats)

with httpx.Client(timeout=15.0) as client:
    # Établir une connexion HTTP avant de commencer les mesures.
    health = client.get(f"{URL}/health")
    health.raise_for_status()

    print("=== CAMPAGNE ÉCRITURE FASTAPI/SQLITE ===")
    print("Transactions :", RUNS)
    print("Campagne :", CAMPAGNE)

    try:
        for i in range(1, RUNS + 1):
            numero = f"PROMO-CENT-BENCH-{CAMPAGNE}-{i:02d}"

            acte = {
                "numeroActe": numero,
                "matricule": f"FICTIF-BENCH-{i:03d}",
                "nomAgent": f"Agent Fictif Benchmark {i}",
                "typeActe": "Promotion",
            }

            debut = time.perf_counter_ns()
            response = client.post(
                f"{URL}/actes",
                headers=headers,
                json=acte,
            )
            duree = (time.perf_counter_ns() - debut) / 1_000_000

            response.raise_for_status()

            verification = client.get(
                f"{URL}/actes/{numero}",
                headers=headers,
            )
            verification.raise_for_status()
            resultat = verification.json()

            if (
                resultat["numeroActe"] != numero
                or resultat["statut"] != "CREE"
            ):
                raise RuntimeError(f"Vérification échouée : {numero}")

            resultats.append([i, numero, f"{duree:.6f}", "CONFIRME"])
            sauvegarder()

            print(f"{i}/{RUNS} confirmée : {duree:.3f} ms")

    finally:
        sauvegarder()

durees = [float(ligne[2]) for ligne in resultats]

print("\n=== RÉSULTATS ===")
print(f"Écritures confirmées : {len(resultats)}/{RUNS}")
print(f"Moyenne : {statistics.mean(durees):.3f} ms")
print(f"Médiane : {statistics.median(durees):.3f} ms")
print(f"Minimum : {min(durees):.3f} ms")
print(f"Maximum : {max(durees):.3f} ms")
print(f"CSV : {SORTIE}")
