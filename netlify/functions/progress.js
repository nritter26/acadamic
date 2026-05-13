import { getStore } from '@netlify/blobs'

export default async (req) => {
  const store = getStore({ name: 'progress', consistency: 'strong' })

  if (req.method === 'GET') {
    const data = (await store.get('global', { type: 'json' })) ?? {}
    return Response.json(data)
  }

  if (req.method === 'POST') {
    const { lang, topic, completed } = await req.json()
    const data = (await store.get('global', { type: 'json' })) ?? {}
    if (!data[lang]) data[lang] = {}
    data[lang][topic] = completed
    await store.setJSON('global', data)
    return Response.json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config = {
  path: '/api/progress',
}
