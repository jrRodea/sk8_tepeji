'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { Spot } from '@/types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const DARK_STYLE  = 'mapbox://styles/mapbox/dark-v11'
const LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11'

const TEPEJI_CENTER: [number, number] = [-99.3667, 20.2167]

interface MapComponentProps {
  spots?: Spot[]
  onSpotClick?: (spot: Spot) => void
  onMapClick?: (lat: number, lng: number) => void
  interactive?: boolean
  className?: string
}

export function MapComponent({
  spots = [],
  onSpotClick,
  onMapClick,
  interactive = true,
  className = 'w-full h-full',
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mapboxgl: any = null

    async function initMap() {
      if (!mapContainer.current) return
      const mod = await import('mapbox-gl')
      await import('mapbox-gl/dist/mapbox-gl.css' as string)
      mapboxgl = (mod as any).default ?? mod

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapboxgl as any).accessToken = MAPBOX_TOKEN

      const style = resolvedTheme === 'dark' ? DARK_STYLE : LIGHT_STYLE
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = new (mapboxgl as any).Map({
        container: mapContainer.current,
        style,
        center: TEPEJI_CENTER,
        zoom: 13,
        interactive,
      })

      mapRef.current = map

      map.on('load', () => {
        spots.forEach((spot) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const el = document.createElement('div')
          el.className = 'spot-pin'
          el.style.cssText = `
            width: 16px; height: 16px;
            border-radius: 50%;
            background: ${resolvedTheme === 'dark' ? '#00aaff' : '#0088cc'};
            border: 2px solid white;
            box-shadow: 0 0 8px ${resolvedTheme === 'dark' ? 'rgba(0,170,255,0.6)' : 'rgba(0,136,204,0.4)'};
            cursor: pointer;
          `

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const marker = new (mapboxgl as any).Marker({ element: el })
            .setLngLat([spot.longitude, spot.latitude])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .setPopup(new (mapboxgl as any).Popup({ offset: 12 }).setHTML(
              `<strong style="font-family:'Bebas Neue',sans-serif;font-size:18px">${spot.name}</strong>
               <p style="margin:2px 0 0;font-size:12px;color:#666">${spot.difficulty}</p>`
            ))
            .addTo(map)

          el.addEventListener('click', () => onSpotClick?.(spot))
          void marker
        })

        if (onMapClick) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map.on('click', (e: any) => onMapClick(e.lngLat.lat, e.lngLat.lng))
        }
      })
    }

    initMap()

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapRef.current as any)?.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme])

  return <div ref={mapContainer} className={className} />
}
