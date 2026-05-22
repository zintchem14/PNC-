'use client'

import { motion } from 'framer-motion'
import { MapPin, Home, GraduationCap, Users, Calendar, Radio, Building2, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { PatientData } from '@/lib/types'
import { CAMEROON_REGIONS, EDUCATION_LEVELS, MARITAL_STATUS } from '@/lib/types'

interface PatientInputFormProps {
  data: PatientData
  onChange: (data: PatientData) => void
}

export function PatientInputForm({ data, onChange }: PatientInputFormProps) {
  const updateField = <K extends keyof PatientData>(field: K, value: PatientData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          Profil de la Patiente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Region Select */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Région
          </Label>
          <Select value={data.region} onValueChange={(v) => updateField('region', v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Sélectionner une région" />
            </SelectTrigger>
            <SelectContent>
              {CAMEROON_REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Residence Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Home className="h-4 w-4 text-primary" />
            Résidence
          </Label>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-background p-3">
            <button
              onClick={() => updateField('residence', 'urban')}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                data.residence === 'urban'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Urbain
            </button>
            <button
              onClick={() => updateField('residence', 'rural')}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                data.residence === 'rural'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Rural
            </button>
          </div>
        </motion.div>

        {/* Education Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <GraduationCap className="h-4 w-4 text-primary" />
            Niveau d&apos;instruction
          </Label>
          <Select value={data.educationLevel} onValueChange={(v) => updateField('educationLevel', v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Sélectionner un niveau" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Marital Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Statut matrimonial
          </Label>
          <Select value={data.maritalStatus} onValueChange={(v) => updateField('maritalStatus', v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* CPN Visits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            Visites CPN
          </Label>
          <div className="flex items-center gap-2">
            {(['0', '1-3', '4+'] as const).map((visits) => (
              <button
                key={visits}
                onClick={() => updateField('cpnVisits', visits)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  data.cpnVisits === visits
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {visits}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Media Exposure Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Radio className="h-4 w-4 text-primary" />
            Exposition aux médias
          </Label>
          <Switch
            checked={data.mediaExposure}
            onCheckedChange={(v) => updateField('mediaExposure', v)}
          />
        </motion.div>

        {/* Hospital Distance Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Distance hôpital {">"} 5km
          </Label>
          <Switch
            checked={data.hospitalDistance}
            onCheckedChange={(v) => updateField('hospitalDistance', v)}
          />
        </motion.div>

        {/* Wealth Level Slider */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              Niveau de richesse
            </Label>
            <span className="text-sm font-semibold text-primary">{data.wealthLevel}%</span>
          </div>
          <div className="px-1">
            <Slider
              value={[data.wealthLevel]}
              onValueChange={(v) => updateField('wealthLevel', v[0])}
              max={100}
              min={0}
              step={5}
              className="py-2"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Très pauvre</span>
              <span>Très riche</span>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
