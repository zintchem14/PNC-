export interface PatientData {
  region: string
  residence: 'urban' | 'rural'
  educationLevel: string
  maritalStatus: string
  cpnVisits: '0' | '1-3' | '4+'
  mediaExposure: boolean
  hospitalDistance: boolean
  wealthLevel: number
}

export interface RiskScore {
  value: number
  level: 'low' | 'medium' | 'high'
  label: string
}

export interface VulnerabilityProfile {
  factor: string
  value: number
  fullMark: number
}

export interface ImpactFactor {
  name: string
  impact: number
  direction: 'positive' | 'negative'
}

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  imageUrl: string
  source: string
}

export interface Recommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  icon: string
}

export const CAMEROON_REGIONS = [
  'Adamaoua',
  'Centre',
  'Est',
  'Extrême-Nord',
  'Littoral',
  'Nord',
  'Nord-Ouest',
  'Ouest',
  'Sud',
  'Sud-Ouest',
] as const

export const EDUCATION_LEVELS = [
  { value: 'none', label: 'Aucun' },
  { value: 'primary', label: 'Primaire' },
  { value: 'secondary', label: 'Secondaire' },
  { value: 'higher', label: 'Supérieur' },
] as const

export const MARITAL_STATUS = [
  { value: 'single', label: 'Célibataire' },
  { value: 'married', label: 'Mariée' },
  { value: 'divorced', label: 'Divorcée' },
  { value: 'widowed', label: 'Veuve' },
] as const
