import Head from 'next/head';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - DIY HQ</title>
        <meta name="description" content="Learn more about the mission behind DIY HQ — empowering everyday people to fix, build, and improve everything themselves." />
        <meta property="og:title" content="About DIY HQ" />
        <meta property="og:description" content="Meet the DIY HQ team and discover our mission to make home projects easier and more fun." />
        <meta property="og:url" content="https://www.doityourselfhq.com/about" />
        <meta property="og:image" content="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About DIY HQ" />
        <meta name="twitter:description" content="DIY HQ is your go-to for smart, satisfying home repair and DIY tips." />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-10 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold mb-6 text-center">About DIY HQ</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">What is DIY HQ?</h2>
          <p>
            DIY HQ (Do It Yourself Headquarters) is your go-to destination for practical, no-fluff home improvement guides, tool reviews, and hands-on project walkthroughs. Whether you're fixing a leaky faucet, organizing your garage, or building a side hustle from scratch, we’ve got the resources and knowledge to back you up—step by step.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p>
            We believe anyone can take control of their space—and their future—with the right guidance. Our mission is to make high-quality DIY knowledge accessible to every homeowner, renter, and weekend warrior, no matter their skill level.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Why We Exist</h2>
          <p>
            There’s a lot of noise out there. Between vague advice, low-effort videos, and recycled content, it’s hard to find trustworthy help that actually works. DIY HQ was built to change that. We cut through the nonsense with clear, tested, real-world solutions—so you can actually finish what you started.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Approach to DIY</h2>
          <p>
            We focus on <strong>clarity, speed, and results</strong>. No filler. No ego. Just honest project breakdowns, cost estimates, time requirements, safety tips, and product recommendations that actually make sense. Our tutorials are written with a working-class mindset and a get-it-done attitude.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">About the Founder</h2>
          <p>
            DIY HQ was founded by a lifelong problem-solver who’s been in the trenches—fixing homes, flipping rentals, and helping everyday folks build better lives with their own two hands. With a background in construction, real-world experience, and a passion for making complex tasks simple, he built this site to be the tool he wished he had years ago.
          </p>
          <p className="mt-2">
            You won’t find celebrity bios or corporate jargon here—just the hard-won insights of someone who understands what it’s like to juggle tools, time, and tight budgets. 
          </p>
        </section>

        <section className="my-12">
          <h2 className="text-2xl font-semibold text-center mb-6">Why DIYers Trust DIY HQ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-bold mb-2">10+ DIY Subjects</h3>
              <p className="text-sm text-gray-600">Covering tools, repairs, remodeling, and more—updated weekly.</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-bold mb-2">100s of Projects</h3>
              <p className="text-sm text-gray-600">Step-by-step walkthroughs with real timelines and cost estimates.</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-bold mb-2">Real-World Advice</h3>
              <p className="text-sm text-gray-600">No fluff. No filler. Just what actually works, from people who’ve done it.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">What Makes DIY HQ Different?</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We publish <strong>new blog posts multiple times per week</strong> across 10 core DIY subjects</li>
            <li>Our guides include <strong>cost and time estimates</strong> so you can plan smarter</li>
            <li>We cut through BS with <strong>no-fluff, real-world advice</strong> you can actually use</li>
            <li>Everything is <strong>organized by subject</strong>, so you can quickly find what matters to you</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Looking Ahead</h2>
          <p>
            This is just the beginning. We're expanding into more tools, topics, and tutorials based on what you need most.
            <br />
            <a href="/category/home-repair" className="text-orange-500 underline hover:text-orange-600 mt-2 inline-block">
              → Browse All Blog Categories
            </a>
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Let’s Build Something Great</h2>
          <p className="mb-4">
            Thanks for stopping by. If you believe in building things yourself, you’re in the right place.
          </p>
          <a href="/contact" className="inline-block mt-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            Get in Touch
          </a>
        </section>
      </main>
    </>
  );
}
