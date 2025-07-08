import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const categories = [
    { title: 'Automotive DIY', filename: 'automotive-diy-hotrod-clean-diyhq-homepage.jpg', slug: 'automotive' },
    { title: 'Beginner DIY Guides', filename: 'beginner-diy-guide-focused-diyhq-homepage.jpg', slug: 'beginner-guides' },
    { title: 'DIY Business & Side Hustles', filename: 'diy-business-side-hustles-split-diyhq-homepage.jpg', slug: 'side-hustles' },
    { title: 'DIY Cleaning & Maintenance', filename: 'diy-cleaning-maintenance-diyhq-homepage.jpg', slug: 'cleaning' },
    { title: 'Home Organization', filename: 'home-organization-closet-diyhq-homepage.jpg', slug: 'organization' },
    { title: 'Home Repair & Maintenance', filename: 'home-repair-maintenance-diyhq.jpg', slug: 'home-repair' },
    { title: 'Renovation & Remodeling', filename: 'renovation-remodeling-blueprint-diyhq-homepage (1).jpg', slug: 'renovation' },
    { title: 'Smart Home & AI DIY', filename: 'smart-home-ai-diyhq-homepage.jpg', slug: 'smart-home' },
    { title: 'Tools & Gear Reviews', filename: 'tools-and-gear-diyhq-homepage.jpg', slug: 'tools-gear' },
    { title: 'Yard, Garden & Outdoor DIY', filename: 'yard-garden-outdoor-diyhq-homepage.jpg', slug: 'yard-garden' },
  ];

  return (
    <>
      <Head>
        <title>DIY HQ | Your No-Nonsense Home Project Headquarters</title>
        <meta
          name="description"
          content="Explore DIY HQ for honest home repair guides, tool reviews, and project tips across 10 key DIY subjects. Built for homeowners, renters, and weekend warriors."
        />
        <meta name="keywords" content="DIY, home repair, tool reviews, smart home, yard work, beginner projects, remodeling, automotive, cleaning, home organization" />
        <meta name="author" content="DIY HQ" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DIY HQ | No-Fluff Home Improvement Help" />
        <meta property="og:description" content="Straightforward advice, real-world walkthroughs, and trustworthy DIY content." />
        <meta property="og:url" content="https://www.doityourselfhq.com" />
        <meta property="og:image" content="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DIY HQ" />
        <meta name="twitter:description" content="Hands-on guides, tool reviews, and smarter home repairs." />
        <meta name="twitter:image" content="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg" />
      </Head>

      <main className="px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8">Explore Our DIY Categories</h1>

        <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {categories.map(({ title, filename, slug }, index) => (
            <Link key={index} href={`/category/${slug}`} legacyBehavior>
              <a className="group rounded overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 ease-in-out bg-white block">
                <div>
                  <Image
                    src={`/images/categories/${filename}`}
                    alt={title}
                    width={400}
                    height={300}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                  <div className="p-3 text-center">
                    <h2 className="font-semibold text-sm sm:text-base group-hover:text-orange-600 transition-colors duration-200">
                      {title}
                    </h2>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
