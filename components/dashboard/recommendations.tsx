'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertTriangle, 
  Calendar, 
  Truck, 
  BookOpen, 
  FileText, 
  Users,
  Lightbulb,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/lib/types'

interface RecommendationsProps {
  recommendations: Recommendation[]
}

const iconMap: Record<string, React.ElementType> = {
  alert: AlertTriangle,
  calendar: Calendar,
  truck: Truck,
  book: BookOpen,
  file: FileText,
  users: Users,
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-risk-medium/20">
            <Lightbulb className="h-4 w-4 text-risk-medium" />
          </div>
          Actions Cliniques
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Recommandations personnalisées basées sur le profil
        </p>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <CheckCircle2 className="mb-2 h-10 w-10 text-risk-low" />
                <p className="text-sm font-medium text-foreground">Aucune action urgente</p>
                <p className="text-xs text-muted-foreground">Le profil de la patiente est favorable</p>
              </motion.div>
            ) : (
              recommendations.map((rec, index) => {
                const Icon = iconMap[rec.icon] || AlertTriangle
                
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border p-3 transition-all hover:shadow-md",
                      rec.priority === 'high' 
                        ? "border-risk-high/30 bg-risk-high/5 hover:border-risk-high/50"
                        : rec.priority === 'medium'
                        ? "border-risk-medium/30 bg-risk-medium/5 hover:border-risk-medium/50"
                        : "border-border bg-muted/30 hover:border-border/80"
                    )}
                  >
                    {/* Priority indicator */}
                    <div className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      rec.priority === 'high' ? "bg-risk-high"
                        : rec.priority === 'medium' ? "bg-risk-medium"
                        : "bg-muted-foreground/30"
                    )} />
                    
                    <div className="flex items-start gap-3 pl-2">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                        rec.priority === 'high' 
                          ? "bg-risk-high/15 text-risk-high"
                          : rec.priority === 'medium'
                          ? "bg-risk-medium/15 text-risk-medium"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">
                            {rec.title}
                          </h4>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            rec.priority === 'high' 
                              ? "bg-risk-high/15 text-risk-high"
                              : rec.priority === 'medium'
                              ? "bg-risk-medium/15 text-risk-medium"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Info'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
