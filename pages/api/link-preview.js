// pages/api/link-preview.js
export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url" });
    }

    // Follow redirects (amzn.to etc.)
    const resp = await fetch(url, {
      redirect: "follow",
      headers: {
        // Simple UA so some sites (including Amazon) return full HTML
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    // Limit size so we don't download huge pages
    const text = (await resp.text()).slice(0, 1_500_000);

    const title =
      findMeta(text, 'property', 'og:title') ||
      findMeta(text, 'name', 'twitter:title') ||
      findTitle(text) || "";

    const description =
      findMeta(text, 'property', 'og:description') ||
      findMeta(text, 'name', 'description') ||
      findMeta(text, 'name', 'twitter:description') ||
      "";

    const image =
      absolutizeUrl(
        findMeta(text, 'property', 'og:image') ||
        findMeta(text, 'name', 'twitter:image') ||
        "",
        resp.url
      ) || "";

    return res.status(200).json({ title, description, image });
  } catch (e) {
    return res.status(200).json({ title: "", description: "", image: "" });
  }
}

function findMeta(html, attr, value) {
  const re = new RegExp(
    `<meta[^>]+${attr}\\s*=\\s*["']${escapeReg(value)}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`,
    "i"
  );
  const m = html.match(re);
  return m ? decodeHTMLEntities(m[1]) : "";
}

function findTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? decodeHTMLEntities(m[1]) : "";
}

function absolutizeUrl(img, base) {
  if (!img) return "";
  try {
    return new URL(img, base).toString();
  } catch { return img; }
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
