// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* --- Google Funding Choices (Google CMP) --- */}
          {/* Signal that Funding Choices is present (required by Google) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){function signalGooglefcPresent(){if(!window.frames['googlefcPresent']){if(document.body){const iframe=document.createElement('iframe');iframe.style.cssText='width:0;height:0;border:0;display:none';iframe.name='googlefcPresent';document.body.appendChild(iframe);}else{setTimeout(signalGooglefcPresent,5);}}}signalGooglefcPresent();})();`,
            }}
          />
          {/* Load the consent message for publisher pub-9161898764253346 */}
          <script
            async
            src="https://fundingchoicesmessages.google.com/i/pub-9161898764253346?ers=3"
          />
          {/* Performance preconnects for ads */}
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
