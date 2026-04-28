import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase-server'
import { SkaterCard, SkaterCardSkeleton } from '@/components/skater-card'
import type { Profile } from '@/types'

async function SkatersList() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const profiles: Profile[] = data ?? []

  if (!profiles.length) {
    return (
      <div className="text-center py-20">
        <p className="font-heading text-4xl text-muted-foreground mb-2">SIN SKATERS AÚN</p>
        <p className="text-muted-foreground text-sm">¡Sé el primero en unirte a la escena!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {profiles.map((profile) => (
        <SkaterCard key={profile.id} profile={profile} />
      ))}
    </div>
  )
}

export default function SkatersPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in-up">
      <h1 className="font-heading text-5xl mb-2">SKATERS</h1>
      <p className="text-muted-foreground text-sm mb-6">La escena local de Tepeji del Río.</p>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkaterCardSkeleton key={i} />)}
          </div>
        }
      >
        <SkatersList />
      </Suspense>
    </div>
  )
}
