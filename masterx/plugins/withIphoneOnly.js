const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withIphoneOnly(config) {
  return withInfoPlist(config, (config) => {
    delete config.modResults['UISupportedInterfaceOrientations~ipad'];
    return config;
  });
};
