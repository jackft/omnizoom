const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'zoomy.js',
    library: 'zoomy',
    libraryTarget: 'umd'
  }
};