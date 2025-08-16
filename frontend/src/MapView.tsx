import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchApi } from './utils/fetchApi'

type ScoreItem = { id: number; name: string; state: string; score: number }

export default function MapView({ valuesDiversity, onSelectLocation }: { valuesDiversity: boolean; onSelectLocation?: (p: { name: string; state: string }) => void }) {
  const [scores, setScores] = useState<ScoreItem[]>([])
  const [usStates, setUsStates] = useState<any>(null)
  const [scoresLoading, setScoresLoading] = useState<boolean>(false)
  const [geoLoading, setGeoLoading] = useState<boolean>(false)
  const [center, setCenter] = useState<[number, number]>(() => {
    try {
      const raw = localStorage.getItem('tp_map_center')
      if (raw) return JSON.parse(raw)
    } catch {}
    return [37.8, -96]
  })
  const [zoom, setZoom] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('tp_map_zoom')
      if (raw) return Number(raw)
    } catch {}
    return 4
  })

  useEffect(() => {
    setScoresLoading(true)
    fetchApi('/api/profile-scores?valuesDiversity=' + valuesDiversity)
      .then((r) => r.json())
      .then((d) => setScores(d.results || []))
      .catch(() => setScores([]))
      .finally(() => setScoresLoading(false))
  }, [valuesDiversity])

  useEffect(() => {
    setGeoLoading(true)
    // Load local states GeoJSON (fetched by scripts) for offline reliability
    fetch('/us-states.json')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.features && d.features.length > 0) setUsStates(d)
        else setUsStates(null)
      })
      .catch(() => setUsStates(null))
      .finally(() => setGeoLoading(false))
  }, [])

  const scoreByState = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of scores) m.set(s.state, s.score)
    return m
  }, [scores])

  function style(feature: any) {
    const st = feature?.properties?.postal
    const score = st ? scoreByState.get(st) ?? 0 : 0
    const color = scoreToColor(score)
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: '#999',
      fillOpacity: 0.7,
    }
  }

  function onEachFeature(feature: any, layer: L.Layer) {
    const st = (feature?.properties?.postal as string) || '—'
    const name = (feature?.properties?.name as string) || st
    const score = scoreByState.get(st) ?? 0
    if ((layer as any).bindTooltip) {
      ;(layer as any).bindTooltip(`${name} (${st}) — ${score}/100`, { sticky: true })
    }
    if ((layer as any).on && onSelectLocation) {
      ;(layer as any).on('click', () => onSelectLocation({ name, state: st }))
    }
  }

  const loading = scoresLoading || geoLoading || !usStates
  return (
    <div style={{ height: 360, marginTop: 24, position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!loading}
        doubleClickZoom={!loading}
        dragging={!loading}
        whenReady={(e) => {
          const map = e.target
          map.on('moveend zoomend', () => {
            const c = map.getCenter()
            try {
              localStorage.setItem('tp_map_center', JSON.stringify([c.lat, c.lng]))
              localStorage.setItem('tp_map_zoom', String(map.getZoom()))
            } catch {}
            setCenter([c.lat, c.lng])
            setZoom(map.getZoom())
          })
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {usStates && <GeoJSON data={usStates} style={style as any} onEachFeature={onEachFeature} />}
        <Legend />
      </MapContainer>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>Loading…</div>
        </div>
      )}
    </div>
  )
}

function scoreToColor(score: number): string {
  // Simple green-to-red
  const t = Math.max(0, Math.min(100, score)) / 100
  const r = Math.round(255 * (1 - t))
  const g = Math.round(180 * t)
  return `rgb(${r},${g},120)`
}

function Legend() {
  const map = useMap()
  useEffect(() => {
    const control = L.control({ position: 'bottomright' })
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'tp-legend')
      div.innerHTML = `
        <div style="background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 8px; font: 12px/1.2 system-ui, sans-serif;">
          <div style="margin-bottom:4px; font-weight:600;">Score</div>
          <div style="width:160px; height:10px; background: linear-gradient(90deg, rgb(255,0,120), rgb(0,180,120));"></div>
          <div style="display:flex; justify-content:space-between;">
            <span>Low</span><span>High</span>
          </div>
        </div>
      `
      return div
    }
    control.addTo(map)
    return () => control.remove()
  }, [map])
  return null
}


