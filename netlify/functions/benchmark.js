export default async (req) => {
  const url = new URL(req.url)
  const n = Math.min(parseInt(url.searchParams.get('n') || '10000'), 10_000_000)

  const start = process.hrtime.bigint()
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += i * i
  }
  const end = process.hrtime.bigint()
  const ms = Number(end - start) / 1e6

  return Response.json({
    backend: 'Node.js',
    version: process.version,
    iterations: n,
    result: sum,
    timeMs: Math.round(ms * 100) / 100,
    opsPerSec: Math.round(n / (ms / 1000)),
  })
}

export const config = {
  path: '/api/benchmark',
}
