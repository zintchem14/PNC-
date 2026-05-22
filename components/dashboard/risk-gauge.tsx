'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { RiskScore } from '@/lib/types'

interface RiskGaugeProps {
  score: RiskScore
  size?: 'sm' | 'md' | 'lg'
}

export function RiskGauge({ score, size = 'lg' }: RiskGaugeProps) {
  const sizeConfig = {
    sm: { width: 120, height: 70, strokeWidth: 10, fontSize: 'text-lg' },
    md: { width: 160, height: 90, strokeWidth: 12, fontSize: 'text-2xl' },
    lg: { width: 220, height: 120, strokeWidth: 16, fontSize: 'text-3xl' },
  }

  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = Math.PI * radius
  const progress = (score.value / 100) * circumference

  const getColor = () => {
    if (score.level === 'low') return '#28A745'
    if (score.level === 'medium') return '#FFC107'
    return '#DC3545'
  }

  const getBackgroundGradient = () => {
    if (score.level === 'low') return 'from-green-500/10 to-green-500/5'
    if (score.level === 'medium') return 'from-yellow-500/10 to-yellow-500/5'
    return 'from-red-500/10 to-red-500/5'
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-2xl p-6",
      `bg-gradient-to-b ${getBackgroundGradient()}`
    )}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height + 10}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={describeArc(config.width / 2, config.height, radius, 180, 360)}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className="text-muted/30"
        />
        
        {/* Progress arc */}
        <motion.path
          d={describeArc(config.width / 2, config.height, radius, 180, 360)}
          fill="none"
          stroke={getColor()}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${getColor()}40)` }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = 180 + (tick / 100) * 180
          const x1 = config.width / 2 + (radius - 8) * Math.cos((angle * Math.PI) / 180)
          const y1 = config.height + (radius - 8) * Math.sin((angle * Math.PI) / 180)
          const x2 = config.width / 2 + (radius + 4) * Math.cos((angle * Math.PI) / 180)
          const y2 = config.height + (radius + 4) * Math.sin((angle * Math.PI) / 180)
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={2}
              className="text-muted-foreground/40"
            />
          )
        })}
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-2 flex flex-col items-center"
      >
        <span className={cn(config.fontSize, "font-bold")} style={{ color: getColor() }}>
          {score.value}%
        </span>
        <motion.span
          key={score.label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm font-medium text-muted-foreground"
        >
          {score.label}
        </motion.span>
      </motion.div>
    </div>
  )
}

// Mini gauges for the dashboard overview
export function MiniRiskGauges({ score }: { score: RiskScore }) {
  const categories = [
    { label: 'Accès soins', value: score.value, color: score.level },
    { label: 'Support social', value: Math.min(100, score.value + 15), color: score.value + 15 >= 70 ? 'low' : score.value + 15 >= 40 ? 'medium' : 'high' as const },
    { label: 'Information', value: Math.max(0, score.value - 10), color: score.value - 10 >= 70 ? 'low' : score.value - 10 >= 40 ? 'medium' : 'high' as const },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center"
        >
          <CircularProgress value={cat.value} color={cat.color} size={70} />
          <span className="mt-2 text-xs font-medium text-muted-foreground">{cat.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

function CircularProgress({ value, color, size }: { value: number; color: 'low' | 'medium' | 'high'; size: number }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - value) / 100) * circumference

  const getColor = () => {
    if (color === 'low') return '#28A745'
    if (color === 'medium') return '#FFC107'
    return '#DC3545'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-foreground">{value}%</span>
      </div>
    </div>
  )
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ')
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  }
}
