// pages/post/[slug].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import SocialShareBar from "../../components/SocialShareBar.jsx";

// AdSense (unchanged)
import AdSenseHead from "../../components/AdSenseHead.jsx";
import AdSlot from "../../components/AdSlot.jsx";

import AffiliateGrid from "../../components/AffiliateGrid.jsx";

const LEFT_SLOT  = "XXXXXXXXXX";
const RIGHT_SLOT = "YYYYYYYYYY";
const INART_SLOT = "ZZZZZZZZZZ";

/* ----------------- Sanity queries ----------------- */
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

/* ---------------- PortableText components ---------------- */
const ptComponents = {
  block: {
    h1: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
    h2: ({ children }) => <h3 className="text-xl font-semibold mt-8 mb-3">{children}</h3>,
    h3: ({ children }) => <h4 className="text-lg font-semibold mt-6 mb-3">{children}</h4>,
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

/* ---------------- Helpers ---------------- */
function sanitizePlainText(text) {
  if (text == null) return text;
  let t = String(text);
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
}

function asString(item) {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    return item.name || item.text || item.title || JSON.stringify(item);
  }
  return String(item);
}

/**
 * Remove legacy editorial stubs and duplicates from the rich‑text body.
 * We remove these ALWAYS so the body never reprints Recommended Gear, See our pick, duplicate
 * Disclosures, Ready to upgrade, Budget & Time Signals, etc.
 */
function stripEditorialBoilerplate(blocks) {
  if (!Array.isArray(blocks)) return blocks;

  const badHeading = (txt) =>
    /recommended\s+gear/i.test(txt) ||
    /editor'?s?\s+picks/i.test(txt) ||
    /budget\s*&\s*time\s*signals/i.test(txt) ||
    /ready\s+to\s+upgrade/i.test(txt) ||
    /pro\s*tips/i.test(txt); // old stub sections

  const badPara = (txt) =>
    /^see\s+our\s+pick/i.test(txt) ||
    /view\s+on\s+amazon/i.test(txt) ||
    /^disclosure:.*amazon associate/i.test(txt);

  return blocks.filter((b) => {
    if (b?._type !== "block") return true;
    const style = String(b?.style || "normal").toLowerCase();
    const text = (Array.isArray(b.children) ? b.children.map((c) => c?.text || "").join(" ") : "")
      .trim();

    if (/^h[1-6]$/.test(style) && badHeading(text)) return false;
    if (badPara(text)) return false;
    return true;
  });
}

function blocksToPlainText(blocks) {
  try {
    return blocks
      .map((b) => (Array.isArray(b.children) ? b.children.map((c) => c.text || "").join(" ") : ""))
      .join("\n");
  } catch {
    return "";
  }
}

function toCurrency(val) {
  if (val == null) return null;
  if (typeof val === "number") return `$${val.toLocaleString()}`;
  if (typeof val === "string") return val;
  return String(val);
}

function estimateReadMinutes(post) {
  if (typeof post?.readTime === "number" && post.readTime > 0) return post.readTime;
  let text = "";
  if (Array.isArray(post?.body)) text = blocksToPlainText(post.body);
  else if (typeof post?.body === "string") text = post.body;
  const words = text ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

/* Tight, clean prev/next card */
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
      className="group grid grid-cols-[64px,1fr] gap-3 items-center rounded-lg border p-3 hover:bg-gray-50 transition"
    >
      {thumb ? (
        <Image src={thumb} alt="" width={64} height={64} className="h-16 w-16 rounded object-cover" />
      ) : (
        <div className="h-16 w-16 rounded bg-gray-100" />
      )}
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide opacity-60">{label}</div>
        <div className="mt-1 font-medium group-hover:underline line-clamp-2">{item.title}</div>
        {chips.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] opacity-70">
            {chips.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* Inline ad marker for PortableText (unchanged) */
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

/* ---------------- Page ---------------- */
export default function PostPage({ post, nav }) {
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
        <p className="opacity-80">The post you’re looking for doesn’t exist or isn’t available yet.</p>
        <div className="mt-6">
          <Link className="text-blue-600 underline" href="/">Go back home</Link>
        </div>
      </main>
    );
  }

  const {
    title, excerpt, seoTitle, seoDescription, publishedAt, _createdAt, category, mainImage, body,
    author, difficultyLevel, estimatedTime, estimatedCost, projectTags, toolsNeeded, materialsNeeded,
    safetyTips, stepByStepInstructions, commonMistakes, videoURL, affiliateLinks, faq, authorAIName,
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
    ? stepByStepInstructions.filter((s) => asString(s?.title) || asString(s?.text) || s?.image?.asset?.url)
    : [];
  const faqWithAnswers =
    Array.isArray(faq) && faq.filter((f) => typeof f === "object" && (f?.answer || f?.a));
  const showFaq = faqWithAnswers && faqWithAnswers.length > 0;

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

      {/* OUTER CONTAINER + GRID */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,900px)_250px] gap-8">

          {/* LEFT AD */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AdSlot slot={LEFT_SLOT} format="auto" style={{ display: "block", width: 250, minHeight: 250 }} />
            </div>
          </aside>

          {/* MAIN */}
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
                    className="w-full h-auto rounded-xl shadow"
                    priority
                  />
                  {caption && <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>}
                </figure>
              ) : (
                <div className="mb-4 bg-gray-100 rounded-xl w-full aspect-[1200/630] flex items-center justify-center text-sm opacity-70">
                  No image provided
                </div>
              )}

              {/* Meta row under hero */}
              <section className="mt-3 mb-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  <MetaKV label="Author" value={author?.name || authorAIName} />
                  <MetaKV label="Skill Level" value={difficultyLevel} />
                  <MetaKV label="Read Time" value={readMins ? `${readMins} min` : null} />
                  <MetaKV label="Estimated Cost" value={costText} />
                  <MetaKV
                    label="Category"
                    value={
                      category?.title && category?.slug ? (
                        <Link className="underline" href={`/category/${category.slug}`}>
                          {category.title}
                        </Link>
                      ) : null
                    }
                  />
                  <MetaKV label="Published" value={dateText} />
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

              {/* Affiliate grid (compact) */}
              <AffiliateGrid links={Array.isArray(affiliateLinks) ? affiliateLinks : []} />

              {/* Body with inline in-article ad after the 3rd block */}
              {Array.isArray(body) ? (
                <div className="prose lg:prose-lg max-w-none">
                  <PortableText value={insertInlineAd(body, 3)} components={ptComponentsWithAd} />
                </div>
              ) : typeof body === "string" && body.trim().length > 0 ? (
                <StringBody text={body} />
              ) : (
                <p className="opacity-70">This article hasn’t been populated with content yet.</p>
              )}

              {/* Video */}
              {maybeEmbed(videoURL)}

              {/* Step-by-step */}
              {steps.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold mb-4">Step-by-Step Instructions</h2>
                  <ol className="list-decimal pl-6 space-y-6">
                    {steps.map((s, i) => {
                      const stepText = asString(s?.text) || asString(s);
                      const stepTitle = s?.title ? String(s.title) : null;
                      const stepImage = s?.image?.asset?.url || null;
                      const stepAlt = s?.image?.alt || stepTitle || `Step ${i + 1}`;
                      return (
                        <li key={i}>
                          {stepTitle && <h3 className="text-lg font-semibold mb-1">{stepTitle}</h3>}
                          {stepText && <p className="mb-3">{stepText}</p>}
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

              {/* Common Mistakes */}
              {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold mb-3">Common Mistakes</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    {commonMistakes.map((c, i) => (<li key={i}>{asString(c)}</li>))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* RIGHT AD */}
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

/* Small helpers (local to file) */
function MetaKV({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col min-w-[8rem]">
      <span className="text-[10px] uppercase tracking-wide opacity-60">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function StringBody({ text }) {
  const cleaned = sanitizePlainText(text);
  const paragraphs = cleaned
    .split(/\r?\n\s*\r?\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <div className="prose lg:prose-lg max-w-none">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function maybeEmbed(videoURL) {
  if (!videoURL) return null;
  const isYouTube = /youtu\.be|youtube\.com/.test(videoURL);
  if (isYouTube) {
    let id = "";
    const m1 = videoURL.match(/v=([^&]+)/);
    const m2 = videoURL.match(/youtu\.be\/([^?]+)/);
    id = (m1 && m1[1]) || (m2 && m2[1]) || "";
    if (!id) return null;
    return (
      <div className="aspect-video w-full my-8">
        <iframe
          className="w-full h-full rounded-xl"
          src={`https://www.youtube.com/embed/${id}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="my-8">
      <video className="w-full rounded-xl" src={videoURL} controls />
    </div>
  );
}

/* ---------------- Data fetching ---------------- */
export async function getStaticProps({ params }) {
  try {
    const { client } = await import("../../lib/sanity.client");
    const raw = await client.fetch(POST_QUERY, { slug: params.slug });
    if (!raw) return { notFound: true, revalidate: 60 };

    const post = { ...raw };

    // ALWAYS strip editorial boilerplate + sanitize
    if (Array.isArray(post.body)) post.body = stripEditorialBoilerplate(post.body);
    if (typeof post.body === "string") post.body = sanitizePlainText(post.body);
    if (typeof post.excerpt === "string") post.excerpt = sanitizePlainText(post.excerpt);

    ["toolsNeeded","materialsNeeded","safetyTips","commonMistakes","projectTags"].forEach((k) => {
      if (Array.isArray(post[k])) post[k] = post[k].map((x) => sanitizePlainText(asString(x)));
    });

    if (Array.isArray(post.stepByStepInstructions)) {
      post.stepByStepInstructions = post.stepByStepInstructions.map((s) => ({
        ...s, title: sanitizePlainText(asString(s?.title)), text: sanitizePlainText(asString(s?.text)),
      }));
    }
    if (Array.isArray(post.faq)) {
      post.faq = post.faq.map((f) =>
        typeof f === "object"
          ? { ...f, question: sanitizePlainText(asString(f?.question || f?.q)),
                    answer: sanitizePlainText(asString(f?.answer || f?.a)) }
          : sanitizePlainText(asString(f))
      );
    }

    // Prev/Next
    let nav = { prev: null, next: null };
    const date = post.publishedAt || post._createdAt || null;
    const cat  = post?.category?.slug || null;
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
