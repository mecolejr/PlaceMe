import React, { useEffect } from 'react'

type Props = {
  message: string
  onClose?: () => void
  timeoutMs?: number
  variant?: 'error' | 'success'
}

export default function Toast({ message, onClose, timeoutMs = 4000, variant = 'error' }: Props) {
  useEffect(() => {
    const id = setTimeout(() => onClose?.(), timeoutMs)
    return () => clearTimeout(id)
  }, [onClose, timeoutMs])

  const styles = variant === 'success'
    ? { bg: '#eef9f0', fg: '#0a6b2b', border: '#b7e2c2', title: 'Success' }
    : { bg: '#fee', fg: '#900', border: '#f99', title: 'Error' }
  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      background: styles.bg,
      color: styles.fg,
      padding: '10px 12px',
      border: `1px solid ${styles.border}`,
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: 360,
      zIndex: 1000,
      fontSize: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>{styles.title}</strong>
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div style={{ marginTop: 6 }}>{message}</div>
    </div>
  )
}


