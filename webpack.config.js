"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const dotenv = require("dotenv");
const { readEnv } = require("read-env");

module.exports = (env, args = {}) => {
  const isProd = args.mode === "production";
  let envfile = "";
  try {
    envfile = fs.readFileSync(`.env`);
  } catch {
    // ignore
  }
  const config = readEnv("REEARTH_WEB", {
    source: {
      ...dotenv.parse(envfile),
      ...process.env,
    },
  });

  return {
    devServer: {
      clientLogLevel: "none",
      contentBase: path.join(__dirname, "build"),
      // disableHostCheck: true,
      historyApiFallback: true,
      hot: true,
      open: true,
      port: 3000,
      stats: "minimal",
      proxy: {
        "/api": {
          target: "http://localhost:8080",
        },
      },
      before(app) {
        app.get("/reearth_config.json", (_req, res) => {
          res.json({
            api: "http://localhost:8080/api",
            ...Object.fromEntries(Object.entries(config).filter(([, v]) => Boolean(v))),
          });
        });
      },
    },
    devtool: isProd ? undefined : "eval-source-map",
    entry: {
      app: "./src/index.tsx",
      published: "./src/published.tsx",
    },
    externals: {
      cesium: "Cesium",
    },
    mode: isProd ? "production" : "development",
    cache: {
      type: "filesystem",
    },
    snapshot: {
      managedPaths: [path.resolve(__dirname, "package-lock.json", "yarn.lock", "tsconfig.json")],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                cacheDirectory: true,
                plugins: isProd ? [] : ["react-refresh/babel"],
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          exclude: [/\.(jsx?|m?js|html?|json|tsx?|css|ya?ml)$/],
          loader: "file-loader",
          options: {
            name: "assets/[name].[contenthash:8].[ext]",
          },
        },
        {
          test: /\.ya?ml$/,
          use: [{ loader: "json-loader" }, { loader: "yaml-flat-loader" }],
        },
      ],
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        minSize: 30000,
        maxInitialRequests: Infinity,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              const hash = crypto
                .createHash("md5")
                .update(packageName, "binary")
                .digest("hex")
                .slice(0, 8);
              return `vendor-${hash}`;
            },
          },
        },
      },
    },
    output: {
      filename: isProd ? "[name].[chunkhash:8].js" : "[name].js",
      path: path.join(__dirname, "build"),
      publicPath: "/",
    },
    performance: {
      hints: isProd ? "warning" : false,
    },
    plugins: [
      ...(isProd
        ? [
            new CleanWebpackPlugin({
              cleanAfterEveryBuildPatterns: ["build"],
            }),
          ]
        : [new webpack.HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin()]),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: `node_modules/cesium/Build/Cesium`,
            to: "cesium",
          },
        ],
      }),
      new HtmlWebpackPlugin({
        excludeChunks: ["published"],
        template: "src/index.html",
      }),
      new HtmlWebpackPlugin({
        excludeChunks: ["app"],
        template: "src/published.html",
        filename: "published.html",
      }),
      new HtmlTagsPlugin({
        append: false,
        tags: ["cesium/Widgets/widgets.css", "cesium/Cesium.js"],
      }),
    ],
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"],
      alias: {
        "@reearth": path.resolve(__dirname, "src/"),
      },
    },
  };
};
