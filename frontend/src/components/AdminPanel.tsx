import React, { useEffect, useState } from 'react'
import { fetchApi } from '../utils/fetchApi'

type DatasetInfo = {
  counts: { locations: number; hateCrimes: number; crimeStats: number; demographics: number }
  sums: { hateCrimesIncidents: number; violentRate: number; propertyRate: number }
  lastUpdated?: { hateCrimes?: string; crimeStats?: string; demographics?: string }
  fingerprint: string
  generatedAt: string
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<DatasetInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>(() => {
    try { return localStorage.getItem('tp_admin_token') || '' } catch { return '' }
  })

  useEffect(() => {
    const headers: Record<string, string> = {}
    if (token) headers['x-admin-token'] = token
    fetchApi('/api/admin/dataset', { headers })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setError(e.message || 'Failed to load'))
  }, [token])

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 420, background: '#fff', borderRight: '1px solid #ddd', boxShadow: '2px 0 10px rgba(0,0,0,0.08)', padding: 16, zIndex: 1000, overflowY: 'auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Admin: Dataset</h3>
        <button onClick={onClose} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <label style={{ fontSize: 12 }}>Admin token: <input type="password" value={token} onChange={(e) => {
          const t = e.target.value; setToken(t); try { localStorage.setItem('tp_admin_token', t) } catch {}
        }} /></label>
        <button onClick={() => setData(null)} style={{ fontSize: 12 }}>Refresh</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !data && <p>Loading…</p>}
      {data && (
        <div style={{ fontSize: 14 }}>
          <div style={{ marginTop: 8 }}>
            <strong>Fingerprint:</strong> {data.fingerprint}
          </div>
          <div><strong>Generated:</strong> {new Date(data.generatedAt).toLocaleString()}</div>
          <div style={{ marginTop: 8 }}>
            <strong>Counts</strong>
            <ul>
              <li>Locations: {data.counts.locations}</li>
              <li>Hate crimes: {data.counts.hateCrimes}</li>
              <li>Crime stats: {data.counts.crimeStats}</li>
              <li>Demographics: {data.counts.demographics}</li>
            </ul>
          </div>
          <div>
            <strong>Last updated</strong>
            <ul>
              <li>Hate crimes: {data.lastUpdated?.hateCrimes ? new Date(data.lastUpdated.hateCrimes).toLocaleString() : '—'}</li>
              <li>Crime stats: {data.lastUpdated?.crimeStats ? new Date(data.lastUpdated.crimeStats).toLocaleString() : '—'}</li>
              <li>Demographics: {data.lastUpdated?.demographics ? new Date(data.lastUpdated.demographics).toLocaleString() : '—'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}


