const path = require("path");

module.exports = {
  reactStrictMode: false,
  experimental: {
    transpilePackages: ["ui"],
  },
  webpack: (config) => {
    // Solving the following issue:
    // https://github.com/typeorm/typeorm/issues/2841
    config.resolve.alias.typeorm = path.resolve(__dirname, "../../node_modules/typeorm/typeorm-model-shim");
    return config;
  }
};
