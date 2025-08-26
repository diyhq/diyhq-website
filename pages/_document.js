import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    const locale = this.props?.locale || "en";
    return (
      <Html lang={locale}>
        <Head>
          {/* --- Google Funding Choices (Google CMP) --- */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){function signalGooglefcPresent(){if(!window.frames['googlefcPresent']){if(document.body){const iframe=document.createElement('iframe');iframe.style.cssText='width:0;height:0;border:0;display:none';iframe.name='googlefcPresent';document.body.appendChild(iframe);}else{setTimeout(signalGooglefcPresent,5);}}}signalGooglefcPresent();})();`,
            }}
          />
          <script
            async
            src="https://fundingchoicesmessages.google.com/i/pub-9161898764253346?ers=3"
          />
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
          <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
