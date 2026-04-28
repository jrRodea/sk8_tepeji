'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ThumbsUp, Video, MapPin } from 'lucide-react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Trick } from '@/types'

interface TrickCardProps {
  trick: Trick
  onVoteToggle?: (trickId: string, newCount: number, voted: boolean) => void
}

export function TrickCard({ trick, onVoteToggle }: TrickCardProps) {
  const { isSignedIn } = useUser()
  const [voted, setVoted] = useState(trick.user_voted ?? false)
  const [count, setCount] = useState(trick.vote_count)
  const [bouncing, setBouncing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleVote = async () => {
    if (!isSignedIn) return

    setBouncing(true)
    setTimeout(() => setBouncing(false), 350)

    const prev = { voted, count }
    const newVoted = !voted
    const newCount = newVoted ? count + 1 : count - 1
    setVoted(newVoted)
    setCount(newCount)

    try {
      setLoading(true)
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trickId: trick.id }),
      })
      if (!res.ok) throw new Error()
      onVoteToggle?.(trick.id, newCount, newVoted)
    } catch {
      setVoted(prev.voted)
      setCount(prev.count)
      toast.error('Error al votar, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  const initials = trick.profiles?.username?.slice(0, 2).toUpperCase() ?? 'SK'

  return (
    <Card className="card-skate rounded-[12px] bg-card overflow-hidden">
      {/* Media */}
      {trick.media_url && (
        <div className="relative aspect-video bg-muted">
          {trick.media_type === 'video' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Video size={32} className="text-white/80" />
              <span className="sr-only">Video</span>
            </div>
          ) : (
            <Image
              src={trick.media_url}
              alt={trick.trick_name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={trick.profiles?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {trick.profiles?.username ?? 'Skater'}
            </p>
            {trick.spots && (
              <Link
                href={`/spots/${trick.spot_id}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors truncate"
              >
                <MapPin size={10} />
                {trick.spots.name}
              </Link>
            )}
          </div>
        </div>

        {/* Trick name */}
        <h3 className="font-heading text-2xl leading-none mb-3">{trick.trick_name}</h3>

        {/* Vote */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(trick.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </span>

          {isSignedIn ? (
            <button
              onClick={handleVote}
              disabled={loading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
                voted
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
                bouncing && 'animate-bounce-vote',
                'disabled:opacity-60'
              )}
            >
              <ThumbsUp size={14} className={voted ? 'fill-current' : ''} />
              <span>{count}</span>
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp size={14} />
                <span>{count}</span>
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </Card>
  )
}

export function TrickCardSkeleton() {
  return (
    <Card className="rounded-[12px] overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  )
}
