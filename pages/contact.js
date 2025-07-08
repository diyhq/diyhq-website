import Head from 'next/head';

export default function ContactPage() {
  return (
    <>
<Head>
  <title>Contact DIY HQ | Get in Touch</title>
  <meta name="description" content="Have a question, comment, or partnership idea? Reach out to the DIY HQ team today." />
  <meta property="og:title" content="Contact DIY HQ" />
  <meta property="og:description" content="We're here to help with anything related to DIY, tools, or home repair." />
  <meta property="og:url" content="https://www.doityourselfhq.com/contact" />
  <meta property="og:image" content="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Contact DIY HQ" />
  <meta name="twitter:description" content="Send us your questions, ideas, or feedback and we’ll get back to you ASAP." />
</Head>


      <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-4xl font-bold text-center mb-6">Contact DIY HQ</h1>
        <p className="text-center mb-10 text-gray-600">
          Got a question, comment, or partnership idea? We’d love to hear from you. Fill out the form below and we’ll get back to you as soon as we can.
        </p>

        <form
          action="mailto:diyheadquaters@gmail.com"
          method="POST"
          encType="text/plain"
          className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-md"
        >
          <div>
            <label htmlFor="name" className="block font-medium mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="Name"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="Email"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-medium mb-1">
              Your Message
            </label>
            <textarea
              id="message"
              name="Message"
              rows="5"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition"
          >
            Send Message
          </button>
        </form>
      </main>
    </>
  );
}
