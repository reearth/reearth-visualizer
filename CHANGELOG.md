# Changelog
All notable changes to this project will be documented in this file.

## 0.14.0 - 2022-12-20

### 🚀 Features

- Port the Box layer into the reearth&#x2F;core ([#377](https://github.com/reearth/reearth-web/pull/377)) [`f235f1`](https://github.com/reearth/reearth-web/commit/f235f1)
- Support multi feature for geojson ([#380](https://github.com/reearth/reearth-web/pull/380)) [`d1ee59`](https://github.com/reearth/reearth-web/commit/d1ee59)
- Extend plugin API supports get query ([#374](https://github.com/reearth/reearth-web/pull/374)) [`ccae02`](https://github.com/reearth/reearth-web/commit/ccae02)
- Extend plugin API supports communication ([#364](https://github.com/reearth/reearth-web/pull/364)) [`61e67e`](https://github.com/reearth/reearth-web/commit/61e67e)
- Support 2d mode in navigator ([#360](https://github.com/reearth/reearth-web/pull/360)) [`595dd5`](https://github.com/reearth/reearth-web/commit/595dd5)
- Main logic of the new layer system ([#370](https://github.com/reearth/reearth-web/pull/370)) [`0dd63e`](https://github.com/reearth/reearth-web/commit/0dd63e)

### 🔧 Bug Fixes

- Cache logic for feature ([#379](https://github.com/reearth/reearth-web/pull/379)) [`67bc52`](https://github.com/reearth/reearth-web/commit/67bc52)
- Rendering bug in new layer system ([#375](https://github.com/reearth/reearth-web/pull/375)) [`172988`](https://github.com/reearth/reearth-web/commit/172988)

### ⚡️ Performance

- Improve unnecessary loading the globe image ([#378](https://github.com/reearth/reearth-web/pull/378)) [`4abbba`](https://github.com/reearth/reearth-web/commit/4abbba)

### ✨ Refactor

- Move feature context ([#381](https://github.com/reearth/reearth-web/pull/381)) [`7e18b8`](https://github.com/reearth/reearth-web/commit/7e18b8)

### Miscellaneous Tasks

- Upgrade dependencies ([#373](https://github.com/reearth/reearth-web/pull/373)) [`1fcc75`](https://github.com/reearth/reearth-web/commit/1fcc75)

## 0.13.0 - 2022-12-06

### 🚀 Features

- Support Cesium Ion terrain ([#331](https://github.com/reearth/reearth-web/pull/331)) [`e0b99a`](https://github.com/reearth/reearth-web/commit/e0b99a)
- Set Cesium Ion default access token via config ([#365](https://github.com/reearth/reearth-web/pull/365)) [`a257b1`](https://github.com/reearth/reearth-web/commit/a257b1)
- Display policy name on workspace title ([#362](https://github.com/reearth/reearth-web/pull/362)) [`c1c632`](https://github.com/reearth/reearth-web/commit/c1c632)
- Editable box ([#357](https://github.com/reearth/reearth-web/pull/357)) [`92a159`](https://github.com/reearth/reearth-web/commit/92a159)
- Extend plugin API supports move widget ([#346](https://github.com/reearth/reearth-web/pull/346)) [`c82825`](https://github.com/reearth/reearth-web/commit/c82825)
- Extend plugin API supports close widget ([#355](https://github.com/reearth/reearth-web/pull/355)) [`d02578`](https://github.com/reearth/reearth-web/commit/d02578)
- Extend plugin API supports get scene inEditor ([#351](https://github.com/reearth/reearth-web/pull/351)) [`ec0b81`](https://github.com/reearth/reearth-web/commit/ec0b81)
- Add clipping box ([#338](https://github.com/reearth/reearth-web/pull/338)) [`af55f1`](https://github.com/reearth/reearth-web/commit/af55f1)
- Extend plugin API event with modalclose popupclose ([#354](https://github.com/reearth/reearth-web/pull/354)) [`9be75a`](https://github.com/reearth/reearth-web/commit/9be75a)
- Extend plugin API supports get location from screen position ([#350](https://github.com/reearth/reearth-web/pull/350)) [`9a826f`](https://github.com/reearth/reearth-web/commit/9a826f)
- Extend plugin API supports get viewport&[#39](https://github.com/reearth/reearth-web/pull/39);s size ([#342](https://github.com/reearth/reearth-web/pull/342)) [`7b268b`](https://github.com/reearth/reearth-web/commit/7b268b)
- Add Re:Earth favicon ([#349](https://github.com/reearth/reearth-web/pull/349)) [`0395d2`](https://github.com/reearth/reearth-web/commit/0395d2)
- Support acquiring locations with terrain ([#343](https://github.com/reearth/reearth-web/pull/343)) [`596543`](https://github.com/reearth/reearth-web/commit/596543)

### 🔧 Bug Fixes

- Policy messages not aligning with policy ([#368](https://github.com/reearth/reearth-web/pull/368)) [`2871ed`](https://github.com/reearth/reearth-web/commit/2871ed)
- Widget align system alignment issue with installed widgets [`e302cc`](https://github.com/reearth/reearth-web/commit/e302cc)
- Rename animation option to withoutAnimation in lookAt ([#361](https://github.com/reearth/reearth-web/pull/361)) [`846a6e`](https://github.com/reearth/reearth-web/commit/846a6e)
- Post message queue doesn&[#39](https://github.com/reearth/reearth-web/pull/39);t work for modal&#x2F;popup ([#359](https://github.com/reearth/reearth-web/pull/359)) [`abb4ed`](https://github.com/reearth/reearth-web/commit/abb4ed)
- Correct flyToGround destination camera ([#356](https://github.com/reearth/reearth-web/pull/356)) [`225758`](https://github.com/reearth/reearth-web/commit/225758)
- Navigator styles ([#353](https://github.com/reearth/reearth-web/pull/353)) [`971323`](https://github.com/reearth/reearth-web/commit/971323)
- Timeline styles ([#352](https://github.com/reearth/reearth-web/pull/352)) [`c76d36`](https://github.com/reearth/reearth-web/commit/c76d36)
- Alignment issues in Widget Align System ([#344](https://github.com/reearth/reearth-web/pull/344)) [`0e12ea`](https://github.com/reearth/reearth-web/commit/0e12ea)
- Cannot input camera altitude less than 500 with camera pane ([#339](https://github.com/reearth/reearth-web/pull/339)) [`76a169`](https://github.com/reearth/reearth-web/commit/76a169)
- Type error from apollo-client [`7dd2b3`](https://github.com/reearth/reearth-web/commit/7dd2b3)
- Fix the camera offset when keep press on zoom to layer ([#335](https://github.com/reearth/reearth-web/pull/335)) [`ccec33`](https://github.com/reearth/reearth-web/commit/ccec33)

### ⚡️ Performance

- Use lodash-es rather than lodash [`731e54`](https://github.com/reearth/reearth-web/commit/731e54)

### 🧪 Testing

- Gql func to e2e reearth page [`593780`](https://github.com/reearth/reearth-web/commit/593780)
- Introduce playwright to run e2e tests ([#336](https://github.com/reearth/reearth-web/pull/336)) [`3af520`](https://github.com/reearth/reearth-web/commit/3af520)

### Miscellaneous Tasks

- Suppress errors output to the console by Icon [`bd9dc5`](https://github.com/reearth/reearth-web/commit/bd9dc5)
- Upgrade cesium to v1.100.0 [`ec05a0`](https://github.com/reearth/reearth-web/commit/ec05a0)
- Upgrade cesium to v1.99 [`be5b22`](https://github.com/reearth/reearth-web/commit/be5b22)
- Upgrade dependencies ([#345](https://github.com/reearth/reearth-web/pull/345)) [`1efe8c`](https://github.com/reearth/reearth-web/commit/1efe8c)
- Remove eslint-plugin-graphql, add eslint-plugin-playwright, refresh yarn.lock [`28c846`](https://github.com/reearth/reearth-web/commit/28c846)
- Use node 16 to avoid storybook build error with node 18 [`64819e`](https://github.com/reearth/reearth-web/commit/64819e)

## 0.12.0 - 2022-10-26

### Miscellaneous Tasks

- Update eslint-config-reearth to 0.2.1 ([#326](https://github.com/reearth/reearth-web/pull/326)) [`25acdd`](https://github.com/reearth/reearth-web/commit/25acdd)

### 🚀 Features

- Add plugin api modal &amp; popup ([#328](https://github.com/reearth/reearth-web/pull/328)) [`27cd7a`](https://github.com/reearth/reearth-web/commit/27cd7a)
- Zoom to layer ([#301](https://github.com/reearth/reearth-web/pull/301)) [`1f5296`](https://github.com/reearth/reearth-web/commit/1f5296)
- Fix layer(marker) extrdue line disapear  ([#330](https://github.com/reearth/reearth-web/pull/330)) [`7c304f`](https://github.com/reearth/reearth-web/commit/7c304f)
- Add option to allow camera to enter the earth&[#39](https://github.com/reearth/reearth-web/pull/39);s surface ([#329](https://github.com/reearth/reearth-web/pull/329)) [`6255ad`](https://github.com/reearth/reearth-web/commit/6255ad)
- Add navigator as a built-in widget ([#323](https://github.com/reearth/reearth-web/pull/323)) [`3befd4`](https://github.com/reearth/reearth-web/commit/3befd4)

### 🔧 Bug Fixes

- Fix the story telling icon size when the layer name is too long  ([#334](https://github.com/reearth/reearth-web/pull/334)) [`c70121`](https://github.com/reearth/reearth-web/commit/c70121)
- Polyfill event target for old Safari [`227d64`](https://github.com/reearth/reearth-web/commit/227d64)
- Zoom to layer functionality ([#332](https://github.com/reearth/reearth-web/pull/332)) [`79b0dd`](https://github.com/reearth/reearth-web/commit/79b0dd)
- Camera popup icon is too small and the icon on storytelling ([#324](https://github.com/reearth/reearth-web/pull/324)) [`e676c3`](https://github.com/reearth/reearth-web/commit/e676c3)

### Miscellaneous Tasks

- Update yarn.lock [`ae4660`](https://github.com/reearth/reearth-web/commit/ae4660)
- Fix wdyr [`d4075a`](https://github.com/reearth/reearth-web/commit/d4075a)
- Update dependency cesium to v1.98.1 ([#325](https://github.com/reearth/reearth-web/pull/325)) [`16e38c`](https://github.com/reearth/reearth-web/commit/16e38c)

## 0.11.0 - 2022-10-03

### 🔧 Bug Fixes

- Installed plugins are not displayed expectedly [`12d546`](https://github.com/reearth/reearth-web/commit/12d546)

### 🚀 Features

- Add 3D OSM building tiles ([#315](https://github.com/reearth/reearth-web/pull/315)) [`2eb89a`](https://github.com/reearth/reearth-web/commit/2eb89a)
- Extend plugin API with camera control ([#311](https://github.com/reearth/reearth-web/pull/311)) [`c1190b`](https://github.com/reearth/reearth-web/commit/c1190b)
- Extend plugin api with captureScreen ([#310](https://github.com/reearth/reearth-web/pull/310)) [`f03022`](https://github.com/reearth/reearth-web/commit/f03022)
- Small update to dashboard UI&#x2F;UX and add marketplace button [`f580e6`](https://github.com/reearth/reearth-web/commit/f580e6)
- Add global modal component and extension location ([#302](https://github.com/reearth/reearth-web/pull/302)) [`7362aa`](https://github.com/reearth/reearth-web/commit/7362aa)
- Add overlay warning to earth editor if browser width is too narrow ([#304](https://github.com/reearth/reearth-web/pull/304)) [`7f5f91`](https://github.com/reearth/reearth-web/commit/7f5f91)
- Add builtin timeline widget ([#285](https://github.com/reearth/reearth-web/pull/285)) [`f774ee`](https://github.com/reearth/reearth-web/commit/f774ee)
- Add plugin settings extension support ([#293](https://github.com/reearth/reearth-web/pull/293)) [`abd1c2`](https://github.com/reearth/reearth-web/commit/abd1c2)

### 🔧 Bug Fixes

- Remove &#x60;show&#x60; props from modal extension ([#321](https://github.com/reearth/reearth-web/pull/321)) [`62eb73`](https://github.com/reearth/reearth-web/commit/62eb73)
- Styles not working as expected in plugin ([#322](https://github.com/reearth/reearth-web/pull/322)) [`21329d`](https://github.com/reearth/reearth-web/commit/21329d)
- Small type error [`21c8bc`](https://github.com/reearth/reearth-web/commit/21c8bc)
- Stop redirect when an error occurs on top page [`236354`](https://github.com/reearth/reearth-web/commit/236354)
- Installed plugins are not correctly listed [`ec305d`](https://github.com/reearth/reearth-web/commit/ec305d)
- Exposed plugin api add layer does not return layer id ([#320](https://github.com/reearth/reearth-web/pull/320)) [`f504d2`](https://github.com/reearth/reearth-web/commit/f504d2)
- Cannot to upgrade marketplace plugins ([#319](https://github.com/reearth/reearth-web/pull/319)) [`444fce`](https://github.com/reearth/reearth-web/commit/444fce)
- Timeline width exceeding browser width ([#316](https://github.com/reearth/reearth-web/pull/316)) [`c6dbb3`](https://github.com/reearth/reearth-web/commit/c6dbb3)
- 3d tile not updating until source type is selected ([#318](https://github.com/reearth/reearth-web/pull/318)) [`49a07b`](https://github.com/reearth/reearth-web/commit/49a07b)
- Wrapper styles in plugin section for plugin extension ([#317](https://github.com/reearth/reearth-web/pull/317)) [`235440`](https://github.com/reearth/reearth-web/commit/235440)
- Timeline speed bug ([#314](https://github.com/reearth/reearth-web/pull/314)) [`984be8`](https://github.com/reearth/reearth-web/commit/984be8)
- Pass extensions to a plugin library extension [`744154`](https://github.com/reearth/reearth-web/commit/744154)
- Print errors when failed to load extensions [`35a63f`](https://github.com/reearth/reearth-web/commit/35a63f)
- Icon button transition happening when undesired ([#313](https://github.com/reearth/reearth-web/pull/313)) [`6a6d98`](https://github.com/reearth/reearth-web/commit/6a6d98)
- Icon size being too small ([#309](https://github.com/reearth/reearth-web/pull/309)) [`3574f0`](https://github.com/reearth/reearth-web/commit/3574f0)
- Change query param used by marketplace to be more concise [`9ba28c`](https://github.com/reearth/reearth-web/commit/9ba28c)
- Dashboard project name not showing ([#307](https://github.com/reearth/reearth-web/pull/307)) [`6a30f5`](https://github.com/reearth/reearth-web/commit/6a30f5)
- Plugin API update event gets called repeatedly, missing hook deps ([#306](https://github.com/reearth/reearth-web/pull/306)) [`47ec24`](https://github.com/reearth/reearth-web/commit/47ec24)
- Update cesium to 1.97.0 [`4d993a`](https://github.com/reearth/reearth-web/commit/4d993a)
- Play button does not work and some unexpected style on timeline widget ([#305](https://github.com/reearth/reearth-web/pull/305)) [`ce29a5`](https://github.com/reearth/reearth-web/commit/ce29a5)
- Development error occurs when updating or DnD layers ([#299](https://github.com/reearth/reearth-web/pull/299)) [`efd079`](https://github.com/reearth/reearth-web/commit/efd079)
- Project creation not creating a scene before earth editor becoming accessible [`a0a03e`](https://github.com/reearth/reearth-web/commit/a0a03e)
- Device settings menu icon getting squished ([#298](https://github.com/reearth/reearth-web/pull/298)) [`91c312`](https://github.com/reearth/reearth-web/commit/91c312)
- Remove unused GraphQL calls [`59f402`](https://github.com/reearth/reearth-web/commit/59f402)

### 🎨 Styling

- Update button and icon UX [`75e6f4`](https://github.com/reearth/reearth-web/commit/75e6f4)

### Miscellaneous Tasks

- Update dependency cesium to v1.97.0 ([#291](https://github.com/reearth/reearth-web/pull/291)) [`dcdf93`](https://github.com/reearth/reearth-web/commit/dcdf93)
- Add remaining props to plugin settings extensions ([#312](https://github.com/reearth/reearth-web/pull/312)) [`893d32`](https://github.com/reearth/reearth-web/commit/893d32)
- Plugin component supports modalContainer and popupContainer props ([#300](https://github.com/reearth/reearth-web/pull/300)) [`fc5f58`](https://github.com/reearth/reearth-web/commit/fc5f58)
- Update cesium to v1.96 ([#303](https://github.com/reearth/reearth-web/pull/303)) [`4fc241`](https://github.com/reearth/reearth-web/commit/4fc241)

## 0.10.0 - 2022-08-10

### 🚀 Features

- Add mouse events to plugin API ([#280](https://github.com/reearth/reearth-web/pull/280)) [`9445f0`](https://github.com/reearth/reearth-web/commit/9445f0)

### 🔧 Bug Fixes

- Select not working after pinch event on ipad ([#290](https://github.com/reearth/reearth-web/pull/290)) [`821504`](https://github.com/reearth/reearth-web/commit/821504)
- Translation for modal buttons [`7eead9`](https://github.com/reearth/reearth-web/commit/7eead9)
- Plugin widget&[#39](https://github.com/reearth/reearth-web/pull/39);s width using iframe&[#39](https://github.com/reearth/reearth-web/pull/39);s default ([#283](https://github.com/reearth/reearth-web/pull/283)) [`572da0`](https://github.com/reearth/reearth-web/commit/572da0)
- Pointer events issues around widgets ([#279](https://github.com/reearth/reearth-web/pull/279)) [`219ea4`](https://github.com/reearth/reearth-web/commit/219ea4)

### 🎨 Styling

- Fix icons of plugin install buttons ([#289](https://github.com/reearth/reearth-web/pull/289)) [`af7a1b`](https://github.com/reearth/reearth-web/commit/af7a1b)

### 🧪 Testing

- Introduce vitest ([#284](https://github.com/reearth/reearth-web/pull/284)) [`2152e0`](https://github.com/reearth/reearth-web/commit/2152e0)

### Miscellaneous Tasks

- Migrate to Vite, upgrade Cypress to v10 ([#287](https://github.com/reearth/reearth-web/pull/287)) [`50f2b6`](https://github.com/reearth/reearth-web/commit/50f2b6)
- Simplify ESLint config ([#282](https://github.com/reearth/reearth-web/pull/282)) [`b3570a`](https://github.com/reearth/reearth-web/commit/b3570a)
- Upgrade resium to v1.15.0 ([#281](https://github.com/reearth/reearth-web/pull/281)) [`bd3968`](https://github.com/reearth/reearth-web/commit/bd3968)
- Cosme changelog [`05084e`](https://github.com/reearth/reearth-web/commit/05084e)
- Fix changelog [`48de86`](https://github.com/reearth/reearth-web/commit/48de86)

## 0.9.0 - 2022-07-20

### 🚀 Features

- Plugin API to add layers ([#258](https://github.com/reearth/reearth-web/pull/258)) [`6468e2`](https://github.com/reearth/reearth-web/commit/6468e2)
- Change layer indicators from preset list ([#245](https://github.com/reearth/reearth-web/pull/245)) [`db185e`](https://github.com/reearth/reearth-web/commit/db185e)

### 🔧 Bug Fixes

- Some menu not displayed at sidebar in proejct setting page [`7c0705`](https://github.com/reearth/reearth-web/commit/7c0705)
- Nothing displayed at project setting page when there are many projects [`0a6744`](https://github.com/reearth/reearth-web/commit/0a6744)
- Plugins do not work as expected, update quickjs-emscripten ([#276](https://github.com/reearth/reearth-web/pull/276)) [`9336e6`](https://github.com/reearth/reearth-web/commit/9336e6)
- Plugin editor changes do not take effect until run button is clicked ([#274](https://github.com/reearth/reearth-web/pull/274)) [`39fdb2`](https://github.com/reearth/reearth-web/commit/39fdb2)
- Storytelling widget does not get layers&[#39](https://github.com/reearth/reearth-web/pull/39); title ([#273](https://github.com/reearth/reearth-web/pull/273)) [`5ff72b`](https://github.com/reearth/reearth-web/commit/5ff72b)
- Dataset icon not showing in layer list ([#275](https://github.com/reearth/reearth-web/pull/275)) [`8dbc88`](https://github.com/reearth/reearth-web/commit/8dbc88)
- Show full camera values in camera property field popup ([#270](https://github.com/reearth/reearth-web/pull/270)) [`7d3eac`](https://github.com/reearth/reearth-web/commit/7d3eac)
- Plugin dimensions and iframe issues ([#271](https://github.com/reearth/reearth-web/pull/271)) [`f3a52a`](https://github.com/reearth/reearth-web/commit/f3a52a)
- Camera jump not working ([#269](https://github.com/reearth/reearth-web/pull/269)) [`48bbfe`](https://github.com/reearth/reearth-web/commit/48bbfe)
- Layer select state not update properly ([#268](https://github.com/reearth/reearth-web/pull/268)) [`5f7c69`](https://github.com/reearth/reearth-web/commit/5f7c69)
- Unselect layer not work properly ([#266](https://github.com/reearth/reearth-web/pull/266)) [`eb41da`](https://github.com/reearth/reearth-web/commit/eb41da)
- Layer drag and drop does not work with indicators ([#265](https://github.com/reearth/reearth-web/pull/265)) [`12ae04`](https://github.com/reearth/reearth-web/commit/12ae04)
- Testing-library react 18 warnings ([#263](https://github.com/reearth/reearth-web/pull/263)) [`4c9076`](https://github.com/reearth/reearth-web/commit/4c9076)
- Auto fetch more items in dashboard page , project list , dataset page for big screens ([#255](https://github.com/reearth/reearth-web/pull/255)) [`fb8bf9`](https://github.com/reearth/reearth-web/commit/fb8bf9)
- Asset modal flushes when camera limiter is enabled ([#261](https://github.com/reearth/reearth-web/pull/261)) [`204629`](https://github.com/reearth/reearth-web/commit/204629)
- Not being able to override an image from the asset modal ([#260](https://github.com/reearth/reearth-web/pull/260)) [`1d3c3f`](https://github.com/reearth/reearth-web/commit/1d3c3f)
- Layers pane does not update after move layer or create folder  ([#259](https://github.com/reearth/reearth-web/pull/259)) [`336d98`](https://github.com/reearth/reearth-web/commit/336d98)
- Cesium flashes on camera change ([#257](https://github.com/reearth/reearth-web/pull/257)) [`ad2c0e`](https://github.com/reearth/reearth-web/commit/ad2c0e)
- Router typos ([#252](https://github.com/reearth/reearth-web/pull/252)) [`19fcb6`](https://github.com/reearth/reearth-web/commit/19fcb6)
- Dataset page showing errors on page refreshing  ([#253](https://github.com/reearth/reearth-web/pull/253)) [`3f48e9`](https://github.com/reearth/reearth-web/commit/3f48e9)

### 🧪 Testing

- Fix test coverage target ([#272](https://github.com/reearth/reearth-web/pull/272)) [`b9db10`](https://github.com/reearth/reearth-web/commit/b9db10)

### Miscellaneous Tasks

- Update dependency cesium to ^1.95.0 ([#262](https://github.com/reearth/reearth-web/pull/262)) [`845e2a`](https://github.com/reearth/reearth-web/commit/845e2a)
- Upgrade cesium [`363071`](https://github.com/reearth/reearth-web/commit/363071)
- Upgrade to React 18 and switch to React Router ([#234](https://github.com/reearth/reearth-web/pull/234)) [`b0e8e6`](https://github.com/reearth/reearth-web/commit/b0e8e6)

## 0.8.0 - 2022-06-17

### 🚀 Features

- Add a basic timeline UI ([#232](https://github.com/reearth/reearth-web/pull/232)) [`fc9732`](https://github.com/reearth/reearth-web/commit/fc9732)
- Add infinite scroll for project lists and datasets in dashboard and setting pages ([#225](https://github.com/reearth/reearth-web/pull/225)) [`28d377`](https://github.com/reearth/reearth-web/commit/28d377)
- Adapt camera field to support 2d mode ([#233](https://github.com/reearth/reearth-web/pull/233)) [`172de5`](https://github.com/reearth/reearth-web/commit/172de5)
- Add scene property overriding to Re:Earth API ([#224](https://github.com/reearth/reearth-web/pull/224)) [`b07603`](https://github.com/reearth/reearth-web/commit/b07603)

### 🔧 Bug Fixes

- Some plugin APIs were missing ([#248](https://github.com/reearth/reearth-web/pull/248)) [`c83262`](https://github.com/reearth/reearth-web/commit/c83262)
- Slight shift when capture a new position ([#246](https://github.com/reearth/reearth-web/pull/246)) [`182406`](https://github.com/reearth/reearth-web/commit/182406)
- Dataset counts are displayed incorrectly in dataset pane ([#235](https://github.com/reearth/reearth-web/pull/235)) [`45a0c8`](https://github.com/reearth/reearth-web/commit/45a0c8)
- Labeling hidden by marker symbol ([#238](https://github.com/reearth/reearth-web/pull/238)) [`99c378`](https://github.com/reearth/reearth-web/commit/99c378)
- Vertical position style in infobox image block ([#236](https://github.com/reearth/reearth-web/pull/236)) [`647cf8`](https://github.com/reearth/reearth-web/commit/647cf8)
- Unexpected values for theme and lang props of extension components [`723486`](https://github.com/reearth/reearth-web/commit/723486)
- Wait until all extensions are loaded [`dfe2aa`](https://github.com/reearth/reearth-web/commit/dfe2aa)
- Iframe not correctly sizing to plugin ([#230](https://github.com/reearth/reearth-web/pull/230)) [`500ce8`](https://github.com/reearth/reearth-web/commit/500ce8)
- Plugin API cameramove event is not emitted in published pages ([#227](https://github.com/reearth/reearth-web/pull/227)) [`7a11b3`](https://github.com/reearth/reearth-web/commit/7a11b3)

### ✨ Refactor

- Migrate to react-intl from react-i18next ([#240](https://github.com/reearth/reearth-web/pull/240)) [`404743`](https://github.com/reearth/reearth-web/commit/404743)

### 🧪 Testing

- Disable util/raf tests that do not always succeed [`45a450`](https://github.com/reearth/reearth-web/commit/45a450)
- Fix unit test for utils/raf [`a060d9`](https://github.com/reearth/reearth-web/commit/a060d9)
- Fix Cypress login test fails ([#241](https://github.com/reearth/reearth-web/pull/241)) [`a5dbfb`](https://github.com/reearth/reearth-web/commit/a5dbfb)

### Miscellaneous Tasks

- Upgrade dependency cesium-dnd to 1.1.0 ([#244](https://github.com/reearth/reearth-web/pull/244)) [`ba6b51`](https://github.com/reearth/reearth-web/commit/ba6b51)
- Fix typos [`f98005`](https://github.com/reearth/reearth-web/commit/f98005)
- Update config so extensionUrls can be declared in .env file for local development ([#237](https://github.com/reearth/reearth-web/pull/237)) [`545b9e`](https://github.com/reearth/reearth-web/commit/545b9e)

## 0.7.0 - 2022-05-16

### 🚀 Features

- Implementation of the avatar feature in workspaces screens ([#206](https://github.com/reearth/reearth-web/pull/206)) [`42d7aa`](https://github.com/reearth/reearth-web/commit/42d7aa)
- Update placehoder for color field ([#215](https://github.com/reearth/reearth-web/pull/215)) [`c6c6e3`](https://github.com/reearth/reearth-web/commit/c6c6e3)
- Add opacity field to map tiles ([#220](https://github.com/reearth/reearth-web/pull/220)) [`006a8d`](https://github.com/reearth/reearth-web/commit/006a8d)

### 🔧 Bug Fixes

- Dropdown styles in right panel break when selected item's name is too long [`9a5993`](https://github.com/reearth/reearth-web/commit/9a5993)
- Dashboard not updating on project creation [`4b5478`](https://github.com/reearth/reearth-web/commit/4b5478)
- Query names in refetchQueries not updated ([#222](https://github.com/reearth/reearth-web/pull/222)) [`711712`](https://github.com/reearth/reearth-web/commit/711712)
- Published page uses GraphQL and reports errors [`3e3e45`](https://github.com/reearth/reearth-web/commit/3e3e45)

### ✨ Refactor

- Queries/mutation code into a single directory ([#208](https://github.com/reearth/reearth-web/pull/208)) [`2afc16`](https://github.com/reearth/reearth-web/commit/2afc16)
- Property, scene, tag, user, widget and workspace gql query files ([#221](https://github.com/reearth/reearth-web/pull/221)) [`3bf421`](https://github.com/reearth/reearth-web/commit/3bf421)

### Miscellaneous Tasks

- Introduce i18next ([#212](https://github.com/reearth/reearth-web/pull/212)) [`0ac0c2`](https://github.com/reearth/reearth-web/commit/0ac0c2)
- Add reference to style guide in README [`e29024`](https://github.com/reearth/reearth-web/commit/e29024)
- Add useT hook to i18n ([#223](https://github.com/reearth/reearth-web/pull/223)) [`b96177`](https://github.com/reearth/reearth-web/commit/b96177)
- Update dependency cesium to ^1.93.0 ([#216](https://github.com/reearth/reearth-web/pull/216)) [`06b563`](https://github.com/reearth/reearth-web/commit/06b563)
- Update all dependencies ([#226](https://github.com/reearth/reearth-web/pull/226)) [`36fb79`](https://github.com/reearth/reearth-web/commit/36fb79)

### Refactor

- Clean gql pt1 asset ([#217](https://github.com/reearth/reearth-web/pull/217)) [`b88a8c`](https://github.com/reearth/reearth-web/commit/b88a8c)
- Cluster, dataset, infobox, layer, plugin and project gql query files ([#219](https://github.com/reearth/reearth-web/pull/219)) [`e4dae9`](https://github.com/reearth/reearth-web/commit/e4dae9)

## 0.6.1 - 2022-04-20

### 🚀 Features

- Extend project publish settings and dataset import modal functionality through extension API ([#200](https://github.com/reearth/reearth-web/pull/200)) [`96aa56`](https://github.com/reearth/reearth-web/commit/96aa56)

### 🔧 Bug Fixes

- Redirect after esc button in any setting page ([#193](https://github.com/reearth/reearth-web/pull/193)) [`c8ec35`](https://github.com/reearth/reearth-web/commit/c8ec35)

### Miscellaneous Tasks

- Follow GraphQL schema updates ([#209](https://github.com/reearth/reearth-web/pull/209)) [`8d9e75`](https://github.com/reearth/reearth-web/commit/8d9e75)
- Update all dependencies ([#210](https://github.com/reearth/reearth-web/pull/210)) [`c22b7a`](https://github.com/reearth/reearth-web/commit/c22b7a)

## 0.6.0 - 2022-04-08

### 🚀 Features

- Add a plugin API to resize iframe by plugins ([#181](https://github.com/reearth/reearth-web/pull/181)) [`7c1019`](https://github.com/reearth/reearth-web/commit/7c1019)
- Authentication ([#121](https://github.com/reearth/reearth-web/pull/121)) [`b63018`](https://github.com/reearth/reearth-web/commit/b63018)
- Infinite scroll on assets ([#130](https://github.com/reearth/reearth-web/pull/130)) [`11f2f2`](https://github.com/reearth/reearth-web/commit/11f2f2)
- Basic plugin editor ([#184](https://github.com/reearth/reearth-web/pull/184)) [`1c4e09`](https://github.com/reearth/reearth-web/commit/1c4e09)

### 🔧 Bug Fixes

- Unable to type RGBA values ([#180](https://github.com/reearth/reearth-web/pull/180)) [`f7345c`](https://github.com/reearth/reearth-web/commit/f7345c)
- Small height of block plugins [`8070a3`](https://github.com/reearth/reearth-web/commit/8070a3)
- Button widget squishing its text & infobox mask click away ([#185](https://github.com/reearth/reearth-web/pull/185)) [`ac7ef0`](https://github.com/reearth/reearth-web/commit/ac7ef0)
- Cannot select layers that activate infobox mask ([#186](https://github.com/reearth/reearth-web/pull/186)) [`d824b6`](https://github.com/reearth/reearth-web/commit/d824b6)
- Display error messages from auth server ([#187](https://github.com/reearth/reearth-web/pull/187)) [`e19fab`](https://github.com/reearth/reearth-web/commit/e19fab)
- Duplicate asset results ([#188](https://github.com/reearth/reearth-web/pull/188)) [`b3eb7f`](https://github.com/reearth/reearth-web/commit/b3eb7f)
- Workspace name cannot be changed, error displayed when deleting assets ([#189](https://github.com/reearth/reearth-web/pull/189)) [`a99cf3`](https://github.com/reearth/reearth-web/commit/a99cf3)
- Multiple assets in infinite scroll and datasets not showing in DatasetPane  ([#192](https://github.com/reearth/reearth-web/pull/192)) [`6f5c93`](https://github.com/reearth/reearth-web/commit/6f5c93)
- Asset modal showing only image-based assets ([#196](https://github.com/reearth/reearth-web/pull/196)) [`83a6bf`](https://github.com/reearth/reearth-web/commit/83a6bf)
- Screen becomes inoperable when errors occur in sign up [`820a04`](https://github.com/reearth/reearth-web/commit/820a04)
- Add missing translations [`a4c237`](https://github.com/reearth/reearth-web/commit/a4c237)

### Miscellaneous Tasks

- Update dependency cesium to ^1.91.0 ([#182](https://github.com/reearth/reearth-web/pull/182)) [`603a5c`](https://github.com/reearth/reearth-web/commit/603a5c)
- Set default auth config to start app with zero configuration ([#191](https://github.com/reearth/reearth-web/pull/191)) [`d5a2aa`](https://github.com/reearth/reearth-web/commit/d5a2aa)

## 0.5.0 - 2022-02-24

### 🚀 Features

- Allowing widget and block plugins to resize when they are expandable ([#170](https://github.com/reearth/reearth-web/pull/170)) [`4fdf5f`](https://github.com/reearth/reearth-web/commit/4fdf5f)
- Plugin APIs to get camera viewport and layers in the viewport ([#165](https://github.com/reearth/reearth-web/pull/165)) [`f1f95a`](https://github.com/reearth/reearth-web/commit/f1f95a)
- Improving the Infobox style  ([#176](https://github.com/reearth/reearth-web/pull/176)) [`f1ddda`](https://github.com/reearth/reearth-web/commit/f1ddda)

### 🔧 Bug Fixes

- Plugin blocks cannot be deleted ([#164](https://github.com/reearth/reearth-web/pull/164)) [`a4f17f`](https://github.com/reearth/reearth-web/commit/a4f17f)
- Support tree-structured layers and tags in published pages ([#168](https://github.com/reearth/reearth-web/pull/168)) [`17d968`](https://github.com/reearth/reearth-web/commit/17d968)
- Workspace settings does not refresh ([#167](https://github.com/reearth/reearth-web/pull/167)) [`0f3654`](https://github.com/reearth/reearth-web/commit/0f3654)
- Plugin layersInViewport API returns errors for layers that have no location fields [`e52b44`](https://github.com/reearth/reearth-web/commit/e52b44)

### ✨ Refactor

- Format codes [`219ac6`](https://github.com/reearth/reearth-web/commit/219ac6)
- Format codes [`4e5b61`](https://github.com/reearth/reearth-web/commit/4e5b61)

### Miscellaneous Tasks

- Upgrade dependencies ([#175](https://github.com/reearth/reearth-web/pull/175)) [`dba959`](https://github.com/reearth/reearth-web/commit/dba959)

## 0.4.0 - 2022-01-27

### 🚀 Features

- Add "clamp to filed" option to file primitive ([#155](https://github.com/reearth/reearth-web/pull/155)) [`2e83ba`](https://github.com/reearth/reearth-web/commit/2e83ba)
- Infobox padding ([#158](https://github.com/reearth/reearth-web/pull/158)) [`90084f`](https://github.com/reearth/reearth-web/commit/90084f)
- Support tags in plugin API ([#153](https://github.com/reearth/reearth-web/pull/153)) [`1031c5`](https://github.com/reearth/reearth-web/commit/1031c5)

### 🔧 Bug Fixes

- Enable to select blocks of plugins ([#162](https://github.com/reearth/reearth-web/pull/162)) [`458402`](https://github.com/reearth/reearth-web/commit/458402)
- Cesium Ion acces token is not set expectedly ([#160](https://github.com/reearth/reearth-web/pull/160)) [`e8e183`](https://github.com/reearth/reearth-web/commit/e8e183)
- Cluster styling issue ([#161](https://github.com/reearth/reearth-web/pull/161)) [`c78872`](https://github.com/reearth/reearth-web/commit/c78872)
- Clusters and layers are not displayed correctly [`4fc124`](https://github.com/reearth/reearth-web/commit/4fc124)
- Type error [`b01bc7`](https://github.com/reearth/reearth-web/commit/b01bc7)
- The style of infobox block dropdown list is broken ([#163](https://github.com/reearth/reearth-web/pull/163)) [`6e02a9`](https://github.com/reearth/reearth-web/commit/6e02a9)
- Plugin blocks protrude from the infobox [`6cf0d3`](https://github.com/reearth/reearth-web/commit/6cf0d3)

### ✨ Refactor

- Layer clustering feature ([#157](https://github.com/reearth/reearth-web/pull/157)) [`db6e6c`](https://github.com/reearth/reearth-web/commit/db6e6c)
- Camera limiter ([#149](https://github.com/reearth/reearth-web/pull/149)) [`105428`](https://github.com/reearth/reearth-web/commit/105428)
- Layer clustering feature (GraphQL) ([#159](https://github.com/reearth/reearth-web/pull/159)) [`4365b8`](https://github.com/reearth/reearth-web/commit/4365b8)

## 0.3.0 - 2022-01-11

### 🚀 Features

- Enhance terrain feature (type selection, exaggeration) ([#138](https://github.com/reearth/reearth-web/pull/138)) [`dae137`](https://github.com/reearth/reearth-web/commit/dae137)
- Clustering layers ([#143](https://github.com/reearth/reearth-web/pull/143)) [`3439cc`](https://github.com/reearth/reearth-web/commit/3439cc)
- Camera limiter ([#142](https://github.com/reearth/reearth-web/pull/142)) [`dec1dd`](https://github.com/reearth/reearth-web/commit/dec1dd)
- Tagging of layers ([#144](https://github.com/reearth/reearth-web/pull/144)) [`4d0a40`](https://github.com/reearth/reearth-web/commit/4d0a40)

### 🔧 Bug Fixes

- Indicator is not displayed on selecting of clustered layer ([#146](https://github.com/reearth/reearth-web/pull/146)) [`e41f67`](https://github.com/reearth/reearth-web/commit/e41f67)
- Use data URL for marker images [`576ea4`](https://github.com/reearth/reearth-web/commit/576ea4)
- Layer clusters do not updated correctly [`ec74f6`](https://github.com/reearth/reearth-web/commit/ec74f6)
- Position label in front of billboard ([#147](https://github.com/reearth/reearth-web/pull/147)) [`81c533`](https://github.com/reearth/reearth-web/commit/81c533)
- Public pages do not work due to clustering feature [`48d8b3`](https://github.com/reearth/reearth-web/commit/48d8b3)
- Photooverlay transition does not work in Android ([#154](https://github.com/reearth/reearth-web/pull/154)) [`decbfe`](https://github.com/reearth/reearth-web/commit/decbfe)

### 🎨 Styling

- Fix the height of the header [`9d6acc`](https://github.com/reearth/reearth-web/commit/9d6acc)

### Miscellaneous Tasks

- Upgrade dependencies ([#134](https://github.com/reearth/reearth-web/pull/134)) [`740821`](https://github.com/reearth/reearth-web/commit/740821)
- Update dependency cesium to ^1.88.0 ([#139](https://github.com/reearth/reearth-web/pull/139)) [`7afdfb`](https://github.com/reearth/reearth-web/commit/7afdfb)
- Fix webpack dev server config [`8d06fa`](https://github.com/reearth/reearth-web/commit/8d06fa)
- Update dependency cesium to ^1.89.0 ([#156](https://github.com/reearth/reearth-web/pull/156)) [`d436ce`](https://github.com/reearth/reearth-web/commit/d436ce)

## 0.2.0 - 2021-11-18

### 🚀 Features

- Widget align system for mobile ([#115](https://github.com/reearth/reearth-web/pull/115)) [`afa4ba`](https://github.com/reearth/reearth-web/commit/afa4ba)
- Support dataset schema preview and create layer group from selected primitive type ([#74](https://github.com/reearth/reearth-web/pull/74)) [`769b86`](https://github.com/reearth/reearth-web/commit/769b86)

### 🔧 Bug Fixes

- Markdown background color is not transparent ([#123](https://github.com/reearth/reearth-web/pull/123)) [`f16706`](https://github.com/reearth/reearth-web/commit/f16706)
- Layers would not be marshalled correctly ([#126](https://github.com/reearth/reearth-web/pull/126)) [`886302`](https://github.com/reearth/reearth-web/commit/886302)
- Widget align system issues ([#124](https://github.com/reearth/reearth-web/pull/124)) [`3bc9fa`](https://github.com/reearth/reearth-web/commit/3bc9fa)
- Project setting page does not display correctly after creating a new project ([#127](https://github.com/reearth/reearth-web/pull/127)) [`c120dc`](https://github.com/reearth/reearth-web/commit/c120dc)
- Dataset info pane shows its property though after selected dataset schema is deleted ([#131](https://github.com/reearth/reearth-web/pull/131)) [`2307d8`](https://github.com/reearth/reearth-web/commit/2307d8)

### Miscellaneous Tasks

- Disable storybook workflow for release commit [`80f4d2`](https://github.com/reearth/reearth-web/commit/80f4d2)
- Change semantic commit type of renovate PRs, omit ci skip in changelog [`4a3e9e`](https://github.com/reearth/reearth-web/commit/4a3e9e)
- Follow backend GraphQL schema update ([#120](https://github.com/reearth/reearth-web/pull/120)) [`aeee1f`](https://github.com/reearth/reearth-web/commit/aeee1f)
- Load local reearth-config.json for debugging ([#119](https://github.com/reearth/reearth-web/pull/119)) [`6115ee`](https://github.com/reearth/reearth-web/commit/6115ee)
- Update dependency cesium to ^1.87.0 ([#118](https://github.com/reearth/reearth-web/pull/118)) [`7c65d0`](https://github.com/reearth/reearth-web/commit/7c65d0)
- Update dependency cesium to ^1.87.1 ([#128](https://github.com/reearth/reearth-web/pull/128)) [`a63aa7`](https://github.com/reearth/reearth-web/commit/a63aa7)
- Update codecov.yml to add ignored files [`b72f17`](https://github.com/reearth/reearth-web/commit/b72f17)

## 0.1.0 - 2021-11-01

### 🚀 Features

- Support Auth0 audience ([#2](https://github.com/reearth/reearth-web/pull/2)) [`0ad0f6`](https://github.com/reearth/reearth-web/commit/0ad0f6)
- Asset modal redesign ([#1](https://github.com/reearth/reearth-web/pull/1)) [`f71117`](https://github.com/reearth/reearth-web/commit/f71117)
- Basic auth for projects ([#3](https://github.com/reearth/reearth-web/pull/3)) [`372c4e`](https://github.com/reearth/reearth-web/commit/372c4e)
- Google analytics ([#6](https://github.com/reearth/reearth-web/pull/6)) [`01aadf`](https://github.com/reearth/reearth-web/commit/01aadf)
- Refine setting page ([#19](https://github.com/reearth/reearth-web/pull/19)) [`d06ee7`](https://github.com/reearth/reearth-web/commit/d06ee7)
- Add  delete assets confirm modal and fix bugs ([#25](https://github.com/reearth/reearth-web/pull/25)) [`0310f5`](https://github.com/reearth/reearth-web/commit/0310f5)
- Update link system and UI ([#12](https://github.com/reearth/reearth-web/pull/12)) [`51de77`](https://github.com/reearth/reearth-web/commit/51de77)
- Import google sheet dataset ([#14](https://github.com/reearth/reearth-web/pull/14)) [`21b167`](https://github.com/reearth/reearth-web/commit/21b167)
- Support multi-line infobox titles ([#40](https://github.com/reearth/reearth-web/pull/40)) [`4cddcc`](https://github.com/reearth/reearth-web/commit/4cddcc)
- Public settings page ([#32](https://github.com/reearth/reearth-web/pull/32)) [`ebfd41`](https://github.com/reearth/reearth-web/commit/ebfd41)
- Refine readme ([#51](https://github.com/reearth/reearth-web/pull/51)) [`41ddb3`](https://github.com/reearth/reearth-web/commit/41ddb3)
- Add light theme ([#52](https://github.com/reearth/reearth-web/pull/52)) [`26159b`](https://github.com/reearth/reearth-web/commit/26159b)
- Add a short discription for light theme ([#56](https://github.com/reearth/reearth-web/pull/56)) [`8b092d`](https://github.com/reearth/reearth-web/commit/8b092d)
- Plugins settings page, install/uninstall plugins ([#22](https://github.com/reearth/reearth-web/pull/22)) [`018674`](https://github.com/reearth/reearth-web/commit/018674)
- Plugin system, refactoring visualizer ([#50](https://github.com/reearth/reearth-web/pull/50)) [`172939`](https://github.com/reearth/reearth-web/commit/172939)
- 3D tileset, model, rectangle primitive, more properties for marker and scene ([#63](https://github.com/reearth/reearth-web/pull/63)) [`a88600`](https://github.com/reearth/reearth-web/commit/a88600)
- Graphiql page ([#70](https://github.com/reearth/reearth-web/pull/70)) [`aa5d10`](https://github.com/reearth/reearth-web/commit/aa5d10)
- Enable to set theme for the scene ([#67](https://github.com/reearth/reearth-web/pull/67)) [`58e670`](https://github.com/reearth/reearth-web/commit/58e670)
- Notification system update ([#73](https://github.com/reearth/reearth-web/pull/73)) [`92cdbb`](https://github.com/reearth/reearth-web/commit/92cdbb)
- Widget align system ([#61](https://github.com/reearth/reearth-web/pull/61)) [`ed2940`](https://github.com/reearth/reearth-web/commit/ed2940)
- Plugin system beta ([#87](https://github.com/reearth/reearth-web/pull/87)) [`d76f1c`](https://github.com/reearth/reearth-web/commit/d76f1c)
- Enhance extended field of widget in plugin API ([#90](https://github.com/reearth/reearth-web/pull/90)) [`06cb14`](https://github.com/reearth/reearth-web/commit/06cb14)
- Add overrideProperty to plugin layers API ([#92](https://github.com/reearth/reearth-web/pull/92)) [`563f88`](https://github.com/reearth/reearth-web/commit/563f88)
- Add a fallback icon for extensions that do not have an icon ([#98](https://github.com/reearth/reearth-web/pull/98)) [`50de1f`](https://github.com/reearth/reearth-web/commit/50de1f)
- Add password validation ([#86](https://github.com/reearth/reearth-web/pull/86)) [`2017aa`](https://github.com/reearth/reearth-web/commit/2017aa)
- Draggable layer ([#58](https://github.com/reearth/reearth-web/pull/58)) [`25a217`](https://github.com/reearth/reearth-web/commit/25a217)
- Multi widgets ([#99](https://github.com/reearth/reearth-web/pull/99)) [`bea1a3`](https://github.com/reearth/reearth-web/commit/bea1a3)
- Front-end for new authentication system ([#102](https://github.com/reearth/reearth-web/pull/102)) [`964d92`](https://github.com/reearth/reearth-web/commit/964d92)
- Add layers.overriddenProperties, find, findAll, walk ([#110](https://github.com/reearth/reearth-web/pull/110)) [`ebe131`](https://github.com/reearth/reearth-web/commit/ebe131)

### 🔧 Bug Fixes

- Reorganize config [`f2e947`](https://github.com/reearth/reearth-web/commit/f2e947)
- Update gql schema [`0905b6`](https://github.com/reearth/reearth-web/commit/0905b6)
- Update dependency cesium to ^1.82.1 ([#4](https://github.com/reearth/reearth-web/pull/4)) [`0627bf`](https://github.com/reearth/reearth-web/commit/0627bf)
- Google analytics ([#7](https://github.com/reearth/reearth-web/pull/7)) [`7505ca`](https://github.com/reearth/reearth-web/commit/7505ca)
- Sprint15 bugs ([#8](https://github.com/reearth/reearth-web/pull/8)) [`e2fe0a`](https://github.com/reearth/reearth-web/commit/e2fe0a)
- Google analytics typo ([#9](https://github.com/reearth/reearth-web/pull/9)) [`943b5e`](https://github.com/reearth/reearth-web/commit/943b5e)
- Ga-typo2 ([#10](https://github.com/reearth/reearth-web/pull/10)) [`b498de`](https://github.com/reearth/reearth-web/commit/b498de)
- Force logout when me query returns null ([#15](https://github.com/reearth/reearth-web/pull/15)) [`339d61`](https://github.com/reearth/reearth-web/commit/339d61)
- Infinit logout loop ([#17](https://github.com/reearth/reearth-web/pull/17)) [`0d510f`](https://github.com/reearth/reearth-web/commit/0d510f)
- Change data.json path [`38a69a`](https://github.com/reearth/reearth-web/commit/38a69a)
- Menu button width ([#21](https://github.com/reearth/reearth-web/pull/21)) [`d08eba`](https://github.com/reearth/reearth-web/commit/d08eba)
- Menu widget bugs ([#37](https://github.com/reearth/reearth-web/pull/37)) [`5d5483`](https://github.com/reearth/reearth-web/commit/5d5483)
- Marker label position is oposite to actual display ([#39](https://github.com/reearth/reearth-web/pull/39)) [`38de46`](https://github.com/reearth/reearth-web/commit/38de46)
- Disable default cesium mouse event ([#42](https://github.com/reearth/reearth-web/pull/42)) [`129ae3`](https://github.com/reearth/reearth-web/commit/129ae3)
- Show layers in storytelling without names ([#45](https://github.com/reearth/reearth-web/pull/45)) [`00ae3c`](https://github.com/reearth/reearth-web/commit/00ae3c)
- Infobox colors ([#47](https://github.com/reearth/reearth-web/pull/47)) [`2a6a36`](https://github.com/reearth/reearth-web/commit/2a6a36)
- Project public image ([#48](https://github.com/reearth/reearth-web/pull/48)) [`91b5ee`](https://github.com/reearth/reearth-web/commit/91b5ee)
- Auth0 redirect uri [`8336a3`](https://github.com/reearth/reearth-web/commit/8336a3)
- Storybook ([#54](https://github.com/reearth/reearth-web/pull/54)) [`fde0c0`](https://github.com/reearth/reearth-web/commit/fde0c0)
- Published data url [`e3d5b0`](https://github.com/reearth/reearth-web/commit/e3d5b0)
- Icon background ([#64](https://github.com/reearth/reearth-web/pull/64)) [`9c69a4`](https://github.com/reearth/reearth-web/commit/9c69a4)
- Prevent extra render, cannot rename layers, cannot display infobox on dataset layers ([#65](https://github.com/reearth/reearth-web/pull/65)) [`e3d618`](https://github.com/reearth/reearth-web/commit/e3d618)
- Remove visibility icon from layer actions [`0ad8aa`](https://github.com/reearth/reearth-web/commit/0ad8aa)
- Default published url, rename layer when focus is removed from text box [`f9accc`](https://github.com/reearth/reearth-web/commit/f9accc)
- Storybook error ([#75](https://github.com/reearth/reearth-web/pull/75)) [`f27f9b`](https://github.com/reearth/reearth-web/commit/f27f9b)
- Showing members section for personal workspace ([#85](https://github.com/reearth/reearth-web/pull/85)) [`8e78f9`](https://github.com/reearth/reearth-web/commit/8e78f9)
- Widget bugs, language ([#89](https://github.com/reearth/reearth-web/pull/89)) [`9de9df`](https://github.com/reearth/reearth-web/commit/9de9df)
- Update dependency cesium to ^1.86.0 ([#93](https://github.com/reearth/reearth-web/pull/93)) [`7ca298`](https://github.com/reearth/reearth-web/commit/7ca298)
- Show properties of 3D tile features on infobox ([#95](https://github.com/reearth/reearth-web/pull/95)) [`a9cc23`](https://github.com/reearth/reearth-web/commit/a9cc23)
- Navigator.language should be used as fallback lang ([#91](https://github.com/reearth/reearth-web/pull/91)) [`15df16`](https://github.com/reearth/reearth-web/commit/15df16)
- Camera property panel bugs ([#96](https://github.com/reearth/reearth-web/pull/96)) [`2c3eaa`](https://github.com/reearth/reearth-web/commit/2c3eaa)
- Camera flight bugs ([#97](https://github.com/reearth/reearth-web/pull/97)) [`b4f1ae`](https://github.com/reearth/reearth-web/commit/b4f1ae)
- Storytelling image crop does not work [`9c23b3`](https://github.com/reearth/reearth-web/commit/9c23b3)
- Export pane is not displayed [`58ceda`](https://github.com/reearth/reearth-web/commit/58ceda)
- 1st bug hunt of october ([#100](https://github.com/reearth/reearth-web/pull/100)) [`1b9032`](https://github.com/reearth/reearth-web/commit/1b9032)
- Layers disappearing when in nested folders ([#101](https://github.com/reearth/reearth-web/pull/101)) [`778395`](https://github.com/reearth/reearth-web/commit/778395)
- Update dependency cesium to ^1.86.1 ([#103](https://github.com/reearth/reearth-web/pull/103)) [`385582`](https://github.com/reearth/reearth-web/commit/385582)
- Bug bounty #2 ([#105](https://github.com/reearth/reearth-web/pull/105)) [`da4815`](https://github.com/reearth/reearth-web/commit/da4815)
- Button widget ([#111](https://github.com/reearth/reearth-web/pull/111)) [`b93485`](https://github.com/reearth/reearth-web/commit/b93485)
- Create team redirect + translations update ([#112](https://github.com/reearth/reearth-web/pull/112)) [`bafcfd`](https://github.com/reearth/reearth-web/commit/bafcfd)
- 3d tile styles not updating sometimes ([#109](https://github.com/reearth/reearth-web/pull/109)) [`1e92b8`](https://github.com/reearth/reearth-web/commit/1e92b8)
- Layers.overrideProperty property merging and rerendering ([#108](https://github.com/reearth/reearth-web/pull/108)) [`e5c255`](https://github.com/reearth/reearth-web/commit/e5c255)
- Password policy conversion in config ([#113](https://github.com/reearth/reearth-web/pull/113)) [`5d57c4`](https://github.com/reearth/reearth-web/commit/5d57c4)
- Password validation, add autofocus ([#117](https://github.com/reearth/reearth-web/pull/117)) [`348454`](https://github.com/reearth/reearth-web/commit/348454)
- Password verification, add better feedback [`bd1725`](https://github.com/reearth/reearth-web/commit/bd1725)

### ✨ Refactor

- Use jotai instead of redux ([#68](https://github.com/reearth/reearth-web/pull/68)) [`ea980c`](https://github.com/reearth/reearth-web/commit/ea980c)
- Replace deprecated gql fields, pass widgetId to widget mutations ([#72](https://github.com/reearth/reearth-web/pull/72)) [`f36c86`](https://github.com/reearth/reearth-web/commit/f36c86)

### 🎨 Styling

- Refine font ([#49](https://github.com/reearth/reearth-web/pull/49)) [`8b3755`](https://github.com/reearth/reearth-web/commit/8b3755)
- Refine color vo.1 ([#59](https://github.com/reearth/reearth-web/pull/59)) [`ab7bce`](https://github.com/reearth/reearth-web/commit/ab7bce)

### 🧪 Testing

- Fix e2e test [`3bcd2d`](https://github.com/reearth/reearth-web/commit/3bcd2d)
- Fix e2e test [`b3e512`](https://github.com/reearth/reearth-web/commit/b3e512)
- Fix e2e test [`277f4e`](https://github.com/reearth/reearth-web/commit/277f4e)
- Fix e2e test [`396f71`](https://github.com/reearth/reearth-web/commit/396f71)
- Fix e2e test [`a8bd0c`](https://github.com/reearth/reearth-web/commit/a8bd0c)
- Fix e2e test [`fd7cf5`](https://github.com/reearth/reearth-web/commit/fd7cf5)
- Fix e2e test [`8c300b`](https://github.com/reearth/reearth-web/commit/8c300b)
- Fix e2e test [`ea5050`](https://github.com/reearth/reearth-web/commit/ea5050)
- Fix e2e test [`866c8c`](https://github.com/reearth/reearth-web/commit/866c8c)
- Support display name in e2e test [`0edf58`](https://github.com/reearth/reearth-web/commit/0edf58)

### Miscellaneous Tasks

- Update workflows, set up nightly release [`0ea0ff`](https://github.com/reearth/reearth-web/commit/0ea0ff)
- Fix nightly release workflow [`d7d1d3`](https://github.com/reearth/reearth-web/commit/d7d1d3)
- Fix config [`7a6ed3`](https://github.com/reearth/reearth-web/commit/7a6ed3)
- Set up cd workflows [`a6f0f5`](https://github.com/reearth/reearth-web/commit/a6f0f5)
- Fix workflows [`97ecf8`](https://github.com/reearth/reearth-web/commit/97ecf8)
- Fix workflows [`a4d451`](https://github.com/reearth/reearth-web/commit/a4d451)
- Fix workflows [`d77b53`](https://github.com/reearth/reearth-web/commit/d77b53)
- Remove unused deps [`81d0eb`](https://github.com/reearth/reearth-web/commit/81d0eb)
- Update cesium [`414b37`](https://github.com/reearth/reearth-web/commit/414b37)
- Update renovate config [`b36740`](https://github.com/reearth/reearth-web/commit/b36740)
- Use .env instead of .env.local [`0b8720`](https://github.com/reearth/reearth-web/commit/0b8720)
- Add storybook workflow [`c624bd`](https://github.com/reearth/reearth-web/commit/c624bd)
- Set up sentry ([#18](https://github.com/reearth/reearth-web/pull/18)) [`8a2d38`](https://github.com/reearth/reearth-web/commit/8a2d38)
- Testable published page ([#43](https://github.com/reearth/reearth-web/pull/43)) [`90c37d`](https://github.com/reearth/reearth-web/commit/90c37d)
- Update netlify.toml [`230e12`](https://github.com/reearth/reearth-web/commit/230e12)
- Add gql sclar types [`09fb76`](https://github.com/reearth/reearth-web/commit/09fb76)
- Update cesium and resium ([#79](https://github.com/reearth/reearth-web/pull/79)) [`c41601`](https://github.com/reearth/reearth-web/commit/c41601)
- Update eslint, enable eslint-plugin-import, perform formatting ([#82](https://github.com/reearth/reearth-web/pull/82)) [`117bab`](https://github.com/reearth/reearth-web/commit/117bab)
- Upgrade dependencies [`4924f9`](https://github.com/reearth/reearth-web/commit/4924f9)
- Fix cypress and unit test [`97f74e`](https://github.com/reearth/reearth-web/commit/97f74e)
- Support for dotenv switching ([#106](https://github.com/reearth/reearth-web/pull/106)) [`cd1974`](https://github.com/reearth/reearth-web/commit/cd1974)
- Upgrade modules oct ([#107](https://github.com/reearth/reearth-web/pull/107)) [`24c145`](https://github.com/reearth/reearth-web/commit/24c145)
- Upgrade react-align ([#116](https://github.com/reearth/reearth-web/pull/116)) [`7f4b98`](https://github.com/reearth/reearth-web/commit/7f4b98)
- Add github workflows to release [`331afb`](https://github.com/reearth/reearth-web/commit/331afb)
- Update translations + format ([#114](https://github.com/reearth/reearth-web/pull/114)) [`7f191e`](https://github.com/reearth/reearth-web/commit/7f191e)
- Lock file maintenance ([#66](https://github.com/reearth/reearth-web/pull/66)) [`6d2a2d`](https://github.com/reearth/reearth-web/commit/6d2a2d)
- Fix slack notifications in workflow [`b4fa35`](https://github.com/reearth/reearth-web/commit/b4fa35)
- Fix sed in release workflow [`f3cd74`](https://github.com/reearth/reearth-web/commit/f3cd74)

<!-- generated by git-cliff -->