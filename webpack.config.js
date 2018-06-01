const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const dotenv = require('dotenv')
const webpack = require('webpack')

dotenv.config()

const browserSyncPort = process.env.PORT || 3500
const webpackPort = 9500

const commonConfig = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
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
  plugins: [],
}

const envConfig = (mode, common) =>
  mode !== 'development'
    ? {
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
          new CleanWebpackPlugin(['dist']),
          new ExtractTextPlugin({
            filename: 'style.css',
            disable: false,
            allChunks: true,
          }),
        ],
      }
    : {
        output: {
          ...common.output,
          publicPath: process.env.PUBLIC_PATH,
        },
        devtool: 'inline-source-map',
        devServer: {
          compress: false,
          port: webpackPort,
          hot: true,
          publicPath: process.env.PUBLIC_PATH,
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
        plugins: [
          ...common.plugins,
          new webpack.NamedModulesPlugin(),
          new BrowserSyncPlugin(
            {
              host: 'localhost',
              port: browserSyncPort,
              proxy: `http://localhost:${webpackPort}`,
              rewriteRules: [
                {
                  match: new RegExp(process.env.PROXY_URL, 'g'),
                  fn: (req, res, match) =>
                    `http://localhost:${browserSyncPort}`,
                },
              ],
              open: false,
            },
            {
              // prevent BrowserSync from reloading the page
              // and let Webpack Dev Server take care of this
              reload: false,
            },
          ),
        ],
      }

module.exports = (env, argv) => ({
  ...commonConfig,
  ...envConfig(argv.mode, commonConfig),
})
