import csv
import os
import sys
import time
import statistics
from pathlib import Path

from dotenv import load_dotenv
from fastapi.testclient import TestClient

RACINE = Path(__file__).resolve().parents[2]
CENTRALISE = RACINE / "prototype-centralise"

sys.path.insert(0, str(CENTRALISE))
os.chdir(CENTRALISE)
load_dotenv(CENTRALISE / ".env")

from main import app

client = TestClient(app)

NUMERO = "PROMO-CENT-2026-001"
URL = f"/actes/{NUMERO}"
HEADERS = {"X-API-Key": os.environ["API_KEY_FP"]}

ECHAUFFEMENT = 10
REPETITIONS = 100

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

for _ in range(ECHAUFFEMENT):
    lire_acte()

mesures = [lire_acte() for _ in range(REPETITIONS)]

destination = RACINE / "experimentation/resultats/lecture_centralisee.csv"

with destination.open("w", newline="", encoding="utf-8") as fichier:
    writer = csv.writer(fichier)
    writer.writerow(["iteration", "duree_ms"])
    for numero, duree in enumerate(mesures, start=1):
        writer.writerow([numero, round(duree, 6)])

mesures_triees = sorted(mesures)
p95 = mesures_triees[94]

print("Architecture : centralisée FastAPI / SQLite")
print("Opération : lecture d'un acte")
print("Échauffement :", ECHAUFFEMENT)
print("Mesures :", REPETITIONS)
print(f"Moyenne : {statistics.mean(mesures):.3f} ms")
print(f"Médiane : {statistics.median(mesures):.3f} ms")
print(f"P95 : {p95:.3f} ms")
print(f"Minimum : {min(mesures):.3f} ms")
print(f"Maximum : {max(mesures):.3f} ms")
print("CSV :", destination)
