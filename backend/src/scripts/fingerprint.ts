import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function computeFingerprint(): Promise<string> {
  const [locationsCount, hateCrimesCount, crimeStatsCount, demographicsCount] = await Promise.all([
    prisma.location.count(),
    prisma.hateCrime.count(),
    prisma.crimeStats.count(),
    prisma.demographics.count(),
  ])
  const [hateSum, violentSum, propertySum] = await Promise.all([
    prisma.hateCrime.aggregate({ _sum: { incidents: true } }),
    prisma.crimeStats.aggregate({ _sum: { violentRate: true } }),
    prisma.crimeStats.aggregate({ _sum: { propertyRate: true } }),
  ])
  const payload = {
    counts: { locations: locationsCount, hateCrimes: hateCrimesCount, crimeStats: crimeStatsCount, demographics: demographicsCount },
    sums: {
      hateCrimesIncidents: hateSum._sum.incidents ?? 0,
      violentRate: violentSum._sum.violentRate ?? 0,
      propertyRate: propertySum._sum.propertyRate ?? 0,
    },
  }
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 12)
}

async function main() {
  const next = await computeFingerprint()
  const fpDir = path.resolve(process.cwd(), 'data')
  const fpFile = path.join(fpDir, '.fingerprint')
  let prev = ''
  try { prev = fs.readFileSync(fpFile, 'utf-8').trim() } catch {}
  console.log(`[dataset] previous=${prev || 'none'} next=${next}`)
  try {
    fs.mkdirSync(fpDir, { recursive: true })
    fs.writeFileSync(fpFile, `${next}\n`, 'utf-8')
  } catch {}
}

main().finally(async () => prisma.$disconnect())


