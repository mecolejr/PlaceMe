import request from 'supertest'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import app from '../index'

const mockPrisma: any = {
  location: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  hateCrime: {
    groupBy: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  crimeStats: {
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  demographics: {
    count: vi.fn(),
    aggregate: vi.fn(),
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

describe('GET /api/profile-scores with biasType', () => {
  beforeEach(() => {
    mockPrisma.location.findMany.mockResolvedValue([
      { id: 1, name: 'Texas', state: 'TX', hateCrimeIndex: 0.3, diversityIndex: 0.5, crimeRate: 0.4 },
      { id: 2, name: 'Utah', state: 'UT', hateCrimeIndex: 0.2, diversityIndex: 0.3, crimeRate: 0.3 },
    ])
    mockPrisma.location.count.mockResolvedValue(2)
    mockPrisma.hateCrime.groupBy.mockResolvedValue([
      { locationId: 1, _sum: { incidents: 5 } },
    ])
    mockPrisma.hateCrime.count.mockResolvedValue(1)
    mockPrisma.hateCrime.aggregate.mockResolvedValue({ _sum: { incidents: 5 } })
    mockPrisma.crimeStats.count.mockResolvedValue(0)
    mockPrisma.crimeStats.aggregate.mockResolvedValue({ _sum: { violentRate: 0, propertyRate: 0 } })
    mockPrisma.demographics.count.mockResolvedValue(0)
    mockPrisma.demographics.aggregate.mockResolvedValue({ _max: { updatedAt: new Date() } })
  })

  it('filters to only locations with requested bias incidents', async () => {
    const res = await request(app).get('/api/profile-scores')
      .query({ valuesDiversity: 'false', biasType: ['anti-Asian'] })
      .expect(200)
    expect(Array.isArray(res.body.results)).toBe(true)
    const names = res.body.results.map((r: any) => r.name)
    expect(names).toContain('Texas')
    expect(names).not.toContain('Utah')
  })
})


