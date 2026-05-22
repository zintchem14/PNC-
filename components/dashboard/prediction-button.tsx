'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { predictPNC, type PatientData, type PredictionResult } from '@/lib/api'

interface PredictionButtonProps {
  patientData: PatientData
  onPredictionComplete?: (result: PredictionResult) => void
}

export function PredictionButton({ patientData, onPredictionComplete }: PredictionButtonProps) {
  const [isPredicting, setIsPredicting] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePrediction = async () => {
    setIsPredicting(true)
    setError(null)
    
    try {
      const predictionResult = await predictPNC(patientData)
      setResult(predictionResult)
      onPredictionComplete?.(predictionResult)
    } catch (err) {
      console.error('Erreur de prédiction:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsPredicting(false)
    }
  }

  const getRiskIcon = (prediction: string) => {
    switch (prediction) {
      case 'low risk':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'mid risk':
        return <TrendingUp className="h-5 w-5 text-orange-500" />
      case 'high risk':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Brain className="h-5 w-5 text-gray-500" />
    }
  }

  const getRiskBadgeVariant = (prediction: string) => {
    switch (prediction) {
      case 'low risk':
        return 'default'
      case 'mid risk':
        return 'secondary'
      case 'high risk':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      {/* Bouton de prédiction principal */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Brain className="h-5 w-5 text-primary" />
            Analyse de Prédiction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handlePrediction}
            disabled={isPredicting}
            className="w-full h-12 text-base font-medium gap-2"
            size="lg"
          >
            {isPredicting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Lancer la Prédiction PNC
              </>
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-md bg-destructive/10 border border-destructive/20"
            >
              <p className="text-sm text-destructive">Erreur: {error}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Résultats de prédiction */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Carte de résultat principal */}
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-semibold">
                <span>Résultat de la Prédiction</span>
                <div className="flex items-center gap-2">
                  {getRiskIcon(result.prediction)}
                  <Badge variant={getRiskBadgeVariant(result.prediction)}>
                    {result.prediction === 'low risk' ? 'Faible Risque' : 
                     result.prediction === 'mid risk' ? 'Risque Moyen' : 'Risque Élevé'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message principal */}
              <div 
                className="p-4 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: result.couleur }}
              >
                {result.message}
              </div>

              {/* Probabilités */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {result.probabilites.recevoir_soins}%
                  </div>
                  <div className="text-xs text-green-600">Probabilité de recevoir les soins</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {result.probabilites.ne_pas_recevoir}%
                  </div>
                  <div className="text-xs text-red-600">Probabilité de ne pas recevoir les soins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facteurs d'impact */}
          <Card className="border-border/50 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Facteurs d'Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.shap.slice(0, 5).map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{factor.variable}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        factor.direction === 'positif' ? 'text-green-600' : 
                        factor.direction === 'negatif' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        factor.direction === 'positif' ? 'bg-green-500' : 
                        factor.direction === 'negatif' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          {result.recommandations.length > 0 && (
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.recommandations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
