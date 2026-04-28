export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Suspense } from 'react'
import { Shield, CheckCircle, XCircle, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DifficultyBadge, StatusBadge } from '@/components/difficulty-badge'
import { createServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role !== 'admin') redirect('/')
}

async function PendingSpots() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('spots')
    .select('*, profiles(username)')
    .eq('status', 'Activo')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!data?.length) {
    return <p className="text-muted-foreground text-sm text-center py-6">Sin spots pendientes.</p>
  }

  return (
    <div className="space-y-3">
      {data.map((spot) => (
        <Card key={spot.id} className="card-skate p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{spot.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">por {spot.profiles?.username ?? 'Anónimo'}</p>
              {spot.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{spot.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <DifficultyBadge level={spot.difficulty} />
              <StatusBadge status={spot.status} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors font-medium">
              <CheckCircle size={13} /> Aprobar
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium">
              <XCircle size={13} /> Eliminar
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function UsersList() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  if (!data?.length) {
    return <p className="text-muted-foreground text-sm text-center py-6">Sin usuarios.</p>
  }

  return (
    <div className="space-y-2">
      {data.map((user) => (
        <Card key={user.id} className="card-skate p-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary">
              {user.username?.slice(0, 2).toUpperCase() ?? 'SK'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.username ?? 'Sin nombre'}</p>
            <p className="text-xs text-muted-foreground">{user.city}</p>
          </div>
          <Badge
            variant={user.role === 'admin' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {user.role}
          </Badge>
        </Card>
      ))}
    </div>
  )
}

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-primary" />
        <h1 className="font-heading text-4xl">PANEL ADMIN</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="font-heading text-2xl mb-3 flex items-center gap-2">
            <span>SPOTS</span>
            <Badge variant="secondary" className="font-sans text-xs">Recientes</Badge>
          </h2>
          <Suspense fallback={<div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-24 bg-muted rounded-xl animate-pulse"/>)}</div>}>
            <PendingSpots />
          </Suspense>
        </section>

        <section>
          <h2 className="font-heading text-2xl mb-3 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            USUARIOS
          </h2>
          <Suspense fallback={<div className="space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="h-14 bg-muted rounded-xl animate-pulse"/>)}</div>}>
            <UsersList />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
