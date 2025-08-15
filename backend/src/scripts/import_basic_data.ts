import { PrismaClient } from '@prisma/client'
import { loadCrimeCsv, loadDiversityCsv, loadHateCrimesCsv, resolveDataPath } from '../data/sources'

const prisma = new PrismaClient()

async function main() {
  const hateCsv = resolveDataPath('basic_hate_crimes.csv')
  const divCsv = resolveDataPath('basic_diversity.csv')

  const hateRows = loadHateCrimesCsv(hateCsv)
  const divRows = loadDiversityCsv(divCsv)
  const crimeRows = loadCrimeCsv(resolveDataPath('basic_crime.csv'))

  const byKey = new Map<string, { name: string; state: string; hateCrimeIndex?: number; diversityIndex?: number }>()

  for (const r of hateRows) {
    const k = `${r.name}|${r.state}`
    byKey.set(k, { name: r.name, state: r.state, hateCrimeIndex: r.hate_crime_index })
  }
  for (const r of divRows) {
    const k = `${r.name}|${r.state}`
    const prev = byKey.get(k) || { name: r.name, state: r.state }
    prev.diversityIndex = r.diversity_index
    byKey.set(k, prev)
  }

  for (const c of crimeRows) {
    const k = `${c.name}|${c.state}`
    const prev = byKey.get(k) || { name: c.name, state: c.state }
    ;(prev as any).crimeRate = c.crime_rate
    byKey.set(k, prev)
  }

  for (const rec of byKey.values()) {
    await prisma.location.upsert({
      where: { name_state: { name: rec.name, state: rec.state } },
      update: { hateCrimeIndex: rec.hateCrimeIndex, diversityIndex: rec.diversityIndex, crimeRate: (rec as any).crimeRate },
      create: {
        name: rec.name,
        state: rec.state,
        hateCrimeIndex: rec.hateCrimeIndex,
        diversityIndex: rec.diversityIndex,
        crimeRate: (rec as any).crimeRate,
      },
    })
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})


