import React, { useEffect } from 'react'

type Props = {
  message: string
  onClose?: () => void
  timeoutMs?: number
}

export default function Toast({ message, onClose, timeoutMs = 4000 }: Props) {
  useEffect(() => {
    const id = setTimeout(() => onClose?.(), timeoutMs)
    return () => clearTimeout(id)
  }, [onClose, timeoutMs])

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      background: '#fee',
      color: '#900',
      padding: '10px 12px',
      border: '1px solid #f99',
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: 360,
      zIndex: 1000,
      fontSize: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>Error</strong>
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


