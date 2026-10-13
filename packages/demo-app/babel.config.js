module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo wires up the reanimated/worklets plugin automatically
  return {
    presets: ["babel-preset-expo"],
  };
};
