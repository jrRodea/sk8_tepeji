import { Suspense } from 'react'
import { Trophy, Flame, Star } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SkaterCard, SkaterCardSkeleton } from '@/components/skater-card'
import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

async function SpotsRanking() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('spots')
    .select('*, spot_photos(*), profiles(username, avatar_url)')
    .eq('status', 'Activo')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!data?.length) {
    return <p className="text-muted-foreground text-center py-12">Sin spots aún.</p>
  }

  return (
    <div className="space-y-3">
      {data.map((spot, i) => (
        <Link key={spot.id} href={`/spots/${spot.id}`}>
          <Card className="card-skate p-4 flex items-center gap-4 hover:scale-[1.005] transition-transform">
            <span className="font-heading text-3xl text-muted-foreground w-8 text-center">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{spot.name}</p>
              <p className="text-xs text-muted-foreground">{spot.difficulty}</p>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={14} />
              <span className="text-sm font-bold">{spot.vote_count ?? 0}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

async function SkatersRanking() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(20)

  if (!data?.length) {
    return <p className="text-muted-foreground text-center py-12">Sin skaters aún.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {data.map((profile) => (
        <SkaterCard key={profile.id} profile={profile} />
      ))}
    </div>
  )
}

async function TricksRanking() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tricks')
    .select('*, profiles(username, avatar_url)')
    .order('vote_count', { ascending: false })
    .limit(20)

  if (!data?.length) {
    return <p className="text-muted-foreground text-center py-12">Sin trucos aún.</p>
  }

  return (
    <div className="space-y-3">
      {data.map((trick, i) => (
        <Card key={trick.id} className="card-skate p-4 flex items-center gap-4">
          <span className="font-heading text-3xl text-muted-foreground w-8 text-center">{i + 1}</span>
          <Avatar className="h-9 w-9">
            <AvatarImage src={trick.profiles?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary">
              {trick.profiles?.username?.slice(0, 2).toUpperCase() ?? 'SK'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-xl leading-none truncate">{trick.trick_name}</p>
            <p className="text-xs text-muted-foreground">{trick.profiles?.username}</p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Trophy size={14} />
            <span className="text-sm font-bold">{trick.vote_count}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function SkaterOfMonth() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single()

  if (!data) return null

  return (
    <Card className="card-skate p-6 mb-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/30 relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Star size={20} className="text-primary fill-primary" />
      </div>
      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Skater del Mes</p>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={data.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
            {data.username?.slice(0, 2).toUpperCase() ?? 'SK'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-heading text-4xl leading-none">{data.username ?? 'Skater'}</h2>
          <p className="text-muted-foreground text-sm mt-1">{data.city}</p>
          <div className="flex gap-2 mt-2">
            {data.style?.map((s: string) => (
              <span key={s} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function RankingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in-up">
      <h1 className="font-heading text-5xl mb-6">RANKINGS</h1>

      <Suspense fallback={null}>
        <SkaterOfMonth />
      </Suspense>

      <Tabs defaultValue="trucos">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="spots" className="flex-1">Spots</TabsTrigger>
          <TabsTrigger value="skaters" className="flex-1">Skaters</TabsTrigger>
          <TabsTrigger value="trucos" className="flex-1">Trucos</TabsTrigger>
        </TabsList>

        <TabsContent value="spots">
          <Suspense fallback={<div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 bg-muted rounded-xl animate-pulse"/>)}</div>}>
            <SpotsRanking />
          </Suspense>
        </TabsContent>

        <TabsContent value="skaters">
          <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{Array.from({length:4}).map((_,i)=><SkaterCardSkeleton key={i}/>)}</div>}>
            <SkatersRanking />
          </Suspense>
        </TabsContent>

        <TabsContent value="trucos">
          <Suspense fallback={<div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 bg-muted rounded-xl animate-pulse"/>)}</div>}>
            <TricksRanking />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
