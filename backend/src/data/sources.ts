import fs from 'fs'
import path from 'path'

export type HateCrimesRow = {
  name: string
  state: string
  hate_crime_index: number
}

export type DiversityRow = {
  name: string
  state: string
  diversity_index: number
}

export type CrimeRow = {
  name: string
  state: string
  crime_rate: number
}

function parseCsv(content: string): string[][] {
  return content
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((s) => s.trim()))
}

export function loadHateCrimesCsv(csvFile: string): HateCrimesRow[] {
  const text = fs.readFileSync(csvFile, 'utf-8')
  const rows = parseCsv(text)
  const [header, ...data] = rows
  const col = (name: string) => header.indexOf(name)
  const iName = col('name')
  const iState = col('state')
  const iIndex = col('hate_crime_index')
  return data
    .filter((r) => r.length >= 3)
    .map((r) => ({
      name: r[iName],
      state: r[iState],
      hate_crime_index: Number(r[iIndex] || 0),
    }))
}

export function loadDiversityCsv(csvFile: string): DiversityRow[] {
  const text = fs.readFileSync(csvFile, 'utf-8')
  const rows = parseCsv(text)
  const [header, ...data] = rows
  const col = (name: string) => header.indexOf(name)
  const iName = col('name')
  const iState = col('state')
  const iIndex = col('diversity_index')
  return data
    .filter((r) => r.length >= 3)
    .map((r) => ({
      name: r[iName],
      state: r[iState],
      diversity_index: Number(r[iIndex] || 0),
    }))
}

export function resolveDataPath(...parts: string[]): string {
  return path.resolve(process.cwd(), 'data', ...parts)
}

export function loadCrimeCsv(csvFile: string): CrimeRow[] {
  const text = fs.readFileSync(csvFile, 'utf-8')
  const rows = parseCsv(text)
  const [header, ...data] = rows
  const col = (name: string) => header.indexOf(name)
  const iName = col('name')
  const iState = col('state')
  const iRate = col('crime_rate')
  return data
    .filter((r) => r.length >= 3)
    .map((r) => ({ name: r[iName], state: r[iState], crime_rate: Number(r[iRate] || 0) }))
}


