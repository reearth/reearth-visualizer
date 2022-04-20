# Changelog
All notable changes to this project will be documented in this file.

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
