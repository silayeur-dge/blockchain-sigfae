import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

racine = Path(__file__).resolve().parents[2]
load_dotenv(racine / "prototype-centralise/.env")

numero = "PROMO-CENT-BENCH-2e4e2c1ecb-01"
url = "http://127.0.0.1:8000"
headers = {"X-API-Key": os.environ["API_KEY_FP"]}

with httpx.Client(timeout=15.0) as client:
    avant = client.get(f"{url}/actes/{numero}", headers=headers)
    avant.raise_for_status()
    acte_avant = avant.json()

    print("=== TEST DE VALIDATION HORS SÉQUENCE ===")
    print("Architecture : FastAPI / SQLite")
    print("Institution : Fonction publique")
    print("Statut avant :", acte_avant["statut"])

    if acte_avant["statut"] != "CREE":
        raise RuntimeError("Précondition non satisfaite")

    reponse = client.post(
        f"{url}/actes/{numero}/validation-fp",
        headers=headers,
    )

    print("Code HTTP :", reponse.status_code)
    print("Réponse :", reponse.text)

    apres = client.get(f"{url}/actes/{numero}", headers=headers)
    apres.raise_for_status()
    acte_apres = apres.json()

    print("Statut après :", acte_apres["statut"])

    if reponse.status_code == 409 and acte_avant == acte_apres:
        print("RÉSULTAT : TEST RÉUSSI")
        print("Validation hors séquence refusée, état inchangé.")
    else:
        raise RuntimeError(
            "TEST ÉCHOUÉ : refus inattendu ou données modifiées"
        )
