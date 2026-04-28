import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DifficultyLevel, SpotStatus } from '@/types'

export function DifficultyBadge({ level }: { level: DifficultyLevel }) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold uppercase tracking-wide border',
        level === 'Fácil' && 'badge-easy',
        level === 'Medio' && 'badge-medium',
        level === 'Pro'   && 'badge-pro'
      )}
    >
      {level}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: SpotStatus }) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold border',
        status === 'Activo'    && 'badge-active',
        status === 'Borrado'   && 'badge-destroyed',
        status === 'En obras'  && 'badge-construction'
      )}
    >
      {status}
    </Badge>
  )
}
