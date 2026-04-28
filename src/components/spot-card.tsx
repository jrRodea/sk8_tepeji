import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DifficultyBadge, StatusBadge } from './difficulty-badge'
import type { Spot } from '@/types'

interface SpotCardProps {
  spot: Spot
  showStatus?: boolean
}

export function SpotCard({ spot, showStatus = false }: SpotCardProps) {
  const coverPhoto = spot.spot_photos?.[0]?.url
  const voteCount = spot.vote_count ?? 0

  return (
    <Link href={`/spots/${spot.id}`}>
      <Card className="card-skate overflow-hidden rounded-[12px] bg-card hover:scale-[1.01] transition-transform duration-200 cursor-pointer">
        <div className="relative aspect-[4/3] bg-muted">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={spot.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-surface-2">
              <MapPin size={32} className="text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <DifficultyBadge level={spot.difficulty} />
            {showStatus && <StatusBadge status={spot.status} />}
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-heading text-xl leading-none mb-1">{spot.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin size={11} />
              <span className="truncate max-w-[140px]">{spot.profiles?.username ?? 'Anónimo'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Flame size={12} className={voteCount > 0 ? 'text-orange-400' : ''} />
              <span>{voteCount}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function SpotCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[12px]">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  )
}
