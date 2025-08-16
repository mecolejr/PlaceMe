import React from 'react'

export type MiniBarDatum = { label: string; value: number }

export default function MiniBarChart({ data, title, colorFor, legend }: { data: MiniBarDatum[]; title?: string; colorFor?: (d: MiniBarDatum) => string; legend?: { label: string; color: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div>
      {title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>}
      <div style={{ display: 'grid', gap: 6 }}>
        {data.map((d, i) => {
          const color = colorFor ? colorFor(d) : '#3f51b5'
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 10, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(d.value / max) * 100}%`, height: '100%', background: color }} />
              </div>
              <div style={{ fontSize: 12 }}>{d.label}: {d.value}</div>
            </div>
          )
        })}
      </div>
      {legend && legend.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
          {legend.map((l, i) => (
            <span key={i} style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: l.color, borderRadius: 2, display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}


