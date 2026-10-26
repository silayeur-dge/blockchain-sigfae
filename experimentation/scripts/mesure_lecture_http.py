import csv
import os
import statistics
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

RACINE = Path(__file__).resolve().parents[2]
CENTRALISE = RACINE / "prototype-centralise"

load_dotenv(CENTRALISE / ".env")

URL = "http://127.0.0.1:8000/actes/PROMO-CENT-2026-001"
HEADERS = {"X-API-Key": os.environ["API_KEY_FP"]}

ECHAUFFEMENT = 10
REPETITIONS = 100

DESTINATION = RACINE / "experimentation/resultats/lecture_centralisee_http.csv"

# Un client HTTP persistant réutilise les connexions.
with httpx.Client(timeout=10.0) as client:

    def lire_acte():
        debut = time.perf_counter_ns()
        response = client.get(URL, headers=HEADERS)
        duree_ms = (time.perf_counter_ns() - debut) / 1_000_000

        if response.status_code != 200:
            raise RuntimeError(
                f"Erreur HTTP {response.status_code}: {response.text}"
            )

        if response.json()["statut"] != "PRIS_EN_COMPTE_SOLDE":
            raise RuntimeError("Statut inattendu")

        return duree_ms

    print("Échauffement en cours...", flush=True)

    for _ in range(ECHAUFFEMENT):
        lire_acte()

    print("Mesures en cours...", flush=True)

    mesures = []

    for i in range(REPETITIONS):
        mesures.append(lire_acte())

        if (i + 1) % 20 == 0:
            print(f"{i + 1}/{REPETITIONS} lectures effectuées", flush=True)

DESTINATION.parent.mkdir(parents=True, exist_ok=True)

with DESTINATION.open("w", newline="", encoding="utf-8") as fichier:
    writer = csv.writer(fichier)
    writer.writerow(["iteration", "duree_ms"])

    for numero, duree in enumerate(mesures, start=1):
        writer.writerow([numero, round(duree, 6)])

p95 = sorted(mesures)[94]

print("\nArchitecture : FastAPI + SQLite")
print("Mode : HTTP local avec client persistant")
print("Échauffement :", ECHAUFFEMENT)
print("Mesures :", REPETITIONS)
print(f"Moyenne : {statistics.mean(mesures):.3f} ms")
print(f"Médiane : {statistics.median(mesures):.3f} ms")
print(f"P95 : {p95:.3f} ms")
print(f"Minimum : {min(mesures):.3f} ms")
print(f"Maximum : {max(mesures):.3f} ms")
print("CSV :", DESTINATION)
