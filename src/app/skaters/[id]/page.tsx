import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Edit } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TrickCard } from '@/components/trick-card'
import { createServerClient } from '@/lib/supabase-server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SkaterProfilePage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [{ count: spotsCount }, { count: tricksCount }, { data: tricks }] = await Promise.all([
    supabase.from('spots').select('*', { count: 'exact', head: true }).eq('added_by', id),
    supabase.from('tricks').select('*', { count: 'exact', head: true }).eq('posted_by', id),
    supabase.from('tricks').select('*, profiles(*), spots(name)').eq('posted_by', id).order('vote_count', { ascending: false }).limit(12),
  ])

  const votesReceived = tricks?.reduce((acc, t) => acc + t.vote_count, 0) ?? 0
  const isOwnProfile = userId === id
  const initials = profile.username?.slice(0, 2).toUpperCase() ?? 'SK'

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 via-muted to-muted grain">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Avatar + info */}
      <div className="px-4 -mt-12 relative z-10 mb-6">
        <div className="flex items-end justify-between mb-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <Link href="/perfil/editar" className="btn-ghost text-sm flex items-center gap-1.5 py-2 px-4">
              <Edit size={14} />
              Editar perfil
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading text-4xl leading-none">{profile.username ?? 'Skater'}</h1>
          {profile.role === 'admin' && (
            <Badge className="text-xs bg-primary/15 text-primary border-primary/30">Admin</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin size={13} />
          <span>{profile.city}</span>
        </div>

        {profile.style?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {profile.style.map((s: string) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 bg-card rounded-2xl p-4 border border-border">
          {[
            { label: 'Spots agregados', value: spotsCount ?? 0 },
            { label: 'Trucos publicados', value: tricksCount ?? 0 },
            { label: 'Votos recibidos', value: votesReceived },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-heading text-3xl text-primary leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trucos */}
      <div className="px-4 pb-8">
        <h2 className="font-heading text-3xl mb-4">TRUCOS</h2>
        {tricks && tricks.length > 0 ? (
          <div className="space-y-4">
            {tricks.map((trick) => <TrickCard key={trick.id} trick={trick} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">
            {isOwnProfile ? 'Aún no has publicado trucos.' : 'Sin trucos publicados.'}
          </p>
        )}
      </div>
    </div>
  )
}
