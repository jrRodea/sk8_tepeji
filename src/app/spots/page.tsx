'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Plus, MapPin, Search } from 'lucide-react'
import { useUser, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { DifficultyBadge, StatusBadge } from '@/components/difficulty-badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Spot } from '@/types'

const MapComponent = dynamic(
  () => import('@/components/map-component').then((m) => m.MapComponent),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse" /> }
)

export default function SpotsPage() {
  const { isSignedIn } = useUser()
  const [spots, setSpots] = useState<Spot[]>([])
  const [selected, setSelected] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('spots')
        .select('*, profiles(username), spot_photos(*)')
        .order('created_at', { ascending: false })
      setSpots(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = spots.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSpotClick = useCallback((spot: Spot) => setSelected(spot), [])

  return (
    <div className="relative h-[calc(100vh-4rem)] md:h-screen lg:h-screen flex flex-col lg:flex-row">
      {/* Map fullscreen */}
      <div className="flex-1 relative">
        <MapComponent
          spots={spots}
          onSpotClick={handleSpotClick}
          className="w-full h-full"
        />

        {/* FAB Agregar spot */}
        <div className="absolute top-4 right-4 z-10">
          {isSignedIn ? (
            <Link
              href="/subir?tipo=spot"
              className="flex items-center gap-2 bg-primary text-white rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Agregar Spot
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 bg-primary text-white rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity">
                <Plus size={16} />
                Agregar Spot
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Panel de lista */}
      <div className="lg:w-80 lg:h-full lg:overflow-y-auto
                      fixed bottom-0 left-0 right-0 lg:static
                      bg-card/95 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-border
                      rounded-t-2xl lg:rounded-none
                      max-h-[50vh] lg:max-h-none overflow-y-auto
                      z-10 p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar spots..."
            className="w-full bg-muted rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/40 placeholder:text-muted-foreground"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Sin resultados.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((spot) => (
              <Card
                key={spot.id}
                onClick={() => setSelected(spot)}
                className={`card-skate p-3 cursor-pointer transition-colors ${
                  selected?.id === spot.id ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{spot.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin size={10} />
                      {spot.profiles?.username ?? 'Anónimo'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <DifficultyBadge level={spot.difficulty} />
                    <StatusBadge status={spot.status} />
                  </div>
                </div>
                {selected?.id === spot.id && (
                  <Link
                    href={`/spots/${spot.id}`}
                    className="mt-2 block text-center text-xs text-primary font-semibold border border-primary/30 rounded-lg py-1.5 hover:bg-primary/10 transition-colors"
                  >
                    Ver detalles →
                  </Link>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
