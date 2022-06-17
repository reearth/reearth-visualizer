# Changelog
All notable changes to this project will be documented in this file.

## 0.8.0 - 2022-06-17

### reearth-web
#### 🚀 Features

- Add a basic timeline UI ([#232](https://github.com/reearth/reearth-web/pull/232)) [`fc9732`](https://github.com/reearth/reearth-web/commit/fc9732)
- Add infinite scroll for project lists and datasets in dashboard and setting pages ([#225](https://github.com/reearth/reearth-web/pull/225)) [`28d377`](https://github.com/reearth/reearth-web/commit/28d377)
- Adapt camera field to support 2d mode ([#233](https://github.com/reearth/reearth-web/pull/233)) [`172de5`](https://github.com/reearth/reearth-web/commit/172de5)
- Add scene property overriding to Re:Earth API ([#224](https://github.com/reearth/reearth-web/pull/224)) [`b07603`](https://github.com/reearth/reearth-web/commit/b07603)

#### 🔧 Bug Fixes

- Some plugin APIs were missing ([#248](https://github.com/reearth/reearth-web/pull/248)) [`c83262`](https://github.com/reearth/reearth-web/commit/c83262)
- Slight shift when capture a new position ([#246](https://github.com/reearth/reearth-web/pull/246)) [`182406`](https://github.com/reearth/reearth-web/commit/182406)
- Dataset counts are displayed incorrectly in dataset pane ([#235](https://github.com/reearth/reearth-web/pull/235)) [`45a0c8`](https://github.com/reearth/reearth-web/commit/45a0c8)
- Labeling hidden by marker symbol ([#238](https://github.com/reearth/reearth-web/pull/238)) [`99c378`](https://github.com/reearth/reearth-web/commit/99c378)
- Vertical position style in infobox image block ([#236](https://github.com/reearth/reearth-web/pull/236)) [`647cf8`](https://github.com/reearth/reearth-web/commit/647cf8)
- Unexpected values for theme and lang props of extension components [`723486`](https://github.com/reearth/reearth-web/commit/723486)
- Wait until all extensions are loaded [`dfe2aa`](https://github.com/reearth/reearth-web/commit/dfe2aa)
- Iframe not correctly sizing to plugin ([#230](https://github.com/reearth/reearth-web/pull/230)) [`500ce8`](https://github.com/reearth/reearth-web/commit/500ce8)
- Plugin API cameramove event is not emitted in published pages ([#227](https://github.com/reearth/reearth-web/pull/227)) [`7a11b3`](https://github.com/reearth/reearth-web/commit/7a11b3)

#### ✨ Refactor

- Migrate to react-intl from react-i18next ([#240](https://github.com/reearth/reearth-web/pull/240)) [`404743`](https://github.com/reearth/reearth-web/commit/404743)

#### 🧪 Testing

- Disable util/raf tests that do not always succeed [`45a450`](https://github.com/reearth/reearth-web/commit/45a450)
- Fix unit test for utils/raf [`a060d9`](https://github.com/reearth/reearth-web/commit/a060d9)
- Fix Cypress login test fails ([#241](https://github.com/reearth/reearth-web/pull/241)) [`a5dbfb`](https://github.com/reearth/reearth-web/commit/a5dbfb)

#### Miscellaneous Tasks

- Upgrade dependency cesium-dnd to 1.1.0 ([#244](https://github.com/reearth/reearth-web/pull/244)) [`ba6b51`](https://github.com/reearth/reearth-web/commit/ba6b51)
- Fix typos [`f98005`](https://github.com/reearth/reearth-web/commit/f98005)
- Update config so extensionUrls can be declared in .env file for local development ([#237](https://github.com/reearth/reearth-web/pull/237)) [`545b9e`](https://github.com/reearth/reearth-web/commit/545b9e)
### reearth-backend
#### 🚀 Features

- Add totalCount field to DatasetSchema type of GraphQL schema ([#154](https://github.com/reearth/reearth-backend/pull/154)) [`ab6334`](https://github.com/reearth/reearth-backend/commit/ab6334)
- Add timeline settings to scene property ([#153](https://github.com/reearth/reearth-backend/pull/153)) [`602ec0`](https://github.com/reearth/reearth-backend/commit/602ec0)

#### 🔧 Bug Fixes

- Assets are not saved when files are uploaded ([#155](https://github.com/reearth/reearth-backend/pull/155)) [`e444e4`](https://github.com/reearth/reearth-backend/commit/e444e4)

#### ✨ Refactor

- Declarative description of use case structure (asset only) ([#151](https://github.com/reearth/reearth-backend/pull/151)) [`c6e98c`](https://github.com/reearth/reearth-backend/commit/c6e98c)

#### Miscellaneous Tasks

- Update go modules ([#150](https://github.com/reearth/reearth-backend/pull/150)) [`6372bc`](https://github.com/reearth/reearth-backend/commit/6372bc)

## 0.7.0 - 2022-05-17

### reearth-web

#### 🚀 Features

- Implementation of the avatar feature in workspaces screens ([#206](https://github.com/reearth/reearth-web/pull/206)) [`42d7aa`](https://github.com/reearth/reearth-web/commit/42d7aa)
- Update placehoder for color field ([#215](https://github.com/reearth/reearth-web/pull/215)) [`c6c6e3`](https://github.com/reearth/reearth-web/commit/c6c6e3)
- Add opacity field to map tiles ([#220](https://github.com/reearth/reearth-web/pull/220)) [`006a8d`](https://github.com/reearth/reearth-web/commit/006a8d)

#### 🔧 Bug Fixes

- Dropdown styles in right panel break when selected item's name is too long [`9a5993`](https://github.com/reearth/reearth-web/commit/9a5993)
- Dashboard not updating on project creation [`4b5478`](https://github.com/reearth/reearth-web/commit/4b5478)
- Query names in refetchQueries not updated ([#222](https://github.com/reearth/reearth-web/pull/222)) [`711712`](https://github.com/reearth/reearth-web/commit/711712)
- Published page uses GraphQL and reports errors [`3e3e45`](https://github.com/reearth/reearth-web/commit/3e3e45)

#### ✨ Refactor

- Queries/mutation code into a single directory ([#208](https://github.com/reearth/reearth-web/pull/208)) [`2afc16`](https://github.com/reearth/reearth-web/commit/2afc16)
- Property, scene, tag, user, widget and workspace gql query files ([#221](https://github.com/reearth/reearth-web/pull/221)) [`3bf421`](https://github.com/reearth/reearth-web/commit/3bf421)

#### Miscellaneous Tasks

- Introduce i18next ([#212](https://github.com/reearth/reearth-web/pull/212)) [`0ac0c2`](https://github.com/reearth/reearth-web/commit/0ac0c2)
- Add reference to style guide in README [`e29024`](https://github.com/reearth/reearth-web/commit/e29024)
- Add useT hook to i18n ([#223](https://github.com/reearth/reearth-web/pull/223)) [`b96177`](https://github.com/reearth/reearth-web/commit/b96177)
- Update dependency cesium to ^1.93.0 ([#216](https://github.com/reearth/reearth-web/pull/216)) [`06b563`](https://github.com/reearth/reearth-web/commit/06b563)
- Update all dependencies ([#226](https://github.com/reearth/reearth-web/pull/226)) [`36fb79`](https://github.com/reearth/reearth-web/commit/36fb79)

#### Refactor

- Clean gql pt1 asset ([#217](https://github.com/reearth/reearth-web/pull/217)) [`b88a8c`](https://github.com/reearth/reearth-web/commit/b88a8c)
- Cluster, dataset, infobox, layer, plugin and project gql query files ([#219](https://github.com/reearth/reearth-web/pull/219)) [`e4dae9`](https://github.com/reearth/reearth-web/commit/e4dae9)

### reearth-backend
#### 🚀 Features

- Add an opacity slider to map tiles ([#138](https://github.com/reearth/reearth-backend/pull/138)) [`4f72b8`](https://github.com/reearth/reearth-backend/commit/4f72b8)

#### 🔧 Bug Fixes

- Signup api requires password field [`a79376`](https://github.com/reearth/reearth-backend/commit/a79376)
- "$in needs an array" error from mongo FindByIDs ([#142](https://github.com/reearth/reearth-backend/pull/142)) [`58e1b0`](https://github.com/reearth/reearth-backend/commit/58e1b0)
- Name field is available again in signup api ([#144](https://github.com/reearth/reearth-backend/pull/144)) [`651852`](https://github.com/reearth/reearth-backend/commit/651852)

#### ✨ Refactor

- Retry mongo lock ([#145](https://github.com/reearth/reearth-backend/pull/145)) [`ddaeaa`](https://github.com/reearth/reearth-backend/commit/ddaeaa)

#### 🧪 Testing

- Add Mongo Asset's [`FindByID`](https://github.com/reearth/reearth-backend/commit/FindByID) unit testing ([#139](https://github.com/reearth/reearth-backend/pull/139)) [`35f9db`](https://github.com/reearth/reearth-backend/commit/35f9db)
- Refactor mongo connect helper function [`751e66`](https://github.com/reearth/reearth-backend/commit/751e66)
- Util.SyncMap.Range test sometimes fails ([#143](https://github.com/reearth/reearth-backend/pull/143)) [`c2b969`](https://github.com/reearth/reearth-backend/commit/c2b969)

#### Miscellaneous Tasks

- Typo [`secrit`](https://github.com/reearth/reearth-backend/commit/secrit) on env example ([#137](https://github.com/reearth/reearth-backend/pull/137)) [`2c0220`](https://github.com/reearth/reearth-backend/commit/2c0220)
- Update the go modules ([#146](https://github.com/reearth/reearth-backend/pull/146)) [`89009b`](https://github.com/reearth/reearth-backend/commit/89009b)

## 0.6.1 - 2022-04-20

### reearth-web

#### 🚀 Features

- Extend project publish settings and dataset import modal functionality through extension API ([#200](https://github.com/reearth/reearth-web/pull/200)) [`96aa56`](https://github.com/reearth/reearth-web/commit/96aa56)

#### 🔧 Bug Fixes

- Redirect after esc button in any setting page ([#193](https://github.com/reearth/reearth-web/pull/193)) [`c8ec35`](https://github.com/reearth/reearth-web/commit/c8ec35)

#### Miscellaneous Tasks

- Follow GraphQL schema updates ([#209](https://github.com/reearth/reearth-web/pull/209)) [`8d9e75`](https://github.com/reearth/reearth-web/commit/8d9e75)
- Update all dependencies ([#210](https://github.com/reearth/reearth-web/pull/210)) [`c22b7a`](https://github.com/reearth/reearth-web/commit/c22b7a)

### reearth-backend
#### 🔧 Bug Fixes

- Renovate bot not running on schedule ([#136](https://github.com/reearth/reearth-backend/pull/136)) [`82843f`](https://github.com/reearth/reearth-backend/commit/82843f)
- Aud was changed and jwt could not be validated correctly [`985100`](https://github.com/reearth/reearth-backend/commit/985100)
- Auth audiences were unintentionally required [`7ec76a`](https://github.com/reearth/reearth-backend/commit/7ec76a)

#### ✨ Refactor

- Introduce generics, reorganize GraphQL schema ([#135](https://github.com/reearth/reearth-backend/pull/135)) [`04a098`](https://github.com/reearth/reearth-backend/commit/04a098)

#### Miscellaneous Tasks

- Update dependencies ([#134](https://github.com/reearth/reearth-backend/pull/134)) [`1b9b6b`](https://github.com/reearth/reearth-backend/commit/1b9b6b)

## 0.6.0 - 2022-04-08

### reearth-web

#### 🚀 Features

- Add a plugin API to resize iframe by plugins ([#181](https://github.com/reearth/reearth-web/pull/181)) [`7c1019`](https://github.com/reearth/reearth-web/commit/7c1019)
- Authentication ([#121](https://github.com/reearth/reearth-web/pull/121)) [`b63018`](https://github.com/reearth/reearth-web/commit/b63018)
- Infinite scroll on assets ([#130](https://github.com/reearth/reearth-web/pull/130)) [`11f2f2`](https://github.com/reearth/reearth-web/commit/11f2f2)
- Basic plugin editor ([#184](https://github.com/reearth/reearth-web/pull/184)) [`1c4e09`](https://github.com/reearth/reearth-web/commit/1c4e09)

#### 🔧 Bug Fixes

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

#### Miscellaneous Tasks

- Update dependency cesium to ^1.91.0 ([#182](https://github.com/reearth/reearth-web/pull/182)) [`603a5c`](https://github.com/reearth/reearth-web/commit/603a5c)
- Set default auth config to start app with zero configuration ([#191](https://github.com/reearth/reearth-web/pull/191)) [`d5a2aa`](https://github.com/reearth/reearth-web/commit/d5a2aa)

### reearth-backend
#### 🚀 Features

- Authentication system ([#108](https://github.com/reearth/reearth-backend/pull/108)) [`b89c32`](https://github.com/reearth/reearth-backend/commit/b89c32)
- Default mailer that outputs mails into stdout [`aab26c`](https://github.com/reearth/reearth-backend/commit/aab26c)
- Assets filtering & pagination ([#81](https://github.com/reearth/reearth-backend/pull/81)) [`739943`](https://github.com/reearth/reearth-backend/commit/739943)
- Support sign up with information provided by OIDC providers ([#130](https://github.com/reearth/reearth-backend/pull/130)) [`fef60e`](https://github.com/reearth/reearth-backend/commit/fef60e)

#### 🔧 Bug Fixes

- Load auth client domain from config ([#124](https://github.com/reearth/reearth-backend/pull/124)) [`9bde8a`](https://github.com/reearth/reearth-backend/commit/9bde8a)
- Signup fails when password is not set [`27c2f0`](https://github.com/reearth/reearth-backend/commit/27c2f0)
- Logger panics [`d1e3a8`](https://github.com/reearth/reearth-backend/commit/d1e3a8)
- Set auth server dev mode automatically [`83a66a`](https://github.com/reearth/reearth-backend/commit/83a66a)
- Auth server bugs and auth client bugs ([#125](https://github.com/reearth/reearth-backend/pull/125)) [`ce2309`](https://github.com/reearth/reearth-backend/commit/ce2309)
- Auth0 setting is not used by JWT verification middleware [`232e75`](https://github.com/reearth/reearth-backend/commit/232e75)
- Invalid mongo queries of pagination [`7caf68`](https://github.com/reearth/reearth-backend/commit/7caf68)
- Auth config not loaded expectedly [`570fe7`](https://github.com/reearth/reearth-backend/commit/570fe7)
- Users cannot creates a new team and scene [`5df25f`](https://github.com/reearth/reearth-backend/commit/5df25f)
- Auth server certificate is not saved as pem format [`982a71`](https://github.com/reearth/reearth-backend/commit/982a71)
- Repo filters are not merged expectedly [`f4cc3f`](https://github.com/reearth/reearth-backend/commit/f4cc3f)
- Auth is no longer required for GraphQL endpoint [`58a6d1`](https://github.com/reearth/reearth-backend/commit/58a6d1)
- Rename auth srv default client ID ([#128](https://github.com/reearth/reearth-backend/pull/128)) [`89adc3`](https://github.com/reearth/reearth-backend/commit/89adc3)
- Signup API is disabled when auth server is disabled, users and auth requests in mongo cannot be deleted ([#132](https://github.com/reearth/reearth-backend/pull/132)) [`47be6a`](https://github.com/reearth/reearth-backend/commit/47be6a)
- Auth to work with zero config ([#131](https://github.com/reearth/reearth-backend/pull/131)) [`3cbb45`](https://github.com/reearth/reearth-backend/commit/3cbb45)
- Property.SchemaListMap.List test fails [`3e6dff`](https://github.com/reearth/reearth-backend/commit/3e6dff)
- Errors when auth srv domain is not specified [`10691a`](https://github.com/reearth/reearth-backend/commit/10691a)
- Errors when auth srv domain is not specified [`648073`](https://github.com/reearth/reearth-backend/commit/648073)
- Login redirect does not work [`cb6ca4`](https://github.com/reearth/reearth-backend/commit/cb6ca4)
- Enable auth srv dev mode when no domain is specified [`0c0e28`](https://github.com/reearth/reearth-backend/commit/0c0e28)
- Add a trailing slash to jwt audiences [`e96f78`](https://github.com/reearth/reearth-backend/commit/e96f78)
- Allow separate auth server ui domain [`0ce79f`](https://github.com/reearth/reearth-backend/commit/0ce79f)

#### ⚡️ Performance

- Reduce database queries to obtain scene IDs ([#119](https://github.com/reearth/reearth-backend/pull/119)) [`784332`](https://github.com/reearth/reearth-backend/commit/784332)

#### ✨ Refactor

- Remove filter args from repos to prevent implementation errors in the use case layer ([#122](https://github.com/reearth/reearth-backend/pull/122)) [`82cf28`](https://github.com/reearth/reearth-backend/commit/82cf28)
- Http api to export layers [`3f2582`](https://github.com/reearth/reearth-backend/commit/3f2582)

#### Miscellaneous Tasks

- Update dependencies ([#117](https://github.com/reearth/reearth-backend/pull/117)) [`d1a38e`](https://github.com/reearth/reearth-backend/commit/d1a38e)
- Update docker-compose config [`83f9b1`](https://github.com/reearth/reearth-backend/commit/83f9b1)
- Add log for GraphQL Playground endpoint ([#133](https://github.com/reearth/reearth-backend/pull/133)) [`adeda4`](https://github.com/reearth/reearth-backend/commit/adeda4)

## 0.5.0 - 2022-02-24

### reearth-web

#### 🚀 Features

- Allowing widget and block plugins to resize when they are expandable ([#170](https://github.com/reearth/reearth-web/pull/170)) [`4fdf5f`](https://github.com/reearth/reearth-web/commit/4fdf5f)
- Plugin APIs to get camera viewport and layers in the viewport ([#165](https://github.com/reearth/reearth-web/pull/165)) [`f1f95a`](https://github.com/reearth/reearth-web/commit/f1f95a)
- Improving the Infobox style  ([#176](https://github.com/reearth/reearth-web/pull/176)) [`f1ddda`](https://github.com/reearth/reearth-web/commit/f1ddda)

#### 🔧 Bug Fixes

- Plugin blocks cannot be deleted ([#164](https://github.com/reearth/reearth-web/pull/164)) [`a4f17f`](https://github.com/reearth/reearth-web/commit/a4f17f)
- Support tree-structured layers and tags in published pages ([#168](https://github.com/reearth/reearth-web/pull/168)) [`17d968`](https://github.com/reearth/reearth-web/commit/17d968)
- Workspace settings does not refresh ([#167](https://github.com/reearth/reearth-web/pull/167)) [`0f3654`](https://github.com/reearth/reearth-web/commit/0f3654)
- Plugin layersInViewport API returns errors for layers that have no location fields [`e52b44`](https://github.com/reearth/reearth-web/commit/e52b44)

#### ✨ Refactor

- Format codes [`219ac6`](https://github.com/reearth/reearth-web/commit/219ac6)
- Format codes [`4e5b61`](https://github.com/reearth/reearth-web/commit/4e5b61)

#### Miscellaneous Tasks

- Upgrade dependencies ([#175](https://github.com/reearth/reearth-web/pull/175)) [`dba959`](https://github.com/reearth/reearth-web/commit/dba959)

### reearth-backend
#### 🚀 Features

- Implement property.Diff and plugin/manifest.Diff ([#107](https://github.com/reearth/reearth-backend/pull/107)) [`700269`](https://github.com/reearth/reearth-backend/commit/700269)
- Support 3rd party plugin translation ([#109](https://github.com/reearth/reearth-backend/pull/109)) [`67a618`](https://github.com/reearth/reearth-backend/commit/67a618)
- Improve the Infobox style (manifest) ([#110](https://github.com/reearth/reearth-backend/pull/110)) [`7aebcd`](https://github.com/reearth/reearth-backend/commit/7aebcd)
- Overwrite installation of new plug-ins without removing (automatic property migration) ([#113](https://github.com/reearth/reearth-backend/pull/113)) [`2dc192`](https://github.com/reearth/reearth-backend/commit/2dc192)
- Update infobox style fields ([#115](https://github.com/reearth/reearth-backend/pull/115)) [`608436`](https://github.com/reearth/reearth-backend/commit/608436)

#### 🔧 Bug Fixes

- Scene exporter should export layers and tags while maintaining the tree structure ([#104](https://github.com/reearth/reearth-backend/pull/104)) [`805d78`](https://github.com/reearth/reearth-backend/commit/805d78)
- Property field in groups in list cannot be updated correctly [`5009c5`](https://github.com/reearth/reearth-backend/commit/5009c5)
- Scenes and properties are not updated properly when plugin is updated [`861c4b`](https://github.com/reearth/reearth-backend/commit/861c4b)
- Scene widgets and blocks are not update properly when plugin is updated [`f66f9a`](https://github.com/reearth/reearth-backend/commit/f66f9a)

#### ✨ Refactor

- Graphql resolvers ([#105](https://github.com/reearth/reearth-backend/pull/105)) [`01a4e6`](https://github.com/reearth/reearth-backend/commit/01a4e6)

#### Miscellaneous Tasks

- Update all dependencies ([#111](https://github.com/reearth/reearth-backend/pull/111)) [`173881`](https://github.com/reearth/reearth-backend/commit/173881)
- Increase batch size of db migration [ci skip] [`fbbca4`](https://github.com/reearth/reearth-backend/commit/fbbca4)

## 0.4.0 - 2022-01-27

### reearth-web
#### 🚀 Features

- Add "clamp to filed" option to file primitive ([#155](https://github.com/reearth/reearth-web/pull/155)) [`2e83ba`](https://github.com/reearth/reearth-web/commit/2e83ba)
- Infobox padding ([#158](https://github.com/reearth/reearth-web/pull/158)) [`90084f`](https://github.com/reearth/reearth-web/commit/90084f)
- Support tags in plugin API ([#153](https://github.com/reearth/reearth-web/pull/153)) [`1031c5`](https://github.com/reearth/reearth-web/commit/1031c5)

#### 🔧 Bug Fixes

- Enable to select blocks of plugins ([#162](https://github.com/reearth/reearth-web/pull/162)) [`458402`](https://github.com/reearth/reearth-web/commit/458402)
- Cesium Ion acces token is not set expectedly ([#160](https://github.com/reearth/reearth-web/pull/160)) [`e8e183`](https://github.com/reearth/reearth-web/commit/e8e183)
- Cluster styling issue ([#161](https://github.com/reearth/reearth-web/pull/161)) [`c78872`](https://github.com/reearth/reearth-web/commit/c78872)
- Clusters and layers are not displayed correctly [`4fc124`](https://github.com/reearth/reearth-web/commit/4fc124)
- Type error [`b01bc7`](https://github.com/reearth/reearth-web/commit/b01bc7)
- The style of infobox block dropdown list is broken ([#163](https://github.com/reearth/reearth-web/pull/163)) [`6e02a9`](https://github.com/reearth/reearth-web/commit/6e02a9)
- Plugin blocks protrude from the infobox [`6cf0d3`](https://github.com/reearth/reearth-web/commit/6cf0d3)

#### ✨ Refactor

- Layer clustering feature ([#157](https://github.com/reearth/reearth-web/pull/157)) [`db6e6c`](https://github.com/reearth/reearth-web/commit/db6e6c)
- Camera limiter ([#149](https://github.com/reearth/reearth-web/pull/149)) [`105428`](https://github.com/reearth/reearth-web/commit/105428)
- Layer clustering feature (GraphQL) ([#159](https://github.com/reearth/reearth-web/pull/159)) [`4365b8`](https://github.com/reearth/reearth-web/commit/4365b8)

### reearth-backend
#### 🚀 Features

- Add "clamp to ground" option to file primitive ([#95](https://github.com/reearth/reearth-backend/pull/95)) [`559194`](https://github.com/reearth/reearth-backend/commit/559194)
- Infobox and text block padding ([#100](https://github.com/reearth/reearth-backend/pull/100)) [`ddd0db`](https://github.com/reearth/reearth-backend/commit/ddd0db)

#### ⚡️ Performance

- Add indexes of mongo collections ([#98](https://github.com/reearth/reearth-backend/pull/98)) [`691cb7`](https://github.com/reearth/reearth-backend/commit/691cb7)

#### ✨ Refactor

- Pkg/id, use ID aliases, move JSON schemas ([#97](https://github.com/reearth/reearth-backend/pull/97)) [`1265ac`](https://github.com/reearth/reearth-backend/commit/1265ac)
- Unit tests ([#99](https://github.com/reearth/reearth-backend/pull/99)) [`0d112c`](https://github.com/reearth/reearth-backend/commit/0d112c)
- Pkg/property, pkg/layer, pkg/plugin ([#101](https://github.com/reearth/reearth-backend/pull/101)) [`17a463`](https://github.com/reearth/reearth-backend/commit/17a463)

## 0.3.0 - 2022-01-11

### reearth-web

#### 🚀 Features

- Enhance terrain feature (type selection, exaggeration) ([#138](https://github.com/reearth/reearth-web/pull/138)) [`dae137`](https://github.com/reearth/reearth-web/commit/dae137)
- Clustering layers ([#143](https://github.com/reearth/reearth-web/pull/143)) [`3439cc`](https://github.com/reearth/reearth-web/commit/3439cc)
- Camera limiter ([#142](https://github.com/reearth/reearth-web/pull/142)) [`dec1dd`](https://github.com/reearth/reearth-web/commit/dec1dd)
- Tagging of layers ([#144](https://github.com/reearth/reearth-web/pull/144)) [`4d0a40`](https://github.com/reearth/reearth-web/commit/4d0a40)

#### 🔧 Bug Fixes

- Indicator is not displayed on selecting of clustered layer ([#146](https://github.com/reearth/reearth-web/pull/146)) [`e41f67`](https://github.com/reearth/reearth-web/commit/e41f67)
- Use data URL for marker images [`576ea4`](https://github.com/reearth/reearth-web/commit/576ea4)
- Layer clusters do not updated correctly [`ec74f6`](https://github.com/reearth/reearth-web/commit/ec74f6)
- Position label in front of billboard ([#147](https://github.com/reearth/reearth-web/pull/147)) [`81c533`](https://github.com/reearth/reearth-web/commit/81c533)
- Public pages do not work due to clustering feature [`48d8b3`](https://github.com/reearth/reearth-web/commit/48d8b3)
- Photooverlay transition does not work in Android ([#154](https://github.com/reearth/reearth-web/pull/154)) [`decbfe`](https://github.com/reearth/reearth-web/commit/decbfe)

#### 🎨 Styling

- Fix the height of the header [`9d6acc`](https://github.com/reearth/reearth-web/commit/9d6acc)

#### Miscellaneous Tasks

- Upgrade dependencies ([#134](https://github.com/reearth/reearth-web/pull/134)) [`740821`](https://github.com/reearth/reearth-web/commit/740821)
- Update dependency cesium to ^1.88.0 ([#139](https://github.com/reearth/reearth-web/pull/139)) [`7afdfb`](https://github.com/reearth/reearth-web/commit/7afdfb)
- Fix webpack dev server config [`8d06fa`](https://github.com/reearth/reearth-web/commit/8d06fa)
- Update dependency cesium to ^1.89.0 ([#156](https://github.com/reearth/reearth-web/pull/156)) [`d436ce`](https://github.com/reearth/reearth-web/commit/d436ce)

### reearth-backend

#### 🚀 Features

- Clusters for scenes ([#75](https://github.com/reearth/reearth-backend/pull/75)) [`3512c0`](https://github.com/reearth/reearth-backend/commit/3512c0)
- Add fields of scene property for terrain [`8693b4`](https://github.com/reearth/reearth-backend/commit/8693b4)
- Camera limiter  ([#87](https://github.com/reearth/reearth-backend/pull/87)) [`63c582`](https://github.com/reearth/reearth-backend/commit/63c582)

#### 🔧 Bug Fixes

- Terrain fields of scene property [`5e3d25`](https://github.com/reearth/reearth-backend/commit/5e3d25)
- Numbers are not decoded from gql to value [`2ddbc8`](https://github.com/reearth/reearth-backend/commit/2ddbc8)
- Layers have their own tags separate from the scene ([#90](https://github.com/reearth/reearth-backend/pull/90)) [`c4fb9a`](https://github.com/reearth/reearth-backend/commit/c4fb9a)
- Return property with clusters data ([#89](https://github.com/reearth/reearth-backend/pull/89)) [`1b99c6`](https://github.com/reearth/reearth-backend/commit/1b99c6)
- Cast values, rename value.OptionalValue ([#93](https://github.com/reearth/reearth-backend/pull/93)) [`ba4b18`](https://github.com/reearth/reearth-backend/commit/ba4b18)
- Synchronize mongo migration ([#94](https://github.com/reearth/reearth-backend/pull/94)) [`db4cea`](https://github.com/reearth/reearth-backend/commit/db4cea)

#### 📖 Documentation

- Add pkg.go.dev badge to readme [`91f9b3`](https://github.com/reearth/reearth-backend/commit/91f9b3)

#### ✨ Refactor

- Make property.Value and dataset.Value independent in pkg/value ([#77](https://github.com/reearth/reearth-backend/pull/77)) [`73143b`](https://github.com/reearth/reearth-backend/commit/73143b)

#### Miscellaneous Tasks

- Fix plugin manifest JSON schema [`2b57b1`](https://github.com/reearth/reearth-backend/commit/2b57b1)


## 0.2.0 - 2021-11-18

#### reearth-web
#### 🚀 Features

- Widget align system for mobile ([#115](https://github.com/reearth/reearth-web/pull/115)) [`afa4ba`](https://github.com/reearth/reearth-web/commit/afa4ba)
- Support dataset schema preview and create layer group from selected primitive type ([#74](https://github.com/reearth/reearth-web/pull/74)) [`769b86`](https://github.com/reearth/reearth-web/commit/769b86)

#### 🔧 Bug Fixes

- Markdown background color is not transparent ([#123](https://github.com/reearth/reearth-web/pull/123)) [`f16706`](https://github.com/reearth/reearth-web/commit/f16706)
- Layers would not be marshalled correctly ([#126](https://github.com/reearth/reearth-web/pull/126)) [`886302`](https://github.com/reearth/reearth-web/commit/886302)
- Widget align system issues ([#124](https://github.com/reearth/reearth-web/pull/124)) [`3bc9fa`](https://github.com/reearth/reearth-web/commit/3bc9fa)
- Project setting page does not display correctly after creating a new project ([#127](https://github.com/reearth/reearth-web/pull/127)) [`c120dc`](https://github.com/reearth/reearth-web/commit/c120dc)
- Dataset info pane shows its property though after selected dataset schema is deleted ([#131](https://github.com/reearth/reearth-web/pull/131)) [`2307d8`](https://github.com/reearth/reearth-web/commit/2307d8)

#### Miscellaneous Tasks

- Disable storybook workflow for release commit [`80f4d2`](https://github.com/reearth/reearth-web/commit/80f4d2)
- Change semantic commit type of renovate PRs, omit ci skip in changelog [`4a3e9e`](https://github.com/reearth/reearth-web/commit/4a3e9e)
- Follow backend GraphQL schema update ([#120](https://github.com/reearth/reearth-web/pull/120)) [`aeee1f`](https://github.com/reearth/reearth-web/commit/aeee1f)
- Load local reearth-config.json for debugging ([#119](https://github.com/reearth/reearth-web/pull/119)) [`6115ee`](https://github.com/reearth/reearth-web/commit/6115ee)
- Update dependency cesium to ^1.87.0 ([#118](https://github.com/reearth/reearth-web/pull/118)) [`7c65d0`](https://github.com/reearth/reearth-web/commit/7c65d0)
- Update dependency cesium to ^1.87.1 ([#128](https://github.com/reearth/reearth-web/pull/128)) [`a63aa7`](https://github.com/reearth/reearth-web/commit/a63aa7)
- Update codecov.yml to add ignored files [`b72f17`](https://github.com/reearth/reearth-web/commit/b72f17)


### reearth-backend
#### 🚀 Features

- Support opentelemetry ([#68](https://github.com/reearth/reearth-backend/pull/68)) [`25c581`](https://github.com/reearth/reearth-backend/commit/25c581)

#### 🔧 Bug Fixes

- Add an index to mongo project collection to prevent creating projects whose alias is duplicated [`10f745`](https://github.com/reearth/reearth-backend/commit/10f745)
- Check project alias duplication on project update [`443f2c`](https://github.com/reearth/reearth-backend/commit/443f2c)

#### ✨ Refactor

- Add PropertySchemaGroupID to pkg/id ([#70](https://github.com/reearth/reearth-backend/pull/70)) [`9ece9e`](https://github.com/reearth/reearth-backend/commit/9ece9e)

#### Miscellaneous Tasks

- Fix typo in github actions [`4a9dc5`](https://github.com/reearth/reearth-backend/commit/4a9dc5)
- Clean up unused code [`b5b01b`](https://github.com/reearth/reearth-backend/commit/b5b01b)
- Update codecov.yml to add ignored files [`d54309`](https://github.com/reearth/reearth-backend/commit/d54309)
- Ignore generated files in codecov [`9d3822`](https://github.com/reearth/reearth-backend/commit/9d3822)
- Upgrade dependencies [`215947`](https://github.com/reearth/reearth-backend/commit/215947)


## 0.1.0 - 2021-11-02

### reearth-web
#### 🚀 Features

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

#### 🔧 Bug Fixes

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

#### ✨ Refactor

- Use jotai instead of redux ([#68](https://github.com/reearth/reearth-web/pull/68)) [`ea980c`](https://github.com/reearth/reearth-web/commit/ea980c)
- Replace deprecated gql fields, pass widgetId to widget mutations ([#72](https://github.com/reearth/reearth-web/pull/72)) [`f36c86`](https://github.com/reearth/reearth-web/commit/f36c86)

#### 🎨 Styling

- Refine font ([#49](https://github.com/reearth/reearth-web/pull/49)) [`8b3755`](https://github.com/reearth/reearth-web/commit/8b3755)
- Refine color vo.1 ([#59](https://github.com/reearth/reearth-web/pull/59)) [`ab7bce`](https://github.com/reearth/reearth-web/commit/ab7bce)

#### 🧪 Testing

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

#### Miscellaneous Tasks

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
- Fix slack notifications in workflow [skip ci] [`b4fa35`](https://github.com/reearth/reearth-web/commit/b4fa35)
- Fix sed in release workflow [skip ci] [`f3cd74`](https://github.com/reearth/reearth-web/commit/f3cd74)


### reearth-backend
#### 🚀 Features

- Support Auth0 audience ([#3](https://github.com/reearth/reearth-backend/pull/3)) [`c3758e`](https://github.com/reearth/reearth-backend/commit/c3758e)
- Basic auth for projects ([#6](https://github.com/reearth/reearth-backend/pull/6)) [`5db065`](https://github.com/reearth/reearth-backend/commit/5db065)
- Google analytics for scene ([#10](https://github.com/reearth/reearth-backend/pull/10)) [`b44249`](https://github.com/reearth/reearth-backend/commit/b44249)
- Create installable plugins ([#1](https://github.com/reearth/reearth-backend/pull/1)) [`5b7a5f`](https://github.com/reearth/reearth-backend/commit/5b7a5f)
- Add thumbnail, author fields on plugin metadata query ([#15](https://github.com/reearth/reearth-backend/pull/15)) [`888fe0`](https://github.com/reearth/reearth-backend/commit/888fe0)
- Published page api ([#11](https://github.com/reearth/reearth-backend/pull/11)) [`aebac3`](https://github.com/reearth/reearth-backend/commit/aebac3)
- Import dataset from google sheets ([#16](https://github.com/reearth/reearth-backend/pull/16)) [`2ef7ef`](https://github.com/reearth/reearth-backend/commit/2ef7ef)
- Add scenePlugin resolver to layers ([#20](https://github.com/reearth/reearth-backend/pull/20)) [`5213f3`](https://github.com/reearth/reearth-backend/commit/5213f3)
- Marker label position [`bb9e4c`](https://github.com/reearth/reearth-backend/commit/bb9e4c)
- Refine dataset import ([#26](https://github.com/reearth/reearth-backend/pull/26)) [`5dd3db`](https://github.com/reearth/reearth-backend/commit/5dd3db)
- Plugin upload and deletion ([#33](https://github.com/reearth/reearth-backend/pull/33)) [`8742db`](https://github.com/reearth/reearth-backend/commit/8742db)
- New primitives, new properties on primitives [`108711`](https://github.com/reearth/reearth-backend/commit/108711)
- Set scene theme ([#35](https://github.com/reearth/reearth-backend/pull/35)) [`2e4f52`](https://github.com/reearth/reearth-backend/commit/2e4f52)
- Widget align system ([#19](https://github.com/reearth/reearth-backend/pull/19)) [`94611f`](https://github.com/reearth/reearth-backend/commit/94611f)
- Tag system ([#67](https://github.com/reearth/reearth-backend/pull/67)) [`163fcf`](https://github.com/reearth/reearth-backend/commit/163fcf)

#### 🔧 Bug Fixes

- Add mutex for each memory repo ([#2](https://github.com/reearth/reearth-backend/pull/2)) [`f4c3b0`](https://github.com/reearth/reearth-backend/commit/f4c3b0)
- Auth0 audience in reearth_config.json [`72e3ed`](https://github.com/reearth/reearth-backend/commit/72e3ed)
- Auth0 domain and multiple auds [`835a02`](https://github.com/reearth/reearth-backend/commit/835a02)
- Signing up and deleting user [`f17b9d`](https://github.com/reearth/reearth-backend/commit/f17b9d)
- Deleting user [`e9b8c9`](https://github.com/reearth/reearth-backend/commit/e9b8c9)
- Sign up and update user [`e5ab87`](https://github.com/reearth/reearth-backend/commit/e5ab87)
- Make gql mutation payloads optional [`9b1c4a`](https://github.com/reearth/reearth-backend/commit/9b1c4a)
- Auth0 [`6a27c6`](https://github.com/reearth/reearth-backend/commit/6a27c6)
- Errors are be overwriten by tx [`2d08c5`](https://github.com/reearth/reearth-backend/commit/2d08c5)
- Deleting user [`f531bd`](https://github.com/reearth/reearth-backend/commit/f531bd)
- Always enable dev mode in debug [`0815d3`](https://github.com/reearth/reearth-backend/commit/0815d3)
- User deletion [`a5eeae`](https://github.com/reearth/reearth-backend/commit/a5eeae)
- Invisible layer issue in published project ([#7](https://github.com/reearth/reearth-backend/pull/7)) [`06cd44`](https://github.com/reearth/reearth-backend/commit/06cd44)
- Dataset link merge bug #378 ([#18](https://github.com/reearth/reearth-backend/pull/18)) [`25da0d`](https://github.com/reearth/reearth-backend/commit/25da0d)
- Ogp image for published page ([#17](https://github.com/reearth/reearth-backend/pull/17)) [`dcb4b0`](https://github.com/reearth/reearth-backend/commit/dcb4b0)
- Change default value of marker label position [`a2059e`](https://github.com/reearth/reearth-backend/commit/a2059e)
- Import dataset from google sheet bug ([#23](https://github.com/reearth/reearth-backend/pull/23)) [`077558`](https://github.com/reearth/reearth-backend/commit/077558)
- Public api param [`846957`](https://github.com/reearth/reearth-backend/commit/846957)
- Replace strings.Split() with strings.field() ([#25](https://github.com/reearth/reearth-backend/pull/25)) [`ba7d16`](https://github.com/reearth/reearth-backend/commit/ba7d16)
- Project public image type [`e82b54`](https://github.com/reearth/reearth-backend/commit/e82b54)
- Published API ([#27](https://github.com/reearth/reearth-backend/pull/27)) [`8ad1f8`](https://github.com/reearth/reearth-backend/commit/8ad1f8)
- Plugin manifest parser bugs ([#32](https://github.com/reearth/reearth-backend/pull/32)) [`78ac13`](https://github.com/reearth/reearth-backend/commit/78ac13)
- Dataset layers are not exported correctly ([#36](https://github.com/reearth/reearth-backend/pull/36)) [`0b8c00`](https://github.com/reearth/reearth-backend/commit/0b8c00)
- Hide parent infobox fields when child infobox is not nil ([#37](https://github.com/reearth/reearth-backend/pull/37)) [`d8c8cd`](https://github.com/reearth/reearth-backend/commit/d8c8cd)
- Mongo.PropertySchema.FindByIDs, propertySchemaID.Equal [`be00da`](https://github.com/reearth/reearth-backend/commit/be00da)
- Gql propertySchemaGroup.translatedTitle resolver [`a4770e`](https://github.com/reearth/reearth-backend/commit/a4770e)
- Use PropertySchemaID.Equal [`8a6459`](https://github.com/reearth/reearth-backend/commit/8a6459)
- Use PropertySchemaID.Equal [`1c3cf1`](https://github.com/reearth/reearth-backend/commit/1c3cf1)
- Tweak field names of model primitive [`080ab9`](https://github.com/reearth/reearth-backend/commit/080ab9)
- Layer importing bug ([#41](https://github.com/reearth/reearth-backend/pull/41)) [`02b17f`](https://github.com/reearth/reearth-backend/commit/02b17f)
- Skip nil geometries ([#42](https://github.com/reearth/reearth-backend/pull/42)) [`90c327`](https://github.com/reearth/reearth-backend/commit/90c327)
- Validate widget extended when moved [`a7daf7`](https://github.com/reearth/reearth-backend/commit/a7daf7)
- Widget extended validation [`98db7e`](https://github.com/reearth/reearth-backend/commit/98db7e)
- Nil error in mongodoc plugin [`d236be`](https://github.com/reearth/reearth-backend/commit/d236be)
- Add widget to default location [`eb1db4`](https://github.com/reearth/reearth-backend/commit/eb1db4)
- Invalid extension data from GraphQL, plugin manifest schema improvement, more friendly error from manifest parser ([#56](https://github.com/reearth/reearth-backend/pull/56)) [`92d137`](https://github.com/reearth/reearth-backend/commit/92d137)
- Translated fields in plugin gql [`0a658a`](https://github.com/reearth/reearth-backend/commit/0a658a)
- Fallback widgetLocation [`579b7a`](https://github.com/reearth/reearth-backend/commit/579b7a)

#### 📖 Documentation

- Refine readme ([#28](https://github.com/reearth/reearth-backend/pull/28)) [`a9d209`](https://github.com/reearth/reearth-backend/commit/a9d209)
- Add badges to readme [skip ci] [`cc63cd`](https://github.com/reearth/reearth-backend/commit/cc63cd)

#### ✨ Refactor

- Remove unused code [`37b2c2`](https://github.com/reearth/reearth-backend/commit/37b2c2)
- Pkg/error ([#31](https://github.com/reearth/reearth-backend/pull/31)) [`a3f8b6`](https://github.com/reearth/reearth-backend/commit/a3f8b6)
- Graphql adapter ([#40](https://github.com/reearth/reearth-backend/pull/40)) [`2a1d4f`](https://github.com/reearth/reearth-backend/commit/2a1d4f)
- Reorganize graphql schema ([#43](https://github.com/reearth/reearth-backend/pull/43)) [`d3360b`](https://github.com/reearth/reearth-backend/commit/d3360b)

#### 🧪 Testing

- Pkg/shp ([#5](https://github.com/reearth/reearth-backend/pull/5)) [`72ed8e`](https://github.com/reearth/reearth-backend/commit/72ed8e)
- Pkg/id ([#4](https://github.com/reearth/reearth-backend/pull/4)) [`c31bdb`](https://github.com/reearth/reearth-backend/commit/c31bdb)

#### Miscellaneous Tasks

- Enable nightly release workflow [`16c037`](https://github.com/reearth/reearth-backend/commit/16c037)
- Set up workflows [`819639`](https://github.com/reearth/reearth-backend/commit/819639)
- Fix workflows [`c022a4`](https://github.com/reearth/reearth-backend/commit/c022a4)
- Print config [`0125aa`](https://github.com/reearth/reearth-backend/commit/0125aa)
- Load .env instead of .env.local [`487a73`](https://github.com/reearth/reearth-backend/commit/487a73)
- Add godoc workflow [`9629dd`](https://github.com/reearth/reearth-backend/commit/9629dd)
- Fix godoc workflow [`cc45b5`](https://github.com/reearth/reearth-backend/commit/cc45b5)
- Fix godoc workflow [`0db163`](https://github.com/reearth/reearth-backend/commit/0db163)
- Fix godoc workflow [`9b78fc`](https://github.com/reearth/reearth-backend/commit/9b78fc)
- Fix godoc workflow [`f1e5a7`](https://github.com/reearth/reearth-backend/commit/f1e5a7)
- Fix godoc workflow [`f7866c`](https://github.com/reearth/reearth-backend/commit/f7866c)
- Fix godoc workflow [`5bc089`](https://github.com/reearth/reearth-backend/commit/5bc089)
- Fix godoc workflow [`5f808b`](https://github.com/reearth/reearth-backend/commit/5f808b)
- Fix godoc workflow [`9f8e11`](https://github.com/reearth/reearth-backend/commit/9f8e11)
- Fix godoc workflow [`150550`](https://github.com/reearth/reearth-backend/commit/150550)
- Use go:embed ([#24](https://github.com/reearth/reearth-backend/pull/24)) [`f7866e`](https://github.com/reearth/reearth-backend/commit/f7866e)
- Add internal error log [`41c377`](https://github.com/reearth/reearth-backend/commit/41c377)
- Support multiple platform docker image [`3651e2`](https://github.com/reearth/reearth-backend/commit/3651e2)
- Stop using upx as it doesn't work on arm64 [`3b5f93`](https://github.com/reearth/reearth-backend/commit/3b5f93)
- Update golang version and modules ([#51](https://github.com/reearth/reearth-backend/pull/51)) [`33f4c7`](https://github.com/reearth/reearth-backend/commit/33f4c7)
- Updating modules ([#62](https://github.com/reearth/reearth-backend/pull/62)) [`65ae32`](https://github.com/reearth/reearth-backend/commit/65ae32)
- Add github workflows to release [`fbcdef`](https://github.com/reearth/reearth-backend/commit/fbcdef)
- Fix release workflow, fix build comment [skip ci] [`cfc79a`](https://github.com/reearth/reearth-backend/commit/cfc79a)
- Fix renaming file names in release workflow [`96f0b3`](https://github.com/reearth/reearth-backend/commit/96f0b3)
- Fix and refactor release workflow [skip ci] [`d5466b`](https://github.com/reearth/reearth-backend/commit/d5466b)

