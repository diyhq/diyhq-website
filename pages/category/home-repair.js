import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '../../lib/sanity';

export async function getStaticProps() {
  const query = `*[_type == "post" && category == "home-repair"] | order(_createdAt desc)[0...20] {
    _id,
    title,
    slug,
    mainImage {
      asset->{
        _id,
        url
      },
      alt
    }
  }`;

  const posts = await sanityClient.fetch(query);
  return {
    props: {
      posts,
    },
    revalidate: 60, // Rebuild page every 60s for freshness
  };
}

export default function HomeRepairCategoryPage({ posts }) {
  return (
    <>
      <Head>
        <title>Home Repair & Maintenance | DIY HQ</title>
        <meta name="description" content="Learn practical home repair skills and seasonal maintenance tips for every homeowner." />
        <meta name="keywords" content="home repair, maintenance, DIY fix, patch drywall, leaky faucet, repair checklist, handyman guide" />
        <meta property="og:title" content="Home Repair & Maintenance | DIY HQ" />
        <meta property="og:description" content="Explore practical repairs and seasonal maintenance for every homeowner." />
        <meta property="og:image" content="https://www.doityourselfhq.com/images/social/home-repair-meta.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.doityourselfhq.com/category/home-repair" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home Repair & Maintenance | DIY HQ" />
        <meta name="twitter:description" content="Explore practical repairs and seasonal maintenance for every homeowner." />
        <meta name="twitter:image" content="https://www.doityourselfhq.com/images/social/home-repair-meta.jpg" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-4">Home Repair & Maintenance</h1>
        <p className="text-center text-gray-600 mb-6">Explore practical repairs and seasonal maintenance for every homeowner.</p>

        {posts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 italic">No blog posts available yet. Check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug.current}`} className="group block bg-white rounded-lg shadow hover:shadow-md transition">
                {post.mainImage?.asset?.url && (
                  <Image
                    src={post.mainImage.asset.url}
                    alt={post.mainImage.alt || post.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover rounded-t"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold group-hover:text-orange-600 transition">{post.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
