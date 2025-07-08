// pages/_app.js
import Head from 'next/head';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Essential Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="author" content="DIY HQ" />
        <meta
          name="description"
          content="DIY HQ is your go-to source for home repair, smart tech, tool reviews, side hustles, and all things hands-on DIY."
        />
        <meta
          name="keywords"
          content="DIY, home improvement, tool reviews, handyman tips, home repair, side hustle, smart home, renovation, organization, automotive, garden"
        />

        {/* Open Graph for Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DIY HQ" />
        <meta
          property="og:description"
          content="Explore tools, repairs, renovations, and hands-on guides for every real-world DIY project."
        />
        <meta property="og:url" content="https://www.doityourselfhq.com" />
        <meta property="og:image" content="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DIY HQ - Tools, Repairs & Real-World Projects" />
        <meta
          name="twitter:description"
          content="Conquer home projects with pro tips, gear reviews, and real-world advice from DIY HQ."
        />
        <meta name="twitter:image" content="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        <title>DIY HQ</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
        <Header />
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default MyApp;
