import React from 'react'

type Props = { items: string[] }

const KNOWN: Record<string, { label: string; href: string }> = {
  'Safety: FBI Crime Data API (UCR/Hate Crimes)': {
    label: 'FBI Crime Data API',
    href: 'https://crime-data-explorer.fr.cloud.gov/pages/docApi',
  },
  'Community: U.S. Census Bureau ACS (Diversity Index)': {
    label: 'U.S. Census ACS',
    href: 'https://www.census.gov/data/developers/data-sets/acs-5year.html',
  },
}

export default function Citations({ items }: Props) {
  if (!Array.isArray(items) || items.length === 0) return null
  const links = items.map((k, i) => {
    const m = KNOWN[k]
    if (m) return <a key={i} href={m.href} target="_blank" rel="noreferrer">{m.label}</a>
    return <span key={i}>{k}</span>
  })
  return (
    <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {links}
    </div>
  )
}


