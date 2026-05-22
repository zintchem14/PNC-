// Configuration de l'API
// README: le backend Flask tourne par défaut sur http://localhost:7860
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860'

// Interface pour les données patient
export interface PatientData {
  region: string
  residence: string
  educationLevel: string
  maritalStatus: string
  cpnVisits: string
  mediaExposure: boolean
  hospitalDistance: boolean
  wealthLevel: string | number
}

// Interface pour les résultats de prédiction
export interface PredictionResult {
  prediction: string
  probabilites: {
    recevoir_soins: number
    ne_pas_recevoir: number
  }
  message: string
  couleur: string
  shap: Array<{
    variable: string
    impact: number
    direction: string
  }>
  recommandations: string[]
}

// Fonction pour faire la prédiction
export async function predictPNC(patientData: PatientData): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(patientData)
    })
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.erreur) {
      throw new Error(result.erreur)
    }
    
    return result
  } catch (error) {
    console.error('Erreur API:', error)
    
    // En cas d'erreur de connexion, retourner un résultat par défaut
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return {
        prediction: 'mid risk',
        probabilites: {
          recevoir_soins: 65.0,
          ne_pas_recevoir: 35.0
        },
        message: 'Mode démo: Le backend n\'est pas accessible. Veuillez démarrer le serveur Flask.',
        couleur: '#f97316',
        shap: [
          { variable: 'Richesse', impact: 0.15, direction: 'positif' },
          { variable: 'Visites CPN', impact: 0.20, direction: 'positif' },
          { variable: 'Distance', impact: -0.15, direction: 'negatif' }
        ],
        recommandations: ['Vérifier que le backend Flask est démarré sur localhost:7860']
      }
    }
    
    throw error
  }
}

// Fonction pour récupérer les statistiques
export async function getStats() {
  try {
    const response = await fetch(`${API_URL}/stats`)
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Erreur stats:', error)
    return null
  }
}

// Fonction pour récupérer les actualités
export async function getNews() {
  try {
    // Certains projets utilisent le backend Flask (7860) ou FastAPI (8000).
    // On essaye l'URL configurée puis l'alternative (si applicable) pour éviter un "Failed to fetch".
    const candidates = [API_URL]
    const alt =
      API_URL.includes(':7860')
        ? API_URL.replace(':7860', ':8000')
        : API_URL.includes(':8000')
          ? API_URL.replace(':8000', ':7860')
          : null
    if (alt && !candidates.includes(alt)) candidates.push(alt)

    let response: Response | null = null
    let lastError: unknown = null
    for (const baseUrl of candidates) {
      try {
        response = await fetch(`${baseUrl}/news`, { cache: 'no-store' })
        break
      } catch (e) {
        lastError = e
      }
    }
    if (!response) throw lastError || new Error('Failed to fetch')
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Erreur HTTP: ${response.status}${text ? ` - ${text}` : ''}`)
    }
    return await response.json()
  } catch (error) {
    // Pas de fallback "fake" : on remonte l'erreur au composant UI.
    throw error
  }
}

// Fonction de health check
export async function healthCheck() {
  try {
    const response = await fetch(`${API_URL}/`)
    return response.ok
  } catch (error) {
    return false
  }
}
