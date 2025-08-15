import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { computeTruePlaceScore } from './scoring';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// In-memory cache for profile scores
type ScoresCacheEntry = { fingerprint: string; valuesDiversity: boolean; results: any[]; ts: number };
const scoresCache = new Map<string, ScoresCacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function computeDatasetFingerprint(): Promise<string> {
  const [locationsCount, hateCrimesCount, crimeStatsCount, demographicsCount] = await Promise.all([
    prisma.location.count(),
    prisma.hateCrime.count(),
    prisma.crimeStats.count(),
    prisma.demographics.count(),
  ]);
  const [hateSum, violentSum, propertySum] = await Promise.all([
    prisma.hateCrime.aggregate({ _sum: { incidents: true } }),
    prisma.crimeStats.aggregate({ _sum: { violentRate: true } }),
    prisma.crimeStats.aggregate({ _sum: { propertyRate: true } }),
  ]);
  const payload = {
    counts: { locations: locationsCount, hateCrimes: hateCrimesCount, crimeStats: crimeStatsCount, demographics: demographicsCount },
    sums: {
      hateCrimesIncidents: hateSum._sum.incidents ?? 0,
      violentRate: violentSum._sum.violentRate ?? 0,
      propertyRate: propertySum._sum.propertyRate ?? 0,
    },
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 12);
}

app.use(cors());
app.use(express.json());

// Startup banner for live data keys
(() => {
  const missing: string[] = [];
  if (!process.env.FBI_API_KEY) missing.push('FBI_API_KEY');
  if (!process.env.CENSUS_API_KEY) missing.push('CENSUS_API_KEY');
  if (missing.length > 0) {
    console.warn(
      `\n[TruePlace] Live data keys missing: ${missing.join(', ')}.\n` +
        '- Using stubbed CSV data. To refresh: `pnpm data:refresh`.\n' +
        '- To enable live fetchers, set keys in `backend/.env`.\n'
    );
  }
})();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/locations', async (_req, res) => {
  try {
    const locations = await prisma.location.findMany({ select: { id: true, name: true, state: true } });
    res.json({ locations });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/score', async (req, res) => {
  try {
    const location = String(req.query.location || '');
    if (!location) {
      return res.status(400).json({ error: 'location is required' });
    }

    const record = await prisma.location.findFirst({
      where: { name: { equals: location, mode: 'insensitive' } },
    });

    if (!record) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { score, breakdown, subScores, citations } = computeTruePlaceScore(record, {
      valuesDiversity: String(req.query.valuesDiversity || '') === 'true',
    });

    return res.json({
      location: record.name,
      state: record.state,
      score,
      breakdown,
      subScores,
      citations,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile-scores', async (req, res) => {
  try {
    const valuesDiversity = String(req.query.valuesDiversity || '') === 'true'
    const nocache = String(req.query.nocache || '') === 'true'
    const minSafety = req.query.minSafety ? Number(req.query.minSafety) : undefined
    const minCommunity = req.query.minCommunity ? Number(req.query.minCommunity) : undefined
    const limit = req.query.limit ? Math.max(1, Math.min(100, Number(req.query.limit))) : 50
    const offset = req.query.offset ? Math.max(0, Number(req.query.offset)) : 0
    const sortBy = (String(req.query.sortBy || 'score') as 'score' | 'safety' | 'community')
    const sortDir = (String(req.query.sortDir || 'desc') as 'asc' | 'desc')

    const fingerprint = await computeDatasetFingerprint()
    const keyObj = { valuesDiversity, minSafety, minCommunity, sortBy, sortDir }
    const cacheKey = `${fingerprint}:${JSON.stringify(keyObj)}`

    if (!nocache) {
      const hit = scoresCache.get(cacheKey)
      if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
        return res.json({ results: hit.results, cache: { hit: true, key: cacheKey, ttlMs: CACHE_TTL_MS } })
      }
    }

    const records = await prisma.location.findMany()
    let results = records.map((r) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      ...computeTruePlaceScore(r, { valuesDiversity }),
    }))
    // Filter
    if (typeof minSafety === 'number') {
      results = results.filter((r) => r.subScores?.safety >= minSafety)
    }
    if (typeof minCommunity === 'number') {
      results = results.filter((r) => r.subScores?.community >= minCommunity)
    }
    // Sort
    results.sort((a, b) => {
      const av = sortBy === 'score' ? a.score : sortBy === 'safety' ? a.subScores?.safety ?? 0 : a.subScores?.community ?? 0
      const bv = sortBy === 'score' ? b.score : sortBy === 'safety' ? b.subScores?.safety ?? 0 : b.subScores?.community ?? 0
      return sortDir === 'asc' ? av - bv : bv - av
    })

    scoresCache.set(cacheKey, { fingerprint, valuesDiversity, results, ts: Date.now() })
    const paged = results.slice(offset, offset + limit)
    res.json({ results: paged, total: results.length, page: { limit, offset }, cache: { hit: false, key: cacheKey, ttlMs: CACHE_TTL_MS } })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin: dataset snapshot
app.get('/api/admin/dataset', async (req, res) => {
  try {
    const token = process.env.ADMIN_TOKEN
    if (token && req.header('x-admin-token') !== token) {
      return res.status(403).json({ error: 'forbidden' })
    }

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

    const citations = [
      'Safety: FBI Crime Data API (UCR/Hate Crimes)',
      'Community: U.S. Census Bureau ACS (Diversity Index)'
    ]

    const payload = {
      counts: { locations: locationsCount, hateCrimes: hateCrimesCount, crimeStats: crimeStatsCount, demographics: demographicsCount },
      sums: {
        hateCrimesIncidents: hateSum._sum.incidents ?? 0,
        violentRate: violentSum._sum.violentRate ?? 0,
        propertyRate: propertySum._sum.propertyRate ?? 0,
      },
      citations,
    }

    const fingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 12)

    res.json({ ...payload, fingerprint, generatedAt: new Date().toISOString() })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


