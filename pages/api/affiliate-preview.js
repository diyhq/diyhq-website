// pages/api/affiliate-preview.js
import type { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

function abs(href, base) {
  try { return new URL(href, base).href; } catch { return null; }
}

function meta($, name) {
  return (
    $(`meta[property="${name}"]`).attr("content") ||
    $(`meta[name="${name}"]`).attr("content") ||
    ""
  ).trim();
}

async function fetchHtml(url) {
  // Try a normal fetch first (server-side; redirects are followed).
  const r = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": UA,
      "accept-language": "en-US,en;q=0.9",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
  });
  const finalUrl = r.url || url;
  const html = await r.text();
  return { html, finalUrl };
}

function parseAmazon($, baseUrl) {
  // 1) Standard OG first
  let img = meta($, "og:image");
  if (!img) {
    // 2) <img id="landingImage" data-old-hires="..." />
    const old = $("#landingImage").attr("data-old-hires");
    if (old) img = old;
  }
  if (!img) {
    // 3) <img id="landingImage" data-a-dynamic-image='{"https://m.media-amazon.com/...": [500,500], ...}'
    const dyn = $("#landingImage").attr("data-a-dynamic-image");
    if (dyn) {
      try {
        const map = JSON.parse(dyn);
        const first = Object.keys(map)[0];
        if (first) img = first;
      } catch {}
    }
  }
  if (!img) {
    // 4) Any other image_src hint
    img = $('link[rel="image_src"]').attr("href") || "";
  }

  const title =
    meta($, "og:title") || $("title").text().trim() || "View on Amazon";
  const desc =
    meta($, "og:description") || meta($, "description") || "";

  return {
    title,
    description: desc,
    image: img ? abs(img, baseUrl) : null,
  };
}

export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "s-maxage=86400, stale-while-revalidate=86400"
  );

  const url = String(req.query.url || "").trim();
  try {
    const u = new URL(url); // validates
    const { html, finalUrl } = await fetchHtml(u.href);

    const $ = cheerio.load(html);
    let out = {
      url: finalUrl,
      title: meta($, "og:title") || $("title").text().trim(),
      description: meta($, "og:description") || meta($, "description"),
      image: meta($, "og:image") || $('link[rel="image_src"]').attr("href"),
    };

    const host = new URL(finalUrl).hostname;
    if (!out.image && /amazon\./i.test(host)) {
      const amz = parseAmazon($, finalUrl);
      out = { ...out, ...amz };
    }
    if (out.image) out.image = abs(out.image, finalUrl);

    res.status(200).json(out);
  } catch (e) {
    // Bad input URL or fetch failure — return minimal payload
    res.status(200).json({
      url,
      title: "View →",
      description: "",
      image: null,
    });
  }
}
