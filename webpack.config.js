const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const rules = [];
rules.push({
  test: /\.ts(x)?$/,
  use: 'ts-loader',
});
rules.push({
  test: /\.less?$/,
  use: [{
      loader: 'style-loader'
    },
    {
      loader: 'css-loader'
    },
    {
      loader: 'less-loader'
    },
  ],
});
rules.push({
  test: /\.css?$/,
  use: [{
      loader: 'style-loader'
    },
    {
      loader: 'css-loader'
    },
  ],
});

const plugins = [];
plugins.push(new HtmlWebpackPlugin({
  filename: 'index.html',
  template: path.join(__dirname, './src/index.html'),
}));

module.exports = {
  context: path.resolve(__dirname, '.'),
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: './',
  },
  mode: 'development',
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.less']
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    port: '5000',
  }
};
