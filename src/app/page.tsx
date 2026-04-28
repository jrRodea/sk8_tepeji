import Link from 'next/link'
import { Zap, MapPin, ArrowRight } from 'lucide-react'
import { SpotCard, SpotCardSkeleton } from '@/components/spot-card'
import { TrickCard, TrickCardSkeleton } from '@/components/trick-card'
import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase-server'
import type { Spot, Trick } from '@/types'

async function FeaturedSpots() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('spots')
    .select('*, profiles(*), spot_photos(*)')
    .eq('status', 'Activo')
    .order('created_at', { ascending: false })
    .limit(8)

  const spots: Spot[] = data ?? []

  if (spots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Aún no hay spots. ¡Agrega el primero!
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {spots.map((spot) => (
        <div key={spot.id} className="min-w-[200px] max-w-[220px] flex-shrink-0">
          <SpotCard spot={spot} />
        </div>
      ))}
    </div>
  )
}

async function RecentTricks() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tricks')
    .select('*, profiles(*), spots(name)')
    .order('created_at', { ascending: false })
    .limit(10)

  const tricks: Trick[] = data ?? []

  if (tricks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Aún no hay trucos publicados.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tricks.map((trick) => (
        <TrickCard key={trick.id} trick={trick} />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 animate-fade-in-up">
      {/* Hero */}
      <section className="grain relative rounded-2xl overflow-hidden mb-8 mt-4 bg-gradient-to-br from-[#0d0d0d] via-[#0a1a2a] to-[#001a33]">
        <div className="relative z-10 px-6 py-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-primary" />
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Tepeji del Río</span>
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl text-white leading-none mb-3">
            ¿QUÉ HAY DE<br />NUEVO EN<br />
            <span className="text-primary">TEPEJI?</span>
          </h1>
          <p className="text-white/60 text-sm mb-6 max-w-xs">
            La escena skate local — spots, trucos y la gente que lo hace posible.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/spots" className="btn-primary flex items-center gap-2">
              <MapPin size={16} />
              Ver spots
            </Link>
            <Link href="/subir" className="border border-white/30 text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors">
              Subir truco
            </Link>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-primary/10 blur-2xl" />
      </section>

      {/* Spots destacados */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-3xl">SPOTS DESTACADOS</h2>
          <Link href="/spots" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[200px] flex-shrink-0"><SpotCardSkeleton /></div>
            ))}
          </div>
        }>
          <FeaturedSpots />
        </Suspense>
      </section>

      {/* Feed de trucos */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-3xl">ÚLTIMOS TRUCOS</h2>
          <Link href="/rankings" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
            Rankings <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <TrickCardSkeleton key={i} />)}
          </div>
        }>
          <RecentTricks />
        </Suspense>
      </section>
    </div>
  )
}
