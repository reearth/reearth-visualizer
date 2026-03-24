<p align="center">
  <a href="https://github.com/reearth/reearth-visualizer">
    <img src="./public/visualizer-logo.svg" alt="Logo" width="300" height="300">
  </a>
</p>

[![GitHub stars](https://img.shields.io/github/stars/reearth/reearth.svg?style=social&label=Star&maxAge=2592000)](https://github.com/reearth/reearth-visualizer/stargazers/)
[![issues](https://img.shields.io/github/issues/reearth/reearth)](https://img.shields.io/github/issues/reearth/reearth)
[![license](https://img.shields.io/github/license/reearth/reearth)](https://github.com/reearth/reearth-visualizer/blob/main/LICENSE)
[![release](https://img.shields.io/github/release/reearth/reearth.svg)](https://github.com/reearth/reearth-visualizer/releases/)

<p align="center">
  <a href="https://renewal2025.reearth.io/">Website</a>
  ·
  <a href="https://visualizer.developer.reearth.io/">Documentation</a>
  ·
  <a href="https://github.com/reearth/reearth-visualizer/issues">Issues</a>
</p>

---

💡 **We are hiring full-time OSS comitters!** [https://eukarya.io/join](https://eukarya.io/join)

## Features

Visualizer is a powerful tool for visualizing GIS data, offering a range of features to enhance your mapping experience:

- **Comprehensive WebGIS Support**: Visualizer supports various common WebGIS data types, displaying them seamlessly on a digital map using Cesium as the rendering engine.
- **Interactive Geometry Drawing**: Draw geometric shapes directly on the map for custom annotations and spatial analysis.
- **Conditional Layer Styling**: Modify display styles for individual layers based on conditions, allowing for personalized data visualization.
- **Engaging Storytelling Feature**: Create interactive, page-by-page narratives with your GIS data using the built-in storytelling feature.
- **Customizable Interface with Plugins**: Use the plugin system to create custom solutions and tailor the interface of public projects to suit your needs.
- **Easy Project Publishing and Sharing**: Publish your projects and share them effortlessly through distribution, embedding, or custom URLs.
- **Community Plugin Marketplace**: Add your custom plugins to the [marketplace](https://marketplace.reearth.io/) and allow other users to integrate them into their projects.

## Built with

[React](https://github.com/facebook/react), [TypeScript](https://github.com/microsoft/TypeScript), [Go](https://github.com/golang/go), [GraphQL](https://github.com/graphql), [MongoDB](https://www.mongodb.com/), [WebAssembly](https://webassembly.org/) (plugin execution), [OpenID Connect](https://openid.net/connect/)

# Getting Started

### Start Backend Services

Before you begin, please ensure that **Docker** is properly installed and running on your machine.

> **Windows users**: Please use [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) for development. All commands below work within WSL.

1. Clone the repository:

   ```bash
   git clone https://github.com/reearth/reearth-visualizer.git
   cd reearth-visualizer/server
   ```

2. Start the backend server.
   This command will automatically start the database, mock GCS storage, and create `.env` files if they don't exist:

   ```bash
   make d-run
   ```

3. Initialize the development environment.
   This creates a mock user and sets up the mock GCS bucket.
   This step is only required for the first-time setup:

   ```bash
   make setup-dev
   ```

> For more details on backend development commands, see [server/README.md](server/README.md).

---

## Start Frontend Service

1. Navigate to the `web` directory of your visualizer project and create a local `.env` file:

   ```bash
   cd web
   touch .env
   ```

2. Add the following environment variables to your `.env` file:

   ```plaintext
   # .env
   REEARTH_WEB_API=http://localhost:8080/api
   REEARTH_WEB_PLUGINS=http://localhost:8080/plugins
   REEARTH_WEB_CESIUM_ION_ACCESS_TOKEN=your_cesium_ion_access_token_here
   REEARTH_WEB_AUTH_PROVIDER=mock
   ```

   > To obtain a Cesium Ion Access Token, please follow
   > [this official guide](https://cesium.com/learn/ion/cesium-ion-access-tokens/).

3. Install dependencies and start the frontend server:

   ```bash
   yarn && yarn start
   ```

---

## ✅ Done!

You should now be able to access the **Re:Earth Visualizer** locally at:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 🌎 Environment

### Supported OS

| Windows 10+ | macOS 10.12+ (Sierra) | ChromeOS | iOS 11+ | Android 10+ | Linux (Desktop) |
| ----------- | --------------------- | -------- | ------- | ----------- | --------------- |
| ✅          | ✅                    | ✅       | ✅      | ✅          | ✅              |

---

For more information, please refer to the [Documentation](https://visualizer-developer-reearth-io.netlify.app/).

### Web Browsers

| ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_32x32.png) <br />Edge | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_32x32.png) <br /> Firefox | ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_32x32.png) <br /> Chrome | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_32x32.png) <br /> Safari | ![iOS Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_32x32.png) <br />iOS Safari | ![Chrome for Android](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_32x32.png) <br/> Chrome for Android |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 91+                                                                                                      | 57+                                                                                                                   | 58+                                                                                                               | 11+                                                                                                               | last 2 versions                                                                                                                  | last 2 versions                                                                                                                          |

## Contributing

See [the contributing guide](CONTRIBUTING.md).

## Contributers

[![Contributers](https://contrib.rocks/image?repo=reearth/reearth)](https://github.com/reearth/reearth-visualizer/graphs/contributors)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Freearth%2Freearth-visualizer.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Freearth%2Freearth-visualizer?ref=badge_shield)

Made with [contrib.rocks](https://contrib.rocks).

## Contact

Re:Earth core committers: [community@reearth.io](mailto:community@reearth.io)

## License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE) for more information.


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Freearth%2Freearth-visualizer.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Freearth%2Freearth-visualizer?ref=badge_large)