// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    // Next.js sets this.props.locale when i18n is enabled
    const lang = this.props.locale || 'en';

    return (
      <Html lang={lang}>
        <Head>
          {/* Funding Choices + preconnects, as you have now */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){function signalGooglefcPresent(){if(!window.frames['googlefcPresent']){if(document.body){const i=document.createElement('iframe');i.style.cssText='width:0;height:0;border:0;display:none';i.name='googlefcPresent';document.body.appendChild(i);}else{setTimeout(signalGooglefcPresent,5);}}}signalGooglefcPresent();})();`,
            }}
          />
          <script async src="https://fundingchoicesmessages.google.com/i/pub-9161898764253346?ers=3" />
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
