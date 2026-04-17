export async function fetchWithCache(url: string, options: { ttl?: number } = {}) {
  const ttl = options.ttl || 10 * 60 * 1000 // Default 10 minutes
  const cacheKey = `wp_cache_${url}`

  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp, headers } = JSON.parse(cached)
      if (Date.now() - timestamp < ttl) {
        return { data, headers, cached: true, ok: true }
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      return { data: null, headers: {}, cached: false, ok: false }
    }

    const data = await res.json()
    const headers: Record<string, string> = {}
    
    // Extract commonly used headers from WordPress API
    const totalPages = res.headers.get('x-wp-totalpages')
    if (totalPages) {
      headers['x-wp-totalpages'] = totalPages
    }

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
        headers
      }))
    } catch (e) {
      // Ignore quota exceeded errors
    }

    return { data, headers, cached: false, ok: true }
  } catch (error) {
    console.error('Fetch error:', error)
    return { data: null, headers: {}, cached: false, ok: false }
  }
}
