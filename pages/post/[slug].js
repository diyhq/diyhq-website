// pages/post/[slug].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import SocialShareBar from "../../components/SocialShareBar.jsx";

import AdSenseHead from "../../components/AdSenseHead.jsx";
import AdSlot from "../../components/AdSlot.jsx";
import AffiliateGrid from "../../components/AffiliateGrid.jsx";

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const LEFT_SLOT = "XXXXXXXXXX";
const RIGHT_SLOT = "YYYYYYYYYY";
const INART_SLOT = "ZZZZZZZZZZ";
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Known section headings that sometimes arrive as "normal" paragraphs.
// We'll upgrade them to headings so they look correct on the page.
const MAJOR_HEADING_HINTS = [
  "before you start",
  "overview of prerequisites",
  "method overview",
  "deep step detail",
  "troubleshooting & fix-ups",
  "pro tips",
  "when to call a pro",
  "budget & time signals",
  "conclusion",
  "confidence and next steps",
];

const MINOR_HEADING_HINTS = [
  "organizing your garage",
  "lighting improvements",
  "building a workbench",
  "small wins to improve outcomes",
  "recognizing your limits",
  "realistic ranges and tradeoffs",
];

// *** Shape-resilient GROQ: prefer meta.*, fallback to root ***
const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  _id,_createdAt,title,"slug": slug.current,publishedAt,excerpt,
  "seoTitle":        coalesce(meta.seoTitle, seoTitle),
  "seoDescription":  coalesce(meta.seoDescription, seoDescription),

  "estimatedTime":   coalesce(meta.estimatedTime, estimatedTime),
  "estimatedCost":   coalesce(meta.estimatedCost, estimatedCost),
  "readTime":        coalesce(meta.readTime, readTime),
  "difficultyLevel": coalesce(meta.difficultyLevel, difficultyLevel),
  authorAIName,commentsEnabled,updateLog,featured,
  "projectTags": projectTags[],
  videoURL,
  "affiliateLinks": coalesce(meta.affiliateLinks, affiliateLinks[]),
  "faq":            coalesce(meta.faq, faq[]),

  // Quick-info lists — always present if either meta.* or root has values
  "commonMistakes":  coalesce(meta.commonMistakes,  commonMistakes[]),
  "safetyTips":      coalesce(meta.safetyTips,      safetyTips[]),
  "toolsNeeded":     coalesce(meta.toolsNeeded,     toolsNeeded[]),
  "materialsNeeded": coalesce(meta.materialsNeeded, materialsNeeded[]),

  "stepByStepInstructions": stepByStepInstructions[]{...,title,text,image{asset->{url}, alt}},
  mainImage{alt,caption,asset->{ _id, url, metadata{ lqip, dimensions{width,height} } }},
  "category": coalesce(category->{ _id, title, "slug": slug.current },
                       categories[0]->{ _id, title, "slug": slug.current }),
  author->{ _id, name, image{asset->{url}} },
  body
}
`;

const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)][].slug.current`;

const NAV_QUERY = `
{
  "prev": *[
    _type == "post" && defined(slug.current) &&
    coalesce(category->slug.current, categories[0]->slug.current) == $category &&
    coalesce(publishedAt, _createdAt) < $date
  ] | order(coalesce(publishedAt, _createdAt) desc)[0]{
    title,"slug": slug.current,difficultyLevel,estimatedCost,readTime,mainImage{asset->{url}}
  },
  "next": *[
    _type == "post" && defined(slug.current) &&
    coalesce(category->slug.current, categories[0]->slug.current) == $category &&
    coalesce(publishedAt, _createdAt) > $date
  ] | order(coalesce(publishedAt, _createdAt) asc)[0]{
    title,"slug": slug.current,difficultyLevel,estimatedCost,readTime,mainImage{asset->{url}}
  }
}
`;

/* ---------------- PortableText components ---------------- */
const ptComponents = {
  block: {
    // Make each heading one size larger than before and cover h1–h6.
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-5 mb-2">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-base font-semibold mt-4 mb-2">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-semibold uppercase tracking-wide mt-3 mb-2">
        {children}
      </h6>
    ),
    normal: ({ children }) => <p className="my-4 leading-7">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-4 italic my-4">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="underline"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

/* ---------------- Helpers ---------------- */
function sanitizePlainText(text) {
  if (text == null) return text;
  let t = String(text);
  t = t.replace(/function\s+anchor\s*\(\)\s*\{?\s*\[native code\]\s*\}?/gi, "");
  t = t.replace(/\bfunction\s+anchor\b/gi, "");
  t = t.replace(/\[ ?native code ?\]/gi, "");
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
}

function blockText(b) {
  if (!b) return "";
  if (Array.isArray(b.children)) return b.children.map((c) => c?.text || "").join(" ");
  return "";
}

// Upgrades "normal" blocks whose text matches known section titles
// into proper heading styles so they look like headings on the page.
function upgradeHeadings(block) {
  if (!block || block._type !== "block") return block;
  const text = blockText(block).trim();
  if (!text) return block;

  const key = text.replace(/:$/, "").toLowerCase();
  if (MAJOR_HEADING_HINTS.includes(key)) {
    return { ...block, style: "h2" };
  }
  if (MINOR_HEADING_HINTS.includes(key)) {
    return { ...block, style: "h3" };
  }
  return block;
}

function sanitizePortableText(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((b) => {
    if (b && typeof b === "object") {
      let out = { ...b };
      if (Array.isArray(out.children)) {
        out.children = out.children.map((c) =>
          c && typeof c === "object" ? { ...c, text: sanitizePlainText(c.text) } : c
        );
      }
      // If Sanity delivered a "normal" block that is actually a section
      // title we've standardized, upgrade it to a heading.
      if (!out.style || out.style === "normal") {
        out = upgradeHeadings(out);
      }
      return out;
    }
    return b;
  });
}

function blocksToPlainText(blocks) {
  try {
    return (blocks || [])
      .map((b) =>
        Array.isArray(b.children) ? b.children.map((c) => c.text || "").join(" ") : ""
      )
      .join("\n")
      .trim();
  } catch {
    return "";
  }
}

function kv(label, value) {
  if (!value) return null;
  return (
    <div className="flex flex-col min-w-[8rem]">
      <span className="text-[10px] uppercase tracking-wide opacity-60">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function toCurrency(val) {
  if (val == null) return null;
  if (typeof val === "number") return `$${val.toLocaleString()}`;
  if (typeof val === "string") return val;
  return String(val);
}
function asString(item) {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    return item.name || item.text || item.title || JSON.stringify(item);
  }
  return String(item);
}

/** Remove “Recommended Gear / Compare options / Ready to upgrade …” from the rich body. */
function stripBoilerplate(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  const killHead =
    /recommended\s+gear|editor'?s?\s+picks|compare\s+options|ready\s+to\s+upgrade/i;
  const killLine = /Disclosure:\s*As an Amazon Associate|See our pick/i;

  let skipping = false;
  return blocks.filter((b) => {
    const isHeading =
      b?._type === "block" && typeof b?.style === "string" && /^h[1-6]$/i.test(b.style);
    const text = blockText(b);

    if (isHeading && killHead.test(text)) {
      skipping = true;
      return false;
    }
    if (isHeading && skipping) {
      skipping = false;
    }
    if (skipping) return false;
    if (killLine.test(text)) return false;

    return true;
  });
}

function stripRecommended(blocks, affiliateLinks) {
  if (!Array.isArray(blocks)) return blocks;
  if (Array.isArray(affiliateLinks) && affiliateLinks.length > 0) return blocks;
  let skipping = false;
  return blocks.filter((b) => {
    const isHeading =
      b?._type === "block" && typeof b?.style === "string" && /^h[1-6]$/i.test(b.style);
    const text = blockText(b).toLowerCase();

    if (isHeading) {
      if (/recommended\s+gear/.test(text) || /editor'?s?\s+picks/.test(text) || /recommended\s+picks/.test(text)) {
        skipping = true;
        return false;
      }
      if (skipping) skipping = false;
      return true;
    }
    if (skipping) return false;
    if (/^see our pick/i.test(text)) return false;
    if (/view on amazon/i.test(text)) return false;
    if (/affiliate code/i.test(text)) return false;
    if (/^disclosure:.*amazon associate/i.test(text)) return false;
    return true;
  });
}

/* ---------- Inline in-article ad marker ---------- */
function insertInlineAd(blocks, index = 3) {
  if (!Array.isArray(blocks)) return blocks;
  const out = [...blocks];
  const i = Math.min(Math.max(index, 1), out.length);
  out.splice(i, 0, { _type: "adMarker", _key: `ad-${i}` });
  return out;
}

const ptComponentsWithAd = {
  ...ptComponents,
  types: {
    adMarker: () => (
      <div className="my-8">
        <AdSlot
          slot={INART_SLOT}
          layout="in-article"
          format="fluid"
          style={{ display: "block", textAlign: "center" }}
        />
      </div>
    ),
  },
};

/* ---------- COMPACT Quick Info List Card (smaller, no bullets) ---------- */
function ListCard({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="rounded-lg border p-3 bg-white">
      <div className="text-[11px] uppercase tracking-wide opacity-60 mb-1">{title}</div>
      <ul className="list-none pl-0 space-y-1">
        {items.map((t, i) => (
          <li key={i} className="text-[13px] leading-5">{asString(t)}</li>
        ))}
      </ul>
    </div>
  );
}

function estimateReadMinutes(post) {
  if (typeof post?.readTime === "number" && post.readTime > 0) return post.readTime;
  let text = "";
  if (Array.isArray(post?.body)) text = blocksToPlainText(post.body);
  else if (typeof post?.body === "string") text = post.body;
  const words = text ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

/* ---------- COMPACT Prev/Next card ---------- */
function NavCard({ label, item }) {
  if (!item) return null;
  const thumb = item?.mainImage?.asset?.url || null;
  const chips = [];
  if (item.difficultyLevel) chips.push(item.difficultyLevel);
  if (item.readTime) chips.push(`${item.readTime} min`);
  const cost = toCurrency(item.estimatedCost);
  if (cost) chips.push(cost);

  return (
    <Link
      href={`/post/${item.slug}`}
      className="group grid grid-cols-[64px,1fr] gap-2 items-center rounded-lg border p-2 hover:bg-gray-50 transition min-h-[68px]">
      {thumb ? (
        <Image
          src={thumb}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded bg-gray-100" />
      )}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wide opacity-60">{label}</div>
        <div className="mt-0.5 text-sm font-medium group-hover:underline line-clamp-2">
          {item.title}
        </div>
        {chips.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] opacity-70">
            {chips.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ---------------- Page ---------------- */
export default function PostPage({ post, nav }) {
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
        <p className="opacity-80">
          The post you’re looking for doesn’t exist or isn’t available yet.
        </p>
        <div className="mt-6">
          <Link className="text-blue-600 underline" href="/">
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  const {
    title,
    excerpt,
    seoTitle,
    seoDescription,
    publishedAt,
    _createdAt,
    category,
    mainImage,
    body,
    author,
    difficultyLevel,
    estimatedTime,
    estimatedCost,
    projectTags,
    toolsNeeded,
    materialsNeeded,
    safetyTips,
    stepByStepInstructions,
    commonMistakes,
    videoURL,
    affiliateLinks,
    faq,
    authorAIName,
  } = post;

  const slug = post.slug;
  const displayTitle = title || "Untitled Post";
  const metaTitle = seoTitle || displayTitle;
  const metaDesc =
    seoDescription ||
    (typeof excerpt === "string" && excerpt.length ? excerpt : "DIY HQ article.");
  const imageUrl = mainImage?.asset?.url || null;
  const imageAlt = mainImage?.alt || displayTitle;
  const caption = mainImage?.caption || mainImage?.alt || null;

  const dateText = publishedAt ? new Date(publishedAt).toLocaleDateString() : null;
  const readMins = estimateReadMinutes(post);
  const costText = toCurrency(estimatedCost);

  const canonicalUrl = `https://www.doityourselfhq.com/post/${slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: displayTitle,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: publishedAt || _createdAt || undefined,
    articleSection: category?.title || undefined,
    author: [{ "@type": "Person", name: author?.name || authorAIName || "DIY HQ Team" }],
    keywords: Array.isArray(projectTags) ? projectTags.map(asString).join(", ") : undefined,
    description: metaDesc,
  };

  const steps = Array.isArray(stepByStepInstructions)
    ? stepByStepInstructions.filter(
        (s) => asString(s?.title) || s?.text || s?.image?.asset?.url
      )
    : [];
  const faqWithAnswers =
    Array.isArray(faq) && faq.filter((f) => typeof f === "object" && (f?.answer || f?.a));
  const showFaq = faqWithAnswers && faqWithAnswers.length > 0;

  // Clean body: remove in‑text affiliate boilerplate & then auto‑upgrade any “normal” blocks
  // that are really headings (so they render as headings).
  let cleanBody = Array.isArray(body) ? stripRecommended(body, affiliateLinks) : body;
  cleanBody = Array.isArray(cleanBody) ? stripBoilerplate(cleanBody) : cleanBody;

  // ---- Quick Info lists (top; compact, no bullets) ----
  const toolsArr      = Array.isArray(toolsNeeded)     ? toolsNeeded.slice(0, 8)     : [];
  const materialsArr  = Array.isArray(materialsNeeded) ? materialsNeeded.slice(0, 8) : [];
  const safetyBase    = (Array.isArray(safetyTips) && safetyTips.length > 0)
    ? safetyTips
    : (Array.isArray(commonMistakes) ? commonMistakes : []);
  const safetyArr     = safetyBase.slice(0, 8);
  const safetyTitle   = (Array.isArray(safetyTips) && safetyTips.length > 0) ? "Safety Tips" : "Common Mistakes";
  const showQuickInfo = toolsArr.length > 0 || materialsArr.length > 0 || safetyArr.length > 0;

  // Caption under hero: prefer SEO description
  const imageCaption = seoDescription || caption || null;

  return (
    <>
      <Head>
        <title>{metaTitle} | DIY HQ</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:title" content={metaTitle} />
        {metaDesc && <meta property="og:description" content={metaDesc} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
        {(publishedAt || _createdAt) && (
          <meta property="article:published_time" content={publishedAt || _createdAt} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      </Head>

      <AdSenseHead />

      {/* OUTER CONTAINER + GRID: [250px ad | 900px article | 250px ad] */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,900px)_250px] gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AdSlot
                slot={LEFT_SLOT}
                format="auto"
                style={{ display: "block", width: 250, minHeight: 250 }}
              />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main>
            <article className="mx-auto py-10">
              {/* Title */}
              <header className="mb-4">
                <h1 className="text-3xl font-bold leading-tight">{displayTitle}</h1>
              </header>

              {/* Hero */}
              {imageUrl ? (
                <figure className="mb-2">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    width={1200}
                    height={630}
                    className="w-full h-auto rounded-xl"
                    priority
                  />
                  {imageCaption && (
                    <figcaption className="mt-2 text-sm opacity-80">{imageCaption}</figcaption>
                  )}
                </figure>
              ) : (
                <div className="mb-4 bg-gray-100 rounded-xl w-full aspect-[1200/630] flex items-center justify-center text-sm opacity-70">
                  No image provided
                </div>
              )}

              {/* Meta row */}
              <section className="mt-3 mb-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  {kv("Author", post?.author?.name || post?.authorAIName)}
                  {kv("Skill Level", post?.difficultyLevel)}
                  {kv("Read Time", readMins ? `${readMins} min` : null)}
                  {kv("Estimated Cost", costText)}
                  {kv(
                    "Category",
                    post?.category?.title && post?.category?.slug ? (
                      <Link className="underline" href={`/category/${post.category.slug}`}>
                        {post.category.title}
                      </Link>
                    ) : null
                  )}
                  {kv("Published", dateText)}
                </div>
              </section>

              {/* Share bar */}
              <div className="mb-6">
                <SocialShareBar url={canonicalUrl} title={displayTitle} media={imageUrl || ""} />
              </div>

              {/* Quick Info: Tools / Materials / Safety (or Mistakes) */}
              {showQuickInfo ? (
                <section className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ListCard title="Tools Needed" items={toolsArr} />
                    <ListCard title="Materials Needed" items={materialsArr} />
                    <ListCard title={safetyTitle} items={safetyArr} />
                  </div>
                </section>
              ) : null}

              {/* Excerpt (optional; separate from image caption) */}
              {typeof excerpt === "string" && excerpt.length > 0 && (
                <p className="text-lg leading-relaxed mb-6 opacity-90">{excerpt}</p>
              )}

              {/* Body with inline ad after the 3rd block */}
              {Array.isArray(cleanBody) ? (
                <div className="prose lg:prose-lg max-w-none">
                  <PortableText
                    value={insertInlineAd(sanitizePortableText(cleanBody), 3)}
                    components={ptComponents}
                  />
                </div>
              ) : typeof cleanBody === "string" && cleanBody.trim().length > 0 ? (
                <div className="prose lg:prose-lg max-w-none">
                  <p>{cleanBody}</p>
                </div>
              ) : (
                <p className="opacity-70">This article hasn’t been populated with content yet.</p>
              )}

              {/* Video */}
              {videoURL ? (
                <div className="my-8">
                  {/youtu\.be|youtube\.com/.test(videoURL) ? (
                    <div className="aspect-video w-full my-8">
                      <iframe
                        className="w-full h-full rounded-xl"
                        src={
                          (videoURL.match(/v=([^&]+)/) || [])[1]
                            ? `https://www.youtube.com/embed/${videoURL.match(/v=([^&]+)/)[1]}`
                            : videoURL.replace("watch?v=", "embed/")
                        }
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video className="w-full rounded-xl" src={videoURL} controls />
                  )}
                </div>
              ) : null}

              {/* Step-by-step (PortableText aware) */}
              {steps.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold mb-4">Step‑by‑Step Instructions</h2>
                  <ol className="list-decimal pl-6 space-y-6">
                    {steps.map((s, i) => {
                      const stepTitle = s?.title ? String(s.title) : null;
                      const stepImage = s?.image?.asset?.url || null;
                      const stepAlt = s?.image?.alt || stepTitle || `Step ${i + 1}`;
                      const isBlocks = Array.isArray(s?.text);
                      const hasStringText =
                        !isBlocks && typeof s?.text === "string" && s.text.trim().length > 0;

                      return (
                        <li key={i}>
                          {stepTitle && (
                            <h3 className="text-lg font-semibold mb-1">{stepTitle}</h3>
                          )}

                          {isBlocks ? (
                            <div className="prose max-w-none mb-3">
                              <PortableText value={s.text} components={ptComponents} />
                            </div>
                          ) : hasStringText ? (
                            <p className="mb-3">{s.text}</p>
                          ) : null}

                          {stepImage && (
                            <Image
                              src={stepImage}
                              alt={stepAlt}
                              width={1200}
                              height={675}
                              className="rounded-lg mt-2"
                            />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* ======= RECOMMENDED GEAR (bottom) ======= */}
              {Array.isArray(affiliateLinks) && affiliateLinks.length > 0 && (
                <AffiliateGrid links={affiliateLinks} />
              )}

              {/* Common Mistakes */}
              {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold mb-3">Common Mistakes</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    {commonMistakes.map((c, i) => (
                      <li key={i}>{asString(c)}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* FAQ */}
              {showFaq && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
                  <div className="space-y-6">
                    {faqWithAnswers.map((f, i) => {
                      const q = f?.question || f?.q || `Question ${i + 1}`;
                      const a = f?.answer || f?.a || "";
                      return (
                        <div key={i} className="rounded-lg border p-4">
                          <div className="font-medium">{q}</div>
                          {a ? <p className="mt-2">{a}</p> : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Prev / Next */}
              {(nav?.prev || nav?.next) && (
                <section className="mt-12 border-t pt-8">
                  <h2 className="text-xl font-semibold mb-4">
                    More in {category?.title || "DIY HQ"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NavCard label="Previous" item={nav.prev} />
                    <NavCard label="Next" item={nav.next} />
                  </div>
                </section>
              )}

              {/* Tags */}
              {Array.isArray(projectTags) && projectTags.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {projectTags.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                      >
                        {asString(t)}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Footer nav */}
              <footer className="mt-12 flex items-center justify-between">
                {category?.slug ? (
                  <Link className="text-blue-600 underline" href={`/category/${category.slug}`}>
                    ← Back to {category.title}
                  </Link>
                ) : (
                  <Link className="text-blue-600 underline" href="/">
                    ← Back to Home
                  </Link>
                )}
                <div id="share-toolbar" className="opacity-60 text-sm" />
              </footer>
            </article>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AdSlot
                slot={RIGHT_SLOT}
                format="auto"
                style={{ display: "block", width: 250, minHeight: 250 }}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ---------------- Data fetching ---------------- */
export async function getStaticProps({ params }) {
  try {
    const { client } = await import("../../lib/sanity.client");
    const raw = await client.fetch(POST_QUERY, { slug: params.slug });
    if (!raw) return { notFound: true, revalidate: 60 };

    const post = { ...raw };

    // Sanitize & gently normalize blocks, and auto‑upgrade known headings
    if (Array.isArray(post.body)) post.body = sanitizePortableText(post.body);
    if (typeof post.body === "string") post.body = sanitizePlainText(post.body);
    if (typeof post.excerpt === "string") post.excerpt = sanitizePlainText(post.excerpt);

    ["toolsNeeded", "materialsNeeded", "safetyTips", "commonMistakes", "projectTags"].forEach(
      (k) => {
        if (Array.isArray(post[k])) post[k] = post[k].map((x) => sanitizePlainText(asString(x)));
      }
    );

    if (Array.isArray(post.stepByStepInstructions)) {
      post.stepByStepInstructions = post.stepByStepInstructions.map((s) => ({
        ...s,
        title: sanitizePlainText(asString(s?.title)),
        // keep s.text as‑is (string or PT array) for the renderer
        text: Array.isArray(s?.text) ? s.text : sanitizePlainText(asString(s?.text)),
      }));
    }

    // Strip in‑body affiliate boilerplate after upgrading headings
    if (Array.isArray(post.body)) {
      const a = post.affiliateLinks || [];
      post.body = stripBoilerplate(stripRecommended(post.body, a));
    }

    let nav = { prev: null, next: null };
    const date = post.publishedAt || post._createdAt || null;
    const cat = post?.category?.slug || null;
    if (date && cat) nav = await client.fetch(NAV_QUERY, { date, category: cat });

    return { props: { post, nav }, revalidate: 60 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

export async function getStaticPaths() {
  try {
    const { client } = await import("../../lib/sanity.client");
    const slugs = await client.fetch(SLUGS_QUERY);
    return { paths: (slugs || []).map((s) => ({ params: { slug: s } })), fallback: "blocking" };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}
