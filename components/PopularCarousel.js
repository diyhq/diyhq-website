// components/PopularCarousel.js

import { useEffect, useState } from 'react'
import { createClient } from 'next-sanity'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import Image from 'next/image'
import Link from 'next/link'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const client = createClient({
  projectId: 'plkjpsnw',
  dataset: 'production',
  apiVersion: '2023-07-06',
  useCdn: true,
})

export default function PopularCarousel({ categoryId }) {
  const [popularPosts, setPopularPosts] = useState([])

  useEffect(() => {
    async function fetchPopular() {
      if (!categoryId) return

      try {
        const query = `
          *[
            _type == "post" &&
            references($catId) &&
            defined(views) &&
            defined(publishedAt) &&
            publishedAt < now()
          ] | order(views desc)[0...5] {
            _id,
            title,
            slug,
            publishedAt,
            views,
            excerpt,
            mainImage {
              asset->{ url }
            }
          }
        `
        const data = await client.fetch(query, { catId: categoryId })
        setPopularPosts(data)
      } catch (err) {
        console.error("🔥 Error fetching popular posts:", err)
        setPopularPosts([]) // Prevent crash
      }
    }

    fetchPopular()
  }, [categoryId])

  if (popularPosts.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">Popular in this Category</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {popularPosts.map((post) => (
          <SwiperSlide key={post._id}>
            <Link
              href={`/post/${post.slug.current}`}
              className="block bg-white rounded shadow hover:shadow-lg transition overflow-hidden"
            >
              <div>
                {post.mainImage?.asset?.url && (
                  <Image
                    src={post.mainImage.asset.url}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-md font-semibold mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  {post.excerpt && (
                    <p className="text-sm mt-2 text-gray-700">{post.excerpt}</p>
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
