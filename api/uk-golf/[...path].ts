export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  try {
    const { path } = req.query as { path?: string[] };
    const pathStr = Array.isArray(path) ? path.join('/') : path || '';
    const search = req.url && req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `https://api.bthree.uk/golf/v1/${pathStr}${search}`;

    const init: RequestInit = {
      method: req.method,
      headers: { ...req.headers, host: undefined as any },
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
    }

    const upstream = await fetch(targetUrl, init);
    const body = Buffer.from(await upstream.arrayBuffer());

    // Copy status and headers
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      // Skip hop-by-hop headers if any
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    // Same-origin, so CORS not required; set permissive just in case
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.send(body);
  } catch (err: any) {
    res.status(500).json({ error: 'Proxy error', message: err?.message || String(err) });
  }
}


