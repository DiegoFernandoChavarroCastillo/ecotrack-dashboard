// Servidor de demostración que imita la API REST de Supabase (PostgREST) para la tabla
// emissions. Permite ver la app sin un proyecto real:
//   MOCK_MODE=datos|vacio|lento node scripts/mock-supabase.mjs
//   VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_ANON_KEY=demo npm run dev
// El estado de error se obtiene deteniendo este servidor (fallo de red).
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

const MODE = process.env.MOCK_MODE ?? 'datos'
const PORT = 54321

const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString()
const rows =
  MODE === 'vacio'
    ? []
    : [
        { source_name: 'Flota de reparto urbano', category: 'transporte', co2_kg: 1284.5, created_at: hoursAgo(2) },
        { source_name: 'Planta de producción norte', category: 'energia', co2_kg: 3420.75, created_at: hoursAgo(5) },
        { source_name: 'Residuos orgánicos cafetería', category: 'residuos', co2_kg: 186.2, created_at: hoursAgo(9) },
        { source_name: 'Vuelos corporativos', category: 'transporte', co2_kg: 2310, created_at: hoursAgo(26) },
        { source_name: 'Centro de datos', category: 'energia', co2_kg: 1975.4, created_at: hoursAgo(30) },
        { source_name: 'Embalaje no reciclable', category: 'residuos', co2_kg: 412.9, created_at: hoursAgo(50) },
      ].map((r) => ({ id: randomUUID(), ...r }))

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}

function send(res, status, body) {
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, null)
  if (!req.url?.startsWith('/rest/v1/emissions')) return send(res, 404, { message: 'No encontrado' })

  if (req.method === 'GET') {
    const sorted = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))
    return MODE === 'lento' ? undefined : send(res, 200, sorted)
  }

  if (req.method === 'POST') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      const input = JSON.parse(body)
      const row = { id: randomUUID(), created_at: new Date().toISOString(), ...input }
      rows.push(row)
      // .single() pide un objeto, no un array.
      const single = req.headers.accept?.includes('vnd.pgrst.object')
      send(res, 201, single ? row : [row])
    })
    return
  }

  send(res, 405, { message: 'Método no permitido' })
}).listen(PORT, () => console.log(`Mock de Supabase en http://localhost:${PORT} (modo: ${MODE})`))
