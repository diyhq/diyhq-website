import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { name: 'Home Repair & Maintenance', slug: 'home-repair-maintenance', image: '/images/categories/home-repair-maintenance-diyhq.jpg' },
  { name: 'Tools & Gear', slug: 'tools-gear-reviews', image: '/images/categories/tools-and-gear-diyhq-homepage.jpg' },
  { name: 'Renovation & Remodeling', slug: 'renovation-remodeling', image: '/images/categories/renovation-remodeling-blueprint-diyhq-homepage (1).jpg' },
  { name: 'Yard, Garden, & Outdoor DIY', slug: 'yard-garden-outdoor-diy', image: '/images/categories/yard-garden-outdoor-diyhq-homepage.jpg' },
  { name: 'Beginner DIY Guides', slug: 'beginner-diy-guides', image: '/images/categories/beginner-diy-guide-focused-diyhq-homepage.jpg' },
  { name: 'Smart Home & AI DIY', slug: 'smart-home-ai-diy', image: '/images/categories/smart-home-ai-diyhq-homepage.jpg' },
  { name: 'Automotive DIY', slug: 'automotive-diy', image: '/images/categories/automotive-diy-hotrod-clean-diyhq-homepage.jpg' },
  { name: 'DIY Business & Side Hustles', slug: 'diy-business-side-hustles', image: '/images/categories/diy-business-side-hustles-split-diyhq-homepage.jpg' },
  { name: 'DIY Cleaning & Maintenance', slug: 'diy-cleaning-maintenance', image: '/images/categories/diy-cleaning-maintenance-diyhq-homepage.jpg' },
  { name: 'Home Organization', slug: 'home-organization', image: '/images/categories/home-organization-closet-diyhq-homepage.jpg' }
];

export default function Home() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">DO-IT-YOURSELF HQ</h1>

      <div className="flex justify-center mb-12">
        <select
          className="text-lg border border-gray-300 p-3 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => {
            if (e.target.value) window.location.href = `/category/${e.target.value}`;
          }}
        >
          <option value="">Browse by Category</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`}>
            <div className="group shadow rounded-xl overflow-hidden bg-white hover:shadow-xl transition duration-300 cursor-pointer">
              <div className="overflow-hidden">
                <Image
                  src={category.image}
                  alt={`DIY HQ category: ${category.name}`}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg transform group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3 text-center font-medium text-gray-800 text-sm sm:text-base">
                {category.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
