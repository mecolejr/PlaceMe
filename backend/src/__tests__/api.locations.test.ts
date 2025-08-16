import request from 'supertest'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import app from '../index'

const mockPrisma: any = {
  location: {
    findUnique: vi.fn(),
  },
  hateCrime: {
    findMany: vi.fn(),
  },
  crimeStats: {
    findUnique: vi.fn(),
  },
  demographics: {
    findUnique: vi.fn(),
  },
}

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      constructor() {
        return mockPrisma
      }
    },
  }
})

describe('GET /api/locations/:id', () => {
  beforeEach(() => {
    mockPrisma.location.findUnique.mockResolvedValue({ id: 1, name: 'Texas', state: 'TX', hateCrimeIndex: 0.3, diversityIndex: 0.6, crimeRate: 0.4 })
    mockPrisma.hateCrime.findMany.mockResolvedValue([{ biasType: 'anti-Asian', incidents: 3 }])
    mockPrisma.crimeStats.findUnique.mockResolvedValue({ violentRate: 0.2, propertyRate: 0.4 })
    mockPrisma.demographics.findUnique.mockResolvedValue({ diversity: 0.6 })
  })

  it('returns detail payload', async () => {
    const res = await request(app).get('/api/locations/1').expect(200)
    expect(res.body.name).toBe('Texas')
    expect(res.body.stats.hateCrimes.byBias[0].biasType).toBe('anti-Asian')
  })
})


