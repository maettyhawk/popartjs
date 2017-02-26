var webpack = require('webpack');

module.exports = {
  entry: "./src/popart.js",
  output: {
      filename: "popart.min.js",
      path: __dirname + "/dest",
      publicPath: "/dest"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2016']
        }
      },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    })
  ]
}
