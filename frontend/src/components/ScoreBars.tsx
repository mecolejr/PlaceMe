import React from 'react'

type Props = {
  hateCrimeIndex?: number
  diversityIndex?: number
}

export default function ScoreBars({ hateCrimeIndex = 0, diversityIndex = 0 }: Props) {
  const safety = clamp01(1 - hateCrimeIndex)
  const diversity = clamp01(diversityIndex)
  return (
    <div style={{ display: 'grid', gap: 4, minWidth: 220 }}>
      <Bar label="Safety" value={safety} color="#4caf50" />
      <Bar label="Diversity" value={diversity} color="#3f51b5" />
    </div>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 36px', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <div style={{ background: '#eee', height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
    </div>
  )
}

function clamp01(n: number) {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}


