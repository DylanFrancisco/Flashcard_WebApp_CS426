const path = require('path');

module.exports = {
  entry: {
    app: 'app.js',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    clean: true,
    filename: 'app.js',
  },
};
