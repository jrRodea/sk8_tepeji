import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import type { Profile } from '@/types'

interface SkaterCardProps {
  profile: Profile
  stats?: {
    spots: number
    tricks: number
    votes: number
  }
}

export function SkaterCard({ profile, stats }: SkaterCardProps) {
  const initials = profile.username?.slice(0, 2).toUpperCase() ?? 'SK'

  return (
    <Link href={`/skaters/${profile.id}`}>
      <Card className="card-skate rounded-[12px] p-4 bg-card hover:scale-[1.01] transition-transform cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile.username ?? 'Skater'}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={10} />
              <span>{profile.city}</span>
            </div>
          </div>
          {profile.role === 'admin' && (
            <Badge className="text-xs bg-primary/15 text-primary border-primary/30">Admin</Badge>
          )}
        </div>

        {profile.style.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.style.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            {[
              { label: 'Spots', value: stats.spots },
              { label: 'Trucos', value: stats.tricks },
              { label: 'Votos', value: stats.votes },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-heading text-2xl leading-none text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Link>
  )
}

export function SkaterCardSkeleton() {
  return (
    <Card className="rounded-[12px] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-6 w-8 mx-auto bg-muted rounded animate-pulse" />
            <div className="h-3 w-12 mx-auto bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  )
}
