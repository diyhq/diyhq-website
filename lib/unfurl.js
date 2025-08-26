// lib/unfurl.js
export async function unfurl(url) {
  const result = { url, title: null, description: null, image: null, domain: null };
  try {
    if (!url) return result;
    const u = new URL(url);
    result.domain = u.hostname.replace(/^www\./, '');

    const res = await fetch(url, {
      // Pretend to be a browser; follow amzn.to redirects
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' },
      redirect: 'follow',
    });

    const html = await res.text();

    const meta = (prop) => {
      const re1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
      const m1 = html.match(re1);
      if (m1) return m1[1];
      const re2 = new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'); // twitter:*
      const m2 = html.match(re2);
      return m2 ? m2[1] : null;
    };

    result.title = meta('og:title') || meta('twitter:title');
    if (!result.title) {
      const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      result.title = t ? t[1] : null;
    }

    result.description = meta('og:description') || meta('twitter:description');
    let img = meta('og:image') || meta('twitter:image');
    if (img && img.startsWith('//')) img = 'https:' + img;
    result.image = img || null;

    return result;
  } catch {
    return result; // safe fallback
  }
}
