// pages/api/affiliate/preview.js
import * as cheerio from "cheerio";

/**
 * GET /api/affiliate/preview?url=<product url>
 * Returns { ok, url, title, description, image }
 * Notes:
 * - Uses a desktop UA so Amazon returns full OG tags.
 * - Falls back to twitter:image, #landingImage, and other common selectors.
 * - Caches for 24h via Next revalidate (can be tuned).
 */
export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "Missing url" });
    }

    // Be polite but look like a browser
    const UA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

    const r = await fetch(url, {
      headers: {
        "user-agent": UA,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      // cache on the edge for a day
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!r.ok) {
      return res
        .status(r.status)
        .json({ ok: false, error: `Upstream ${r.statusText}` });
    }

    const html = await r.text();
    const $ = cheerio.load(html);

    const pick = (name) =>
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content");

    let title =
      pick("og:title") ||
      $("title").first().text().trim() ||
      pick("twitter:title") ||
      null;

    let description =
      pick("og:description") ||
      pick("description") ||
      pick("twitter:description") ||
      null;

    let image =
      pick("og:image:secure_url") ||
      pick("og:image") ||
      pick("twitter:image") ||
      // Amazon fallbacks
      $("#landingImage").attr("src") ||
      $("#imgBlkFront").attr("data-old-hires") ||
      $("#imgBlkFront").attr("src") ||
      null;

    if (image && image.startsWith("//")) image = "https:" + image;

    // Canonical URL when available
    const canonical = $('link[rel="canonical"]').attr("href") || url;

    return res.status(200).json({
      ok: true,
      url: canonical,
      title: title || null,
      description: description || null,
      image: image || null,
    });
  } catch (err) {
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
