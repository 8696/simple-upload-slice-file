const path = require('path');


module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'simple-upload-slice-file.min.js',
    library: 'SimpleUploadSliceFile',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          }
        ],
        exclude: /node_modules/,
      },
    ]
  },
};
