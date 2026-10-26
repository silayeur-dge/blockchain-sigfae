import csv
import math
import random
import statistics
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
DOSSIER = RACINE / "experimentation/resultats"

SOURCES = {
    "FastAPI TestClient": "lecture_centralisee.csv",
    "FastAPI HTTP": "lecture_centralisee_http.csv",
    "Fabric CLI": "lecture_fabric.csv",
    "Fabric Gateway": "lecture_fabric_gateway.csv",
}

def percentile(valeurs, p):
    valeurs = sorted(valeurs)
    position = (len(valeurs) - 1) * p / 100
    bas = math.floor(position)
    haut = math.ceil(position)

    return valeurs[bas] + (
        valeurs[haut] - valeurs[bas]
    ) * (position - bas)

def intervalle_bootstrap(valeurs, iterations=5000):
    generateur = random.Random(20261022)
    moyennes = []

    for _ in range(iterations):
        echantillon = generateur.choices(
            valeurs, k=len(valeurs)
        )
        moyennes.append(statistics.mean(echantillon))

    return (
        percentile(moyennes, 2.5),
        percentile(moyennes, 97.5),
    )

resultats = []

for methode, fichier in SOURCES.items():
    chemin = DOSSIER / fichier

    with chemin.open(newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))

    valeurs = [float(ligne["duree_ms"]) for ligne in lignes]

    if len(valeurs) != 100:
        raise ValueError(
            f"{fichier} : {len(valeurs)} mesures au lieu de 100"
        )

    borne_inf, borne_sup = intervalle_bootstrap(valeurs)

    resultats.append({
        "methode": methode,
        "n": len(valeurs),
        "moyenne_ms": round(statistics.mean(valeurs), 3),
        "mediane_ms": round(statistics.median(valeurs), 3),
        "ecart_type_ms": round(statistics.stdev(valeurs), 3),
        "p95_ms": round(percentile(valeurs, 95), 3),
        "p99_ms": round(percentile(valeurs, 99), 3),
        "minimum_ms": round(min(valeurs), 3),
        "maximum_ms": round(max(valeurs), 3),
        "ic95_inf_ms": round(borne_inf, 3),
        "ic95_sup_ms": round(borne_sup, 3),
    })

sortie = DOSSIER / "synthese_statistique.csv"

with sortie.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=resultats[0].keys())
    writer.writeheader()
    writer.writerows(resultats)

print("\n=== ANALYSE STATISTIQUE DES LECTURES ===\n")

for r in resultats:
    print(r["methode"])
    print(f"  Nombre      : {r['n']}")
    print(f"  Moyenne     : {r['moyenne_ms']} ms")
    print(f"  Médiane     : {r['mediane_ms']} ms")
    print(f"  Écart-type  : {r['ecart_type_ms']} ms")
    print(f"  P95         : {r['p95_ms']} ms")
    print(f"  P99         : {r['p99_ms']} ms")
    print(
        f"  IC95 moyen  : "
        f"[{r['ic95_inf_ms']}, {r['ic95_sup_ms']}] ms"
    )
    print()

print("Synthèse enregistrée :", sortie)
