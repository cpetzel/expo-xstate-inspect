module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // NOTE: this is only necessary if you are using reanimated for animations
      "react-native-reanimated/plugin",
    ],
  };
};
