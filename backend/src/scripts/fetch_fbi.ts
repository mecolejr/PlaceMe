/**
 * Placeholder FBI API fetcher: documents the endpoint and writes a CSV to data/.
 * Replace with full implementation and proper paging/auth.
 */
import fs from 'fs'
import path from 'path'

const FBI_API_KEY = process.env.FBI_API_KEY || ''

async function main() {
  if (!FBI_API_KEY) {
    console.warn('FBI_API_KEY not set; skipping live fetch. Using stub data.')
    process.exit(0)
  }
  // Example endpoint (placeholder): adjust to real FBI hate crimes endpoint
  // const url = `https://api.usa.gov/crime/fbi/sapi/api/agencies?api_key=${FBI_API_KEY}`
  // const res = await fetch(url)
  // const json = await res.json()
  // Transform json -> CSV with columns name,state,hate_crime_index

  const out = path.resolve(process.cwd(), 'data', 'basic_hate_crimes.csv')
  fs.writeFileSync(out, 'name,state,hate_crime_index\nTexas,TX,0.30\nCalifornia,CA,0.20\nNew York,NY,0.25\n')
  console.log('Wrote stub FBI data to', out)
}

main()


