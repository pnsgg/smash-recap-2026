import { Database } from 'bun:sqlite'
import { resolve } from 'node:path'

const path = process.argv[2]
if (!path) {
  console.error('Usage: bun run ultrank:import <path to ur_db_YYYY.db>')
  process.exit(1)
}

const db = new Database(resolve(path), { readonly: true })
const rows = db.query('SELECT id, value FROM tournaments ORDER BY id').all() as { id: string; value: number }[]
const { from, to } = db.query('SELECT MIN(date) AS "from", MAX(date) AS "to" FROM tournaments').get() as {
  from: string
  to: string
}
db.close()

const scores = Object.fromEntries(rows.filter((row) => row.id.split('/').length === 2).map((row) => [row.id, row.value]))
const skipped = rows.length - Object.keys(scores).length

const out = resolve(import.meta.dir, '../src/libs/ultrank/tournaments.json')
const body = Object.entries(scores)
  .map(([slug, score]) => `    ${JSON.stringify(slug)}: ${score}`)
  .join(',\n')
await Bun.write(out, `{\n  "from": "${from}",\n  "to": "${to}",\n  "scores": {\n${body}\n  }\n}\n`)

console.log(`${Object.keys(scores).length} events (${from} to ${to}) written to ${out}${skipped ? `, ${skipped} skipped` : ''}`)
