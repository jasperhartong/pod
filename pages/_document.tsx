import { ServerStyleSheets } from "@material-ui/styles";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";
import themeOptionsProvider from "../src/theme";
/**
 * @see https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/pages/_document.tsx
 */

const siteName = "Tapes.me";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA primary color */}
          <meta
            name="theme-color"
            content={themeOptionsProvider.theme.palette.background.default}
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
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
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
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
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
    styles: styles,
  };
};

export default MyDocument;
