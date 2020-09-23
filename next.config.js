const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const rehypePrism = require('@mapbox/rehype-prism');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      rehypePrism
    ]
  }
});

module.exports = withMDX(withBundleAnalyzer({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  webpack: function (cfg) {
    const originalEntry = cfg.entry;
    cfg.entry = async () => {
      const entries = await originalEntry();
      // Add client polyfills
      if (
        entries["main.js"] &&
        !entries["main.js"].includes("./src/client-polyfills.js")
      ) {
        entries["main.js"].unshift("./src/client-polyfills.js");
      }

      return entries;
    };

    return cfg;
  },
}));