// pages/category/[slug]/page/[page].jsx
import CategoryListingPage from "../../../../components/CategoryListingPage";
import { sanityFetch, USE_CATEGORY_REFERENCE } from "../../../../lib/sanityFetch";

const PAGE_SIZE = 15;

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

export default function CategoryPageN(props) {
  return <CategoryListingPage {...props} />;
}

export async function getStaticPaths() {
  // Build page N on first request (ISR)
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const page = Math.max(1, parseInt(params.page, 10) || 1);

  const totalQuery = `count(*[${FILTER}])`;
  const total = await sanityFetch(totalQuery, { slug });

  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
  if (page > pageCount) {
    return {
      redirect: { destination: `/category/${slug}/page/${pageCount}`, permanent: false },
    };
  }

  const from = (page - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE;

  const listQuery = `* [${FILTER}] | order(publishedAt desc, _updatedAt desc) [${from}...${to}] ${fields}`;
  const posts = (await sanityFetch(listQuery, { slug })) || [];

  const catTitleRef = `*[_type=="category" && slug.current==$slug][0]{title}`;
  const categoryTitle = USE_CATEGORY_REFERENCE
    ? (await sanityFetch(catTitleRef, { slug }))?.title || slug
    : slug;

  const featuredQuery = `* [${FILTER} && featured==true] | order(publishedAt desc)[0...10] ${fields}`;
  const featured = (await sanityFetch(featuredQuery, { slug })) || [];

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
