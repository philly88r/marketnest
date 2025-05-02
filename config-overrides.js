const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    util: require.resolve('util'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    zlib: require.resolve('browserify-zlib'),
    assert: require.resolve('assert'),
    url: require.resolve('url'),
    tty: require.resolve('tty-browserify'),
    constants: require.resolve('constants-browserify'),
    process: require.resolve('process/browser'),
    net: false,
    tls: false,
    child_process: false,
    dns: false,
    http2: false,
    inspector: false,
    readline: false,
    async_hooks: false,
    electron: false,
  };

  // Add webpack plugins
  config.plugins = [
    ...config.plugins,
    // Add buffer polyfill
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process',
    }),
    // Process polyfill
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ];

  // Add resolve alias for process
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': 'process/browser.js',
  };

  // Ignore specific modules that can't be polyfilled
  config.module.rules.push({
    test: /playwright-core/,
    use: 'null-loader',
  });

  return config;
};
