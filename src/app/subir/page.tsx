'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Upload, MapPin, Video, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const MapComponent = dynamic(
  () => import('@/components/map-component').then((m) => m.MapComponent),
  { ssr: false, loading: () => <div className="w-full h-48 bg-muted animate-pulse rounded-xl" /> }
)

type ContentType = 'spot' | 'truco' | 'foto'
type Step = 1 | 2

export default function SubirPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState<Step>(1)
  const [tipo, setTipo] = useState<ContentType>('truco')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Spot form
  const [spotNombre, setSpotNombre] = useState('')
  const [spotDesc, setSpotDesc] = useState('')
  const [spotDificultad, setSpotDificultad] = useState('Medio')
  const [spotEstado, setSpotEstado] = useState('Activo')
  const [spotLat, setSpotLat] = useState<number>(20.2167)
  const [spotLng, setSpotLng] = useState<number>(-99.3667)
  const [spotFile, setSpotFile] = useState<File | null>(null)

  // Truco form
  const [trucoNombreSpot, setTrucoNombreSpot] = useState('')
  const [spotId, setSpotId] = useState('')
  const [trucoNombre, setTrucoNombre] = useState('')
  const [trucoFile, setTrucoFile] = useState<File | null>(null)

  async function uploadFile(file: File, bucket: string): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${user!.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmitSpot() {
    if (!spotNombre.trim()) return toast.error('El nombre del spot es requerido')
    setLoading(true)
    try {
      let photoUrl: string | null = null
      if (spotFile) {
        photoUrl = await uploadFile(spotFile, 'spot-photos')
      }

      const { data: spot, error } = await supabase
        .from('spots')
        .insert({
          name: spotNombre,
          description: spotDesc || null,
          latitude: spotLat,
          longitude: spotLng,
          difficulty: spotDificultad,
          status: spotEstado,
          added_by: user!.id,
        })
        .select()
        .single()

      if (error) throw error

      if (photoUrl && spot) {
        await supabase.from('spot_photos').insert({
          spot_id: spot.id,
          url: photoUrl,
          uploaded_by: user!.id,
        })
      }

      toast.success('¡Spot agregado exitosamente!')
      router.push(`/spots/${spot.id}`)
    } catch {
      toast.error('Error al guardar el spot')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitTruco() {
    if (!trucoNombre.trim() || !spotId) return toast.error('Completa todos los campos')
    setLoading(true)
    try {
      let mediaUrl: string | null = null
      let mediaType: string | null = null

      if (trucoFile) {
        const isVideo = trucoFile.type.startsWith('video/')
        mediaUrl = await uploadFile(trucoFile, isVideo ? 'trick-videos' : 'trick-photos')
        mediaType = isVideo ? 'video' : 'imagen'
      }

      const { error } = await supabase.from('tricks').insert({
        spot_id: spotId,
        posted_by: user!.id,
        trick_name: trucoNombre,
        media_url: mediaUrl,
        media_type: mediaType,
      })

      if (error) throw error
      toast.success('¡Truco publicado!')
      router.push('/')
    } catch {
      toast.error('Error al publicar el truco')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in-up">
      <h1 className="font-heading text-5xl mb-6">SUBIR</h1>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm mb-4">¿Qué quieres compartir?</p>
          {[
            { type: 'spot' as const, label: 'Nuevo Spot', desc: 'Agrega un lugar para skater', icon: MapPin },
            { type: 'truco' as const, label: 'Truco en Spot', desc: 'Publica un truco con foto o video', icon: Video },
            { type: 'foto' as const, label: 'Foto de Sesión', desc: 'Comparte una foto del spot', icon: ImageIcon },
          ].map(({ type, label, desc, icon: Icon }) => (
            <Card
              key={type}
              onClick={() => { setTipo(type); setStep(2) }}
              className="card-skate p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Card>
          ))}
        </div>
      )}

      {step === 2 && tipo === 'spot' && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground mb-2">
            ← Volver
          </button>

          <div>
            <Label>Nombre del spot</Label>
            <Input value={spotNombre} onChange={(e) => setSpotNombre(e.target.value)} placeholder="Ej: Plaza Lagunas" className="mt-1" />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea value={spotDesc} onChange={(e) => setSpotDesc(e.target.value)} placeholder="Describe el spot..." className="mt-1 resize-none" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Dificultad</Label>
              <Select value={spotDificultad} onValueChange={(v) => setSpotDificultad(v ?? 'Medio')}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={spotEstado} onValueChange={(v) => setSpotEstado(v ?? 'Activo')}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="En obras">En obras</SelectItem>
                  <SelectItem value="Borrado">Borrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Ubicación en el mapa</Label>
            <p className="text-xs text-muted-foreground mb-2">
              El mapa se centra en tu ubicación — haz clic para ajustar el punto exacto
            </p>
            <div className="h-52 rounded-xl overflow-hidden border border-border">
              <MapComponent
                onMapClick={(lat, lng) => { setSpotLat(lat); setSpotLng(lng) }}
                interactive
                centerOnUser
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {spotLat.toFixed(4)}, {spotLng.toFixed(4)}
            </p>
          </div>

          <div>
            <Label>Foto del spot</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSpotFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1 w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors"
            >
              <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {spotFile ? spotFile.name : 'Clic para subir foto'}
              </p>
            </button>
          </div>

          <button
            onClick={handleSubmitSpot}
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-60"
          >
            {loading ? 'Guardando...' : 'Publicar Spot'}
          </button>
        </div>
      )}

      {step === 2 && (tipo === 'truco' || tipo === 'foto') && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground mb-2">
            ← Volver
          </button>

          <div>
            <Label>Spot</Label>
            <Input
              value={trucoNombreSpot}
              onChange={(e) => setTrucoNombreSpot(e.target.value)}
              placeholder="ID del spot..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Ingresa el ID del spot. (Búsqueda próximamente)</p>
            {trucoNombreSpot && (
              <div className="mt-1">
                <Input
                  value={spotId}
                  onChange={(e) => setSpotId(e.target.value)}
                  placeholder="UUID del spot"
                  className="text-xs"
                />
              </div>
            )}
          </div>

          {tipo === 'truco' && (
            <div>
              <Label>Nombre del truco</Label>
              <Input value={trucoNombre} onChange={(e) => setTrucoNombre(e.target.value)} placeholder="Ej: Kickflip sobre el curb" className="mt-1" />
            </div>
          )}

          <div>
            <Label>{tipo === 'truco' ? 'Foto o Video del truco' : 'Foto de sesión'}</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setTrucoFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1 w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors"
            >
              <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {trucoFile ? trucoFile.name : 'Clic para subir archivo'}
              </p>
            </button>
          </div>

          <button
            onClick={handleSubmitTruco}
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-60"
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      )}
    </div>
  )
}
