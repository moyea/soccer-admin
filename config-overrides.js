const {injectBabelPlugin} = require('react-app-rewired');

module.exports = function (config, env) {
  config = injectBabelPlugin(['import', {libraryName: 'antd', libraryDirectory: 'es', style: 'css'}], config);
  // config.module.rules.push({
  //   test: /\.less$/,
  //   use: ['style-loader', 'css-loader', 'less-loader']
  // });
  return config;
};
