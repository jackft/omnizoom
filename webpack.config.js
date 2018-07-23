const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'omnizoom.min.js',
    library: 'omnizoom',
    libraryTarget: 'umd'
  }
};