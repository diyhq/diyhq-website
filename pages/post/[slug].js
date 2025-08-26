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

const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  _id,_createdAt,title,"slug": slug.current,publishedAt,excerpt,seoTitle,seoDescription,
  estimatedTime,estimatedCost,readTime,difficultyLevel,authorAIName,commentsEnabled,updateLog,
  featured,"projectTags": projectTags[],videoURL,"affiliateLinks": affiliateLinks[],"faq": faq[],
  commonMistakes[],safetyTips[],"toolsNeeded": toolsNeeded[],"materialsNeeded": materialsNeeded[],
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
function sanitizePortableText(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((b) => {
    if (b && typeof b === "object") {
      const out = { ...b };
      if (Array.isArray(out.children)) {
        out.children = out.children.map((c) =>
          c && typeof c === "object" ? { ...c, text: sanitizePlainText(c.text) } : c
        );
      }
      return out;
    }
    return b;
  });
}
function blockText(b) {
  if (!b) return "";
  if (Array.isArray(b.children)) return b.children.map((c) => c?.text || "").join(" ");
  return "";
}
function blocksToPlainText(blocks) {
  try {
    return (blocks || [])
      .map((b) => (Array.isArray(b.children) ? b.children.map((c) => c.text || "").join(" ") : ""))
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

/** Remove “Recommended Gear / Compare options / Ready to upgrade …”
 *  and also “Troubleshooting & Fix‑Ups / Common Issues …” from the rich body.
 */
function stripBoilerplate(blocks) {
  if (!Array.isArray(blocks)) return blocks;

  const killHead =
    /recommended\s+gear|editor'?s?\s+picks|compare\s+options|ready\s+to\s+upgrade|troubleshooting|fix[-\s]?ups|common\s+issues/i;
  const killLine = /Disclosure:\s*As an Amazon Associate|See our pick/i;

  let skipping = false;
  return blocks.filter((b) => {
    const isHeading =
      b?._type === "block" && typeof b?.style === "string" && /^h[1-6]$/i.test(b.style);
    const text = blockText(b);

    // strip matched headings and their following content until the next heading
    if (isHeading && killHead.test(text)) {
      skipping = true;
      return false;
    }

    if (isHeading && skipping) {
      // next heading ends the skip
      skipping = false;
    }

    if (skipping) return false; // drop all content inside the section
    if (killLine.test(text)) return false; // inline boilerplate lines

    return true;
  });
}

/** Hide embedded “Recommended Gear” only when there are no affiliate links on the post.
 *  (If we DO have links, we keep the body and rely on stripBoilerplate above.)
 */
function stripRecommended(blocks, affiliateLinks) {
  if (!Array.isArray(blocks)) return blocks;
  if (Array.isArray(affiliateLinks) && affiliateLinks.length > 0) return blocks;
  let skipping = false;
  return blocks.filter((b) => {
    const isHeading =
      b?._type === "block" && typeof b?.style === "string" && /^h[1-6]$/i.test(b.style);
    const text = blockText(b).toLowerCase();

    if (isHeading) {
      if (
        /recommended\s+gear/.test(text) ||
        /editor'?s?\s+picks/.test(text) ||
        /recommended\s+picks/.test(text)
      ) {
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

/* ---------- Heading promotion rules ---------- */
/** Any heading whose text matches one of these phrases gets bumped one size. */
const PROMOTE_RE = new RegExp(
  [
    // Group 1
    "before\\s+you\\s+start",
    "overview\\s+of\\s+prerequisites",
    "method\\s+overview",
    "deep\\s+step\\s+detail",
    "^pro\\s*tips?$",
    "when\\s+to\\s+call\\s+a\\s+pro",
    "budget\\s*&?\\s*time\\s+signals?",
    "^conclusion$",
    // Group 2
    "organizing\\s+your\\s+garage",
    "lighting\\s+improvements?",
    "building\\s+a\\s+workbench",
    "small\\s+wins\\s+to\\s+improve\\s+outcomes?",
    "recognizing\\s+your\\s+limits",
    "realistic\\s+ranges?\\s+and\\s+tradeoffs?",
    "confidence\\s+and\\s+next\\s+steps?",
  ].join("|"),
  "i"
);

/** Map baseline sizes by style; then bump one step for promoted headings. */
const SIZE_SCALE = ["text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];
const BASE_INDEX = { h3: 1, h2: 2, h1: 3 }; // our visual scale: h3→lg, h2→xl, h1→2xl

function headingClassFor(style, value) {
  const txt = blockText(value);
  const baseIdx = BASE_INDEX[String(style).toLowerCase()] ?? 2;
  const bump = PROMOTE_RE.test(txt) ? 1 : 0;
  const idx = Math.min(baseIdx + bump, SIZE_SCALE.length - 1);
  return `${SIZE_SCALE[idx]} font-semibold mt-8 mb-3`;
}

/* ---------------- PortableText components ---------------- */
const Heading = (styleTag) =>
  function HeadingRenderer({ children, value }) {
    const cls = headingClassFor(styleTag, value);
    // keep the semantic down‑shift (h1→h2, h2→h3, h3→h4) used in your theme
    const Tag = styleTag === "h1" ? "h2" : styleTag === "h2" ? "h3" : styleTag === "h3" ? "h4" : "h3";
    return <Tag className={cls}>{children}</Tag>;
  };

const ptComponents = {
  block: {
    h1: Heading("h1"),
    h2: Heading("h2"),
    h3: Heading("h3"),
    normal: ({ children }) => <p className="my-4 leading-7">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-4 italic my-4">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
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
      className="group grid grid-cols-[64px,1fr] gap-2 items-center rounded-lg border p-2 hover:bg-gray-50 transition min-h-[68px]"
    >
      {thumb ? (
        <Image src={thumb} alt="" width={64} height={64} className="h-16 w-16 rounded object-cover" />
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
        <p className="opacity-80">The post you’re looking for doesn’t exist or isn’t available yet.</p>
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
    seoDescription || (typeof excerpt === "string" && excerpt.length ? excerpt : "DIY HQ article.");
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

  const hasTopSafety = Array.isArray(safetyTips) && safetyTips.length > 0;
  const steps = Array.isArray(stepByStepInstructions)
    ? stepByStepInstructions.filter((s) => asString(s?.title) || s?.text || s?.image?.asset?.url)
    : [];
  const faqWithAnswers =
    Array.isArray(faq) && faq.filter((f) => typeof f === "object" && (f?.answer || f?.a));
  const showFaq = faqWithAnswers && faqWithAnswers.length > 0;

  // Body cleanup: strip embedded boilerplate (including Troubleshooting/Fix‑Ups) and
  // duplicate in‑body affiliate sections.
  let cleanBody = Array.isArray(body) ? stripRecommended(body, affiliateLinks) : body;
  cleanBody = Array.isArray(cleanBody) ? stripBoilerplate(cleanBody) : cleanBody;

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      </Head>

      <AdSenseHead />

      {/* OUTER CONTAINER + GRID: [250px ad | 900px article | 250px ad] */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,900px)_250px] gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AdSlot slot={LEFT_SLOT} format="auto" style={{ display: "block", width: 250, minHeight: 250 }} />
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
                  {caption && <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>}
                </figure>
              ) : (
                <div className="mb-4 bg-gray-100 rounded-xl w-full aspect-[1200/630] flex items-center justify-center text-sm opacity-70">
                  No image provided
                </div>
              )}

              {/* Meta row */}
              <section className="mt-3 mb-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  {kv("Author", author?.name || authorAIName)}
                  {kv("Skill Level", difficultyLevel)}
                  {kv("Read Time", readMins ? `${readMins} min` : null)}
                  {kv("Estimated Cost", costText)}
                  {kv(
                    "Category",
                    category?.title && category?.slug ? (
                      <Link className="underline" href={`/category/${category.slug}`}>
                        {category.title}
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

              {/* Excerpt */}
              {typeof excerpt === "string" && excerpt.length > 0 && (
                <p className="text-lg leading-relaxed mb-6 opacity-90">{excerpt}</p>
              )}

              {/* Tools / Materials / Safety */}
              {(Array.isArray(toolsNeeded) && toolsNeeded.length > 0) ||
              (Array.isArray(materialsNeeded) && materialsNeeded.length > 0) ||
              hasTopSafety ? (
                <section className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.isArray(toolsNeeded) && toolsNeeded.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Tools Needed</h2>
                      <ul className="list-disc pl-6 space-y-1 text-sm leading-6">
                        {toolsNeeded.map((t, i) => (
                          <li key={i}>{asString(t)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(materialsNeeded) && materialsNeeded.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Materials Needed</h2>
                      <ul className="list-disc pl-6 space-y-1 text-sm leading-6">
                        {materialsNeeded.map((m, i) => (
                          <li key={i}>{asString(m)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {hasTopSafety && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Safety Tips</h2>
                      <ul className="list-disc pl-6 space-y-1 text-sm leading-6">
                        {safetyTips.map((s, i) => (
                          <li key={i}>{asString(s)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ) : null}

              {/* Body with inline ad after the 3rd block */}
              {Array.isArray(cleanBody) ? (
                <div className="prose lg:prose-lg max-w-none">
                  <PortableText value={insertInlineAd(cleanBody, 3)} components={ptComponentsWithAd} />
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
                      const hasStringText = !isBlocks && typeof s?.text === "string" && s.text.trim().length > 0;

                      return (
                        <li key={i}>
                          {stepTitle && <h3 className="text-lg font-semibold mb-1">{stepTitle}</h3>}

                          {isBlocks ? (
                            <div className="prose max-w-none mb-3">
                              <PortableText value={s.text} components={ptComponents} />
                            </div>
                          ) : hasStringText ? (
                            <p className="mb-3">{s.text}</p>
                          ) : null}

                          {stepImage && (
                            <Image src={stepImage} alt={stepAlt} width={1200} height={675} className="rounded-lg mt-2" />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* ======= RECOMMENDED GEAR (bottom) ======= */}
              {Array.isArray(affiliateLinks) && affiliateLinks.length > 0 && <AffiliateGrid links={affiliateLinks} />}

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
                  <h2 className="text-xl font-semibold mb-4">More in {category?.title || "DIY HQ"}</h2>
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
                      <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
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
              <AdSlot slot={RIGHT_SLOT} format="auto" style={{ display: "block", width: 250, minHeight: 250 }} />
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
    if (Array.isArray(post.body)) post.body = sanitizePortableText(post.body);
    if (typeof post.body === "string") post.body = sanitizePlainText(post.body);
    if (typeof post.excerpt === "string") post.excerpt = sanitizePlainText(post.excerpt);
    ["toolsNeeded", "materialsNeeded", "safetyTips", "commonMistakes", "projectTags"].forEach((k) => {
      if (Array.isArray(post[k])) post[k] = post[k].map((x) => sanitizePlainText(asString(x)));
    });
    if (Array.isArray(post.stepByStepInstructions)) {
      post.stepByStepInstructions = post.stepByStepInstructions.map((s) => ({
        ...s,
        title: sanitizePlainText(asString(s?.title)),
        // keep s.text as‑is (string or PT array) for the renderer
        text: Array.isArray(s?.text) ? s.text : sanitizePlainText(asString(s?.text)),
      }));
    }
    if (Array.isArray(post.faq)) {
      post.faq = post.faq.map((f) =>
        typeof f === "object"
          ? {
              ...f,
              question: sanitizePlainText(asString(f?.question || f?.q)),
              answer: sanitizePlainText(asString(f?.answer || f?.a)),
            }
          : sanitizePlainText(asString(f))
      );
    }

    // Strip in‑body boilerplate affiliate sections (and Troubleshooting/Fix‑Ups)
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
