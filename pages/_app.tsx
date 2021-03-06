import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/styles";
import App from "next/app";
import Head from "next/head";
import React from "react";
import "../src/lib/doka/doka.min.css";
import "../src/lib/prism/prism-vsc-dark-plus.css";
import themeOptionsProvider from "../src/theme";



/**
 * @see https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/pages/_app.tsx
 * - Extended with customized getInitialProps method
 */

const siteName = "Tapes.me";

class MyApp extends App {
  state = {
    theme: themeOptionsProvider.theme,
  };

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
    themeOptionsProvider.setupListeners(() => {
      this.setState(() => ({
        theme: themeOptionsProvider.theme,
      }));
    });
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <Head>
          <title>{siteName}</title>
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
        </Head>
        <style>
          @import url(https://fonts.googleapis.com/css?family=Questrial);
          {/* Or Roboto: https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap */}
        </style>
        <ThemeProvider theme={this.state.theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </>
    );
  }
}

export default MyApp;
