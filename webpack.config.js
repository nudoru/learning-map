const {resolve}   = require('path');
const webpack           = require('webpack');
const HTMLPlugin        = require('html-webpack-plugin');
const CopyPlugin        = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const PurifyCSSPlugin   = require('purifycss-webpack-plugin');

// Source
const appEntryFile  = resolve(__dirname, 'front', 'app', 'index.js');
const appConfigFile = resolve(__dirname, 'front', 'app', 'config.json');
const favicon = resolve(__dirname, 'front', 'app', 'favicon.ico');
// const appSourcePath = resolve(__dirname, 'front', 'app');
// Destination
const appDestPath = resolve(__dirname, 'front', 'www');

// Bools to determine build environment
// const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

module.exports = env => {

  // Helper to remove empty elements from an array. Used in plugins below.
  const removeEmpty = array => array.filter(i => !!i);

  const isProd = env.prod ? true : false;

  console.log('Building env: ', env, isProd, isTest);

  return {

    entry: {
      app   : appEntryFile
      //vendor: ['lodash', 'react', 'react-dom', 'react-redux', 'redux', 'moment', 'react-scroll', 'ramda']
    },

    output: {
      path      : appDestPath,
      // Name is replaced with keys from entry block
      filename  : "[name].[hash].js",
      publicPath: isProd ? '' : '/'
    },

    devtool: env.prod ? 'cheap-module-source-map' : 'eval',
    //devtool: 'hidden-source-map',
    bail   : env.prod,

    module: {
      loaders: [
        {
          test  : /\.(s?)(a|c)ss$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader        : ['css', 'postcss', 'sass']
          })
        },
        {
          test  : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: 'file?name=[name].[ext]'
        },
        {
          test   : /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-Webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
          ]
        },
        {
          enforce: "pre",
          test   : /\.jsx?$/,
          loader : "eslint-loader?{configFile:'./.eslintrc', quiet:false, failOnWarning:false, failOnError:true}",
          exclude: ['/node_modules/', '/app/vendor/']
        },
        {
          test   : /\.jsx?$/,
          loader : 'babel-loader',
          exclude: ['/node_modules/'],
          query  : {
            plugins: [
              "transform-class-properties",
              "transform-object-rest-spread",
              "transform-es2015-destructuring"
            ],
            presets: removeEmpty(['es2015','react', isProd ? undefined : 'react-hmre']),
            compact: false,
            comments: false
          }
        }
      ]
    },

    devServer: {
      historyApiFallback: true
    },

    plugins: removeEmpty([
      // If we're in prod, optimization
      isProd ? undefined : new webpack.DefinePlugin({
        'process.env': {NODE_ENV: '"production"'}
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss () {
            return [require('autoprefixer'), require('precss')];
          }
        }
      }),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
      new HTMLPlugin({
        title   : 'Application',
        template: 'front/app/index.html'
      }),
      new CopyPlugin([
        {from: appConfigFile },
        {from: favicon }
        ]),
      new ExtractTextPlugin({
        filename : 'style.css',
        allChunks: true,
        disable: !isProd
      }),
      // Disabled, was causing CSS classes referenced in conditional statements
      // to not be present in output
      !isProd ? undefined : new PurifyCSSPlugin({
        basePath     : __dirname,
        purifyOptions: {
          info     : true,
          minify   : true,
          whitelist: ['fa-*']
        }
      }),
      // Optimize ID order
      !isProd ? undefined : new webpack.optimize.OccurrenceOrderPlugin(),
      // If we're not in testing, create a separate vendor bundle file
      isTest ? undefined : new webpack.optimize.CommonsChunkPlugin({
        name     : 'vendor',
        //minChunks: Infinity
        minChunks: function (module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      }),
      isTest ? undefined : new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest'
      })
    ])
  }
};
