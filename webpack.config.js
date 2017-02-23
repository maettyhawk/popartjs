module.exports = {
  entry: "./src/popart.js",
  output: {
      path: __dirname,
      filename: "popart.dev.js"
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
  }
}
