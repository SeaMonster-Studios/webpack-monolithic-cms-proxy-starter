const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const dotenv = require('dotenv')
const webpack = require('webpack')

dotenv.config()

const isHTTPS = process.env.PROXY_URL.includes('https')
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 9100
const publicPath =
  (isHTTPS ? 'https' : 'http') +
  '://' +
  host +
  ':' +
  port +
  process.env.PUBLIC_PATH

const commonConfig = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
        ],
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(['dist'])],
}

const envConfig = (mode, common) =>
  mode !== 'development'
    ? {
        devtool: 'inline-source-map',
        module: {
          rules: [
            ...common.module.rules,
            {
              test: /\.(s)?css$/,
              use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'postcss-loader', 'sass-loader'],
              }),
            },
          ],
        },
        plugins: [
          ...common.plugins,
          new ExtractTextPlugin({
            filename: 'style.css',
            disable: false,
            allChunks: true,
          }),
        ],
      }
    : {
        devServer: {
          compress: false,
          port,
          hotOnly: true,
          hot: true,
          publicPath,
          contentBase: './dist',
          historyApiFallback: true,
          overlay: {
            errors: true,
            warnings: false,
          },
          proxy: [
            {
              context: ['**', `!${process.env.PUBLIC_PATH}/**`],
              target: process.env.PROXY_URL,
              secure: false,
              changeOrigin: true,
              autoRewrite: true,
            },
          ],
        },
        module: {
          rules: [
            ...common.module.rules,
            {
              test: /\.(s)?css$/,
              use: [
                'style-loader',
                'css-loader',
                'postcss-loader',
                'sass-loader',
              ],
            },
          ],
        },
        plugins: [...common.plugins, new webpack.NamedModulesPlugin()],
      }

module.exports = (env, argv) => ({
  ...commonConfig,
  ...envConfig(argv.mode, commonConfig),
})
