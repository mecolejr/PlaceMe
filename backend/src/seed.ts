import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.location.createMany({
    data: [
      { name: 'Texas', state: 'TX', crimeRate: 0.6, hateCrimeIndex: 0.3, diversityIndex: 0.7 },
      { name: 'California', state: 'CA', crimeRate: 0.5, hateCrimeIndex: 0.2, diversityIndex: 0.85 },
      { name: 'New York', state: 'NY', crimeRate: 0.55, hateCrimeIndex: 0.25, diversityIndex: 0.8 }
    ],
    skipDuplicates: true
  })
}

main().finally(async () => {
  await prisma.$disconnect()
})

