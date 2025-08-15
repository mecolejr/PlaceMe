import { computeTruePlaceScore } from '../scoring'

describe('computeTruePlaceScore', () => {
  it('punishes higher hateCrimeIndex and rewards diversityIndex', () => {
    const lowSafety = computeTruePlaceScore({ hateCrimeIndex: 0.8, diversityIndex: 0.2 })
    const highSafety = computeTruePlaceScore({ hateCrimeIndex: 0.1, diversityIndex: 0.2 })
    expect(highSafety.score).toBeGreaterThan(lowSafety.score)
  })

  it('weights diversity more when profile.valuesDiversity is true', () => {
    const standard = computeTruePlaceScore({ hateCrimeIndex: 0.3, diversityIndex: 0.8 })
    const diversityValued = computeTruePlaceScore(
      { hateCrimeIndex: 0.3, diversityIndex: 0.8 },
      { valuesDiversity: true }
    )
    expect(diversityValued.score).toBeGreaterThanOrEqual(standard.score)
  })

  it('returns subScores and citations', () => {
    const r = computeTruePlaceScore({ hateCrimeIndex: 0.3, diversityIndex: 0.8, crimeRate: 0.5 })
    expect(r.subScores.safety).toBeGreaterThan(0)
    expect(r.subScores.community).toBeGreaterThan(0)
    expect(Array.isArray(r.citations)).toBe(true)
  })
})


