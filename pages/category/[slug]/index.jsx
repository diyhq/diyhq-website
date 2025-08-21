// pages/category/[slug]/index.jsx
import CategoryListingPage from "../../../components/CategoryListingPage";
import { sanityFetch, USE_CATEGORY_REFERENCE } from "../../../lib/sanityFetch";

const PAGE_SIZE = 15;

// GROQ filters depending on how "category" is stored in your post
const filterRef   = `_type=="post" && defined(slug.current) && category->slug.current == $slug && publishedAt < now() && !(_id in path('drafts.**'))`;
const filterPlain = `_type=="post" && defined(slug.current) && category == $slug && publishedAt < now() && !(_id in path('drafts.**'))`;
const FILTER = USE_CATEGORY_REFERENCE ? filterRef : filterPlain;

const fields = `{ 
  "slug": slug.current, 
  title, 
  "image": {"url": coalesce(mainImage.asset->url, mainImageUrl) }, 
  "excerpt": coalesce(excerpt, blurb), 
  "date": coalesce(publishedAt, _updatedAt) 
}`;

export default function CategoryIndex(props) {
  return <CategoryListingPage {...props} />;
}

export async function getStaticPaths() {
  // Build paths for each category
  const catsRef   = `*[_type=="category" && defined(slug.current)]{"slug": slug.current}`;
  const catsPlain = `array::unique(*[_type=="post" && defined(category)].category)[]`;

  const categories = USE_CATEGORY_REFERENCE
    ? await sanityFetch(catsRef)
    : (await sanityFetch(catsPlain))?.map((c) => ({ slug: c })) ?? [];

  const paths = (categories || []).map((c) => ({ params: { slug: c.slug || c } }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;

  // total posts in this category
  const totalQuery = `count(*[${FILTER}])`;
  const total = await sanityFetch(totalQuery, { slug });

  const page = 1;
  const from = 0;
  const to   = PAGE_SIZE;

  const listQuery = `* [${FILTER}] | order(publishedAt desc, _updatedAt desc) [${from}...${to}] ${fields}`;
  const posts = (await sanityFetch(listQuery, { slug })) || [];

  // category title
  const catTitleRef = `*[_type=="category" && slug.current==$slug][0]{title}`;
  const categoryTitle = USE_CATEGORY_REFERENCE
    ? (await sanityFetch(catTitleRef, { slug }))?.title || slug
    : slug;

  // featured posts (optional flag on post docs)
  const featuredQuery = `* [${FILTER} && featured==true] | order(publishedAt desc)[0...10] ${fields}`;
  const featured = (await sanityFetch(featuredQuery, { slug })) || [];

  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  return {
    props: {
      categoryTitle,
      slug,
      posts,
      featured,
      page,
      pageCount,
      pageSize: PAGE_SIZE,
    },
    revalidate: 60,
  };
}
