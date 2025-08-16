import React, { useEffect, useState } from 'react'
import ScoreBars from './ScoreBars'
import Citations from './Citations'
import { fetchApi } from '../utils/fetchApi'
import MiniBarChart from './MiniBarChart'

type Detail = {
  id: number
  name: string
  state: string
  score: number
  breakdown: { hateCrimeIndex: number; diversityIndex: number }
  subScores?: { safety: number; community: number }
  citations?: string[]
  stats?: {
    hateCrimes?: { byBias: { biasType: string; incidents: number }[] }
    crimeStats?: { violentRate?: number; propertyRate?: number }
    demographics?: { diversity?: number }
  }
}

export default function LocationDetail({ id, onClose }: { id: number | null; onClose: () => void }) {
  const [data, setData] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setData(null)
    fetchApi(`/api/locations/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  if (id == null) return null

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: '#fff',
      borderLeft: '1px solid #ddd', boxShadow: '-2px 0 10px rgba(0,0,0,0.08)', padding: 16, zIndex: 1000,
      overflowY: 'auto', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Location detail</h3>
        <button onClick={onClose} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <h4 style={{ marginTop: 12 }}>{data.name}, {data.state}</h4>
          <p>TruePlace Score: {data.score}/100</p>
          <ScoreBars hateCrimeIndex={data.breakdown.hateCrimeIndex} diversityIndex={data.breakdown.diversityIndex} />
          {data.subScores && (
            <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 14 }}>
              <span>Safety: {data.subScores.safety}%</span>
              <span>Community: {data.subScores.community}%</span>
              {typeof data.subScores.policy === 'number' && <span>Policy: {data.subScores.policy}%</span>}
            </div>
          )}
          {data.citations && <Citations items={data.citations} />}

          <div style={{ marginTop: 12 }}>
            <h5 style={{ margin: '8px 0' }}>Stats</h5>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Weights: Safety ≈ 45%, Community 40–60% (pref-dependent), Policy ≈ 15%</div>
            {data.stats?.crimeStats && (
              <MiniBarChart
                title="Crime rates"
                data={[
                  { label: 'Violent', value: data.stats.crimeStats.violentRate ?? 0 },
                  { label: 'Property', value: data.stats.crimeStats.propertyRate ?? 0 },
                ]}
                colorFor={(d) => (d.label === 'Violent' ? '#e53935' : '#fb8c00')}
                legend={[{ label: 'Violent', color: '#e53935' }, { label: 'Property', color: '#fb8c00' }]}
              />
            )}
            {data.stats?.demographics && (
              <div style={{ fontSize: 14, marginTop: 6 }}>
                <div>Diversity: {data.stats.demographics.diversity ?? '—'}</div>
              </div>
            )}
            {data.stats?.hateCrimes?.byBias && data.stats.hateCrimes.byBias.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <MiniBarChart
                  title="Bias-motivated incidents by category"
                  data={data.stats.hateCrimes.byBias.map(b => ({ label: humanizeBiasType(b.biasType), value: b.incidents }))}
                  colorFor={() => '#6a1b9a'}
                  legend={[{ label: 'Incidents', color: '#6a1b9a' }]}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function humanizeBiasType(biasType: string): string {
  switch (biasType) {
    case 'anti-LGBTQ':
      return 'Against LGBTQ people'
    case 'anti-Asian':
      return 'Against Asian people'
    case 'anti-Black':
      return 'Against Black people'
    default:
      return biasType
  }
}


