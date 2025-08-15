import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function csv(file: string): string[][] {
  const text = fs.readFileSync(file, 'utf-8').trim()
  return text.split(/\r?\n/).map((l) => l.split(',').map((s) => s.trim()))
}

async function main() {
  const root = path.resolve(process.cwd(), 'data')

  // Hate crimes by bias
  const hateFile = path.join(root, 'phase2_hate_crimes.csv')
  if (fs.existsSync(hateFile)) {
    const [h, ...rows] = csv(hateFile)
    const ix = {
      name: h.indexOf('name'),
      state: h.indexOf('state'),
      bias: h.indexOf('bias_type'),
      incidents: h.indexOf('incidents'),
    }
    for (const r of rows) {
      const name = r[ix.name]
      const state = r[ix.state]
      const bias = r[ix.bias]
      const incidents = Number(r[ix.incidents] || 0)
      const loc = await prisma.location.findFirst({ where: { name, state } })
      if (!loc) continue
      await prisma.hateCrime.upsert({
        where: { locationId_biasType: { locationId: loc.id, biasType: bias } },
        update: { incidents },
        create: { locationId: loc.id, biasType: bias, incidents },
      })
    }
  }

  // General crime
  const crimeFile = path.join(root, 'phase2_crime_stats.csv')
  if (fs.existsSync(crimeFile)) {
    const [h, ...rows] = csv(crimeFile)
    const ix = {
      name: h.indexOf('name'),
      state: h.indexOf('state'),
      violent: h.indexOf('violent_rate'),
      property: h.indexOf('property_rate'),
    }
    for (const r of rows) {
      const name = r[ix.name]
      const state = r[ix.state]
      const violentRate = Number(r[ix.violent] || 0)
      const propertyRate = Number(r[ix.property] || 0)
      const loc = await prisma.location.findFirst({ where: { name, state } })
      if (!loc) continue
      await prisma.crimeStats.upsert({
        where: { locationId: loc.id },
        update: { violentRate, propertyRate },
        create: { locationId: loc.id, violentRate, propertyRate },
      })
    }
  }

  // Demographics
  const demoFile = path.join(root, 'phase2_demographics.csv')
  if (fs.existsSync(demoFile)) {
    const [h, ...rows] = csv(demoFile)
    const ix = {
      name: h.indexOf('name'),
      state: h.indexOf('state'),
      diversity: h.indexOf('diversity'),
    }
    for (const r of rows) {
      const name = r[ix.name]
      const state = r[ix.state]
      const diversity = Number(r[ix.diversity] || 0)
      const loc = await prisma.location.findFirst({ where: { name, state } })
      if (!loc) continue
      await prisma.demographics.upsert({
        where: { locationId: loc.id },
        update: { diversity },
        create: { locationId: loc.id, diversity },
      })
    }
  }
}

main().finally(async () => prisma.$disconnect())


