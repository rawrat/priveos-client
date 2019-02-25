const path = require('path');

module.exports = {
  target: "web",
  entry: {
    app: ["./src/index.js"]
  },
  output: {
    path: path.resolve(__dirname, "./dist/browser"),
    filename: "priveos.js",
  },
  devtool: 'inline-source-map',
}