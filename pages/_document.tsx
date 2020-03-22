import React from "react";
import Document, { Head, Main, NextScript } from "next/document";
import { ServerStyleSheets } from "@material-ui/styles";
import themeOptionsProvider from "../src/theme";

/**
 * @see https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/pages/_document.tsx
 */

const siteName = "pod";

class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          {/* <link rel="icon" href="/public/favicon.ico" /> */}
          <meta property="og:site_name" content={siteName} />
          <meta property="og:title" content={siteName} />
          <meta property="og:description" content={siteName} />

          {/* <meta
            property="og:image"
            itemProp="image"
            content="/public/icon.png"
          /> */}
          <meta property="og:type" content="website" />
          <meta property="og:updated_time" content="1566389369" />
          <meta charSet="utf-8" />
          {/* Use minimum-scale=1 to enable GPU rasterization */}
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=0"
          />
          {/* PWA primary color */}
          <meta
            name="theme-color"
            content={themeOptionsProvider.theme.palette.background.default}
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Start Simple Analytics */}
          <script
            async
            defer
            src="https://cdn.simpleanalytics.io/hello.js"
          ></script>
          <noscript>
            <img src="https://api.simpleanalytics.io/hello.gif" alt="" />
          </noscript>
          {/* End Simple Analytics */}
        </body>
      </html>
    );
  }
}

MyDocument.getInitialProps = async ctx => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props => sheets.collect(<App {...props} />)
    });

  /**
   * @deviation from https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/pages/_app.tsx
   * setting styles as an array of React Elements instead of a React Node
   */
  const initialProps = await Document.getInitialProps(ctx);
  const styles = initialProps.styles || [];
  // @ts-ignoretsignore
  styles.push(sheets.getStyleElement());

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: styles
  };
};

export default MyDocument;
