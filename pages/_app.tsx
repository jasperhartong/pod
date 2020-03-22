import React from "react";
import App from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import themeOptionsProvider from "../src/theme";

/**
 * @see https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/pages/_app.tsx
 * - Extended with customized getInitialProps method
 */

class MyApp extends App {
  state = {
    theme: themeOptionsProvider.theme
  };

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
    themeOptionsProvider.setupListeners(() => {
      this.setState(() => ({
        theme: themeOptionsProvider.theme
      }));
    });
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <Head>
          <title>emit/time</title>
        </Head>
        <style>
          @import url(https://fonts.googleapis.com/css?family=Questrial);
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
