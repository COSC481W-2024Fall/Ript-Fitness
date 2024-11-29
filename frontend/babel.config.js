module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowlist: ['USE_LOCAL', 'LOCAL_IP', 'AZURE_API_URL'], // Ensure these are listed
        },
      ],
      [
        "babel-plugin-inline-import",
        {
          extensions: [],
        },
      ],
      "react-native-reanimated/plugin", // Must be last
    ],
  };
};
