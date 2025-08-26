// pages/api/affiliate-preview.js
import cheerio from "cheerio";

const UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

function normalize(url) {
  try { return new URL(url).toString(); } catch { return ""; }
}

function domainOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; }
}

// Extract ASIN from common amazon patterns
function extractASIN(u) {
  try {
    const url = new URL(u);
    const h = url.hostname;
    const p = url.pathname;

    // e.g. /dp/B0CXXXXXXX /gp/product/B0CXXXXXXX /Something/dp/B0CXXXXXXX
    const m = p.match(/(?:dp|gp\/product|o\/ASIN|product-reviews)\/([A-Z0-9]{10})/i);
    if (m) return m[1].toUpperCase();

    // ?ASIN= query param
    if (url.searchParams.get("ASIN")) return url.searchParams.get("ASIN").toUpperCase();

    return null;
  } catch { return null; }
}

// Build official AsinImage URL (Associate-friendly)
function asinImageURL(asin, tag) {
  if (!asin || !tag) return null;
  const params = new URLSearchParams({
    _encoding: "UTF8",
    ASIN: asin,
    Format: "_SL400_",
    ID: "AsinImage",
    MarketPlace: "US",
    ServiceVersion: "20070822",
    WS: "1",
    tag
  });
  return `https://ws-na.amazon-adsystem.com/widgets/q?${params.toString()}`;
}

export default async function handler(req, res) {
  const input = String(req.query.url || "");
  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG || process.env.AMAZON_TAG || "";

  if (!input) {
    return res.status(400).json({ ok: false, error: "Missing url" });
  }

  try {
    // 1) follow redirects to get the final URL
    const r0 = await fetch(input, {
      redirect: "follow",
      headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    });
    const finalURL = r0.url || input;

    // 2) fetch HTML of the final URL (again, explicit UA)
    const r1 = await fetch(finalURL, {
      redirect: "follow",
      headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    });
    const html = await r1.text();

    // 3) parse OG tags
    const $ = cheerio.load(html);
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").first().text() ||
      "";

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      "";

    let image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const d = domainOf(finalURL);

    // 4) If Amazon, compute ASIN + AsinImage fallback
    let asin = null;
    if (/amazon\./i.test(d) || /amzn\.to$/i.test(d)) {
      asin = extractASIN(finalURL);
      if (!image && asin && amazonTag) {
        image = asinImageURL(asin, amazonTag);
      }
    }

    // Normalize image URL (avoid protocol-relative)
    if (image && image.startsWith("//")) image = "https:" + image;

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400");
    return res.status(200).json({
      ok: true,
      url: normalize(finalURL),
      title: title?.trim() || null,
      description: description?.trim() || null,
      image: image || null,
      asin,
      domain: d,
    });
  } catch (err) {
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
