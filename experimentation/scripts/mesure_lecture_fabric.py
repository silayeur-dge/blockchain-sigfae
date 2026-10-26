import csv
import json
import os
import statistics
import subprocess
import time
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
RESEAU = RACINE / "fabric-samples/test-network"
DESTINATION = RACINE / "experimentation/resultats/lecture_fabric.csv"

ENV = os.environ.copy()
ENV["PATH"] = f"{RACINE / 'fabric-samples/bin'}:{ENV.get('PATH', '')}"
ENV["FABRIC_CFG_PATH"] = str(RACINE / "fabric-samples/config")

# Identité de l'organisation 1 (Fonction publique)
ENV["CORE_PEER_TLS_ENABLED"] = "true"
ENV["CORE_PEER_LOCALMSPID"] = "Org1MSP"
ENV["CORE_PEER_TLS_ROOTCERT_FILE"] = str(
    RESEAU / "organizations/peerOrganizations/org1.example.com"
    / "peers/peer0.org1.example.com/tls/ca.crt"
)
ENV["CORE_PEER_MSPCONFIGPATH"] = str(
    RESEAU / "organizations/peerOrganizations/org1.example.com"
    / "users/Admin@org1.example.com/msp"
)
ENV["CORE_PEER_ADDRESS"] = "localhost:7051"

COMMANDE = [
    str(RACINE / "fabric-samples/bin/peer"),
    "chaincode", "query",
    "-C", "sigfae",
    "-n", "gestionactes",
    "-c", '{"Args":["ReadAct","PROMO-2026-002"]}'
]

ECHAUFFEMENT = 10
REPETITIONS = 100

def lire_acte():
    debut = time.perf_counter_ns()

    resultat = subprocess.run(
        COMMANDE,
        cwd=RESEAU,
        env=ENV,
        capture_output=True,
        text=True,
        timeout=30
    )

    duree_ms = (time.perf_counter_ns() - debut) / 1_000_000

    if resultat.returncode != 0:
        raise RuntimeError(resultat.stderr)

    acte = json.loads(resultat.stdout)

    if acte.get("statut") != "PRIS_EN_COMPTE_SOLDE":
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

print("\nArchitecture : Hyperledger Fabric")
print("Opération : ReadAct")
print("Échauffement :", ECHAUFFEMENT)
print("Mesures :", REPETITIONS)
print(f"Moyenne : {statistics.mean(mesures):.3f} ms")
print(f"Médiane : {statistics.median(mesures):.3f} ms")
print(f"P95 : {p95:.3f} ms")
print(f"Minimum : {min(mesures):.3f} ms")
print(f"Maximum : {max(mesures):.3f} ms")
print("CSV :", DESTINATION)
