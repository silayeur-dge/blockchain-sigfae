import os
import subprocess
import statistics
import time
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
PEER = RACINE / "fabric-samples/bin/peer"
CONFIG = RACINE / "fabric-samples/config"

env = os.environ.copy()
env["FABRIC_CFG_PATH"] = str(CONFIG)

mesures = []

for i in range(100):
    debut = time.perf_counter_ns()

    resultat = subprocess.run(
        [str(PEER), "version"],
        env=env,
        capture_output=True,
        text=True,
        timeout=10
    )

    duree = (time.perf_counter_ns() - debut) / 1_000_000

    if resultat.returncode != 0:
        raise RuntimeError(resultat.stderr)

    mesures.append(duree)

mesures.sort()

print("Mesure : lancement du client peer")
print("Repetitions : 100")
print(f"Moyenne : {statistics.mean(mesures):.3f} ms")
print(f"Mediane : {statistics.median(mesures):.3f} ms")
print(f"P95 : {mesures[94]:.3f} ms")
print(f"Minimum : {min(mesures):.3f} ms")
print(f"Maximum : {max(mesures):.3f} ms")
