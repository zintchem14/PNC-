import requests
import json
import os

# Lecture de la clé API depuis .env.backend
def load_env_file(path: str):
    env_vars = {}
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k:
                        env_vars[k] = v
    except Exception as e:
        print(f"Erreur lecture .env.backend: {e}")
    return env_vars

env_vars = load_env_file(".env.backend")
GNEWS_API_KEY = env_vars.get("GNEWS_API_KEY", "")
GNEWS_URL = "https://gnews.io/api/v4/search"

if not GNEWS_API_KEY:
    print("ERREUR: Clé API GNews non trouvée dans .env.backend")
    exit(1)

params = {
    "q": "santé maternelle Cameroun",
    "lang": "fr",
    "max": 2,
    "apikey": GNEWS_API_KEY
}

print(f"Test de l'API GNews avec la clé: {GNEWS_API_KEY[:6]}***")
print(f"URL: {GNEWS_URL}")
print(f"Paramètres: {params}")
print("-" * 50)

try:
    response = requests.get(GNEWS_URL, params=params, timeout=10)
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Articles trouvés: {len(data.get('articles', []))}")
        
        for i, article in enumerate(data.get("articles", []), 1):
            print(f"\n--- Article {i} ---")
            print(f"Titre: {article.get('title', '')}")
            url = article.get('url', '')
            print(f"URL: {url}")
            print(f"URL valide: {bool(url and url.strip())}")
            print(f"Source: {article.get('source', {}).get('name', '')}")
            print(f"Image: {article.get('image', '')}")
            print(f"Description: {article.get('description', '')[:100]}...")
    else:
        print(f"Erreur: {response.text}")
        
except Exception as e:
    print(f"Exception: {str(e)}")
