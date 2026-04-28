'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { Spot } from '@/types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const DARK_STYLE  = 'mapbox://styles/mapbox/dark-v11'
const LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11'

// Coordenadas exactas del centro de Tepeji del Río
const TEPEJI_CENTER: [number, number] = [-99.34479, 19.90481]
const TEPEJI_ZOOM = 13

const ACCENT_DARK  = '#00aaff'
const ACCENT_LIGHT = '#0088cc'

interface MapComponentProps {
  spots?: Spot[]
  onSpotClick?: (spot: Spot) => void
  onMapClick?: (lat: number, lng: number) => void
  interactive?: boolean
  centerOnUser?: boolean
  className?: string
}

function createSkatePin(color: string): HTMLElement {
  const el = document.createElement('div')
  el.innerHTML = `<span style="display:block;transform:rotate(45deg);font-size:15px;line-height:1;user-select:none">🛹</span>`
  el.style.cssText = `
    width: 34px; height: 34px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 3px 10px rgba(0,0,0,0.45);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  `
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'rotate(-45deg) scale(1.2)'
  })
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'rotate(-45deg) scale(1)'
  })
  return el
}

function createUserDot(): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `
    width: 18px; height: 18px;
    background: #4ade80;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 4px rgba(74,222,128,0.3);
    animation: pulse-user 2s ease-in-out infinite;
  `
  return el
}

export function MapComponent({
  spots = [],
  onSpotClick,
  onMapClick,
  interactive = true,
  centerOnUser = false,
  className = 'w-full h-full',
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  // ── Inicialización: solo se ejecuta una vez ──────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    async function initMap() {
      const mod = await import('mapbox-gl')
      await import('mapbox-gl/dist/mapbox-gl.css' as string)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapboxgl: any = (mod as any).default ?? mod
      mapboxgl.accessToken = MAPBOX_TOKEN

      const isDark = document.documentElement.classList.contains('dark')
      const style = isDark ? DARK_STYLE : LIGHT_STYLE
      const pinColor = isDark ? ACCENT_DARK : ACCENT_LIGHT

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style,
        center: TEPEJI_CENTER,
        zoom: TEPEJI_ZOOM,
        interactive,
      })

      mapRef.current = map

      map.on('load', () => {
        // Pines de spots
        spots.forEach((spot) => {
          const el = createSkatePin(pinColor)
          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom-left' })
            .setLngLat([spot.longitude, spot.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(
                `<div style="font-family:system-ui;padding:2px 0">
                   <strong style="font-family:'Bebas Neue',sans-serif;font-size:17px;display:block">${spot.name}</strong>
                   <span style="font-size:11px;color:#888">${spot.difficulty} · ${spot.status}</span>
                 </div>`
              )
            )
            .addTo(map)
          el.addEventListener('click', (e) => { e.stopPropagation(); onSpotClick?.(spot) })
          void marker
        })

        // Geolocalización solo para el formulario de agregar spot
        if (centerOnUser && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 16, speed: 1.4 })
              new mapboxgl.Marker({ element: createUserDot() })
                .setLngLat([coords.longitude, coords.latitude])
                .addTo(map)
              onMapClick?.(coords.latitude, coords.longitude)
            },
            () => { /* permiso denegado → se queda en Tepeji */ },
            { enableHighAccuracy: true, timeout: 8000 }
          )
        }

        // Click para seleccionar ubicación
        if (onMapClick) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map.on('click', (e: any) => onMapClick(e.lngLat.lat, e.lngLat.lng))
        }
      })
    }

    initMap()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo al montar — no depende de resolvedTheme

  // ── Cambio de tema: actualiza solo el estilo, sin re-inicializar ─────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const style = resolvedTheme === 'dark' ? DARK_STYLE : LIGHT_STYLE
    map.setStyle(style)
  }, [resolvedTheme])

  return <div ref={mapContainer} className={className} />
}
