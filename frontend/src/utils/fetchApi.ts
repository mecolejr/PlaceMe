const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) || 'http://localhost:4000'

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  if (path.startsWith('/api')) {
    const absolute = `${API_BASE}${path}`
    return fetch(absolute, init)
  }
  return fetch(path, init)
}


