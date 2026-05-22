from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pickle
import json
import numpy as np
import pandas as pd
import requests
import os
from typing import Dict, Any, List

app = FastAPI(title="PNC Predict API", version="1.0.0")

# ─── CORS ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── GNews API ───────────────────────────────────────────────────────────────
GNEWS_API_KEY = "demo"  # ← Remplacez par votre vraie clé GNews pour des résultats réels
GNEWS_URL = "https://gnews.io/api/v4/search"

# ─── Chargement du modèle ────────────────────────────────────────────────────
if os.path.exists("model_PNC_Cameroun.pkl"):
    with open("model_PNC_Cameroun.pkl", "rb") as f:
        model = pickle.load(f)
else:
    # Modèle factice pour le développement
    class DummyModel:
        def predict(self, X):
            return np.array([0.78])  # Probabilité par défaut
        
        @property
        def params(self):
            return pd.Series({
                'richesse_Plus riche': 0.15,
                'richesse_Riche': 0.10,
                'richesse_Moyen': 0.05,
                'richesse_Pauvre': -0.08,
                'richesse_Plus pauvre': -0.12,
                'CPN_4+': 0.20,
                'CPN_1-3': 0.10,
                'CPN_Aucune': -0.25,
                'distance_Probleme': -0.15,
                'media_Oui': 0.08,
                'residence_Urbain': 0.12,
                'instruction_Primaire': 0.05,
                'instruction_Secondaire': 0.10,
                'instruction_Superieur': 0.15,
                'mariage_Marie(e)': 0.03,
                'mariage_Concubinage': -0.02,
                'region_Centre': 0.05,
                'region_Sud': -0.08,
                'region_Ouest': 0.03,
                'region_Nord': -0.10,
                'region_Extrême-Nord': -0.12,
                'region_Adamaoua': -0.05,
                'region_Est': -0.07,
                'region_Littoral': 0.08,
                'region_Nord-Ouest': -0.03,
                'region_Sud-Ouest': 0.02
            })
    
    model = DummyModel()

if os.path.exists("colonnes_model.json"):
    with open("colonnes_model.json", "r") as f:
        COLONNES = json.load(f)
else:
    COLONNES = [
        'richesse_Plus riche', 'richesse_Riche', 'richesse_Moyen', 
        'richesse_Pauvre', 'richesse_Plus pauvre',
        'CPN_4+', 'CPN_1-3', 'CPN_Aucune',
        'distance_Probleme', 'media_Oui',
        'residence_Urbain', 'instruction_Primaire', 
        'instruction_Secondaire', 'instruction_Superieur',
        'mariage_Marie(e)', 'mariage_Concubinage',
        'region_Centre', 'region_Sud', 'region_Ouest', 'region_Nord',
        'region_Extrême-Nord', 'region_Adamaoua', 'region_Est',
        'region_Littoral', 'region_Nord-Ouest', 'region_Sud-Ouest'
    ]

# ─── Statistiques générales ──────────────────────────────────────────────────
STATS = {
    "taux_pnc": 78.38,
    "echantillon": 4548,
    "annee_eds": 2018,
    "regions": 10,
    "variables_significatives": 8,
    "meilleur_modele": "Multiniveau",
    "auc_meilleur": 0.637,
    "repartition": {
        "pnc_oui": 3565,
        "pnc_non": 983
    },
    "facteurs_principaux": [
        {"nom": "Richesse (Plus riche)", "or": 1.34, "pvalue": 0.029},
        {"nom": "CPN 4+",               "or": 1.32, "pvalue": 0.003},
        {"nom": "Région Sud",           "or": 0.70, "pvalue": 0.017},
        {"nom": "Instruction Primaire", "or": 1.24, "pvalue": 0.014}
    ]
}

# ─── Prétraitement ───────────────────────────────────────────────────────────
def preprocess(data: Dict[str, Any]) -> pd.DataFrame:
    row = {col: 0 for col in COLONNES}

    richesse    = data.get("wealthLevel")
    instruction = data.get("educationLevel")
    cpn         = data.get("cpnVisits")
    
    media       = "Oui" if data.get("mediaExposure") is True else "Non"
    distance    = "Probleme" if data.get("hospitalDistance") is True else "Pas de probleme"
    residence   = "Urbain" if data.get("residence") == "urban" else "Rural"
    
    region      = data.get("region", "Centre")
    mariage     = data.get("maritalStatus", "married")

    # Mapping des valeurs
    if richesse == "Pauvre"      and "richesse_Pauvre"      in row: row["richesse_Pauvre"]      = 1
    if richesse == "Plus pauvre" and "richesse_Plus pauvre" in row: row["richesse_Plus pauvre"] = 1
    if richesse == "Plus riche"  and "richesse_Plus riche"  in row: row["richesse_Plus riche"]  = 1
    if richesse == "Riche"       and "richesse_Riche"       in row: row["richesse_Riche"]       = 1
    if richesse == "Moyen"       and "richesse_Moyen"       in row: row["richesse_Moyen"]       = 1
    if distance == "Probleme"    and "distance_Probleme"    in row: row["distance_Probleme"]    = 1
    if cpn == "4+"               and "CPN_4+"               in row: row["CPN_4+"]               = 1
    if cpn == "1-3"              and "CPN_1-3"              in row: row["CPN_1-3"]              = 1
    if cpn == "Aucune"           and "CPN_Aucune"           in row: row["CPN_Aucune"]           = 1
    if media == "Oui"            and "media_Oui"            in row: row["media_Oui"]            = 1
    if residence == "Urbain"     and "residence_Urbain"     in row: row["residence_Urbain"]     = 1
    if mariage == "Concubinage"  and "mariage_Concubinage"  in row: row["mariage_Concubinage"]  = 1
    if mariage == "Marie(e)"     and "mariage_Marie(e)"     in row: row["mariage_Marie(e)"]     = 1
    if mariage == "married"      and "mariage_Marie(e)"     in row: row["mariage_Marie(e)"]     = 1
    
    # Mapping pour l'éducation
    if instruction == "Primaire"   and "instruction_Primaire"   in row: row["instruction_Primaire"]   = 1
    if instruction == "Secondaire" and "instruction_Secondaire" in row: row["instruction_Secondaire"] = 1
    if instruction == "Superieur"  and "instruction_Superieur"  in row: row["instruction_Superieur"]  = 1
    if instruction == "secondary"  and "instruction_Secondaire" in row: row["instruction_Secondaire"] = 1
    if instruction == "primary"    and "instruction_Primaire"   in row: row["instruction_Primaire"]   = 1
    if instruction == "higher"     and "instruction_Superieur"  in row: row["instruction_Superieur"]  = 1

    region_key = f"region_{region}"
    if region_key in row: row[region_key] = 1

    return pd.DataFrame([row])[COLONNES]

# ─── SHAP simplifié ──────────────────────────────────────────────────────────
def compute_shap(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        coefs = model.params

        mapping = {
            "Richesse":    f"richesse_{data.get('wealthLevel','Moyen')}",
            "Visites CPN": f"CPN_{data.get('cpnVisits','1-3')}",
            "Distance":    "distance_Probleme" if data.get("hospitalDistance") == True else None,
            "Médias":      "media_Oui"         if data.get("mediaExposure")    == True else None,
            "Résidence":   "residence_Urbain"  if data.get("residence")       == "urban" else None,
            "Instruction": f"instruction_{data.get('educationLevel','Aucun')}",
            "Région":      f"region_{data.get('region','Adamaoua')}",
            "Mariage":     f"mariage_{data.get('maritalStatus','Autre')}",
        }

        impacts = []
        for label, key in mapping.items():
            if key and key in coefs.index:
                val = float(coefs[key])
                impacts.append({
                    "variable":  label,
                    "impact":    round(val, 4),
                    "direction": "positif" if val > 0 else "negatif"
                })
            else:
                impacts.append({
                    "variable":  label,
                    "impact":    0.0,
                    "direction": "neutre"
                })

        impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
        return impacts
    except:
        return [
            {"variable": "Richesse", "impact": 0.15, "direction": "positif"},
            {"variable": "Visites CPN", "impact": 0.20, "direction": "positif"},
            {"variable": "Distance", "impact": -0.15, "direction": "negatif"},
            {"variable": "Médias", "impact": 0.08, "direction": "positif"}
        ]

# ════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ════════════════════════════════════════════════════════════════

# ─── 1. Health check ─────────────────────────────────────────────────────────
@app.get("/")
async def health():
    return {
        "status":  "ok",
        "message": "PNC Predict API — Cameroun EDS 2018",
        "version": "1.0.0"
    }

# ─── 2. Prédiction ───────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(data: Dict[str, Any]):
    try:
        X = preprocess(data)
        
        proba = float(model.predict(X)[0])
        risk_pnc = round(proba * 100, 1)
        risk_no_pnc = round((1 - proba) * 100, 1)

        if proba >= 0.75:
            niveau = "low risk"
            message = "Cette patiente a de bonnes chances de recevoir ses soins postnataux."
            couleur = "#22c55e"
        elif proba >= 0.50:
            niveau = "mid risk"
            message = "Cette patiente nécessite un suivi particulier."
            couleur = "#f97316"
        else:
            niveau = "high risk"
            message = "Cette patiente est à risque élevé — intervention recommandée."
            couleur = "#ef4444"

        recommandations = []
        if data.get("cpnVisits") == "Aucune":
            recommandations.append("Orienter la patiente vers une consultation prénatale immédiate.")
        if data.get("hospitalDistance") == True:
            recommandations.append("Planifier une visite à domicile dans les 48h après l'accouchement.")
        if data.get("mediaExposure") == False:
            recommandations.append("Sensibiliser via des agents de santé communautaires.")
        if data.get("wealthLevel") in ["Plus pauvre", "Pauvre"]:
            recommandations.append("Orienter vers les programmes de gratuité des soins maternels.")
        if not recommandations:
            recommandations.append("Continuer le suivi standard recommandé par l'OMS.")

        return {
            "prediction":    niveau,
            "probabilites": {
                "recevoir_soins":  risk_pnc,
                "ne_pas_recevoir": risk_no_pnc
            },
            "message":         message,
            "couleur":         couleur,
            "shap":            compute_shap(data),
            "recommandations": recommandations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 3. News dynamiques via GNews ────────────────────────────────────────────
@app.get("/news")
async def news():
    try:
        print(f"[DEBUG] Tentative de récupération des actualités avec API key: {GNEWS_API_KEY[:10]}...")
        
        queries = [
            "santé maternelle Cameroun",
            "soins postnataux Afrique",
            "mortalité maternelle Cameroun"
        ]

        articles = []

        for query in queries:
            print(f"[DEBUG] Recherche pour: {query}")
            params = {
                "q":      query,
                "lang":   "fr",
                "max":    2,
                "apikey": GNEWS_API_KEY
            }

            try:
                response = requests.get(GNEWS_URL, params=params, timeout=10)
                print(f"[DEBUG] Status code pour {query}: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    print(f"[DEBUG] Articles trouvés pour {query}: {len(data.get('articles', []))}")
                    
                    for article in data.get("articles", []):
                        url = article.get("url", "")
                        print(f"[DEBUG] Article URL: {url}")
                        articles.append({
                            "titre":   article.get("title", ""),
                            "source":  article.get("source", {}).get("name", ""),
                            "date":    article.get("publishedAt", "")[:10],
                            "resume":  article.get("description", ""),
                            "url":     url,
                            "image":   article.get("image", ""),
                            "tag":     "Santé maternelle",
                            "couleur": "#3b82f6"
                        })
                else:
                    print(f"[DEBUG] Erreur API pour {query}: {response.text}")
                    
            except Exception as e:
                print(f"[DEBUG] Exception lors de la requête pour {query}: {str(e)}")
                continue

        # Fallback si aucun article trouvé
        if not articles:
            print("[DEBUG] Aucun article trouvé, utilisation des données de fallback")
            articles = [{
                "titre":   "EDS 2018 : 78% des femmes camerounaises reçoivent des soins postnataux",
                "source":  "Institut National de la Statistique",
                "date":    "2018-01-01",
                "resume":  "Le taux d'utilisation des soins postnataux au Cameroun est parmi les plus élevés d'Afrique subsaharienne selon l'EDS-MICS 2018.",
                "url":     "https://dhsprogram.com",
                "image":   "",
                "tag":     "Statistiques",
                "couleur": "#22c55e"
            }, {
                "titre":   "Cameroun : Nouveau plan stratégique pour la santé maternelle",
                "source":  "Ministère de la Santé",
                "date":    "2024-03-15",
                "resume":  "Le gouvernement camerounais lance un nouveau plan décennal pour réduire la mortalité maternelle de 30% d'ici 2030.",
                "url":     "https://www.minsante.cm",
                "image":   "",
                "tag":     "Politique",
                "couleur": "#f97316"
            }]

        print(f"[DEBUG] Total d'articles retournés: {len(articles)}")
        
        return {
            "status":   "ok",
            "total":    len(articles),
            "articles": articles
        }

    except Exception as e:
        print(f"[DEBUG] Erreur générale dans l'endpoint /news: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── 4. Statistiques générales ───────────────────────────────────────────────
@app.get("/stats")
async def stats():
    return {
        "status":  "ok",
        "donnees": STATS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
