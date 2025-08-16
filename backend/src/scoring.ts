export type BasicProfile = {
  valuesDiversity?: boolean
}

export type LocationRecord = {
  hateCrimeIndex?: number | null
  diversityIndex?: number | null
  crimeRate?: number | null
  policyScore?: number | null
}

export type ScoreBreakdown = {
  hateCrimeIndex: number
  diversityIndex: number
}

export type SubScores = {
  safety: number
  community: number
  policy?: number
}

export function computeTruePlaceScore(
  location: LocationRecord,
  profile: BasicProfile = {}
): { score: number; breakdown: ScoreBreakdown; subScores: SubScores; citations: string[] } {
  const hateCrimeIndex = location.hateCrimeIndex ?? 0
  const diversityIndex = location.diversityIndex ?? 0
  const crimeRate = location.crimeRate ?? 0
  const policy = location.policyScore ?? 0.5

  const diversityWeight = profile.valuesDiversity ? 0.6 : 0.45
  const policyWeight = 0.15
  const safetyWeight = 1 - (diversityWeight + policyWeight)

  const normalizedSafety = Math.max(0, Math.min(1, (1 - hateCrimeIndex) * 0.6 + (1 - crimeRate) * 0.4))
  const normalizedDiversity = Math.max(0, Math.min(1, diversityIndex))
  const normalizedPolicy = Math.max(0, Math.min(1, policy))

  // Sub-scores (0..1)
  const safety01 = normalizedSafety
  const community01 = normalizedDiversity
  const policy01 = normalizedPolicy

  const score01 = safety01 * safetyWeight + community01 * diversityWeight + policy01 * policyWeight
  const score = Math.round(score01 * 100)

  return {
    score,
    breakdown: {
      hateCrimeIndex,
      diversityIndex,
    },
    subScores: {
      safety: Math.round(safety01 * 100),
      community: Math.round(community01 * 100),
      policy: Math.round(policy01 * 100),
    },
    citations: [
      'Safety: FBI Crime Data API (UCR/Hate Crimes)',
      'Community: U.S. Census Bureau ACS (Diversity Index)'
    ],
  }
}


