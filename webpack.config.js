"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");
const { readEnv } = require("read-env");
const webpack = require("webpack");

const pkg = require("./package.json");

let reearthConfig = {};
try {
  // eslint-disable-next-line node/no-missing-require
  reearthConfig = require("./reearth-config.json");
} catch {
  // ignore
}

module.exports = (env, args = {}) => {
  const isProd = args.mode === "production";
  const envfile = loadEnv(Object.keys(env || {}).find(k => !k.startsWith("WEBPACK_")));
  const config = {
    api: "http://localhost:8080/api",
    published: "/published.html?alias={}",
    ...readEnv("REEARTH_WEB", {
      source: {
        // When --env local is specified, .env.local will be loaded
        ...(envfile ? dotenv.parse(envfile) : {}),
        ...process.env,
      },
    }),
    ...reearthConfig,
  };

  return {
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      },
      historyApiFallback: true,
      open: true,
      // host: "local-ip",
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
        },
        "/plugins": {
          target: "http://localhost:8080",
        },
      },
      onBeforeSetupMiddleware(devServer) {
        if (!devServer) return;
        devServer.app.get("/reearth_config.json", (_req, res) => {
          res.json(config);
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
          test: /\.ya?ml$/,
          loader: "yaml-loader",
        },
        {
          resourceQuery: /raw/,
          type: "asset/source",
        },
        {
          exclude: [/\.(jsx?|m?js|html?|json|tsx?|css|ya?ml)$|\?raw$/],
          loader: "file-loader",
          resourceQuery: { not: [/raw/] },
          options: {
            name: "assets/[name].[contenthash:8].[ext]",
          },
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
        REEARTH_WEB_VERSION: pkg.version,
        "process.env.QTS_DEBUG": "false",
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
      alias: {
        "@reearth": path.resolve(__dirname, "src/"),
        // For quickjs-emscripten
        crypto: "crypto-js",
      },
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"],
      // For quickjs-emscripten
      fallback: {
        fs: false,
        path: false,
      },
    },
  };
};

function loadEnv(env) {
  try {
    return fs.readFileSync(`.env${env ? `.${env}` : ""}`);
  } catch {
    // ignore
  }
}
