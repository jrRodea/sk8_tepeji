import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createServerClient } from '@/lib/supabase-server'

type ClerkUserEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted'
  data: {
    id: string
    username: string | null
    image_url: string
    first_name: string | null
    last_name: string | null
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const svixId = headersList.get('svix-id')
  const svixTimestamp = headersList.get('svix-timestamp')
  const svixSignature = headersList.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Faltan cabeceras Svix', { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let event: ClerkUserEvent
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new Response('Firma inválida', { status: 400 })
  }

  const supabase = createServerClient()

  if (event.type === 'user.created') {
    const { data } = event
    const fullName = `${data.first_name ?? ''}${data.last_name ?? ''}`.trim()
    const username = data.username ?? (fullName || `skater_${data.id.slice(-6)}`)

    await supabase.from('profiles').upsert({
      id: data.id,
      username,
      avatar_url: data.image_url,
      style: [],
      city: 'Tepeji del Río',
      role: 'skater',
    }, { onConflict: 'id' })
  }

  if (event.type === 'user.updated') {
    const { data } = event
    await supabase.from('profiles').update({
      username: data.username ?? undefined,
      avatar_url: data.image_url,
    }).eq('id', data.id)
  }

  if (event.type === 'user.deleted') {
    await supabase.from('profiles').delete().eq('id', event.data.id)
  }

  return new Response('OK', { status: 200 })
}
