// pages/_app.js
import Head from "next/head";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161898764253346"
          crossOrigin="anonymous"
        ></script>

        {/* Basic meta */}
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

        {/* IMPORTANT:
            We intentionally do NOT set global Open Graph or Twitter
            image tags here, so that blog posts can control og:image
            per-post from pages/post/[slug].js using their hero image.
        */}

        <link rel="icon" href="/favicon.ico" />
        <title>DIY HQ</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
        <Header />
        {/* Site-wide content width */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default MyApp;
