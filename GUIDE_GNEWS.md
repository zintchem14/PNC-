# Guide pour résoudre le problème GNews

## Problème
Les news ne redirigent pas vers les vrais sites web ou n'affichent pas les vraies informations.

## Diagnostic

### 1. Vérifier que le backend est démarré
Le backend doit être en cours d'exécution pour que les news fonctionnent.

**Pour le backend Flask (port 7860):**
```bash
python backend.py
```

**Pour le backend FastAPI (port 8000):**
```bash
python backend_fastapi.py
```

### 2. Vérifier la clé API GNews
La clé API est stockée dans `.env.backend`:
```
GNEWS_API_KEY=61cd6cb5a8ec3b655ea55bc188ea9121
```

Si cette clé ne fonctionne plus, vous devez:
1. Obtenir une nouvelle clé API sur https://gnews.io/
2. Remplacer la clé dans `.env.backend`
3. Redémarrer le backend

### 3. Tester l'API GNews
Pour vérifier si la clé API fonctionne, exécutez:
```bash
python test_gnews.py
```

Ce script va:
- Lire la clé API depuis `.env.backend`
- Faire une requête à l'API GNews
- Afficher les articles et leurs URLs

### 4. Vérifier les logs du backend
Les backends (Flask et FastAPI) affichent maintenant des messages de debug:
- `[DEBUG] Status code pour {query}: {response.status_code}`
- `[DEBUG] Article URL: {url}`

Si les URLs sont vides ou manquantes, c'est que l'API GNews ne les retourne pas.

## Solution

### Option 1: Corriger la clé API
Si la clé API est expirée ou invalide:
1. Obtenez une nouvelle clé sur https://gnews.io/
2. Mettez à jour `.env.backend` avec la nouvelle clé
3. Redémarrez le backend

### Option 2: Utiliser une autre source de news
Si l'API GNews ne fonctionne pas, vous pouvez modifier le backend pour utiliser une autre API de news comme:
- NewsAPI (https://newsapi.org/)
- Bing News API

### Option 3: Vérifier le frontend
Le code frontend (`components/dashboard/news-feed.tsx`) a une fonction `resolveUrl` qui:
1. Utilise l'URL de l'article si elle existe
2. Sinon, fait une recherche Google News sur le titre

Si les articles n'ont pas d'URL, le frontend fera automatiquement une recherche Google News.

## Étapes de dépannage

1. **Démarrer le backend**
   ```bash
   python backend.py
   # ou
   python backend_fastapi.py
   ```

2. **Tester l'endpoint /news**
   ```bash
   curl http://localhost:7860/news
   # ou
   curl http://localhost:8000/news
   ```

3. **Vérifier la réponse**
   - Si la réponse contient des articles avec des URLs, le problème est dans le frontend
   - Si la réponse ne contient pas d'URLs, le problème est dans l'API GNews

4. **Tester l'API GNews directement**
   ```bash
   python test_gnews.py
   ```

5. **Corriger selon le diagnostic**
   - Si la clé API ne fonctionne pas: obtenir une nouvelle clé
   - Si le backend ne fonctionne pas: vérifier les dépendances
   - Si le frontend ne fonctionne pas: vérifier la console du navigateur

## Code modifié

J'ai ajouté du debug dans les backends pour afficher les URLs:
- `backend.py` ligne 318-319
- `backend_fastapi.py` ligne 289-290

Cela permettra de voir si les URLs sont bien extraites de l'API GNews.
