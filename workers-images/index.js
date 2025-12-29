export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Fjern leading /
    const key = url.pathname.slice(1)

    // Hent bilde fra R2
    const object = await env.PIXTR_USERS.get(key)

    if (!object) {
      return new Response('Not found', { status: 404 })
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',

        // 🔑 DETTE ER HELE FIKSEN
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD',
        'Access-Control-Allow-Headers': '*',

        'Cache-Control': 'public, max-age=31536000',
      },
    })
  },
}
