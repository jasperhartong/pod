const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  experimental: {
    reactRefresh: true,
  },
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
});
