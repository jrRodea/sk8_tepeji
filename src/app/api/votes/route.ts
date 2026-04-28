import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { trickId } = await req.json()
  if (!trickId) {
    return NextResponse.json({ error: 'trickId requerido' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Check existing vote
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('trick_id', trickId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Unvote
    await supabase.from('votes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_vote_count', { trick_id: trickId })
    const { data } = await supabase.from('tricks').select('vote_count').eq('id', trickId).single()
    return NextResponse.json({ voted: false, count: data?.vote_count ?? 0 })
  } else {
    // Vote
    await supabase.from('votes').insert({ trick_id: trickId, user_id: userId })
    await supabase.rpc('increment_vote_count', { trick_id: trickId })
    const { data } = await supabase.from('tricks').select('vote_count').eq('id', trickId).single()
    return NextResponse.json({ voted: true, count: data?.vote_count ?? 0 })
  }
}
