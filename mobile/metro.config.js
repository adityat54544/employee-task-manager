const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Allow resolving native-only packages by providing empty stubs on web
config.resolver = config.resolver || {};
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Provide empty module stubs for native-only packages on web
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

module.exports = config;
