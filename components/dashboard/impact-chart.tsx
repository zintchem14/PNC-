'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImpactFactor } from '@/lib/types'

interface ImpactChartProps {
  factors: ImpactFactor[]
}

export function ImpactChart({ factors }: ImpactChartProps) {
  const maxImpact = Math.max(...factors.map(f => Math.abs(f.impact)))

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          Analyse d&apos;Impact (Style SHAP)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Contribution de chaque facteur au score de prédiction
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {factors.map((factor, index) => (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, x: factor.direction === 'positive' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="group"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{factor.name}</span>
              <div className="flex items-center gap-1">
                {factor.direction === 'positive' ? (
                  <TrendingUp className="h-3 w-3 text-risk-low" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-risk-high" />
                )}
                <span className={cn(
                  "text-xs font-semibold",
                  factor.direction === 'positive' ? "text-risk-low" : "text-risk-high"
                )}>
                  {factor.direction === 'positive' ? '+' : ''}{factor.impact}
                </span>
              </div>
            </div>
            
            <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted/50">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 z-10 h-full w-px bg-border" />
              
              {/* Impact bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(Math.abs(factor.impact) / maxImpact) * 50}%` }}
                transition={{ delay: index * 0.08 + 0.2, duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  "absolute top-0 h-full rounded-full transition-all group-hover:brightness-110",
                  factor.direction === 'positive' 
                    ? "left-1/2 bg-gradient-to-r from-risk-low/80 to-risk-low"
                    : "right-1/2 bg-gradient-to-l from-risk-high/80 to-risk-high"
                )}
                style={{
                  boxShadow: factor.direction === 'positive' 
                    ? '0 0 10px rgba(40, 167, 69, 0.3)' 
                    : '0 0 10px rgba(220, 53, 69, 0.3)'
                }}
              />
            </div>
          </motion.div>
        ))}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-risk-high" />
            <span>Réduit l&apos;accès</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Améliore l&apos;accès</span>
            <TrendingUp className="h-3 w-3 text-risk-low" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
