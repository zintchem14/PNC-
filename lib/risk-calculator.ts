import type { PatientData, RiskScore, VulnerabilityProfile, ImpactFactor, Recommendation } from './types'

export function calculateRiskScore(data: PatientData): RiskScore {
  let score = 50 // Base score

  // Region impact (rural regions have higher risk)
  const highRiskRegions = ['Extrême-Nord', 'Nord', 'Adamaoua', 'Est']
  if (highRiskRegions.includes(data.region)) {
    score -= 15
  } else {
    score += 10
  }

  // Residence impact
  if (data.residence === 'rural') {
    score -= 12
  } else {
    score += 8
  }

  // Education level impact
  const educationScores: Record<string, number> = {
    none: -20,
    primary: -5,
    secondary: 10,
    higher: 20,
  }
  score += educationScores[data.educationLevel] || 0

  // CPN visits impact
  const cpnScores: Record<string, number> = {
    '0': -25,
    '1-3': 5,
    '4+': 20,
  }
  score += cpnScores[data.cpnVisits] || 0

  // Media exposure
  if (data.mediaExposure) {
    score += 8
  } else {
    score -= 8
  }

  // Hospital distance
  if (data.hospitalDistance) {
    score -= 15
  } else {
    score += 10
  }

  // Wealth level (0-100)
  score += (data.wealthLevel - 50) * 0.4

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score))

  // Determine risk level
  let level: 'low' | 'medium' | 'high'
  let label: string

  if (score >= 70) {
    level = 'low'
    label = 'Accès Favorable'
  } else if (score >= 40) {
    level = 'medium'
    label = 'Attention Requise'
  } else {
    level = 'high'
    label = 'Risque Élevé'
  }

  return { value: Math.round(score), level, label }
}

export function calculateVulnerabilityProfile(data: PatientData): VulnerabilityProfile[] {
  const highRiskRegions = ['Extrême-Nord', 'Nord', 'Adamaoua', 'Est']
  
  return [
    {
      factor: 'Géographie',
      value: highRiskRegions.includes(data.region) ? 30 : 80,
      fullMark: 100,
    },
    {
      factor: 'Éducation',
      value: data.educationLevel === 'higher' ? 90 : data.educationLevel === 'secondary' ? 70 : data.educationLevel === 'primary' ? 45 : 20,
      fullMark: 100,
    },
    {
      factor: 'Soins prénataux',
      value: data.cpnVisits === '4+' ? 95 : data.cpnVisits === '1-3' ? 55 : 15,
      fullMark: 100,
    },
    {
      factor: 'Accessibilité',
      value: data.hospitalDistance ? 25 : 85,
      fullMark: 100,
    },
    {
      factor: 'Richesse',
      value: data.wealthLevel,
      fullMark: 100,
    },
    {
      factor: 'Information',
      value: data.mediaExposure ? 80 : 30,
      fullMark: 100,
    },
    {
      factor: 'Urbanisation',
      value: data.residence === 'urban' ? 85 : 35,
      fullMark: 100,
    },
    {
      factor: 'Statut social',
      value: data.maritalStatus === 'married' ? 75 : 50,
      fullMark: 100,
    },
  ]
}

export function calculateImpactFactors(data: PatientData): ImpactFactor[] {
  const factors: ImpactFactor[] = []
  const highRiskRegions = ['Extrême-Nord', 'Nord', 'Adamaoua', 'Est']

  // CPN visits impact
  if (data.cpnVisits === '4+') {
    factors.push({ name: 'Visites CPN (4+)', impact: 25, direction: 'positive' })
  } else if (data.cpnVisits === '0') {
    factors.push({ name: 'Aucune visite CPN', impact: -30, direction: 'negative' })
  }

  // Education impact
  if (data.educationLevel === 'higher') {
    factors.push({ name: 'Niveau supérieur', impact: 22, direction: 'positive' })
  } else if (data.educationLevel === 'none') {
    factors.push({ name: 'Sans éducation', impact: -25, direction: 'negative' })
  }

  // Region impact
  if (highRiskRegions.includes(data.region)) {
    factors.push({ name: `Région ${data.region}`, impact: -18, direction: 'negative' })
  } else {
    factors.push({ name: `Région ${data.region}`, impact: 12, direction: 'positive' })
  }

  // Hospital distance
  if (data.hospitalDistance) {
    factors.push({ name: 'Distance hôpital', impact: -20, direction: 'negative' })
  } else {
    factors.push({ name: 'Proximité hôpital', impact: 15, direction: 'positive' })
  }

  // Wealth level
  if (data.wealthLevel >= 70) {
    factors.push({ name: 'Niveau de richesse', impact: 18, direction: 'positive' })
  } else if (data.wealthLevel <= 30) {
    factors.push({ name: 'Niveau de richesse', impact: -15, direction: 'negative' })
  }

  // Residence
  if (data.residence === 'rural') {
    factors.push({ name: 'Zone rurale', impact: -14, direction: 'negative' })
  } else {
    factors.push({ name: 'Zone urbaine', impact: 10, direction: 'positive' })
  }

  // Media exposure
  if (data.mediaExposure) {
    factors.push({ name: 'Exposition médias', impact: 10, direction: 'positive' })
  } else {
    factors.push({ name: 'Pas d\'accès médias', impact: -10, direction: 'negative' })
  }

  // Sort by absolute impact
  return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
}

export function generateRecommendations(data: PatientData, riskScore: RiskScore): Recommendation[] {
  const recommendations: Recommendation[] = []

  if (riskScore.level === 'high') {
    recommendations.push({
      id: '1',
      priority: 'high',
      title: 'Alerter l\'agent communautaire',
      description: 'Contacter immédiatement l\'agent de santé communautaire pour un suivi rapproché de la patiente.',
      icon: 'alert',
    })
  }

  if (data.cpnVisits === '0') {
    recommendations.push({
      id: '2',
      priority: 'high',
      title: 'Planifier visite CPN urgente',
      description: 'La patiente n\'a effectué aucune consultation prénatale. Organiser une visite dans les 48h.',
      icon: 'calendar',
    })
  }

  if (data.hospitalDistance) {
    recommendations.push({
      id: '3',
      priority: 'medium',
      title: 'Organiser transport médical',
      description: 'Prévoir un moyen de transport pour les urgences obstétriques vu la distance du centre de santé.',
      icon: 'truck',
    })
  }

  if (data.educationLevel === 'none' || data.educationLevel === 'primary') {
    recommendations.push({
      id: '4',
      priority: 'medium',
      title: 'Session d\'éducation sanitaire',
      description: 'Programmer une séance d\'information sur les soins postnataux et les signes de danger.',
      icon: 'book',
    })
  }

  if (!data.mediaExposure) {
    recommendations.push({
      id: '5',
      priority: 'low',
      title: 'Fournir documentation illustrée',
      description: 'Remettre des supports visuels sur les soins essentiels du nouveau-né et de la mère.',
      icon: 'file',
    })
  }

  if (data.residence === 'rural') {
    recommendations.push({
      id: '6',
      priority: 'medium',
      title: 'Identifier accompagnant',
      description: 'S\'assurer qu\'un membre de la famille peut accompagner la patiente lors des consultations.',
      icon: 'users',
    })
  }

  return recommendations.slice(0, 4)
}
