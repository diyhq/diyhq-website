// pages/api/affiliate-preview.js
// Fetch a lightweight preview (title/description/image) for affiliate links.
// Works with Amazon shorteners and guards all invalid URLs so SSR never crashes.

import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function safeURL(input) {
  try {
    if (!input) return null;
    const s = String(input).trim();
    if (!/^https?:\/\//i.test(s)) return null;
    return new URL(s);
  } catch {
    return null;
  }
}

function labelFor(input) {
  if (!input) return "View";
  try {
    const u = new URL(input);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return String(input).slice(0, 64);
  }
}

function pickMeta($, ...names) {
  for (const n of names) {
    const v =
      $(`meta[property="${n}"]`).attr("content") ||
      $(`meta[name="${n}"]`).attr("content");
    if (v) return v;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "s-maxage=86400, stale-while-revalidate=604800"
  );

  const raw = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  const parsed = safeURL(raw);

  // If not a full URL, return a harmless stub so the UI still renders.
  if (!parsed) {
    return res.status(200).json({
      ok: true,
      url: raw || "",
      title: labelFor(raw || "View"),
      description: null,
      image: null,
    });
  }

  try {
    const resp = await fetch(parsed.toString(), {
      redirect: "follow",
      headers: {
        "user-agent": UA,
        "accept-language": "en-US,en;q=0.8",
      },
    });
    const html = await resp.text();
    const $ = cheerio.load(html);

    const title =
      pickMeta($, "og:title", "twitter:title") ||
      $("title").text() ||
      labelFor(parsed.hostname);

    const description =
      pickMeta($, "og:description", "twitter:description") ||
      $('meta[name="description"]').attr("content") ||
      null;

    let image =
      pickMeta($, "og:image", "og:image:url", "twitter:image") || null;
    if (image && image.startsWith("//")) {
      image = `${parsed.protocol}${image}`;
    }

    return res.status(200).json({
      ok: true,
      url: parsed.toString(),
      title,
      description,
      image: image || null,
    });
  } catch {
    // On any fetch/parse error, return a safe stub.
    return res.status(200).json({
      ok: true,
      url: parsed.toString(),
      title: labelFor(parsed.hostname),
      description: null,
      image: null,
    });
  }
}
