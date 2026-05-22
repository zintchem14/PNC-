'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope, RefreshCw, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarNav } from './sidebar-nav'
import { PatientInputForm } from './patient-input-form'
import { RiskGauge, MiniRiskGauges } from './risk-gauge'
import { VulnerabilityRadar } from './vulnerability-radar'
import { ImpactChart } from './impact-chart'
import { Recommendations } from './recommendations'
import { NewsFeed } from './news-feed'
import { PredictionButton } from './prediction-button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { PatientData } from '@/lib/types'
import { 
  calculateRiskScore, 
  calculateVulnerabilityProfile, 
  calculateImpactFactors,
  generateRecommendations 
} from '@/lib/risk-calculator'

const defaultPatientData: PatientData = {
  region: 'Centre',
  residence: 'urban',
  educationLevel: 'secondary',
  maritalStatus: 'married',
  cpnVisits: '1-3',
  mediaExposure: true,
  hospitalDistance: false,
  wealthLevel: 50,
}

export function PNCDashboard() {
  const [patientData, setPatientData] = useState<PatientData>(defaultPatientData)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [activeView, setActiveView] = useState<
    'dashboard' | 'patients' | 'analytics' | 'reports' | 'pnc-followup' | 'settings' | 'help'
  >('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { toast } = useToast()

  const riskScore = useMemo(() => calculateRiskScore(patientData), [patientData])
  const vulnerabilityProfile = useMemo(() => calculateVulnerabilityProfile(patientData), [patientData])
  const impactFactors = useMemo(() => calculateImpactFactors(patientData), [patientData])
  const recommendations = useMemo(() => generateRecommendations(patientData, riskScore), [patientData, riskScore])

  const handleReset = () => {
    setIsAnalyzing(true)
    setPredictionResult(null)
    setTimeout(() => {
      setPatientData(defaultPatientData)
      setIsAnalyzing(false)
    }, 500)
  }

  const handleDataChange = (newData: PatientData) => {
    setPatientData(newData)
    setPredictionResult(null)
  }

  const handlePredictionComplete = (result: any) => {
    setPredictionResult(result)
  }

  const buildExportPayload = () => ({
    generatedAt: new Date().toISOString(),
    patientData,
    riskScore,
    vulnerabilityProfile,
    impactFactors,
    recommendations,
    predictionResult,
  })

  const handleExport = () => {
    const payload = buildExportPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pnc-report-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast({ title: 'Export effectué', description: 'Le fichier JSON a été téléchargé.' })
  }

  const handleShare = async () => {
    const payload = buildExportPayload()
    const summary = [
      'PNC Predict',
      `Risque (score): ${riskScore}/100`,
      `Région: ${patientData.region}`,
      predictionResult?.prediction ? `Prédiction: ${predictionResult.prediction}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'PNC Predict',
          text: summary,
          url: window.location.href,
        })
        toast({ title: 'Partage', description: 'Partage envoyé.' })
        return
      }

      await navigator.clipboard.writeText(
        `${summary}\n\nDonnées (JSON):\n${JSON.stringify(payload, null, 2)}`
      )
      toast({ title: 'Copié', description: 'Résumé + données copiés dans le presse-papiers.' })
    } catch (e) {
      console.error('Erreur partage:', e)
      toast({ title: 'Erreur', description: 'Impossible de partager/copier pour le moment.' })
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="p-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column - Patient Input */}
              <div className="lg:col-span-4 space-y-6">
                <PatientInputForm data={patientData} onChange={handleDataChange} />
                <PredictionButton
                  patientData={patientData}
                  onPredictionComplete={handlePredictionComplete}
                />
              </div>

              {/* Center Column - Analysis */}
              <div className="space-y-6 lg:col-span-8">
                {/* Risk Score Section */}
                <Card className="border-border/50 bg-card shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base font-semibold text-foreground">
                      <span>Prédiction d&apos;Accès aux Soins Postnataux</span>
                      <AnimatePresence>
                        {isAnalyzing && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-normal text-muted-foreground"
                          >
                            Analyse en cours...
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex items-center justify-center">
                        <RiskGauge score={riskScore} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="mb-4 text-sm font-medium text-foreground">
                          Indicateurs Secondaires
                        </h3>
                        <MiniRiskGauges score={riskScore} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <VulnerabilityRadar data={vulnerabilityProfile} />
                  <ImpactChart factors={impactFactors} />
                </div>

                {/* Recommendations */}
                <Recommendations recommendations={recommendations} />
              </div>
            </div>
          </div>
        )

      case 'patients':
        return (
          <div className="p-6">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Patientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Cette section est prête à recevoir une liste/gestion des patientes. Pour l’instant,
                  elle affiche le profil en cours (démo) pour éviter une page vide.
                </p>
                <pre className="max-h-[420px] overflow-auto rounded-lg bg-muted p-3 text-xs text-foreground">
                  {JSON.stringify(patientData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )

      case 'analytics':
        return (
          <div className="p-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <VulnerabilityRadar data={vulnerabilityProfile} />
              <ImpactChart factors={impactFactors} />
            </div>
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Interprétation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ajustez les paramètres du profil patiente pour voir l’impact sur les facteurs de
                vulnérabilité et d’influence.
              </CardContent>
            </Card>
          </div>
        )

      case 'reports':
        return (
          <div className="p-6">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Rapports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exportez un rapport (JSON) ou partagez un résumé. (On peut ensuite ajouter PDF/CSV
                  si vous préférez.)
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Exporter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'pnc-followup':
        return (
          <div className="p-6 space-y-6">
            <Recommendations recommendations={recommendations} />
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Suivi PNC</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                À compléter: plan de suivi, rappels, tâches et historique. (Mais la page n’est plus
                vide.)
              </CardContent>
            </Card>
          </div>
        )

      case 'settings':
        return (
          <div className="p-6">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                À compléter: URL backend, mode démo, thèmes, etc.
              </CardContent>
            </Card>
          </div>
        )

      case 'help':
        return (
          <div className="p-6">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Aide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Démarrer le backend: <code>python backend.py</code> (port 7860)</p>
                <p>• Démarrer le frontend: <code>npm run dev</code> (port 3000)</p>
                <p>• Si le flux d’actualités ne charge pas, l’app passe en données locales.</p>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <SidebarNav
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        activeItem={activeView}
        onActiveItemChange={(id) => setActiveView(id as any)}
      />

      {/* Right News Feed */}
      <NewsFeed />

      {/* Main Content */}
      <main
        className={cn(
          'mr-0 min-h-screen xl:mr-80',
          sidebarCollapsed ? 'ml-20' : 'ml-20 lg:ml-[260px]',
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isAnalyzing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isAnalyzing ? Infinity : 0, ease: 'linear' }}
              >
                <Stethoscope className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">PNC Predict</h1>
                <p className="text-xs text-muted-foreground">Anticiper pour mieux protéger</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>
        </header>

        {renderView()}

        {/* Footer */}
        <footer className="border-t border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 PNC Predict - Système de prédiction pour l&apos;accès aux soins postnataux</p>
            <p>Données basées sur les indicateurs de santé maternelle au Cameroun</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
