// pages/api/affiliate-preview.js
export const config = {
  runtime: "edge",
};

function pick(meta, keys) {
  for (const k of keys) {
    const v = meta.get(k);
    if (v) return v;
  }
  return "";
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    if (!target) {
      return new Response(JSON.stringify({ ok: false, error: "missing url" }), { status: 400 });
    }

    const resp = await fetch(target, {
      headers: {
        // Helps Amazon and others return normal HTML with OG tags
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const html = await resp.text();
    const meta = new Map();
    // very small parser for common OG/SEO tags
    const re = /<meta\s+[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?\scontent\s*=\s*["']([^"']+)["'][^>]*?>/gi;
    let m;
    while ((m = re.exec(html))) {
      meta.set(m[1].toLowerCase(), m[2]);
    }

    let title = pick(meta, ["og:title", "twitter:title", "title", "name"]);
    let description = pick(meta, ["og:description", "twitter:description", "description"]);
    let image = pick(meta, ["og:image", "twitter:image", "og:image:url"]);

    // Amazon tidy-ups
    try {
      const host = new URL(target).hostname;
      if (/amazon\./i.test(host)) {
        // Strip leading "Amazon.com:" noise
        title = title.replace(/^Amazon(\.com)?:\s*/i, "");
        // Prefer m.media-amazon host if present
        if (image && !/m\.media\-amazon\.com/i.test(image)) {
          const mm = image.match(/\/images\/I\/[^"']+/i);
          if (mm) image = `https://m.media-amazon.com${mm[0]}`;
        }
      }
    } catch {}

    // fallback image (allowed in next.config)
    if (!image) image = "https://images-na.ssl-images-amazon.com/images/G/01/anywhere/amazon_logo._CB485945433_.png";

    const body = JSON.stringify({ ok: true, title, description, image, url: target });
    return new Response(body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        // CDN cache a week; SWR 1 day
        "cache-control": "s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
}
