import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import { MapPin, Calendar, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrickCard, TrickCardSkeleton } from '@/components/trick-card'
import { DifficultyBadge, StatusBadge } from '@/components/difficulty-badge'
import { createServerClient } from '@/lib/supabase-server'
import type { Trick } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function SpotTricks({ spotId }: { spotId: string }) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tricks')
    .select('*, profiles(*), spots(name)')
    .eq('spot_id', spotId)
    .order('vote_count', { ascending: false })

  const tricks: Trick[] = data ?? []

  if (!tricks.length) {
    return (
      <p className="text-muted-foreground text-center py-12 text-sm">
        Aún no hay trucos en este spot.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {tricks.map((trick) => <TrickCard key={trick.id} trick={trick} />)}
    </div>
  )
}

async function SpotPhotos({ spotId }: { spotId: string }) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('spot_photos')
    .select('*')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false })

  if (!data?.length) {
    return <p className="text-muted-foreground text-center py-12 text-sm">Sin fotos aún.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {data.map((photo) => (
        <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
          <Image src={photo.url} alt="Foto del spot" fill className="object-cover" sizes="33vw" />
        </div>
      ))}
    </div>
  )
}

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: spot } = await supabase
    .from('spots')
    .select('*, profiles(*), spot_photos(*)')
    .eq('id', id)
    .single()

  if (!spot) notFound()

  const coverPhotos = spot.spot_photos ?? []

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Hero carrusel (foto principal) */}
      <div className="relative aspect-[16/9] bg-muted">
        {coverPhotos.length > 0 ? (
          <Image
            src={coverPhotos[0].url}
            alt={spot.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 672px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-surface-2">
            <MapPin size={48} className="text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            <DifficultyBadge level={spot.difficulty} />
            <StatusBadge status={spot.status} />
          </div>
          <h1 className="font-heading text-4xl text-white leading-none">{spot.name}</h1>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>Agregado por <strong className="text-foreground">{spot.profiles?.username ?? 'Anónimo'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{new Date(spot.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</span>
          </div>
        </div>
        {spot.description && (
          <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{spot.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs defaultValue="trucos">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="fotos" className="flex-1">Fotos</TabsTrigger>
            <TabsTrigger value="trucos" className="flex-1">Trucos</TabsTrigger>
            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="fotos">
            <Suspense fallback={<div className="grid grid-cols-2 gap-2">{Array.from({length:4}).map((_,i)=><div key={i} className="aspect-square bg-muted rounded-xl animate-pulse"/>)}</div>}>
              <SpotPhotos spotId={id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="trucos">
            <Suspense fallback={<div className="space-y-4">{Array.from({length:3}).map((_,i)=><TrickCardSkeleton key={i}/>)}</div>}>
              <SpotTricks spotId={id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Nombre</span>
                <span className="font-medium">{spot.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Dificultad</span>
                <DifficultyBadge level={spot.difficulty} />
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Estado</span>
                <StatusBadge status={spot.status} />
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Latitud</span>
                <span className="font-mono text-xs">{spot.latitude}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Longitud</span>
                <span className="font-mono text-xs">{spot.longitude}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
