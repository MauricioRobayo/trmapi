module.exports = {
  externals: {
    "aws-sdk": "aws-sdk"
  },
  mode: "production",
  entry: ["./src/handler.js"],
  target: "node",
  output: {
    path: `${process.cwd()}/dist`,
    filename: "handler.js",
    libraryTarget: "commonjs2"
  }
};
