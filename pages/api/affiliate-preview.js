import * as cheerio from "cheerio";

// best-effort absolutizer for og:image etc.
function absUrl(u, base) {
  if (!u) return null;
  if (u.startsWith("//")) return "https:" + u;
  try {
    return new URL(u, base).toString();
  } catch {
    return null;
  }
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36";

export default async function handler(req, res) {
  const input = String(req.query.url || "").trim();
  if (!input) {
    res.status(400).json({ ok: false, error: "Missing url" });
    return;
  }

  try {
    // follow amzn.to => amazon.com redirects; ask for EN HTML
    const r = await fetch(input, {
      redirect: "follow",
      headers: {
        "user-agent": UA,
        "accept-language": "en-US,en;q=0.9",
      },
    });

    const finalUrl = r.url;
    const html = await r.text();
    const $ = cheerio.load(html);

    const pick = (sel, attr = "content") => ($(sel).attr(attr) || "").trim();

    let title =
      pick('meta[property="og:title"]') ||
      pick('meta[name="title"]') ||
      $("title").text().trim();

    let description =
      pick('meta[property="og:description"]') ||
      pick('meta[name="description"]');

    let image =
      pick('meta[property="og:image"]') ||
      pick('meta[name="twitter:image"]') ||
      pick('meta[name="twitter:image:src"]');

    image = absUrl(image, finalUrl);

    // cache on the edge for a day; stale revalidate another day
    res.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=86400"
    );

    res.status(200).json({
      ok: true,
      url: finalUrl,
      title: title || null,
      description: description || null,
      image: image || null,
    });
  } catch (e) {
    // graceful fallback – card still renders with "View"
    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=3600"
    );
    res.status(200).json({ ok: false, url: input, title: null, description: null, image: null });
  }
}
