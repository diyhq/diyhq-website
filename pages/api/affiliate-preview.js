// pages/api/affiliate-preview.js
import * as cheerio from 'cheerio';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function absolutize(u, base) {
  try {
    return new URL(u, base).toString();
  } catch {
    return null;
  }
}

function isAmazon(u) {
  try {
    const h = new URL(u).hostname;
    return /(amazon\.)|(amzn\.to$)/i.test(h);
  } catch {
    return false;
  }
}

// normalize very long amazon image urls (keeps Next/Image happier)
function tidyAmazonImage(u) {
  if (!u) return null;
  try {
    const url = new URL(u);
    // Prefer m.media-amazon.com when available (smaller, public CDN)
    if (/images-na\.ssl-images-amazon\.com/i.test(url.hostname)) {
      url.hostname = 'm.media-amazon.com';
    }
    // Strip query noise
    url.search = '';
    return url.toString();
  } catch {
    return u;
  }
}

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ ok: false, error: 'Missing url' });
    return;
  }

  let finalUrl = url;

  // 1) follow shortlink redirects (amzn.to, bit.ly, etc.)
  try {
    const head = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': UA,
        'accept-language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    });
    finalUrl = head.url || url;
  } catch {
    // ignore; fall back to raw url
  }

  // 2) fetch HTML like a browser
  let html = '';
  try {
    const resp = await fetch(finalUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': UA,
        'accept-language': 'en-US,en;q=0.9',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      cache: 'no-store',
    });
    html = await resp.text();
  } catch (e) {
    res
      .status(200)
      .json({ ok: true, url: finalUrl, title: new URL(finalUrl).hostname, image: null, description: null });
    return;
  }

  const $ = cheerio.load(html);

  // 3) collect candidates
  const candidates = [];

  const ogImg =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[property="og:image:secure_url"]').attr('content');

  const twImg = $('meta[name="twitter:image"]').attr('content');
  const linkImage = $('link[rel="image_src"]').attr('href');

  if (ogImg) candidates.push(ogImg);
  if (twImg) candidates.push(twImg);
  if (linkImage) candidates.push(linkImage);

  // Amazon-specific fallbacks: look for <img> preloads or canonical image hints
  $('link[rel="preload"][as="image"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) candidates.push(href);
  });

  let image = null;
  for (const c of candidates) {
    const abs = absolutize(c, finalUrl);
    if (abs) {
      image = tidyAmazonImage(abs);
      break;
    }
  }

  // Title/description
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    new URL(finalUrl).hostname;

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    null;

  // Cache at the edge for a day; revalidate for a week
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  res.status(200).json({
    ok: true,
    url: finalUrl,
    title: title?.trim() || new URL(finalUrl).hostname,
    description: description?.trim() || null,
    image: image || null,
    amazon: isAmazon(finalUrl),
  });
}
