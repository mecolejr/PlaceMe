import React, { useEffect, useState } from 'react'
import MapView from './MapView'
import ScoreBars from './components/ScoreBars'
import Citations from './components/Citations'
import Toast from './components/Toast'
import { fetchApi } from './utils/fetchApi'

export default function App() {
  const [location, setLocation] = useState('Texas')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<{ id: number; name: string; state: string }[]>([])
  const [valuesDiversity, setValuesDiversity] = useState(false)
  const [ranked, setRanked] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stateFilter, setStateFilter] = useState<string>('')
  const [toast, setToast] = useState<string | null>(null)
  const [cacheMeta, setCacheMeta] = useState<{ hit: boolean; key: string; ttlMs: number } | null>(null)
  const [forceRefresh, setForceRefresh] = useState(false)
  const [minSafety, setMinSafety] = useState<number | ''>('')
  const [minCommunity, setMinCommunity] = useState<number | ''>('')
  const [limit, setLimit] = useState<number>(10)
  const [sortBy, setSortBy] = useState<'score' | 'safety' | 'community'>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [offset, setOffset] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    fetchApi('/api/locations')
      .then((r) => r.json())
      .then((data) => {
        const list = data.locations || []
        setLocations(list)
        try {
          const savedLoc = localStorage.getItem('tp_location')
          const preferred = list.find((l: any) => l.name === savedLoc)
          if (preferred) {
            setLocation(preferred.name)
            return
          }
        } catch {}
        if (list.length > 0 && !list.find((l: any) => l.name === location)) setLocation(list[0].name)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tp_valuesDiversity')
      if (saved === 'true' || saved === 'false') setValuesDiversity(saved === 'true')
    } catch {}
  }, [])

  useEffect(() => {
    // Load persisted UI settings
    try {
      const cfg = JSON.parse(localStorage.getItem('tp_ui') || '{}')
      if (cfg.minSafety !== undefined) setMinSafety(cfg.minSafety)
      if (cfg.minCommunity !== undefined) setMinCommunity(cfg.minCommunity)
      if (cfg.limit) setLimit(cfg.limit)
      if (cfg.sortBy) setSortBy(cfg.sortBy)
      if (cfg.sortDir) setSortDir(cfg.sortDir)
    } catch {}
  }, [])

  useEffect(() => {
    // Persist settings
    try {
      localStorage.setItem('tp_ui', JSON.stringify({ minSafety, minCommunity, limit, sortBy, sortDir }))
    } catch {}
  }, [minSafety, minCommunity, limit, sortBy, sortDir])

  useEffect(() => {
    const controller = new AbortController()
    const loadRanked = async () => {
      try {
        const params = new URLSearchParams({ valuesDiversity: String(valuesDiversity), limit: String(limit), sortBy, sortDir, offset: String(offset) })
        if (minSafety !== '') params.set('minSafety', String(minSafety))
        if (minCommunity !== '') params.set('minCommunity', String(minCommunity))
        const res = await fetchApi(`/api/profile-scores?${params.toString()}`, { signal: controller.signal })
        const data = await res.json()
        if (res.ok) {
          setRanked(Array.isArray(data.results) ? data.results : [])
          if (typeof data.total === 'number') setTotal(data.total)
          if (data.cache) setCacheMeta(data.cache)
        }
      } catch {}
    }
    loadRanked()
    return () => controller.abort()
  }, [valuesDiversity, minSafety, minCommunity, limit, sortBy, sortDir, offset])

  useEffect(() => {
    try {
      localStorage.setItem('tp_valuesDiversity', String(valuesDiversity))
    } catch {}
  }, [valuesDiversity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setRanked([])
    try {
      setLoading(true)
      const params = new URLSearchParams({ location, valuesDiversity: String(valuesDiversity) })
      const rankedParams = new URLSearchParams({ valuesDiversity: String(valuesDiversity), limit: String(limit), sortBy, sortDir, offset: String(offset) })
      if (minSafety !== '') rankedParams.set('minSafety', String(minSafety))
      if (minCommunity !== '') rankedParams.set('minCommunity', String(minCommunity))
      if (forceRefresh) rankedParams.set('nocache', 'true')
      const [r1, r2] = await Promise.all([
        fetchApi(`/api/score?${params.toString()}`),
        fetchApi(`/api/profile-scores?${rankedParams.toString()}`)
      ])
      const t1 = await r1.text()
      const t2 = await r2.text()
      if (!r1.ok) throw new Error(t1 || 'Request failed')
      if (!r2.ok) throw new Error(t2 || 'Request failed')
      const data1 = t1 ? JSON.parse(t1) : {}
      const data2 = t2 ? JSON.parse(t2) : {}
      setResult(data1)
      setRanked(Array.isArray(data2.results) ? data2.results.slice(0, 10) : [])
      if (data2.cache) setCacheMeta(data2.cache)
    } catch (err: any) {
      const msg = err.message || 'Unknown error'
      setError(msg)
      setToast(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>TruePlace</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {locations.length > 0 ? (
          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              try { localStorage.setItem('tp_location', e.target.value) } catch {}
            }}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              try { localStorage.setItem('tp_location', e.target.value) } catch {}
            }}
            placeholder="Enter a location name"
          />
        )}
        <label style={{ display: 'flex', gap: 6 }}>
          <input type="checkbox" checked={valuesDiversity} onChange={(e) => setValuesDiversity(e.target.checked)} />
          Value diversity
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Show My Score'}</button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }} title="Bypass cached results">
          <input type="checkbox" checked={forceRefresh} onChange={(e) => setForceRefresh(e.target.checked)} />
          Force refresh
        </label>
      </form>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <label>Min safety: <input style={{ width: 60 }} type="number" min={0} max={100} value={minSafety} onChange={(e) => setMinSafety(e.target.value === '' ? '' : Number(e.target.value))} /></label>
        <label>Min community: <input style={{ width: 60 }} type="number" min={0} max={100} value={minCommunity} onChange={(e) => setMinCommunity(e.target.value === '' ? '' : Number(e.target.value))} /></label>
        <label>Sort by: <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}><option value="score">Score</option><option value="safety">Safety</option><option value="community">Community</option></select></label>
        <label>Dir: <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}><option value="desc">desc</option><option value="asc">asc</option></select></label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>
            {result.location}, {result.state}
          </h2>
          <p>TruePlace Score: {result.score}/100</p>
          <ScoreBars hateCrimeIndex={result.breakdown.hateCrimeIndex} diversityIndex={result.breakdown.diversityIndex} />
          {result.subScores && (
            <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
              <span><strong>Safety:</strong> {result.subScores.safety}%</span>
              <span><strong>Community:</strong> {result.subScores.community}%</span>
            </div>
          )}
          {Array.isArray(result.citations) && result.citations.length > 0 && <Citations items={result.citations} />}
        </div>
      )}
      {ranked.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Top matches</h3>
          {cacheMeta && (
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              Cache: {cacheMeta.hit ? 'hit' : 'miss'} · key {cacheMeta.key}
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <label>
              Filter by state:
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={{ marginLeft: 8 }}>
                <option value="">All</option>
                {[...new Set(locations.map((l) => l.state))].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </label>
          </div>
          <ol>
            {ranked
              .filter((r) => (stateFilter ? r.state === stateFilter : true))
              .map((r) => (
              <li key={r.id} style={{ marginBottom: 8 }}>
                <div>
                  {r.name}, {r.state} — {r.score}/100
                </div>
                {'breakdown' in r && r.breakdown && (
                  <ScoreBars hateCrimeIndex={r.breakdown.hateCrimeIndex} diversityIndex={r.breakdown.diversityIndex} />
                )}
                {r.subScores && (
                  <div style={{ marginTop: 4, display: 'flex', gap: 16, fontSize: 12 }}>
                    <span>Safety: {r.subScores.safety}%</span>
                    <span>Community: {r.subScores.community}%</span>
                  </div>
                )}
                {Array.isArray(r.citations) && r.citations.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Citations items={r.citations} />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <button disabled={offset <= 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</button>
            <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Next</button>
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + ranked.length)} of {total}
            </span>
            <label>Page size: <select value={limit} onChange={(e) => { setOffset(0); setLimit(Number(e.target.value)) }}>
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select></label>
          </div>
        </div>
      )}
      <MapView valuesDiversity={valuesDiversity} onSelectLocation={(n) => setLocation(n)} />
    </div>
  )
}


