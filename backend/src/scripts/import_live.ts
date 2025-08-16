import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fetchFbiHateCrimesByState(_apiKey: string) {
  // TODO: Implement real FBI API calls. For now, return an empty map.
  // Shape: Map<state, Array<{ biasType: string; incidents: number }>>
  return new Map<string, Array<{ biasType: string; incidents: number }>>()
}

async function fetchCensusDiversity(_apiKey: string) {
  // TODO: Implement real Census ACS calls. For now, return an empty map.
  // Shape: Map<state, { diversity: number }>
  return new Map<string, { diversity: number }>()
}

async function main() {
  const FBI_API_KEY = process.env.FBI_API_KEY || ''
  const CENSUS_API_KEY = process.env.CENSUS_API_KEY || ''

  if (!FBI_API_KEY && !CENSUS_API_KEY) {
    console.warn('[import_live] No API keys present; skipping live import (stubs remain in use).')
    return
  }

  // Build name/state -> location id lookup
  const locations = await prisma.location.findMany({ select: { id: true, name: true, state: true } })
  const byState = new Map<string, number>()
  for (const l of locations) byState.set(l.state, l.id)

  if (FBI_API_KEY) {
    try {
      const byStateBias = await fetchFbiHateCrimesByState(FBI_API_KEY)
      for (const [state, arr] of byStateBias) {
        const locId = byState.get(state)
        if (!locId) continue
        for (const row of arr) {
          await prisma.hateCrime.upsert({
            where: { locationId_biasType: { locationId: locId, biasType: row.biasType } },
            update: { incidents: row.incidents },
            create: { locationId: locId, biasType: row.biasType, incidents: row.incidents },
          })
        }
      }
      await prisma.meta.upsert({
        where: { key: 'import:fbi' },
        update: { value: new Date().toISOString() },
        create: { key: 'import:fbi', value: new Date().toISOString() },
      })
      console.log('[import_live] FBI hate crimes import complete')
    } catch (e) {
      console.warn('[import_live] FBI import failed:', (e as Error).message)
    }
  }

  if (CENSUS_API_KEY) {
    try {
      const byStateDemo = await fetchCensusDiversity(CENSUS_API_KEY)
      for (const [state, demo] of byStateDemo) {
        const locId = byState.get(state)
        if (!locId) continue
        await prisma.demographics.upsert({
          where: { locationId: locId },
          update: { diversity: demo.diversity },
          create: { locationId: locId, diversity: demo.diversity },
        })
      }
      await prisma.meta.upsert({
        where: { key: 'import:census' },
        update: { value: new Date().toISOString() },
        create: { key: 'import:census', value: new Date().toISOString() },
      })
      console.log('[import_live] Census diversity import complete')
    } catch (e) {
      console.warn('[import_live] Census import failed:', (e as Error).message)
    }
  }
}

main().finally(async () => prisma.$disconnect())


