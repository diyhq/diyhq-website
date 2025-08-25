// pages/post/[slug].js
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

/**
 * GROQ: prefer normalized category ref; fallback to legacy categories[0].
 * Pull all fields we display above-the-fold (hero, meta, excerpt, tools/materials).
 */
const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  seoTitle,
  seoDescription,
  estimatedTime,
  estimatedCost,
  readTime,
  difficultyLevel,
  authorAIName,
  commentsEnabled,
  updateLog,
  featured,
  "projectTags": projectTags[],
  videoURL,
  "affiliateLinks": affiliateLinks[],
  "faq": faq[],
  commonMistakes[],
  safetyTips[],
  "toolsNeeded": toolsNeeded[],
  "materialsNeeded": materialsNeeded[],
  "stepByStepInstructions": stepByStepInstructions[]{
    ...,
    title,
    text,
    image{asset->{url}, alt}
  },
  mainImage{
    alt,
    caption,
    asset->{ _id, url, metadata{ lqip, dimensions{width,height} } }
  },
  "category": coalesce(
    category->{ _id, title, "slug": slug.current },
    categories[0]->{ _id, title, "slug": slug.current }
  ),
  author->{ _id, name, image{asset->{url}} },
  body
}
`;

const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)][].slug.current`;

// ---------- Portable Text components ----------
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

// ---------- Helpers ----------
function StringBody({ text }) {
  const paragraphs = String(text)
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

function pill(text) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
      {text}
    </span>
  );
}

function kv(label, value) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide opacity-60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function toCurrency(val) {
  if (typeof val === "number") return `$${val.toLocaleString()}`;
  if (typeof val === "string") return val;
  return null;
}

function asString(item) {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    return item.name || item.text || item.title || JSON.stringify(item);
  }
  return String(item);
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

function blocksToPlainText(blocks) {
  try {
    return blocks
      .map((b) => (Array.isArray(b.children) ? b.children.map((c) => c.text || "").join(" ") : ""))
      .join("\n");
  } catch {
    return "";
  }
}

function estimateReadMinutes(post) {
  if (typeof post?.readTime === "number" && post.readTime > 0) return post.readTime;
  let text = "";
  if (Array.isArray(post?.body)) text = blocksToPlainText(post.body);
  else if (typeof post?.body === "string") text = post.body;
  const words = text ? text.trim().split(/\s+/).length : 0;
  const mins = Math.max(1, Math.round(words / 200));
  return mins;
}

// ---------- Page ----------
export default function PostPage({ post }) {
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
    title,
    excerpt,
    seoTitle,
    seoDescription,
    publishedAt,
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
    stepByStepInstructions,
    safetyTips,
    commonMistakes,
    videoURL,
    affiliateLinks,
    faq,
    authorAIName,
  } = post;

  const displayTitle = title || "Untitled Post";
  const metaTitle = seoTitle || displayTitle;
  const metaDesc =
    seoDescription ||
    (typeof excerpt === "string" && excerpt.length ? excerpt : "DIY HQ article.");
  const imageUrl = mainImage?.asset?.url || null;
  const imageAlt = mainImage?.alt || displayTitle;
  const caption = mainImage?.caption || mainImage?.alt || null;

  const isPortable = Array.isArray(body);
  const isString = typeof body === "string" && body.trim().length > 0;

  const dateText = publishedAt ? new Date(publishedAt).toLocaleDateString() : null;
  const readMins = estimateReadMinutes(post);

  return (
    <>
      <Head>
        <title>{metaTitle} | DIY HQ</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:title" content={metaTitle} />
        {metaDesc && <meta property="og:description" content={metaDesc} />}
        <meta property="og:type" content="article" />
        {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      </Head>

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Title only */}
        <header className="mb-4">
          <h1 className="text-3xl font-bold leading-tight">{displayTitle}</h1>
        </header>

        {/* Hero */}
        {imageUrl ? (
          <figure className="mb-3">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={630}
              className="w-full h-auto rounded-xl"
              priority
            />
            {caption && (
              <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
            )}
          </figure>
        ) : (
          <div className="mb-4 bg-gray-100 rounded-xl w-full aspect-[1200/630] flex items-center justify-center text-sm opacity-70">
            No image provided
          </div>
        )}

        {/* Meta row UNDER the hero (per your request) */}
        <div className="mt-2 mb-6 flex flex-wrap items-center gap-4 text-sm">
          {dateText && kv("Published", dateText)}
          {category?.title && category?.slug && (
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide opacity-60">Category</span>
              <Link className="underline" href={`/category/${category.slug}`}>
                {category.title}
              </Link>
            </div>
          )}
          {readMins ? kv("Read Time", `${readMins} min`) : null}
          {difficultyLevel ? kv("Skill Level", difficultyLevel) : null}
          {author?.name
            ? kv("Author", author.name)
            : authorAIName
            ? kv("Author", authorAIName)
            : null}
        </div>

        {/* Excerpt */}
        {typeof excerpt === "string" && excerpt.length > 0 && (
          <p className="text-lg leading-relaxed mb-6 opacity-90">{excerpt}</p>
        )}

        {/* Tools & Materials moved up near the top */}
        {(Array.isArray(toolsNeeded) && toolsNeeded.length > 0) ||
        (Array.isArray(materialsNeeded) && materialsNeeded.length > 0) ? (
          <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {Array.isArray(toolsNeeded) && toolsNeeded.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Tools Needed</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {toolsNeeded.map((t, i) => (
                    <li key={i}>{asString(t)}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(materialsNeeded) && materialsNeeded.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Materials Needed</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {materialsNeeded.map((m, i) => (
                    <li key={i}>{asString(m)}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        {/* Body */}
        {isPortable && (
          <div className="prose lg:prose-lg max-w-none">
            <PortableText value={body} components={ptComponents} />
          </div>
        )}
        {!isPortable && isString && <StringBody text={body} />}

        {!isPortable && !isString && (
          <p className="opacity-70">This article hasn’t been populated with content yet.</p>
        )}

        {/* Video Embed (optional) */}
        {maybeEmbed(videoURL)}

        {/* Step-by-step */}
        {Array.isArray(stepByStepInstructions) && stepByStepInstructions.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-6">
              {stepByStepInstructions.map((s, i) => {
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

        {/* Safety / Mistakes */}
        {(Array.isArray(safetyTips) && safetyTips.length > 0) ||
        (Array.isArray(commonMistakes) && commonMistakes.length > 0) ? (
          <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {Array.isArray(safetyTips) && safetyTips.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Safety Tips</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {safetyTips.map((s, i) => (
                    <li key={i}>{asString(s)}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Common Mistakes</h2>
                <ul className="list-disc pl-6 space-y-2">
                  {commonMistakes.map((c, i) => (
                    <li key={i}>{asString(c)}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        {/* FAQ — expanded, no clicking */}
        {Array.isArray(faq) && faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
            {/* If objects with {question, answer} → render Q/A blocks.
                If simple strings → render a clean list of questions. */}
            {faq.some((f) => typeof f === "object" && (f?.question || f?.answer)) ? (
              <div className="space-y-6">
                {faq.map((f, i) => {
                  const q =
                    typeof f === "object" ? f?.question || f?.q || `Question ${i + 1}` : String(f);
                  const a =
                    typeof f === "object" ? f?.answer || f?.a || "" : "";
                  return (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="font-medium">{q}</div>
                      {a ? <p className="mt-2">{a}</p> : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul className="list-disc pl-6 space-y-2">
                {faq.map((q, i) => (
                  <li key={i}>{asString(q)}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Affiliate Links */}
        {Array.isArray(affiliateLinks) && affiliateLinks.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Affiliate Links</h2>
            <ul className="list-disc pl-6 space-y-2">
              {affiliateLinks.map((link, i) => {
                const label = asString(link);
                const href =
                  typeof link === "string" && /^https?:\/\//i.test(link) ? link : undefined;
                return (
                  <li key={i}>
                    {href ? (
                      <a
                        className="underline"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {label}
                      </a>
                    ) : (
                      label
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-xs opacity-60 mt-2">
              Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra
              cost to you.
            </p>
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
    </>
  );
}

// ---------- Data fetching ----------
export async function getStaticProps({ params }) {
  try {
    const { client } = await import("../../lib/sanity.client");
    const post = await client.fetch(POST_QUERY, { slug: params.slug });
    if (!post) return { notFound: true, revalidate: 60 };
    return { props: { post }, revalidate: 60 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}

export async function getStaticPaths() {
  try {
    const { client } = await import("../../lib/sanity.client");
    const slugs = await client.fetch(SLUGS_QUERY);
    return {
      paths: (slugs || []).map((s) => ({ params: { slug: s } })),
      fallback: "blocking",
    };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}
