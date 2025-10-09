# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0-beta.11.0 - 2025-10-08

### Web

#### 🚀 Features

- Add warning banner on dashboard page [VIZ-2278] ([#1831](https://github.com/reearth/reearth-visualizer/pull/1831)) [`66ea98`](https://github.com/reearth/reearth-visualizer/commit/66ea98)
- Add data attribution widget to plugin playground ([#1823](https://github.com/reearth/reearth-visualizer/pull/1823)) [`0c329e`](https://github.com/reearth/reearth-visualizer/commit/0c329e)

#### 🔧 Bug Fixes

- Clean up iss param ([#1850](https://github.com/reearth/reearth-visualizer/pull/1850)) [`cb4c1f`](https://github.com/reearth/reearth-visualizer/commit/cb4c1f)
- Missing loading animation on project import when there&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s empty project list [VIZ-2289] [VIZ-2290] ([#1837](https://github.com/reearth/reearth-visualizer/pull/1837)) [`9b5d5e`](https://github.com/reearth/reearth-visualizer/commit/9b5d5e)

#### ✨ Refactor

- Hide user photo when loading failed ([#1844](https://github.com/reearth/reearth-visualizer/pull/1844)) [`ea2665`](https://github.com/reearth/reearth-visualizer/commit/ea2665)
- Integrate workspace policy check to manage custom domain extension availability [VIZ-2268] ([#1826](https://github.com/reearth/reearth-visualizer/pull/1826)) [`63303c`](https://github.com/reearth/reearth-visualizer/commit/63303c)
- Apply new project import API &amp; update UI&#x2F;UX [VIZ-2267] ([#1813](https://github.com/reearth/reearth-visualizer/pull/1813)) [`01e1cf`](https://github.com/reearth/reearth-visualizer/commit/01e1cf)

#### 🧪 Testing

- Added global auth ([#1839](https://github.com/reearth/reearth-visualizer/pull/1839)) [`0454a0`](https://github.com/reearth/reearth-visualizer/commit/0454a0)
- Fixed e2e tests and enable ci&#x2F;cd ([#1833](https://github.com/reearth/reearth-visualizer/pull/1833)) [`b93acb`](https://github.com/reearth/reearth-visualizer/commit/b93acb)

#### Miscellaneous Tasks

- Bump up to 1.0.0-beta.11.0 ([#1853](https://github.com/reearth/reearth-visualizer/pull/1853)) [`b2091b`](https://github.com/reearth/reearth-visualizer/commit/b2091b)
- Add script for scan yarn.lock, update reviewer ([#1824](https://github.com/reearth/reearth-visualizer/pull/1824)) [`74582c`](https://github.com/reearth/reearth-visualizer/commit/74582c)
- Improve type definition &amp; clean up unused components &amp; format [VIZ-2246] ([#1822](https://github.com/reearth/reearth-visualizer/pull/1822)) [`46c87c`](https://github.com/reearth/reearth-visualizer/commit/46c87c)

### Server

#### 🚀 Features

- Add export data version [VIZ-2295] ([#1843](https://github.com/reearth/reearth-visualizer/pull/1843)) [`0ba949`](https://github.com/reearth/reearth-visualizer/commit/0ba949)
- Add split-import test ([#1842](https://github.com/reearth/reearth-visualizer/pull/1842)) [`b11ffb`](https://github.com/reearth/reearth-visualizer/commit/b11ffb)
- Add internal api endpoint to get all projects without restriction to workspace ([#1834](https://github.com/reearth/reearth-visualizer/pull/1834)) [`fb1359`](https://github.com/reearth/reearth-visualizer/commit/fb1359)
- Add photoURL on GetMe query ([#1836](https://github.com/reearth/reearth-visualizer/pull/1836)) [`5411b3`](https://github.com/reearth/reearth-visualizer/commit/5411b3)
- Add migration to add new fields to project collection [VIZ-2269] ([#1830](https://github.com/reearth/reearth-visualizer/pull/1830)) [`e59b64`](https://github.com/reearth/reearth-visualizer/commit/e59b64)
- When operation is not allowed, return false ([#1832](https://github.com/reearth/reearth-visualizer/pull/1832)) [`3c7c5a`](https://github.com/reearth/reearth-visualizer/commit/3c7c5a)
- Allow access from storage trigger [VIZ-2232] ([#1825](https://github.com/reearth/reearth-visualizer/pull/1825)) [`84db2e`](https://github.com/reearth/reearth-visualizer/commit/84db2e)
- Modifying the imported project [VIZ-2232] ([#1811](https://github.com/reearth/reearth-visualizer/pull/1811)) [`66bfe8`](https://github.com/reearth/reearth-visualizer/commit/66bfe8)

#### 🔧 Bug Fixes

- Delete debug code ([#1852](https://github.com/reearth/reearth-visualizer/pull/1852)) [`56ac81`](https://github.com/reearth/reearth-visualizer/commit/56ac81)
- Fix debug code ([#1849](https://github.com/reearth/reearth-visualizer/pull/1849)) [`ac0884`](https://github.com/reearth/reearth-visualizer/commit/ac0884)
- Debug log ([#1848](https://github.com/reearth/reearth-visualizer/pull/1848)) [`76a03d`](https://github.com/reearth/reearth-visualizer/commit/76a03d)
- Debug for calling policy check ([#1846](https://github.com/reearth/reearth-visualizer/pull/1846)) [`72ffd2`](https://github.com/reearth/reearth-visualizer/commit/72ffd2)
- Fix export project prop ([#1838](https://github.com/reearth/reearth-visualizer/pull/1838)) [`7a4791`](https://github.com/reearth/reearth-visualizer/commit/7a4791)
- Add prop DisableOperationByOverUsedSeat on PolicyCheckPayload ([#1829](https://github.com/reearth/reearth-visualizer/pull/1829)) [`372e77`](https://github.com/reearth/reearth-visualizer/commit/372e77)
- Delete validation of url geojson ([#1827](https://github.com/reearth/reearth-visualizer/pull/1827)) [`3f30b6`](https://github.com/reearth/reearth-visualizer/commit/3f30b6)

### web,serer

#### 🔧 Bug Fixes

- Fixed typo import result log ([#1828](https://github.com/reearth/reearth-visualizer/pull/1828)) [`11a76e`](https://github.com/reearth/reearth-visualizer/commit/11a76e)

## 1.0.0-beta.10.0 - 2025-09-17

### Web

#### 🔧 Bug Fixes

- Memo ExtensionComponent ([#1806](https://github.com/reearth/reearth-visualizer/pull/1806)) [`8039df`](https://github.com/reearth/reearth-visualizer/commit/8039df)

#### ✨ Refactor

- Temporarily disable global modal ([#1820](https://github.com/reearth/reearth-visualizer/pull/1820)) [`569909`](https://github.com/reearth/reearth-visualizer/commit/569909)
- Improve API hooks ([#1818](https://github.com/reearth/reearth-visualizer/pull/1818)) [`724371`](https://github.com/reearth/reearth-visualizer/commit/724371)

#### Miscellaneous Tasks

- Bump up version to 1.0.0-beta.10.0 ([#1821](https://github.com/reearth/reearth-visualizer/pull/1821)) [`22ed14`](https://github.com/reearth/reearth-visualizer/commit/22ed14)

### Server

#### 🔧 Bug Fixes

- Rename assets cors middleware and apply this middleware to reading all file ([#1814](https://github.com/reearth/reearth-visualizer/pull/1814)) [`18ccb5`](https://github.com/reearth/reearth-visualizer/commit/18ccb5)
- Story publishing isn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t working ([#1812](https://github.com/reearth/reearth-visualizer/pull/1812)) [`8655ce`](https://github.com/reearth/reearth-visualizer/commit/8655ce)
- Asset cors middleware ([#1810](https://github.com/reearth/reearth-visualizer/pull/1810)) [`f567b9`](https://github.com/reearth/reearth-visualizer/commit/f567b9)
- Allow to access assets endpoint from custom domain ([#1802](https://github.com/reearth/reearth-visualizer/pull/1802)) [`df2d66`](https://github.com/reearth/reearth-visualizer/commit/df2d66)

#### Miscellaneous Tasks

- Add grpcurl doc ([#1714](https://github.com/reearth/reearth-visualizer/pull/1714)) [`883f56`](https://github.com/reearth/reearth-visualizer/commit/883f56)

### Misc

#### Miscellaneous Tasks

- Update actions&#x2F;setup-go action to v6 ([#1816](https://github.com/reearth/reearth-visualizer/pull/1816)) [`d4774b`](https://github.com/reearth/reearth-visualizer/commit/d4774b)
- Update actions&#x2F;cache action to v4 ([#1625](https://github.com/reearth/reearth-visualizer/pull/1625)) [`b7d049`](https://github.com/reearth/reearth-visualizer/commit/b7d049)
- Update actions&#x2F;checkout action to v5 ([#1803](https://github.com/reearth/reearth-visualizer/pull/1803)) [`1966bd`](https://github.com/reearth/reearth-visualizer/commit/1966bd)

### 

#### Miscellaneous Tasks

- Update actions&#x2F;setup-go action to v6 ([#1816](https://github.com/reearth/reearth-visualizer/pull/1816)) [`d4774b`](https://github.com/reearth/reearth-visualizer/commit/d4774b)
- Update actions&#x2F;cache action to v4 ([#1625](https://github.com/reearth/reearth-visualizer/pull/1625)) [`b7d049`](https://github.com/reearth/reearth-visualizer/commit/b7d049)
- Update actions&#x2F;checkout action to v5 ([#1803](https://github.com/reearth/reearth-visualizer/pull/1803)) [`1966bd`](https://github.com/reearth/reearth-visualizer/commit/1966bd)

## 1.0.0-beta.9.4 - 2025-09-04

## 1.0.0-beta.9.3 - 2025-08-28

### Web

#### 🚀 Features

- Update links on sidebar [VIZ-2201] ([#1788](https://github.com/reearth/reearth-visualizer/pull/1788)) [`1cfdd5`](https://github.com/reearth/reearth-visualizer/commit/1cfdd5)

#### Miscellaneous Tasks

- Bump up version 1.0.0-beta.9.3 ([#1792](https://github.com/reearth/reearth-visualizer/pull/1792)) [`1ac286`](https://github.com/reearth/reearth-visualizer/commit/1ac286)
- Update core version to 0.0.7-alpha.43 ([#1791](https://github.com/reearth/reearth-visualizer/pull/1791)) [`5e0f35`](https://github.com/reearth/reearth-visualizer/commit/5e0f35)

### Misc

#### 🔧 Bug Fixes

- Refactor import of lang value [`42d0bc`](https://github.com/reearth/reearth-visualizer/commit/42d0bc)

### 

#### 🔧 Bug Fixes

- Refactor import of lang value [`42d0bc`](https://github.com/reearth/reearth-visualizer/commit/42d0bc)

## 1.0.0-beta.9.2 - 2025-08-27

### Web

#### 🔧 Bug Fixes

- Status check while checking project alias &amp; UI updates on recycle bin [VIZ-2195] ([#1772](https://github.com/reearth/reearth-visualizer/pull/1772)) [`04abe4`](https://github.com/reearth/reearth-visualizer/commit/04abe4)

#### ✨ Refactor

- Forbidden remove data attribution widget[VIZ-2139] ([#1773](https://github.com/reearth/reearth-visualizer/pull/1773)) [`fec746`](https://github.com/reearth/reearth-visualizer/commit/fec746)

#### Miscellaneous Tasks

- Bump up version to 1.0.0-beta.9.2 ([#1789](https://github.com/reearth/reearth-visualizer/pull/1789)) [`15120a`](https://github.com/reearth/reearth-visualizer/commit/15120a)
- Update core version to 0.0.7-alpha.42 ([#1787](https://github.com/reearth/reearth-visualizer/pull/1787)) [`133172`](https://github.com/reearth/reearth-visualizer/commit/133172)

### migration

#### 🔧 Bug Fixes

- Change esri to default migration ([#1786](https://github.com/reearth/reearth-visualizer/pull/1786)) [`e7c9f3`](https://github.com/reearth/reearth-visualizer/commit/e7c9f3)

### web, server

#### 🔧 Bug Fixes

- Correct data attribution[VIZ-2137] ([#1765](https://github.com/reearth/reearth-visualizer/pull/1765)) [`1df37a`](https://github.com/reearth/reearth-visualizer/commit/1df37a)

## 1.0.0-beta.9.1 - 2025-08-26

### Web

#### Miscellaneous Tasks

- Bump up version 1.0.0-beta.9.1 ([#1782](https://github.com/reearth/reearth-visualizer/pull/1782)) [`07976c`](https://github.com/reearth/reearth-visualizer/commit/07976c)

### Server

#### 🔧 Bug Fixes

- Get project list internal api has error when user is not authenticated ([#1781](https://github.com/reearth/reearth-visualizer/pull/1781)) [`d9a603`](https://github.com/reearth/reearth-visualizer/commit/d9a603)

#### Miscellaneous Tasks

- Error due to Project Export Failure ([#1780](https://github.com/reearth/reearth-visualizer/pull/1780)) [`ad5732`](https://github.com/reearth/reearth-visualizer/commit/ad5732)

## 1.0.0-beta.9.0 - 2025-08-25

### Web

#### 🔧 Bug Fixes

- Update japanese translations for project visibility terminology [VIZ-2153] ([#1775](https://github.com/reearth/reearth-visualizer/pull/1775)) [`b3b4e9`](https://github.com/reearth/reearth-visualizer/commit/b3b4e9)
- Use query to check if private project can be created for given workspace [VIZ-2145] ([#1763](https://github.com/reearth/reearth-visualizer/pull/1763)) [`ead0f9`](https://github.com/reearth/reearth-visualizer/commit/ead0f9)
- 3dtiles feature color update incorrectly when apply new style on selected feature ([#1762](https://github.com/reearth/reearth-visualizer/pull/1762)) [`99a3cb`](https://github.com/reearth/reearth-visualizer/commit/99a3cb)
- Layer style expression startsWith doesn’t work[VIZ-2094] ([#1759](https://github.com/reearth/reearth-visualizer/pull/1759)) [`323854`](https://github.com/reearth/reearth-visualizer/commit/323854)

#### ✨ Refactor

- Support link to external workspace settings page ([#1758](https://github.com/reearth/reearth-visualizer/pull/1758)) [`37af2c`](https://github.com/reearth/reearth-visualizer/commit/37af2c)

#### Miscellaneous Tasks

- Bump up version 1.0.0-beta.9.0 ([#1779](https://github.com/reearth/reearth-visualizer/pull/1779)) [`5e5dcc`](https://github.com/reearth/reearth-visualizer/commit/5e5dcc)

### Server

#### 🚀 Features

- Change project filter [VIZ-2160] ([#1770](https://github.com/reearth/reearth-visualizer/pull/1770)) [`69e0de`](https://github.com/reearth/reearth-visualizer/commit/69e0de)
- Multiple WidgetAlignSystems [VIZ-2135] ([#1761](https://github.com/reearth/reearth-visualizer/pull/1761)) [`a61c23`](https://github.com/reearth/reearth-visualizer/commit/a61c23)
- Adjust visibility handling [VIZ-2110] ([#1757](https://github.com/reearth/reearth-visualizer/pull/1757)) [`970618`](https://github.com/reearth/reearth-visualizer/commit/970618)
- Policy check query ([#1760](https://github.com/reearth/reearth-visualizer/pull/1760)) [`fc755b`](https://github.com/reearth/reearth-visualizer/commit/fc755b)
- Policy checker [VIZ-1818] ([#1746](https://github.com/reearth/reearth-visualizer/pull/1746)) [`7040de`](https://github.com/reearth/reearth-visualizer/commit/7040de)

#### 🔧 Bug Fixes

- Import project data don&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t set visibility correctly ([#1778](https://github.com/reearth/reearth-visualizer/pull/1778)) [`ff8506`](https://github.com/reearth/reearth-visualizer/commit/ff8506)
- Fix bug that visibility become empty when project import ([#1777](https://github.com/reearth/reearth-visualizer/pull/1777)) [`4d6085`](https://github.com/reearth/reearth-visualizer/commit/4d6085)
- Policy check enum ([#1774](https://github.com/reearth/reearth-visualizer/pull/1774)) [`1643da`](https://github.com/reearth/reearth-visualizer/commit/1643da)
- Revert Multiple WidgetAlignSystems [VIZ-2135] ([#1766](https://github.com/reearth/reearth-visualizer/pull/1766)) [`24098e`](https://github.com/reearth/reearth-visualizer/commit/24098e)
- Update project import export ([#1755](https://github.com/reearth/reearth-visualizer/pull/1755)) [`192fee`](https://github.com/reearth/reearth-visualizer/commit/192fee)

### Misc

#### 🔧 Bug Fixes

- Use query to check private project can be created for given workspace [`a9d0f8`](https://github.com/reearth/reearth-visualizer/commit/a9d0f8)

#### 

- Standardizes &quot;Markdown Text&quot; terminology in manifests [`37c59e`](https://github.com/reearth/reearth-visualizer/commit/37c59e)
- Update Japanese translations for project visibility terminology [`0b504e`](https://github.com/reearth/reearth-visualizer/commit/0b504e)
- Refactors workspace policy check to use custom hook [`d09f6d`](https://github.com/reearth/reearth-visualizer/commit/d09f6d)
- Fixes disabled button logic for project visibility changes [`5f1d24`](https://github.com/reearth/reearth-visualizer/commit/5f1d24)
- Improve private project creation handling and visibility checks [`0fbdbc`](https://github.com/reearth/reearth-visualizer/commit/0fbdbc)

### 

#### 🔧 Bug Fixes

- Use query to check private project can be created for given workspace [`a9d0f8`](https://github.com/reearth/reearth-visualizer/commit/a9d0f8)

#### 

- Standardizes &quot;Markdown Text&quot; terminology in manifests [`37c59e`](https://github.com/reearth/reearth-visualizer/commit/37c59e)
- Update Japanese translations for project visibility terminology [`0b504e`](https://github.com/reearth/reearth-visualizer/commit/0b504e)
- Refactors workspace policy check to use custom hook [`d09f6d`](https://github.com/reearth/reearth-visualizer/commit/d09f6d)
- Fixes disabled button logic for project visibility changes [`5f1d24`](https://github.com/reearth/reearth-visualizer/commit/5f1d24)
- Improve private project creation handling and visibility checks [`0fbdbc`](https://github.com/reearth/reearth-visualizer/commit/0fbdbc)

## 1.0.0-beta.8.1 - 2025-08-04

### Web

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.8.1 ([#1756](https://github.com/reearth/reearth-visualizer/pull/1756)) [`4794d7`](https://github.com/reearth/reearth-visualizer/commit/4794d7)

### Server

#### 🚀 Features

- Remove filtering for internal API ([#1754](https://github.com/reearth/reearth-visualizer/pull/1754)) [`7c4698`](https://github.com/reearth/reearth-visualizer/commit/7c4698)
- Add workspace alias [VIZ-2081] ([#1753](https://github.com/reearth/reearth-visualizer/pull/1753)) [`608656`](https://github.com/reearth/reearth-visualizer/commit/608656)

#### 🔧 Bug Fixes

- Project metadata filtering error ([#1752](https://github.com/reearth/reearth-visualizer/pull/1752)) [`3cc88b`](https://github.com/reearth/reearth-visualizer/commit/3cc88b)

## 1.0.0-beta.8.0 - 2025-07-29

### Web

#### 🚀 Features

- Support SaaS features for projects [VIZ-1970] ([#1711](https://github.com/reearth/reearth-visualizer/pull/1711)) [`a14f8a`](https://github.com/reearth/reearth-visualizer/commit/a14f8a)
- Implement ui for visitor&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s branding page [VIZ-1965] ([#1710](https://github.com/reearth/reearth-visualizer/pull/1710)) [`5f346e`](https://github.com/reearth/reearth-visualizer/commit/5f346e)
- Improve project settings&[#39](https://github.com/reearth/reearth-visualizer/pull/39); page ui ([#1700](https://github.com/reearth/reearth-visualizer/pull/1700)) [`0cfe00`](https://github.com/reearth/reearth-visualizer/commit/0cfe00)
- Introduce app feature config ([#1699](https://github.com/reearth/reearth-visualizer/pull/1699)) [`7b1041`](https://github.com/reearth/reearth-visualizer/commit/7b1041)
- Add env variable for SaaS mode and update members page &amp; drop down menu ([#1688](https://github.com/reearth/reearth-visualizer/pull/1688)) [`242615`](https://github.com/reearth/reearth-visualizer/commit/242615)
- Add getCurrentLocation example in playground ([#1664](https://github.com/reearth/reearth-visualizer/pull/1664)) [`fef7b9`](https://github.com/reearth/reearth-visualizer/commit/fef7b9)
- Add plugin api of getting current location ([#1662](https://github.com/reearth/reearth-visualizer/pull/1662)) [`9a1574`](https://github.com/reearth/reearth-visualizer/commit/9a1574)
- Support height for 3d model [VIZ-1597] ([#1631](https://github.com/reearth/reearth-visualizer/pull/1631)) [`dec766`](https://github.com/reearth/reearth-visualizer/commit/dec766)
- Initially hidden the two preset layers in playground ([#1615](https://github.com/reearth/reearth-visualizer/pull/1615)) [`f753c7`](https://github.com/reearth/reearth-visualizer/commit/f753c7)
- Support close infobox with button [VIZ-1674] ([#1617](https://github.com/reearth/reearth-visualizer/pull/1617)) [`51796c`](https://github.com/reearth/reearth-visualizer/commit/51796c)
- Update csv and 3d tiles example in playground ([#1597](https://github.com/reearth/reearth-visualizer/pull/1597)) [`98480b`](https://github.com/reearth/reearth-visualizer/commit/98480b)
- Update geojson example in playground ([#1547](https://github.com/reearth/reearth-visualizer/pull/1547)) [`8b41d8`](https://github.com/reearth/reearth-visualizer/commit/8b41d8)
- Add infobox example in playground ([#1608](https://github.com/reearth/reearth-visualizer/pull/1608)) [`686813`](https://github.com/reearth/reearth-visualizer/commit/686813)

#### 🔧 Bug Fixes

- Allow ignoring existing event callbacks in getEventCallback ([#1743](https://github.com/reearth/reearth-visualizer/pull/1743)) [`8cd40b`](https://github.com/reearth/reearth-visualizer/commit/8cd40b)
- Missing project visibility in project convert ([#1732](https://github.com/reearth/reearth-visualizer/pull/1732)) [`e59e27`](https://github.com/reearth/reearth-visualizer/commit/e59e27)
- Refactor read me translation ([#1729](https://github.com/reearth/reearth-visualizer/pull/1729)) [`0aebbf`](https://github.com/reearth/reearth-visualizer/commit/0aebbf)
- Change camera height unit ([#1720](https://github.com/reearth/reearth-visualizer/pull/1720)) [`e53e94`](https://github.com/reearth/reearth-visualizer/commit/e53e94)
- Missing logo color on header ([#1717](https://github.com/reearth/reearth-visualizer/pull/1717)) [`41059f`](https://github.com/reearth/reearth-visualizer/commit/41059f)
- Plugin playground new file input lost focus unexpectly [VIZ-2016] ([#1713](https://github.com/reearth/reearth-visualizer/pull/1713)) [`f2a591`](https://github.com/reearth/reearth-visualizer/commit/f2a591)
- Plugin API event off not working ([#1687](https://github.com/reearth/reearth-visualizer/pull/1687)) [`578ac3`](https://github.com/reearth/reearth-visualizer/commit/578ac3)
- Revert &quot;refactor(web): upgrade to react 19&quot; ([#1679](https://github.com/reearth/reearth-visualizer/pull/1679)) [`316c97`](https://github.com/reearth/reearth-visualizer/commit/316c97)
- Updating workspace name setting ([#1646](https://github.com/reearth/reearth-visualizer/pull/1646)) [`4d1d11`](https://github.com/reearth/reearth-visualizer/commit/4d1d11)

#### ✨ Refactor

- Enhance event callback management with fingerprint support ([#1745](https://github.com/reearth/reearth-visualizer/pull/1745)) [`343322`](https://github.com/reearth/reearth-visualizer/commit/343322)
- Use scene alias on publish scene ([#1738](https://github.com/reearth/reearth-visualizer/pull/1738)) [`91bc0f`](https://github.com/reearth/reearth-visualizer/commit/91bc0f)
- Update license list ([#1744](https://github.com/reearth/reearth-visualizer/pull/1744)) [`c32657`](https://github.com/reearth/reearth-visualizer/commit/c32657)
- Remove externalAuth0Signup feature flag and related logic ([#1728](https://github.com/reearth/reearth-visualizer/pull/1728)) [`516983`](https://github.com/reearth/reearth-visualizer/commit/516983)
- Migrate from react-ga to react-ga4 and remove unused GA files ([#1724](https://github.com/reearth/reearth-visualizer/pull/1724)) [`0dfa0b`](https://github.com/reearth/reearth-visualizer/commit/0dfa0b)
- Show login only when use external signup flow ([#1723](https://github.com/reearth/reearth-visualizer/pull/1723)) [`598111`](https://github.com/reearth/reearth-visualizer/commit/598111)
- Enable GA settings &amp; fix update settings from switcher ([#1722](https://github.com/reearth/reearth-visualizer/pull/1722)) [`a66a5a`](https://github.com/reearth/reearth-visualizer/commit/a66a5a)
- External auth0 sign-up flow for ee ([#1716](https://github.com/reearth/reearth-visualizer/pull/1716)) [`43e798`](https://github.com/reearth/reearth-visualizer/commit/43e798)
- Enhance configuration options ([#1696](https://github.com/reearth/reearth-visualizer/pull/1696)) [`8fa980`](https://github.com/reearth/reearth-visualizer/commit/8fa980)
- Improve type safety and cleanup timeout handling in various hooks and components ([#1694](https://github.com/reearth/reearth-visualizer/pull/1694)) [`bc9e07`](https://github.com/reearth/reearth-visualizer/commit/bc9e07)
- Upgrade to react 19 ([#1678](https://github.com/reearth/reearth-visualizer/pull/1678)) [`63a0fa`](https://github.com/reearth/reearth-visualizer/commit/63a0fa)
- Init CLAUDE.md for web &amp; rename beta as app ([#1676](https://github.com/reearth/reearth-visualizer/pull/1676)) [`4bffc2`](https://github.com/reearth/reearth-visualizer/commit/4bffc2)
- Add label to filter feature by style sample ([#1610](https://github.com/reearth/reearth-visualizer/pull/1610)) [`c202b1`](https://github.com/reearth/reearth-visualizer/commit/c202b1)
- Improve import project [VIZ-1774] ([#1669](https://github.com/reearth/reearth-visualizer/pull/1669)) [`7ca72a`](https://github.com/reearth/reearth-visualizer/commit/7ca72a)
- Builtin widget Data Attribution ([#1641](https://github.com/reearth/reearth-visualizer/pull/1641)) [`e8480e`](https://github.com/reearth/reearth-visualizer/commit/e8480e)
- Hide GA settings on project [VIZ-1722] ([#1638](https://github.com/reearth/reearth-visualizer/pull/1638)) [`bfa84e`](https://github.com/reearth/reearth-visualizer/commit/bfa84e)
- Improve buttons for alias setting [VIZ-1653] ([#1612](https://github.com/reearth/reearth-visualizer/pull/1612)) [`4e08d5`](https://github.com/reearth/reearth-visualizer/commit/4e08d5)
- Remove asset page from dashboard ([#1606](https://github.com/reearth/reearth-visualizer/pull/1606)) [`7b979e`](https://github.com/reearth/reearth-visualizer/commit/7b979e)

#### 🧪 Testing

- Exvlude e2e test from the CI until we fix the issue with user account [`4dc429`](https://github.com/reearth/reearth-visualizer/commit/4dc429)
- Move e2e tests from web project to separate e2e project ([#1693](https://github.com/reearth/reearth-visualizer/pull/1693)) [`6a6f10`](https://github.com/reearth/reearth-visualizer/commit/6a6f10)
- Fix playwright config and login test ([#1677](https://github.com/reearth/reearth-visualizer/pull/1677)) [`b0b4ff`](https://github.com/reearth/reearth-visualizer/commit/b0b4ff)
- Refactor component on FE ([#1672](https://github.com/reearth/reearth-visualizer/pull/1672)) [`61f093`](https://github.com/reearth/reearth-visualizer/commit/61f093)
- Project test cases and data-testod ([#1665](https://github.com/reearth/reearth-visualizer/pull/1665)) [`6bb074`](https://github.com/reearth/reearth-visualizer/commit/6bb074)
- Added data-testids and fix the failed tests ([#1609](https://github.com/reearth/reearth-visualizer/pull/1609)) [`aa3dea`](https://github.com/reearth/reearth-visualizer/commit/aa3dea)
- Project tests fix ([#1605](https://github.com/reearth/reearth-visualizer/pull/1605)) [`a4ed25`](https://github.com/reearth/reearth-visualizer/commit/a4ed25)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.8.0 ([#1751](https://github.com/reearth/reearth-visualizer/pull/1751)) [`2f1f52`](https://github.com/reearth/reearth-visualizer/commit/2f1f52)
- Remove Playwright E2E testing setup and related configurations ([#1695](https://github.com/reearth/reearth-visualizer/pull/1695)) [`877c1f`](https://github.com/reearth/reearth-visualizer/commit/877c1f)
- Update @reearth&#x2F;core to version 0.0.7-alpha.39 ([#1689](https://github.com/reearth/reearth-visualizer/pull/1689)) [`053f9b`](https://github.com/reearth/reearth-visualizer/commit/053f9b)
- Remove asset link [VIZ-1925] ([#1683](https://github.com/reearth/reearth-visualizer/pull/1683)) [`15a369`](https://github.com/reearth/reearth-visualizer/commit/15a369)
- Update package version to 1.0.0-beta.7.0 ([#1648](https://github.com/reearth/reearth-visualizer/pull/1648)) [`131873`](https://github.com/reearth/reearth-visualizer/commit/131873)
- Update core version to 0.0.7-alpha.37 ([#1639](https://github.com/reearth/reearth-visualizer/pull/1639)) [`83a292`](https://github.com/reearth/reearth-visualizer/commit/83a292)
- Clean up ref url ([#1632](https://github.com/reearth/reearth-visualizer/pull/1632)) [`3a2a38`](https://github.com/reearth/reearth-visualizer/commit/3a2a38)

### Server

#### 🚀 Features

- Set PhotoOverlay ([#1737](https://github.com/reearth/reearth-visualizer/pull/1737)) [`d49c9f`](https://github.com/reearth/reearth-visualizer/commit/d49c9f)
- Project Data Maintenance ([#1739](https://github.com/reearth/reearth-visualizer/pull/1739)) [`6f5db7`](https://github.com/reearth/reearth-visualizer/commit/6f5db7)
- Remove ErrInvalidID ([#1733](https://github.com/reearth/reearth-visualizer/pull/1733)) [`868e7b`](https://github.com/reearth/reearth-visualizer/commit/868e7b)
- Set visibility public ([#1731](https://github.com/reearth/reearth-visualizer/pull/1731)) [`0b5134`](https://github.com/reearth/reearth-visualizer/commit/0b5134)
- Modify alias validate [VIZ-2047] ([#1721](https://github.com/reearth/reearth-visualizer/pull/1721)) [`790645`](https://github.com/reearth/reearth-visualizer/commit/790645)
- Validate project alias [VIZ-2047] ([#1718](https://github.com/reearth/reearth-visualizer/pull/1718)) [`afe870`](https://github.com/reearth/reearth-visualizer/commit/afe870)
- Update internal api by projectalias [VIZ-2037] ([#1715](https://github.com/reearth/reearth-visualizer/pull/1715)) [`ec874c`](https://github.com/reearth/reearth-visualizer/commit/ec874c)
- Add metadata for create project [VIZ-2026] ([#1708](https://github.com/reearth/reearth-visualizer/pull/1708)) [`27f2ee`](https://github.com/reearth/reearth-visualizer/commit/27f2ee)
- Add projectAlias [VIZ-2025] ([#1705](https://github.com/reearth/reearth-visualizer/pull/1705)) [`3255cf`](https://github.com/reearth/reearth-visualizer/commit/3255cf)
- Add projectid for story ([#1697](https://github.com/reearth/reearth-visualizer/pull/1697)) [`635302`](https://github.com/reearth/reearth-visualizer/commit/635302)
- Enable to access internal api to get project data without auth ([#1698](https://github.com/reearth/reearth-visualizer/pull/1698)) [`1e7d9b`](https://github.com/reearth/reearth-visualizer/commit/1e7d9b)
- Update intanal project api [VIZ-1962,VIZ-1961] ([#1691](https://github.com/reearth/reearth-visualizer/pull/1691)) [`2af027`](https://github.com/reearth/reearth-visualizer/commit/2af027)
- Update project api alias [VIZ-1849] ([#1681](https://github.com/reearth/reearth-visualizer/pull/1681)) [`3de034`](https://github.com/reearth/reearth-visualizer/commit/3de034)
- Add export project for internal [VIZ-1757] ([#1666](https://github.com/reearth/reearth-visualizer/pull/1666)) [`1b7672`](https://github.com/reearth/reearth-visualizer/commit/1b7672)
- Add topics for metadata [VIZ-1758] ([#1660](https://github.com/reearth/reearth-visualizer/pull/1660)) [`9dbe77`](https://github.com/reearth/reearth-visualizer/commit/9dbe77)
- Import bug fix ([#1673](https://github.com/reearth/reearth-visualizer/pull/1673)) [`f0cc8f`](https://github.com/reearth/reearth-visualizer/commit/f0cc8f)
- Update project for internal [VIZ-1756] ([#1659](https://github.com/reearth/reearth-visualizer/pull/1659)) [`fa30d3`](https://github.com/reearth/reearth-visualizer/commit/fa30d3)
- Add readme license api [VIZ-1656] ([#1658](https://github.com/reearth/reearth-visualizer/pull/1658)) [`e63c85`](https://github.com/reearth/reearth-visualizer/commit/e63c85)
- Add ProjectImportStatus[VIZ-1641] ([#1640](https://github.com/reearth/reearth-visualizer/pull/1640)) [`f8654d`](https://github.com/reearth/reearth-visualizer/commit/f8654d)
- Remove h2c for cloudrun grpc [VIZ-1734] ([#1649](https://github.com/reearth/reearth-visualizer/pull/1649)) [`1325e1`](https://github.com/reearth/reearth-visualizer/commit/1325e1)
- Add healthcheck path ([#1611](https://github.com/reearth/reearth-visualizer/pull/1611)) [`7f5234`](https://github.com/reearth/reearth-visualizer/commit/7f5234)
- Add visualizer internal api [VIZ-1517, VIZ-1604] ([#1574](https://github.com/reearth/reearth-visualizer/pull/1574)) [`7254d8`](https://github.com/reearth/reearth-visualizer/commit/7254d8)
- Threading the file upload process [VIZ-1556] ([#1594](https://github.com/reearth/reearth-visualizer/pull/1594)) [`79c886`](https://github.com/reearth/reearth-visualizer/commit/79c886)

#### 🔧 Bug Fixes

- Fix filtering bug ([#1750](https://github.com/reearth/reearth-visualizer/pull/1750)) [`d44552`](https://github.com/reearth/reearth-visualizer/commit/d44552)
- Revert &quot;feat(server): remove ErrInvalidID&quot; ([#1749](https://github.com/reearth/reearth-visualizer/pull/1749)) [`32b577`](https://github.com/reearth/reearth-visualizer/commit/32b577)
- Cannot access a workspace ([#1748](https://github.com/reearth/reearth-visualizer/pull/1748)) [`cdf3dd`](https://github.com/reearth/reearth-visualizer/commit/cdf3dd)
- Fix import error ([#1730](https://github.com/reearth/reearth-visualizer/pull/1730)) [`404179`](https://github.com/reearth/reearth-visualizer/commit/404179)
- Copy team to workspace ([#1736](https://github.com/reearth/reearth-visualizer/pull/1736)) [`25170c`](https://github.com/reearth/reearth-visualizer/commit/25170c)
- Migrate projectmetadata id ([#1735](https://github.com/reearth/reearth-visualizer/pull/1735)) [`8e7864`](https://github.com/reearth/reearth-visualizer/commit/8e7864)
- Stories not filtered ([#1727](https://github.com/reearth/reearth-visualizer/pull/1727)) [`080710`](https://github.com/reearth/reearth-visualizer/commit/080710)
- Save point change ([#1712](https://github.com/reearth/reearth-visualizer/pull/1712)) [`aa9c50`](https://github.com/reearth/reearth-visualizer/commit/aa9c50)
- Internal api cesium value [VIZ-2027] ([#1706](https://github.com/reearth/reearth-visualizer/pull/1706)) [`16b898`](https://github.com/reearth/reearth-visualizer/commit/16b898)
- Force attach host ([#1704](https://github.com/reearth/reearth-visualizer/pull/1704)) [`d4e9e1`](https://github.com/reearth/reearth-visualizer/commit/d4e9e1)
- Enable to set offset on project pgFilter ([#1701](https://github.com/reearth/reearth-visualizer/pull/1701)) [`8e18d8`](https://github.com/reearth/reearth-visualizer/commit/8e18d8)
- For project import [VIZ-1945] ([#1692](https://github.com/reearth/reearth-visualizer/pull/1692)) [`9c214d`](https://github.com/reearth/reearth-visualizer/commit/9c214d)
- Save status from project to project metadata ([#1667](https://github.com/reearth/reearth-visualizer/pull/1667)) [`63f488`](https://github.com/reearth/reearth-visualizer/commit/63f488)

#### ✨ Refactor

- Getproject internalapi [VIZ-1819] ([#1668](https://github.com/reearth/reearth-visualizer/pull/1668)) [`096af6`](https://github.com/reearth/reearth-visualizer/commit/096af6)

#### Miscellaneous Tasks

- Added non valid project alias migration ([#1742](https://github.com/reearth/reearth-visualizer/pull/1742)) [`807005`](https://github.com/reearth/reearth-visualizer/commit/807005)
- Team to workspace [VIZ-1997] ([#1719](https://github.com/reearth/reearth-visualizer/pull/1719)) [`a9e534`](https://github.com/reearth/reearth-visualizer/commit/a9e534)
- Activated internal api [VIZ-1922] ([#1682](https://github.com/reearth/reearth-visualizer/pull/1682)) [`87e10b`](https://github.com/reearth/reearth-visualizer/commit/87e10b)
- Update to latest reearthx [VIZ-1840] ([#1671](https://github.com/reearth/reearth-visualizer/pull/1671)) [`2a7d42`](https://github.com/reearth/reearth-visualizer/commit/2a7d42)
- Publishment refactoring ([#1607](https://github.com/reearth/reearth-visualizer/pull/1607)) [`5c19ab`](https://github.com/reearth/reearth-visualizer/commit/5c19ab)
- Delete junk data [VIZ-1396] ([#1527](https://github.com/reearth/reearth-visualizer/pull/1527)) [`964095`](https://github.com/reearth/reearth-visualizer/commit/964095)

### Misc

#### Miscellaneous Tasks

- Update step-security&#x2F;changed-files action to v46 ([#1657](https://github.com/reearth/reearth-visualizer/pull/1657)) [`fa0e5c`](https://github.com/reearth/reearth-visualizer/commit/fa0e5c)
- Update docker&#x2F;login-action action to v3 ([#1655](https://github.com/reearth/reearth-visualizer/pull/1655)) [`3bf751`](https://github.com/reearth/reearth-visualizer/commit/3bf751)
- Update reearth&#x2F;actions digest to b63f7da ([#1624](https://github.com/reearth/reearth-visualizer/pull/1624)) [`2891c7`](https://github.com/reearth/reearth-visualizer/commit/2891c7)

### migrate

#### 🔧 Bug Fixes

- Copy workspace to team ([#1734](https://github.com/reearth/reearth-visualizer/pull/1734)) [`acd78b`](https://github.com/reearth/reearth-visualizer/commit/acd78b)

### migration


### test,web


### 

#### Miscellaneous Tasks

- Update step-security&#x2F;changed-files action to v46 ([#1657](https://github.com/reearth/reearth-visualizer/pull/1657)) [`fa0e5c`](https://github.com/reearth/reearth-visualizer/commit/fa0e5c)
- Update docker&#x2F;login-action action to v3 ([#1655](https://github.com/reearth/reearth-visualizer/pull/1655)) [`3bf751`](https://github.com/reearth/reearth-visualizer/commit/3bf751)
- Update reearth&#x2F;actions digest to b63f7da ([#1624](https://github.com/reearth/reearth-visualizer/pull/1624)) [`2891c7`](https://github.com/reearth/reearth-visualizer/commit/2891c7)

## 1.0.0-beta.6.0 - 2025-05-13

### Web

#### 🚀 Features

- Support restful api for split import project [VIZ-1508] ([#1570](https://github.com/reearth/reearth-visualizer/pull/1570)) [`cb134b`](https://github.com/reearth/reearth-visualizer/commit/cb134b)
- Support custom timeout for project export&#x2F;import&#x2F;delete mutation [VIZ-1494] ([#1550](https://github.com/reearth/reearth-visualizer/pull/1550)) [`f25527`](https://github.com/reearth/reearth-visualizer/commit/f25527)

#### 🔧 Bug Fixes

- Disable cache on valid alias queries &amp; fix ui around alias ([#1603](https://github.com/reearth/reearth-visualizer/pull/1603)) [`d0faf3`](https://github.com/reearth/reearth-visualizer/commit/d0faf3)
- Remove unnecessary project properties from update calls in project general settings ([#1595](https://github.com/reearth/reearth-visualizer/pull/1595)) [`040023`](https://github.com/reearth/reearth-visualizer/commit/040023)
- Skip project mutation update when no change [VIZ-1523] ([#1591](https://github.com/reearth/reearth-visualizer/pull/1591)) [`649676`](https://github.com/reearth/reearth-visualizer/commit/649676)
- Fix TS error in vite.config.ts file [VIZ-1559] ([#1586](https://github.com/reearth/reearth-visualizer/pull/1586)) [`7c1e45`](https://github.com/reearth/reearth-visualizer/commit/7c1e45)
- Input&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s action key missing ([#1588](https://github.com/reearth/reearth-visualizer/pull/1588)) [`6fa63d`](https://github.com/reearth/reearth-visualizer/commit/6fa63d)
- Auth session persistence after logout when using browser back button [VIZ-1486] ([#1554](https://github.com/reearth/reearth-visualizer/pull/1554)) [`d23b95`](https://github.com/reearth/reearth-visualizer/commit/d23b95)
- Missing property on installed plugin [VIZ-1492] ([#1549](https://github.com/reearth/reearth-visualizer/pull/1549)) [`3cf1ef`](https://github.com/reearth/reearth-visualizer/commit/3cf1ef)

#### ✨ Refactor

- Use scene.id when reset alias of published map [VIZ-1601] ([#1599](https://github.com/reearth/reearth-visualizer/pull/1599)) [`edfff9`](https://github.com/reearth/reearth-visualizer/commit/edfff9)
- Update alias prefix in public settings for consistency ([#1596](https://github.com/reearth/reearth-visualizer/pull/1596)) [`352be7`](https://github.com/reearth/reearth-visualizer/commit/352be7)
- Publish project page ui&#x2F;ux [VIZ-1439] ([#1558](https://github.com/reearth/reearth-visualizer/pull/1558)) [`23beb8`](https://github.com/reearth/reearth-visualizer/commit/23beb8)
- Improve error handling [VIZ-1485] ([#1584](https://github.com/reearth/reearth-visualizer/pull/1584)) [`6b772a`](https://github.com/reearth/reearth-visualizer/commit/6b772a)
- Improve ui components accessibility [VIZ-1522] ([#1576](https://github.com/reearth/reearth-visualizer/pull/1576)) [`2a2c53`](https://github.com/reearth/reearth-visualizer/commit/2a2c53)
- Rename measured height[VIZ-1542] ([#1583](https://github.com/reearth/reearth-visualizer/pull/1583)) [`be1755`](https://github.com/reearth/reearth-visualizer/commit/be1755)
- Settings page layout [VIZ-1431] ([#1560](https://github.com/reearth/reearth-visualizer/pull/1560)) [`c16ba0`](https://github.com/reearth/reearth-visualizer/commit/c16ba0)

#### 🧪 Testing

- Import project tests ([#1593](https://github.com/reearth/reearth-visualizer/pull/1593)) [`bda584`](https://github.com/reearth/reearth-visualizer/commit/bda584)
- Add unit tests for hooks [VIZ-1577] ([#1592](https://github.com/reearth/reearth-visualizer/pull/1592)) [`147afa`](https://github.com/reearth/reearth-visualizer/commit/147afa)
- Add tests for hooks [VIZ-1559] ([#1589](https://github.com/reearth/reearth-visualizer/pull/1589)) [`5f40a4`](https://github.com/reearth/reearth-visualizer/commit/5f40a4)
- Add unit tests to components [VIZ-1465] ([#1579](https://github.com/reearth/reearth-visualizer/pull/1579)) [`610c93`](https://github.com/reearth/reearth-visualizer/commit/610c93)
- Reduce unit test coverage and add unit tests to components [VIZ-1501] ([#1582](https://github.com/reearth/reearth-visualizer/pull/1582)) [`94328b`](https://github.com/reearth/reearth-visualizer/commit/94328b)
- Added tests for project screen ([#1581](https://github.com/reearth/reearth-visualizer/pull/1581)) [`dfd42e`](https://github.com/reearth/reearth-visualizer/commit/dfd42e)
- Add unit tests to components [VIZ-1465] ([#1577](https://github.com/reearth/reearth-visualizer/pull/1577)) [`6198ee`](https://github.com/reearth/reearth-visualizer/commit/6198ee)
- Add unit tests for field components [VIZ-1498] ([#1567](https://github.com/reearth/reearth-visualizer/pull/1567)) [`ec6a89`](https://github.com/reearth/reearth-visualizer/commit/ec6a89)
- Add test screen recording ([#1571](https://github.com/reearth/reearth-visualizer/pull/1571)) [`42585f`](https://github.com/reearth/reearth-visualizer/commit/42585f)
- Add unit tests to utility functions [VIZ-1497] ([#1552](https://github.com/reearth/reearth-visualizer/pull/1552)) [`c137ea`](https://github.com/reearth/reearth-visualizer/commit/c137ea)
- Add component tests for Breadcrumb, Button, CheckBox, and ClickAway in reearth-ui ([#1533](https://github.com/reearth/reearth-visualizer/pull/1533)) [`2a30f2`](https://github.com/reearth/reearth-visualizer/commit/2a30f2)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.6.0 ([#1600](https://github.com/reearth/reearth-visualizer/pull/1600)) [`e942be`](https://github.com/reearth/reearth-visualizer/commit/e942be)
- Enable Corepack and set Yarn version in license checker workflow ([#1601](https://github.com/reearth/reearth-visualizer/pull/1601)) [`413fb3`](https://github.com/reearth/reearth-visualizer/commit/413fb3)
- Improve accessibility in feature&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s component ([#1585](https://github.com/reearth/reearth-visualizer/pull/1585)) [`1e15dc`](https://github.com/reearth/reearth-visualizer/commit/1e15dc)
- QA Automation Framework ([#1559](https://github.com/reearth/reearth-visualizer/pull/1559)) [`5875bd`](https://github.com/reearth/reearth-visualizer/commit/5875bd)
- Update code owner of e2e ([#1561](https://github.com/reearth/reearth-visualizer/pull/1561)) [`5905e2`](https://github.com/reearth/reearth-visualizer/commit/5905e2)
- Update test related packages and reduce test coverage scope temporarily [VIZ-1460] ([#1551](https://github.com/reearth/reearth-visualizer/pull/1551)) [`45a938`](https://github.com/reearth/reearth-visualizer/commit/45a938)

### Server

#### 🚀 Features

- Migrate project&#x2F;story alias [VIZ-1478] ([#1590](https://github.com/reearth/reearth-visualizer/pull/1590)) [`b639e3`](https://github.com/reearth/reearth-visualizer/commit/b639e3)
- Update alias check [VIZ-1541] ([#1587](https://github.com/reearth/reearth-visualizer/pull/1587)) [`3e84d8`](https://github.com/reearth/reearth-visualizer/commit/3e84d8)
- Update alias validation[VIZ-1535] [VIZ-1558] ([#1580](https://github.com/reearth/reearth-visualizer/pull/1580)) [`85b4c0`](https://github.com/reearth/reearth-visualizer/commit/85b4c0)
- Add Public Projects Support[VIZ-1481] [VIZ-1480] ([#1573](https://github.com/reearth/reearth-visualizer/pull/1573)) [`a5a657`](https://github.com/reearth/reearth-visualizer/commit/a5a657)
- Set project visibility [VIZ-1517] ([#1575](https://github.com/reearth/reearth-visualizer/pull/1575)) [`071011`](https://github.com/reearth/reearth-visualizer/commit/071011)
- Split file uploads command [VIZ-1470] ([#1553](https://github.com/reearth/reearth-visualizer/pull/1553)) [`149084`](https://github.com/reearth/reearth-visualizer/commit/149084)
- Add windows batch [VIZ-1468] ([#1544](https://github.com/reearth/reearth-visualizer/pull/1544)) [`68cf3a`](https://github.com/reearth/reearth-visualizer/commit/68cf3a)
- Insert project id to project alias value when project is created [VIZ-1475] ([#1556](https://github.com/reearth/reearth-visualizer/pull/1556)) [`5779d7`](https://github.com/reearth/reearth-visualizer/commit/5779d7)

#### 🔧 Bug Fixes

- Fix alias duplicate check ([#1602](https://github.com/reearth/reearth-visualizer/pull/1602)) [`f1779a`](https://github.com/reearth/reearth-visualizer/commit/f1779a)
- Use scene.id when id is checked in project.Publish ([#1598](https://github.com/reearth/reearth-visualizer/pull/1598)) [`1b7894`](https://github.com/reearth/reearth-visualizer/commit/1b7894)
- Use epsilon comparison [VIZ-1488] ([#1548](https://github.com/reearth/reearth-visualizer/pull/1548)) [`82f130`](https://github.com/reearth/reearth-visualizer/commit/82f130)
- Revert sort logic [VIZ-1423] ([#1528](https://github.com/reearth/reearth-visualizer/pull/1528)) [`47c8b9`](https://github.com/reearth/reearth-visualizer/commit/47c8b9)
- Import url replace error ([#1526](https://github.com/reearth/reearth-visualizer/pull/1526)) [`c8ffef`](https://github.com/reearth/reearth-visualizer/commit/c8ffef)

#### Miscellaneous Tasks

- Return appropriate error from project updateAlias ([#1543](https://github.com/reearth/reearth-visualizer/pull/1543)) [`085504`](https://github.com/reearth/reearth-visualizer/commit/085504)
- Fix graceful shutdown &amp; fix filename typo [VIZ-1483] ([#1545](https://github.com/reearth/reearth-visualizer/pull/1545)) [`dc2a27`](https://github.com/reearth/reearth-visualizer/commit/dc2a27)
- Add file size check [VIZ-1425] ([#1542](https://github.com/reearth/reearth-visualizer/pull/1542)) [`2d6abc`](https://github.com/reearth/reearth-visualizer/commit/2d6abc)
- Update README about how to add error message ([#1541](https://github.com/reearth/reearth-visualizer/pull/1541)) [`346dff`](https://github.com/reearth/reearth-visualizer/commit/346dff)
- Add document about how to add error message ([#1540](https://github.com/reearth/reearth-visualizer/pull/1540)) [`744e8f`](https://github.com/reearth/reearth-visualizer/commit/744e8f)

### Misc


### qa-web

#### Miscellaneous Tasks

- Update dev-test-run.yml ([#1563](https://github.com/reearth/reearth-visualizer/pull/1563)) [`4ef360`](https://github.com/reearth/reearth-visualizer/commit/4ef360)
- Fixing qa pipeline ([#1562](https://github.com/reearth/reearth-visualizer/pull/1562)) [`ac2bcc`](https://github.com/reearth/reearth-visualizer/commit/ac2bcc)

###

## 1.0.0-beta.5.1 - 2025-03-31

### Web

#### 🔧 Bug Fixes

- Member page permissions for modify role and remove member ([#1537](https://github.com/reearth/reearth-visualizer/pull/1537)) [`348a52`](https://github.com/reearth/reearth-visualizer/commit/348a52)

#### Miscellaneous Tasks

- Update package version to v1.0.0-beta.5.1 ([#1538](https://github.com/reearth/reearth-visualizer/pull/1538)) [`372e5e`](https://github.com/reearth/reearth-visualizer/commit/372e5e)

## 1.0.0-beta.5.0 - 2025-03-31

### Web

#### 🚀 Features

- Support set photo overlay on layer inspector [VIZ-1349] ([#1522](https://github.com/reearth/reearth-visualizer/pull/1522)) [`801620`](https://github.com/reearth/reearth-visualizer/commit/801620)

#### 🔧 Bug Fixes

- Add supportedLangs to i18n initializer [VIZ-1412] ([#1536](https://github.com/reearth/reearth-visualizer/pull/1536)) [`405405`](https://github.com/reearth/reearth-visualizer/commit/405405)
- Edit sketch custom properties [VIZ-1429] ([#1531](https://github.com/reearth/reearth-visualizer/pull/1531)) [`2003af`](https://github.com/reearth/reearth-visualizer/commit/2003af)

#### ✨ Refactor

- Add experimental icon to project settings dropdown export button ([#1534](https://github.com/reearth/reearth-visualizer/pull/1534)) [`7c4923`](https://github.com/reearth/reearth-visualizer/commit/7c4923)
- Plugin playground presets - refactor presets styling [VIZ-1384] ([#1495](https://github.com/reearth/reearth-visualizer/pull/1495)) [`2586d9`](https://github.com/reearth/reearth-visualizer/commit/2586d9)
- Remove api key input for google map photorealistics [VIZ-1411] ([#1524](https://github.com/reearth/reearth-visualizer/pull/1524)) [`dca0d7`](https://github.com/reearth/reearth-visualizer/commit/dca0d7)
- Support  tooltip on icon button [VIZ-1401] ([#1514](https://github.com/reearth/reearth-visualizer/pull/1514)) [`92d9b8`](https://github.com/reearth/reearth-visualizer/commit/92d9b8)
- Implement a permission table on FE[VIZ-1400] ([#1518](https://github.com/reearth/reearth-visualizer/pull/1518)) [`040e53`](https://github.com/reearth/reearth-visualizer/commit/040e53)
- Plugin playground presets - refactor screenshot example [VIZ-1414] ([#1507](https://github.com/reearth/reearth-visualizer/pull/1507)) [`06134e`](https://github.com/reearth/reearth-visualizer/commit/06134e)
- Add reference to developer documentation links in plugin playground [VIZ-1410] ([#1506](https://github.com/reearth/reearth-visualizer/pull/1506)) [`1a88f5`](https://github.com/reearth/reearth-visualizer/commit/1a88f5)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.5.0 ([#1535](https://github.com/reearth/reearth-visualizer/pull/1535)) [`928ba0`](https://github.com/reearth/reearth-visualizer/commit/928ba0)
- Remove support for 2D&#x2F;2.5D mode ([#1519](https://github.com/reearth/reearth-visualizer/pull/1519)) [`3e423e`](https://github.com/reearth/reearth-visualizer/commit/3e423e)
- Camera type correction [VIZ-1355] ([#1509](https://github.com/reearth/reearth-visualizer/pull/1509)) [`b06d0e`](https://github.com/reearth/reearth-visualizer/commit/b06d0e)
- Support kmz file in kml format [VIZ-1402] ([#1513](https://github.com/reearth/reearth-visualizer/pull/1513)) [`ca9cce`](https://github.com/reearth/reearth-visualizer/commit/ca9cce)

### Server

#### 🚀 Features

- Add db index [VIZ-1406] ([#1505](https://github.com/reearth/reearth-visualizer/pull/1505)) [`68d14b`](https://github.com/reearth/reearth-visualizer/commit/68d14b)
- Add data deletion process [VIZ-1419] ([#1520](https://github.com/reearth/reearth-visualizer/pull/1520)) [`46a083`](https://github.com/reearth/reearth-visualizer/commit/46a083)
- Add photoOverlay property  [VIZ-1340]  ([#1508](https://github.com/reearth/reearth-visualizer/pull/1508)) [`4f8f0f`](https://github.com/reearth/reearth-visualizer/commit/4f8f0f)
- Remove unnecessary code [VIZ-BE-582] ([#1458](https://github.com/reearth/reearth-visualizer/pull/1458)) [`55cd40`](https://github.com/reearth/reearth-visualizer/commit/55cd40)

#### Miscellaneous Tasks

- Remaining ID refactoring [VIZ-574] ([#1517](https://github.com/reearth/reearth-visualizer/pull/1517)) [`1bb86b`](https://github.com/reearth/reearth-visualizer/commit/1bb86b)
- Refactoring id scene [VIZ-BE-574] ([#1516](https://github.com/reearth/reearth-visualizer/pull/1516)) [`e8a438`](https://github.com/reearth/reearth-visualizer/commit/e8a438)
- Refactoring id project and workspace [VIZ-BE-574] ([#1515](https://github.com/reearth/reearth-visualizer/pull/1515)) [`26615f`](https://github.com/reearth/reearth-visualizer/commit/26615f)

### Misc

#### 

- Vv1.0.0 [`d34bca`](https://github.com/reearth/reearth-visualizer/commit/d34bca)

### server, web

#### Miscellaneous Tasks

- Remove ArcGIS terrain [VIZ-1424] ([#1525](https://github.com/reearth/reearth-visualizer/pull/1525)) [`837aa0`](https://github.com/reearth/reearth-visualizer/commit/837aa0)

### 

#### 

- Vv1.0.0 [`d34bca`](https://github.com/reearth/reearth-visualizer/commit/d34bca)

## 1.0.0 - 2025-03-31

### Web

#### 🚀 Features

- Support set photo overlay on layer inspector [VIZ-1349] ([#1522](https://github.com/reearth/reearth-visualizer/pull/1522)) [`801620`](https://github.com/reearth/reearth-visualizer/commit/801620)

#### 🔧 Bug Fixes

- Add supportedLangs to i18n initializer [VIZ-1412] ([#1536](https://github.com/reearth/reearth-visualizer/pull/1536)) [`405405`](https://github.com/reearth/reearth-visualizer/commit/405405)
- Edit sketch custom properties [VIZ-1429] ([#1531](https://github.com/reearth/reearth-visualizer/pull/1531)) [`2003af`](https://github.com/reearth/reearth-visualizer/commit/2003af)

#### ✨ Refactor

- Add experimental icon to project settings dropdown export button ([#1534](https://github.com/reearth/reearth-visualizer/pull/1534)) [`7c4923`](https://github.com/reearth/reearth-visualizer/commit/7c4923)
- Plugin playground presets - refactor presets styling [VIZ-1384] ([#1495](https://github.com/reearth/reearth-visualizer/pull/1495)) [`2586d9`](https://github.com/reearth/reearth-visualizer/commit/2586d9)
- Remove api key input for google map photorealistics [VIZ-1411] ([#1524](https://github.com/reearth/reearth-visualizer/pull/1524)) [`dca0d7`](https://github.com/reearth/reearth-visualizer/commit/dca0d7)
- Support  tooltip on icon button [VIZ-1401] ([#1514](https://github.com/reearth/reearth-visualizer/pull/1514)) [`92d9b8`](https://github.com/reearth/reearth-visualizer/commit/92d9b8)
- Implement a permission table on FE[VIZ-1400] ([#1518](https://github.com/reearth/reearth-visualizer/pull/1518)) [`040e53`](https://github.com/reearth/reearth-visualizer/commit/040e53)
- Plugin playground presets - refactor screenshot example [VIZ-1414] ([#1507](https://github.com/reearth/reearth-visualizer/pull/1507)) [`06134e`](https://github.com/reearth/reearth-visualizer/commit/06134e)
- Add reference to developer documentation links in plugin playground [VIZ-1410] ([#1506](https://github.com/reearth/reearth-visualizer/pull/1506)) [`1a88f5`](https://github.com/reearth/reearth-visualizer/commit/1a88f5)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.5.0 ([#1535](https://github.com/reearth/reearth-visualizer/pull/1535)) [`928ba0`](https://github.com/reearth/reearth-visualizer/commit/928ba0)
- Remove support for 2D&#x2F;2.5D mode ([#1519](https://github.com/reearth/reearth-visualizer/pull/1519)) [`3e423e`](https://github.com/reearth/reearth-visualizer/commit/3e423e)
- Camera type correction [VIZ-1355] ([#1509](https://github.com/reearth/reearth-visualizer/pull/1509)) [`b06d0e`](https://github.com/reearth/reearth-visualizer/commit/b06d0e)
- Support kmz file in kml format [VIZ-1402] ([#1513](https://github.com/reearth/reearth-visualizer/pull/1513)) [`ca9cce`](https://github.com/reearth/reearth-visualizer/commit/ca9cce)

### Server

#### 🚀 Features

- Add db index [VIZ-1406] ([#1505](https://github.com/reearth/reearth-visualizer/pull/1505)) [`68d14b`](https://github.com/reearth/reearth-visualizer/commit/68d14b)
- Add data deletion process [VIZ-1419] ([#1520](https://github.com/reearth/reearth-visualizer/pull/1520)) [`46a083`](https://github.com/reearth/reearth-visualizer/commit/46a083)
- Add photoOverlay property  [VIZ-1340]  ([#1508](https://github.com/reearth/reearth-visualizer/pull/1508)) [`4f8f0f`](https://github.com/reearth/reearth-visualizer/commit/4f8f0f)
- Remove unnecessary code [VIZ-BE-582] ([#1458](https://github.com/reearth/reearth-visualizer/pull/1458)) [`55cd40`](https://github.com/reearth/reearth-visualizer/commit/55cd40)

#### Miscellaneous Tasks

- Remaining ID refactoring [VIZ-574] ([#1517](https://github.com/reearth/reearth-visualizer/pull/1517)) [`1bb86b`](https://github.com/reearth/reearth-visualizer/commit/1bb86b)
- Refactoring id scene [VIZ-BE-574] ([#1516](https://github.com/reearth/reearth-visualizer/pull/1516)) [`e8a438`](https://github.com/reearth/reearth-visualizer/commit/e8a438)
- Refactoring id project and workspace [VIZ-BE-574] ([#1515](https://github.com/reearth/reearth-visualizer/pull/1515)) [`26615f`](https://github.com/reearth/reearth-visualizer/commit/26615f)

### Misc


### server, web

#### Miscellaneous Tasks

- Remove ArcGIS terrain [VIZ-1424] ([#1525](https://github.com/reearth/reearth-visualizer/pull/1525)) [`837aa0`](https://github.com/reearth/reearth-visualizer/commit/837aa0)

###

## 1.0.0-beta.4.1 - 2025-03-18

### Web

#### 🔧 Bug Fixes

- Fix selector undefined of label ([#1510](https://github.com/reearth/reearth-visualizer/pull/1510)) [`d7add7`](https://github.com/reearth/reearth-visualizer/commit/d7add7)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.4.1 ([#1511](https://github.com/reearth/reearth-visualizer/pull/1511)) [`9f5c49`](https://github.com/reearth/reearth-visualizer/commit/9f5c49)

## 1.0.0-beta.4.0 - 2025-03-18

### Web

#### 🚀 Features

- Plugin playground presets - refactor some parts of plugin playground UI [VIZ-1343] ([#1463](https://github.com/reearth/reearth-visualizer/pull/1463)) [`e158ff`](https://github.com/reearth/reearth-visualizer/commit/e158ff)
- Integrate assets into project [VIZ-540] ([#1460](https://github.com/reearth/reearth-visualizer/pull/1460)) [`67e276`](https://github.com/reearth/reearth-visualizer/commit/67e276)
- Support photooverlay basic functions [VIZ-553] ([#1454](https://github.com/reearth/reearth-visualizer/pull/1454)) [`1fadbe`](https://github.com/reearth/reearth-visualizer/commit/1fadbe)
- Plugin playground presets - create popup plugin example ([#1453](https://github.com/reearth/reearth-visualizer/pull/1453)) [`1d7ddf`](https://github.com/reearth/reearth-visualizer/commit/1d7ddf)
- Add japanese language support to plugin playground ([#1441](https://github.com/reearth/reearth-visualizer/pull/1441)) [`a9dfd1`](https://github.com/reearth/reearth-visualizer/commit/a9dfd1)
- Add modal window preset plugin to plugin playground ([#1447](https://github.com/reearth/reearth-visualizer/pull/1447)) [`38a43c`](https://github.com/reearth/reearth-visualizer/commit/38a43c)
- Plugin playground presets - create viewer mouse events example ([#1445](https://github.com/reearth/reearth-visualizer/pull/1445)) [`f7b5b1`](https://github.com/reearth/reearth-visualizer/commit/f7b5b1)
- Support popup tip on Icon  ([#1437](https://github.com/reearth/reearth-visualizer/pull/1437)) [`0ae4d3`](https://github.com/reearth/reearth-visualizer/commit/0ae4d3)

#### 🔧 Bug Fixes

- Correct selected feature for infobox block &amp; fix several UI issue [VIZ-1403] ([#1501](https://github.com/reearth/reearth-visualizer/pull/1501)) [`4a95f8`](https://github.com/reearth/reearth-visualizer/commit/4a95f8)
- Ensure previously opened category remains open during category selection in plugin playground [VIZ-569] ([#1499](https://github.com/reearth/reearth-visualizer/pull/1499)) [`75e439`](https://github.com/reearth/reearth-visualizer/commit/75e439)
- Set maxHeight on story show layer button edit panel layer selector &amp; Apply layer order[VIZ-1370] ([#1498](https://github.com/reearth/reearth-visualizer/pull/1498)) [`1d1aaa`](https://github.com/reearth/reearth-visualizer/commit/1d1aaa)
- Update browser url on preset-plugin selection [VIZ-569] ([#1487](https://github.com/reearth/reearth-visualizer/pull/1487)) [`94e8cd`](https://github.com/reearth/reearth-visualizer/commit/94e8cd)
- Members management allow owner update owner [VIZ-1399] ([#1496](https://github.com/reearth/reearth-visualizer/pull/1496)) [`2cda35`](https://github.com/reearth/reearth-visualizer/commit/2cda35)
- Reset layer style name when update with empty input [VIZ-1369] ([#1488](https://github.com/reearth/reearth-visualizer/pull/1488)) [`617e02`](https://github.com/reearth/reearth-visualizer/commit/617e02)
- Fix property select not only for sketch layer[VIZ-1387] ([#1486](https://github.com/reearth/reearth-visualizer/pull/1486)) [`c83f66`](https://github.com/reearth/reearth-visualizer/commit/c83f66)
- Amend shared plugin title in plugin playground [VIZ-569] ([#1482](https://github.com/reearth/reearth-visualizer/pull/1482)) [`bdb0e4`](https://github.com/reearth/reearth-visualizer/commit/bdb0e4)
- Fix block markdown issue[VIZ-1351] ([#1473](https://github.com/reearth/reearth-visualizer/pull/1473)) [`1dcd67`](https://github.com/reearth/reearth-visualizer/commit/1dcd67)
- Check the zip format by extension on plugin playground[VIZ-1376] ([#1476](https://github.com/reearth/reearth-visualizer/pull/1476)) [`61ed01`](https://github.com/reearth/reearth-visualizer/commit/61ed01)
- Add minimum width to window-size for visualizer viewer in plugin playground [VIZ-1343] ([#1470](https://github.com/reearth/reearth-visualizer/pull/1470)) [`bea1be`](https://github.com/reearth/reearth-visualizer/commit/bea1be)
- Project general settings page missing ([#1467](https://github.com/reearth/reearth-visualizer/pull/1467)) [`4bbe6f`](https://github.com/reearth/reearth-visualizer/commit/4bbe6f)
- Plugin iframe resize issue [VIZ-451] ([#1466](https://github.com/reearth/reearth-visualizer/pull/1466)) [`d8e777`](https://github.com/reearth/reearth-visualizer/commit/d8e777)

#### ✨ Refactor

- Several minor updates on preset plugins [VIZ-1397] ([#1494](https://github.com/reearth/reearth-visualizer/pull/1494)) [`52bfa4`](https://github.com/reearth/reearth-visualizer/commit/52bfa4)
- Remove cover image from create project modal [VIZ-1378] ([#1485](https://github.com/reearth/reearth-visualizer/pull/1485)) [`82cd7b`](https://github.com/reearth/reearth-visualizer/commit/82cd7b)
- Move edit geometry button to the toolbar [VIZ-543] ([#1469](https://github.com/reearth/reearth-visualizer/pull/1469)) [`668b67`](https://github.com/reearth/reearth-visualizer/commit/668b67)
- Add prefix to story tab item title &amp; update settings layout [VIZ-1380] ([#1472](https://github.com/reearth/reearth-visualizer/pull/1472)) [`a5ae39`](https://github.com/reearth/reearth-visualizer/commit/a5ae39)
- Hide assets with projectId on workspace asset page [VIZ-1356] ([#1464](https://github.com/reearth/reearth-visualizer/pull/1464)) [`ecc193`](https://github.com/reearth/reearth-visualizer/commit/ecc193)
- Update actions base on role &amp; remove inner settings page[VIZ-544] ([#1424](https://github.com/reearth/reearth-visualizer/pull/1424)) [`552249`](https://github.com/reearth/reearth-visualizer/commit/552249)
- Connect story GA settings [VIZ-1348] ([#1461](https://github.com/reearth/reearth-visualizer/pull/1461)) [`bccb77`](https://github.com/reearth/reearth-visualizer/commit/bccb77)
- Support update layer’s  name and url ([#1451](https://github.com/reearth/reearth-visualizer/pull/1451)) [`cdbd65`](https://github.com/reearth/reearth-visualizer/commit/cdbd65)
- Update tiles&[#39](https://github.com/reearth/reearth-visualizer/pull/39); zoom level range ([#1438](https://github.com/reearth/reearth-visualizer/pull/1438)) [`8faaef`](https://github.com/reearth/reearth-visualizer/commit/8faaef)

#### Miscellaneous Tasks

- Update package version to v1.0.0-beta.4.0 ([#1503](https://github.com/reearth/reearth-visualizer/pull/1503)) [`010fd2`](https://github.com/reearth/reearth-visualizer/commit/010fd2)
- Deleted the file causing the clone issue on windows ([#1475](https://github.com/reearth/reearth-visualizer/pull/1475)) [`97878d`](https://github.com/reearth/reearth-visualizer/commit/97878d)

### Server

#### 🚀 Features

- Asset project association migration [VIZ-1381] ([#1471](https://github.com/reearth/reearth-visualizer/pull/1471)) [`64de9f`](https://github.com/reearth/reearth-visualizer/commit/64de9f)
- Create for migration job ([#1483](https://github.com/reearth/reearth-visualizer/pull/1483)) [`ec0e3a`](https://github.com/reearth/reearth-visualizer/commit/ec0e3a)
- Storytelling ga support [VIZ-1180] ([#1425](https://github.com/reearth/reearth-visualizer/pull/1425)) [`6a8820`](https://github.com/reearth/reearth-visualizer/commit/6a8820)
- Re associate project asset [#1410](https://github.com/reearth/reearth-visualizer/pull/1410) ([#1450](https://github.com/reearth/reearth-visualizer/pull/1450)) [`e01305`](https://github.com/reearth/reearth-visualizer/commit/e01305)
- Associate project asset ([#1410](https://github.com/reearth/reearth-visualizer/pull/1410)) [`bf8da5`](https://github.com/reearth/reearth-visualizer/commit/bf8da5)

#### 🔧 Bug Fixes

- Trimming Quotation ([#1502](https://github.com/reearth/reearth-visualizer/pull/1502)) [`174def`](https://github.com/reearth/reearth-visualizer/commit/174def)
- Modify migration [VIZ-1381] ([#1500](https://github.com/reearth/reearth-visualizer/pull/1500)) [`56eab8`](https://github.com/reearth/reearth-visualizer/commit/56eab8)
- Remove panic error [VIZ-1359] ([#1490](https://github.com/reearth/reearth-visualizer/pull/1490)) [`d32a6b`](https://github.com/reearth/reearth-visualizer/commit/d32a6b)
- Modify Artifact Registry ([#1492](https://github.com/reearth/reearth-visualizer/pull/1492)) [`4446a8`](https://github.com/reearth/reearth-visualizer/commit/4446a8)
- Project import export4 [VIZ-1360] ([#1484](https://github.com/reearth/reearth-visualizer/pull/1484)) [`14f610`](https://github.com/reearth/reearth-visualizer/commit/14f610)
- Ci error sort property ([#1480](https://github.com/reearth/reearth-visualizer/pull/1480)) [`299ca9`](https://github.com/reearth/reearth-visualizer/commit/299ca9)
- Project import export3 [VIZ-1360] ([#1477](https://github.com/reearth/reearth-visualizer/pull/1477)) [`d8d705`](https://github.com/reearth/reearth-visualizer/commit/d8d705)
- Project import export2 [VIZ-1359] ([#1474](https://github.com/reearth/reearth-visualizer/pull/1474)) [`0c2c20`](https://github.com/reearth/reearth-visualizer/commit/0c2c20)
- Project import export ([#1468](https://github.com/reearth/reearth-visualizer/pull/1468)) [`71f3dd`](https://github.com/reearth/reearth-visualizer/commit/71f3dd)
- Auth error fix bug ([#1459](https://github.com/reearth/reearth-visualizer/pull/1459)) [`fd3cc3`](https://github.com/reearth/reearth-visualizer/commit/fd3cc3)

#### Miscellaneous Tasks

- Sort fields ([#1479](https://github.com/reearth/reearth-visualizer/pull/1479)) [`f708ef`](https://github.com/reearth/reearth-visualizer/commit/f708ef)
- Sorting properties [VIZ-1360] ([#1478](https://github.com/reearth/reearth-visualizer/pull/1478)) [`527d46`](https://github.com/reearth/reearth-visualizer/commit/527d46)
- Revert associate project asset ([#1449](https://github.com/reearth/reearth-visualizer/pull/1449)) [`8e4f09`](https://github.com/reearth/reearth-visualizer/commit/8e4f09)

### Misc


### web,server

#### 🚀 Features

- Support dropdown to select a property on builtin infobox blocks [VIZ-560] ([#1457](https://github.com/reearth/reearth-visualizer/pull/1457)) [`37d1a3`](https://github.com/reearth/reearth-visualizer/commit/37d1a3)
- Refactor unused graphql ([#1386](https://github.com/reearth/reearth-visualizer/pull/1386)) [`e3e5ce`](https://github.com/reearth/reearth-visualizer/commit/e3e5ce)

###

## 1.0.0-beta.3.4 - 2025-02-21

### Web

#### 🚀 Features

- Plugin API: support geoid server ([#1442](https://github.com/reearth/reearth-visualizer/pull/1442)) [`ed6d56`](https://github.com/reearth/reearth-visualizer/commit/ed6d56)
- Add viewer and scene settings example ([#1440](https://github.com/reearth/reearth-visualizer/pull/1440)) [`da066c`](https://github.com/reearth/reearth-visualizer/commit/da066c)
- Plugin playground presets - create data storage plugin example ([#1435](https://github.com/reearth/reearth-visualizer/pull/1435)) [`bc7e51`](https://github.com/reearth/reearth-visualizer/commit/bc7e51)
- Add example enable shadow style and terrain ([#1436](https://github.com/reearth/reearth-visualizer/pull/1436)) [`cea577`](https://github.com/reearth/reearth-visualizer/commit/cea577)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.3.4 ([#1446](https://github.com/reearth/reearth-visualizer/pull/1446)) [`7d5b0e`](https://github.com/reearth/reearth-visualizer/commit/7d5b0e)
- Update core version ([#1434](https://github.com/reearth/reearth-visualizer/pull/1434)) [`77c5ae`](https://github.com/reearth/reearth-visualizer/commit/77c5ae)

### Server

#### Miscellaneous Tasks

- Refactoring id Layer and NLSLayer ([#1430](https://github.com/reearth/reearth-visualizer/pull/1430)) [`9361bb`](https://github.com/reearth/reearth-visualizer/commit/9361bb)

### Misc

#### Miscellaneous Tasks

- Update CODEOWNERS [`17883d`](https://github.com/reearth/reearth-visualizer/commit/17883d)

### 

#### Miscellaneous Tasks

- Update CODEOWNERS [`17883d`](https://github.com/reearth/reearth-visualizer/commit/17883d)

## 1.0.0-beta.3.3 - 2025-02-18

### Web

#### 🚀 Features

- Plugin playground presets - create timeline playback control ([#1421](https://github.com/reearth/reearth-visualizer/pull/1421)) [`e40c69`](https://github.com/reearth/reearth-visualizer/commit/e40c69)
- Add time series czml example ([#1417](https://github.com/reearth/reearth-visualizer/pull/1417)) [`1ad2fc`](https://github.com/reearth/reearth-visualizer/commit/1ad2fc)
- Plugin playground preset plugin: filter features with style ([#1409](https://github.com/reearth/reearth-visualizer/pull/1409)) [`6b3a04`](https://github.com/reearth/reearth-visualizer/commit/6b3a04)
- Add extension settings panel to plugin playground ([#1383](https://github.com/reearth/reearth-visualizer/pull/1383)) [`165b14`](https://github.com/reearth/reearth-visualizer/commit/165b14)
- Add layer override api example ([#1381](https://github.com/reearth/reearth-visualizer/pull/1381)) [`c7b5ac`](https://github.com/reearth/reearth-visualizer/commit/c7b5ac)
- Add zoom in out example ([#1413](https://github.com/reearth/reearth-visualizer/pull/1413)) [`cb1ffe`](https://github.com/reearth/reearth-visualizer/commit/cb1ffe)
- Plugin playground presets - camera position ([#1412](https://github.com/reearth/reearth-visualizer/pull/1412)) [`13b788`](https://github.com/reearth/reearth-visualizer/commit/13b788)
- Add rotate camera example ([#1411](https://github.com/reearth/reearth-visualizer/pull/1411)) [`a553eb`](https://github.com/reearth/reearth-visualizer/commit/a553eb)

#### 🔧 Bug Fixes

- Plugin playground presets - add an hidden overflow to plugin titles ([#1406](https://github.com/reearth/reearth-visualizer/pull/1406)) [`c767b7`](https://github.com/reearth/reearth-visualizer/commit/c767b7)

#### ✨ Refactor

- Sketch layer and the custom properties ([#1414](https://github.com/reearth/reearth-visualizer/pull/1414)) [`fe572c`](https://github.com/reearth/reearth-visualizer/commit/fe572c)
- Update type on plugin api spatial id ([#1422](https://github.com/reearth/reearth-visualizer/pull/1422)) [`f43e77`](https://github.com/reearth/reearth-visualizer/commit/f43e77)
- Support import plugin with zip file instead of single js file in plugin playground ([#1420](https://github.com/reearth/reearth-visualizer/pull/1420)) [`29c766`](https://github.com/reearth/reearth-visualizer/commit/29c766)
- Support edit mode on sketch custom property value editor &amp; style editor ([#1419](https://github.com/reearth/reearth-visualizer/pull/1419)) [`49554d`](https://github.com/reearth/reearth-visualizer/commit/49554d)
- Plugin playground presets - camera position ([#1415](https://github.com/reearth/reearth-visualizer/pull/1415)) [`98a374`](https://github.com/reearth/reearth-visualizer/commit/98a374)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.3.3 ([#1433](https://github.com/reearth/reearth-visualizer/pull/1433)) [`21a7eb`](https://github.com/reearth/reearth-visualizer/commit/21a7eb)

### Server

#### 🔧 Bug Fixes

- Attempt to fix golang lint file error ([#1431](https://github.com/reearth/reearth-visualizer/pull/1431)) [`ec8b31`](https://github.com/reearth/reearth-visualizer/commit/ec8b31)

#### Miscellaneous Tasks

- Removed unnecessary initializer ([#1432](https://github.com/reearth/reearth-visualizer/pull/1432)) [`455246`](https://github.com/reearth/reearth-visualizer/commit/455246)
- Refactoring e2e test code ([#1393](https://github.com/reearth/reearth-visualizer/pull/1393)) [`6c9312`](https://github.com/reearth/reearth-visualizer/commit/6c9312)

## 1.0.0-beta.3.2 - 2025-02-05

### Web

#### 🚀 Features

- Update @reearth&#x2F;core ([#1407](https://github.com/reearth/reearth-visualizer/pull/1407)) [`7c3f1a`](https://github.com/reearth/reearth-visualizer/commit/7c3f1a)

#### 🔧 Bug Fixes

- Missing one example on plugin playground ([#1402](https://github.com/reearth/reearth-visualizer/pull/1402)) [`304d32`](https://github.com/reearth/reearth-visualizer/commit/304d32)

#### ✨ Refactor

- Format code ([#1405](https://github.com/reearth/reearth-visualizer/pull/1405)) [`5aed76`](https://github.com/reearth/reearth-visualizer/commit/5aed76)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.3.2 ([#1408](https://github.com/reearth/reearth-visualizer/pull/1408)) [`d6f07c`](https://github.com/reearth/reearth-visualizer/commit/d6f07c)
- Update package version to 1.0.0-beta.3.1 ([#1403](https://github.com/reearth/reearth-visualizer/pull/1403)) [`2dd7b7`](https://github.com/reearth/reearth-visualizer/commit/2dd7b7)

### ci

#### Miscellaneous Tasks

- Fix changed-files ([#1404](https://github.com/reearth/reearth-visualizer/pull/1404)) [`1b368e`](https://github.com/reearth/reearth-visualizer/commit/1b368e)

## 1.0.0-beta.3.0 - 2025-02-04

### Web

#### 🚀 Features

- Add 3d tiles and 3d model style example ([#1394](https://github.com/reearth/reearth-visualizer/pull/1394)) [`4e1fdf`](https://github.com/reearth/reearth-visualizer/commit/4e1fdf)
- Add example of show selected features information in plugin playground ([#1376](https://github.com/reearth/reearth-visualizer/pull/1376)) [`67be6f`](https://github.com/reearth/reearth-visualizer/commit/67be6f)
- Plugin playground presets extension to extension messenger ([#1367](https://github.com/reearth/reearth-visualizer/pull/1367)) [`11d841`](https://github.com/reearth/reearth-visualizer/commit/11d841)
- Add playground example google 3d tiles ([#1368](https://github.com/reearth/reearth-visualizer/pull/1368)) [`778cfd`](https://github.com/reearth/reearth-visualizer/commit/778cfd)
- Add hide flyto and delete layer plugin example  ([#1365](https://github.com/reearth/reearth-visualizer/pull/1365)) [`3290d0`](https://github.com/reearth/reearth-visualizer/commit/3290d0)
- Reset visualizer when plugin is executed ([#1364](https://github.com/reearth/reearth-visualizer/pull/1364)) [`b282bb`](https://github.com/reearth/reearth-visualizer/commit/b282bb)
- Update story custom domain extension ([#1361](https://github.com/reearth/reearth-visualizer/pull/1361)) [`2d1d0a`](https://github.com/reearth/reearth-visualizer/commit/2d1d0a)

#### 🔧 Bug Fixes

- Custom domain form ([#1369](https://github.com/reearth/reearth-visualizer/pull/1369)) [`206654`](https://github.com/reearth/reearth-visualizer/commit/206654)

#### ✨ Refactor

- Improve exit story block edit mode ([#1347](https://github.com/reearth/reearth-visualizer/pull/1347)) [`a340b7`](https://github.com/reearth/reearth-visualizer/commit/a340b7)
- Display errors msg got from be ([#1343](https://github.com/reearth/reearth-visualizer/pull/1343)) [`1d93e8`](https://github.com/reearth/reearth-visualizer/commit/1d93e8)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.3.0 ([#1400](https://github.com/reearth/reearth-visualizer/pull/1400)) [`dad5dc`](https://github.com/reearth/reearth-visualizer/commit/dad5dc)
- Validate Re:Earth configuration on container startup ([#1390](https://github.com/reearth/reearth-visualizer/pull/1390)) [`d004b6`](https://github.com/reearth/reearth-visualizer/commit/d004b6)
- Update reearth core versionto 0.0.7-alpha.28 ([#1391](https://github.com/reearth/reearth-visualizer/pull/1391)) [`751818`](https://github.com/reearth/reearth-visualizer/commit/751818)
- Update package version to 1.0.0-beta.2.2 ([#1374](https://github.com/reearth/reearth-visualizer/pull/1374)) [`e2b952`](https://github.com/reearth/reearth-visualizer/commit/e2b952)
- Upgrade reearth core to 0.0.7-alpha.27 ([#1373](https://github.com/reearth/reearth-visualizer/pull/1373)) [`07ae4a`](https://github.com/reearth/reearth-visualizer/commit/07ae4a)
- Support create initial camera with Edit panel ([#1356](https://github.com/reearth/reearth-visualizer/pull/1356)) [`1141a0`](https://github.com/reearth/reearth-visualizer/commit/1141a0)

### Server

#### 🚀 Features

- Update geojson custom library ([#1366](https://github.com/reearth/reearth-visualizer/pull/1366)) [`37c75f`](https://github.com/reearth/reearth-visualizer/commit/37c75f)

#### 🔧 Bug Fixes

- Enable CoreSupport ([#1392](https://github.com/reearth/reearth-visualizer/pull/1392)) [`49cd2f`](https://github.com/reearth/reearth-visualizer/commit/49cd2f)
- Fix CustomProperty nil error ([#1388](https://github.com/reearth/reearth-visualizer/pull/1388)) [`a52c0a`](https://github.com/reearth/reearth-visualizer/commit/a52c0a)

#### ✨ Refactor

- Return detailed error by lang ([#1342](https://github.com/reearth/reearth-visualizer/pull/1342)) [`70d3dc`](https://github.com/reearth/reearth-visualizer/commit/70d3dc)

#### Miscellaneous Tasks

- Fix docker&#x2F;build-push-action version ([#1396](https://github.com/reearth/reearth-visualizer/pull/1396)) [`5fd91a`](https://github.com/reearth/reearth-visualizer/commit/5fd91a)
- Fix diff of generated files from go generate ([#1382](https://github.com/reearth/reearth-visualizer/pull/1382)) [`41c428`](https://github.com/reearth/reearth-visualizer/commit/41c428)
- Add UploadAssetFromURL on fs file implementation ([#1380](https://github.com/reearth/reearth-visualizer/pull/1380)) [`b59def`](https://github.com/reearth/reearth-visualizer/commit/b59def)
- Upgrade go version to 1.23.5 ([#1384](https://github.com/reearth/reearth-visualizer/pull/1384)) [`34c240`](https://github.com/reearth/reearth-visualizer/commit/34c240)
- Add UploadAssetFromURL on gcs file implementation ([#1379](https://github.com/reearth/reearth-visualizer/pull/1379)) [`75dbc0`](https://github.com/reearth/reearth-visualizer/commit/75dbc0)
- Fake gcs server for local development ([#1372](https://github.com/reearth/reearth-visualizer/pull/1372)) [`267cfb`](https://github.com/reearth/reearth-visualizer/commit/267cfb)

### Misc

#### Miscellaneous Tasks

- Update go dependencies ([#1329](https://github.com/reearth/reearth-visualizer/pull/1329)) [`1cfa20`](https://github.com/reearth/reearth-visualizer/commit/1cfa20)

### servr

#### 🚀 Features

- Add MultiLineString Valid ([#1377](https://github.com/reearth/reearth-visualizer/pull/1377)) [`b6111f`](https://github.com/reearth/reearth-visualizer/commit/b6111f)

### 

#### Miscellaneous Tasks

- Update go dependencies ([#1329](https://github.com/reearth/reearth-visualizer/pull/1329)) [`1cfa20`](https://github.com/reearth/reearth-visualizer/commit/1cfa20)

## 1.0.0-beta.2.1 - 2025-01-20

### Web

#### 🚀 Features

- Add manage layer example ([#1362](https://github.com/reearth/reearth-visualizer/pull/1362)) [`8fcdbf`](https://github.com/reearth/reearth-visualizer/commit/8fcdbf)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.2.1 ([#1363](https://github.com/reearth/reearth-visualizer/pull/1363)) [`6b53ac`](https://github.com/reearth/reearth-visualizer/commit/6b53ac)

## 1.0.0-beta.2.0 - 2025-01-20

### Web

#### 🚀 Features

- Add google map search function and ui ([#1318](https://github.com/reearth/reearth-visualizer/pull/1318)) [`215b0a`](https://github.com/reearth/reearth-visualizer/commit/215b0a)
- Support for spatial id  ([#1331](https://github.com/reearth/reearth-visualizer/pull/1331)) [`9441b7`](https://github.com/reearth/reearth-visualizer/commit/9441b7)
- Plugin playground presets header ([#1319](https://github.com/reearth/reearth-visualizer/pull/1319)) [`9e409d`](https://github.com/reearth/reearth-visualizer/commit/9e409d)
- Support layer reorder ([#1338](https://github.com/reearth/reearth-visualizer/pull/1338)) [`76ac96`](https://github.com/reearth/reearth-visualizer/commit/76ac96)
- Add sample layers to plugin playground ([#1330](https://github.com/reearth/reearth-visualizer/pull/1330)) [`ee4c98`](https://github.com/reearth/reearth-visualizer/commit/ee4c98)
- Plugin playground presets sidebar ([#1315](https://github.com/reearth/reearth-visualizer/pull/1315)) [`bf23f0`](https://github.com/reearth/reearth-visualizer/commit/bf23f0)
- Missing &#x60;disableWorkspaceManagement&#x60; envvar ([#1312](https://github.com/reearth/reearth-visualizer/pull/1312)) [`a10633`](https://github.com/reearth/reearth-visualizer/commit/a10633)
- Add ability to share plugin in plugin-playground ([#1305](https://github.com/reearth/reearth-visualizer/pull/1305)) [`99c8f1`](https://github.com/reearth/reearth-visualizer/commit/99c8f1)
- Setup basic widget ui ([#1302](https://github.com/reearth/reearth-visualizer/pull/1302)) [`daa169`](https://github.com/reearth/reearth-visualizer/commit/daa169)
- Support preset plugins on plugin playground ([#1299](https://github.com/reearth/reearth-visualizer/pull/1299)) [`05953e`](https://github.com/reearth/reearth-visualizer/commit/05953e)

#### 🔧 Bug Fixes

- Ensure new layer reorders correctly. ([#1346](https://github.com/reearth/reearth-visualizer/pull/1346)) [`c8910c`](https://github.com/reearth/reearth-visualizer/commit/c8910c)
- Improve enter functionality in text input  ([#1341](https://github.com/reearth/reearth-visualizer/pull/1341)) [`887173`](https://github.com/reearth/reearth-visualizer/commit/887173)
- Naming typo on preset layer style category ([#1340](https://github.com/reearth/reearth-visualizer/pull/1340)) [`b3a6c4`](https://github.com/reearth/reearth-visualizer/commit/b3a6c4)
- Fix icon button size on block add bar ([#1333](https://github.com/reearth/reearth-visualizer/pull/1333)) [`0c94bb`](https://github.com/reearth/reearth-visualizer/commit/0c94bb)
- Layer style boolean selector field doesn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t work properly with string value ([#1322](https://github.com/reearth/reearth-visualizer/pull/1322)) [`6edee2`](https://github.com/reearth/reearth-visualizer/commit/6edee2)
- Add missing &quot;extended&quot; prop to plugin ([#1325](https://github.com/reearth/reearth-visualizer/pull/1325)) [`b42214`](https://github.com/reearth/reearth-visualizer/commit/b42214)
- Refactor UI to plugin list in plugin playground page ([#1307](https://github.com/reearth/reearth-visualizer/pull/1307)) [`554c53`](https://github.com/reearth/reearth-visualizer/commit/554c53)
- Number input logics ([#1316](https://github.com/reearth/reearth-visualizer/pull/1316)) [`e36143`](https://github.com/reearth/reearth-visualizer/commit/e36143)
- Tailwind class not included on build ([#1313](https://github.com/reearth/reearth-visualizer/pull/1313)) [`3cc7f1`](https://github.com/reearth/reearth-visualizer/commit/3cc7f1)
- Remove&#x60;VISUALIZER&#x60; for runtime environment variables ([#1280](https://github.com/reearth/reearth-visualizer/pull/1280)) [`2f1054`](https://github.com/reearth/reearth-visualizer/commit/2f1054)
- Widget ui style missing on built ([#1304](https://github.com/reearth/reearth-visualizer/pull/1304)) [`c1589d`](https://github.com/reearth/reearth-visualizer/commit/c1589d)
- Add missing &#x60;UNSAFE_PLUGIN_URLS&#x60; and &#x60;BRAND&#x60; environment variable ([#1297](https://github.com/reearth/reearth-visualizer/pull/1297)) [`8b1dad`](https://github.com/reearth/reearth-visualizer/commit/8b1dad)

#### ✨ Refactor

- Infobox&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s customized property list. ([#1317](https://github.com/reearth/reearth-visualizer/pull/1317)) [`ec01d9`](https://github.com/reearth/reearth-visualizer/commit/ec01d9)

#### Miscellaneous Tasks

- Update version to 1.0.0-beta.2.0 ([#1353](https://github.com/reearth/reearth-visualizer/pull/1353)) [`4ab77e`](https://github.com/reearth/reearth-visualizer/commit/4ab77e)
- Update core version ([#1334](https://github.com/reearth/reearth-visualizer/pull/1334)) [`aa882c`](https://github.com/reearth/reearth-visualizer/commit/aa882c)
- Update core version to &[#39](https://github.com/reearth/reearth-visualizer/pull/39);0.0.7-alpha.22&[#39](https://github.com/reearth/reearth-visualizer/pull/39); ([#1303](https://github.com/reearth/reearth-visualizer/pull/1303)) [`ead9f8`](https://github.com/reearth/reearth-visualizer/commit/ead9f8)
- Clean up usage of &quot;any&quot; type in code-base ([#1294](https://github.com/reearth/reearth-visualizer/pull/1294)) [`18be4e`](https://github.com/reearth/reearth-visualizer/commit/18be4e)

### Server

#### 🚀 Features

- Modify query response ([#1327](https://github.com/reearth/reearth-visualizer/pull/1327)) [`0f72fb`](https://github.com/reearth/reearth-visualizer/commit/0f72fb)
- Support reorder layer ([#1321](https://github.com/reearth/reearth-visualizer/pull/1321)) [`769a27`](https://github.com/reearth/reearth-visualizer/commit/769a27)

#### Miscellaneous Tasks

- Enable to set visualizer db name by .env ([#1345](https://github.com/reearth/reearth-visualizer/pull/1345)) [`52f66e`](https://github.com/reearth/reearth-visualizer/commit/52f66e)
- Install air and add dev command for hotreload ([#1337](https://github.com/reearth/reearth-visualizer/pull/1337)) [`42e2b7`](https://github.com/reearth/reearth-visualizer/commit/42e2b7)
- Upgrade go version to 1.23.4 ([#1339](https://github.com/reearth/reearth-visualizer/pull/1339)) [`189fda`](https://github.com/reearth/reearth-visualizer/commit/189fda)
- Handler for gql has extension loaded twice ([#1335](https://github.com/reearth/reearth-visualizer/pull/1335)) [`255d3c`](https://github.com/reearth/reearth-visualizer/commit/255d3c)
- Fix makefile command that did not work ([#1332](https://github.com/reearth/reearth-visualizer/pull/1332)) [`d6d6f0`](https://github.com/reearth/reearth-visualizer/commit/d6d6f0)

### Misc

#### Miscellaneous Tasks

- Update CODEOWNERS [`f9f67a`](https://github.com/reearth/reearth-visualizer/commit/f9f67a)
- Add bind mounts tailwind and postcss config on docker build for web ([#1314](https://github.com/reearth/reearth-visualizer/pull/1314)) [`3432cd`](https://github.com/reearth/reearth-visualizer/commit/3432cd)

### 

#### Miscellaneous Tasks

- Update CODEOWNERS [`f9f67a`](https://github.com/reearth/reearth-visualizer/commit/f9f67a)
- Add bind mounts tailwind and postcss config on docker build for web ([#1314](https://github.com/reearth/reearth-visualizer/pull/1314)) [`3432cd`](https://github.com/reearth/reearth-visualizer/commit/3432cd)

## 1.0.0-beta.1.0 - 2024-11-29

### Web

#### 🚀 Features

- Improve time point input with ISO8601 ([#1292](https://github.com/reearth/reearth-visualizer/pull/1292)) [`f75434`](https://github.com/reearth/reearth-visualizer/commit/f75434)
- Plugin playground &#x2F; display console ([#1263](https://github.com/reearth/reearth-visualizer/pull/1263)) [`3444ab`](https://github.com/reearth/reearth-visualizer/commit/3444ab)
- Plugin playground&#x2F;enable edit html with modal ([#1236](https://github.com/reearth/reearth-visualizer/pull/1236)) [`898a0b`](https://github.com/reearth/reearth-visualizer/commit/898a0b)
- Plugin playground&#x2F;reflect code editor to viewer ([#1224](https://github.com/reearth/reearth-visualizer/pull/1224)) [`49df88`](https://github.com/reearth/reearth-visualizer/commit/49df88)
- Add missing &#x60;multiTenant&#x60; property in Re:Earth config ([#1249](https://github.com/reearth/reearth-visualizer/pull/1249)) [`a70324`](https://github.com/reearth/reearth-visualizer/commit/a70324)
- Support property placeholder on infobox blocks ([#1243](https://github.com/reearth/reearth-visualizer/pull/1243)) [`f0f384`](https://github.com/reearth/reearth-visualizer/commit/f0f384)
- Plugin playground&#x2F;upload file and download plugin ([#1216](https://github.com/reearth/reearth-visualizer/pull/1216)) [`fa27c3`](https://github.com/reearth/reearth-visualizer/commit/fa27c3)
- Add new logo to screens ([#1230](https://github.com/reearth/reearth-visualizer/pull/1230)) [`f4e2eb`](https://github.com/reearth/reearth-visualizer/commit/f4e2eb)
- Env vars to rewrite favicon and title on Docker ([#1235](https://github.com/reearth/reearth-visualizer/pull/1235)) [`26db1c`](https://github.com/reearth/reearth-visualizer/commit/26db1c)
- Add tooltip for experimental functions ([#1232](https://github.com/reearth/reearth-visualizer/pull/1232)) [`3d0f73`](https://github.com/reearth/reearth-visualizer/commit/3d0f73)
- Add workspace function ([#1229](https://github.com/reearth/reearth-visualizer/pull/1229)) [`cf1bd0`](https://github.com/reearth/reearth-visualizer/commit/cf1bd0)
- Add support to copy asset url from asset dashboard ([#1195](https://github.com/reearth/reearth-visualizer/pull/1195)) [`6b7695`](https://github.com/reearth/reearth-visualizer/commit/6b7695)
- Add env var to control the display of workspace management pages ([#1203](https://github.com/reearth/reearth-visualizer/pull/1203)) [`a67942`](https://github.com/reearth/reearth-visualizer/commit/a67942)
- Data license builtin widget ([#1196](https://github.com/reearth/reearth-visualizer/pull/1196)) [`e04f67`](https://github.com/reearth/reearth-visualizer/commit/e04f67)
- Members setting ([#1186](https://github.com/reearth/reearth-visualizer/pull/1186)) [`8011ac`](https://github.com/reearth/reearth-visualizer/commit/8011ac)
- Project recycle bin ([#1181](https://github.com/reearth/reearth-visualizer/pull/1181)) [`0fde95`](https://github.com/reearth/reearth-visualizer/commit/0fde95)
- Add indicator for active gql requests ([#1190](https://github.com/reearth/reearth-visualizer/pull/1190)) [`b922fb`](https://github.com/reearth/reearth-visualizer/commit/b922fb)
- Support asset field in layer style editor ([#1184](https://github.com/reearth/reearth-visualizer/pull/1184)) [`f25b5d`](https://github.com/reearth/reearth-visualizer/commit/f25b5d)
- Workspace setting page ([#1174](https://github.com/reearth/reearth-visualizer/pull/1174)) [`967eb7`](https://github.com/reearth/reearth-visualizer/commit/967eb7)
- Support cesium  and google photorealistic 3d tiles ([#1172](https://github.com/reearth/reearth-visualizer/pull/1172)) [`b96d9f`](https://github.com/reearth/reearth-visualizer/commit/b96d9f)
- New layer style final step ([#1175](https://github.com/reearth/reearth-visualizer/pull/1175)) [`b1c2db`](https://github.com/reearth/reearth-visualizer/commit/b1c2db)
- Support edit sketch geometry on editor ([#1153](https://github.com/reearth/reearth-visualizer/pull/1153)) [`12bf6b`](https://github.com/reearth/reearth-visualizer/commit/12bf6b)
- Update preset layer style hideIndicator setting ([#1164](https://github.com/reearth/reearth-visualizer/pull/1164)) [`dedecd`](https://github.com/reearth/reearth-visualizer/commit/dedecd)
- Add account page to change password ([#1155](https://github.com/reearth/reearth-visualizer/pull/1155)) [`391c75`](https://github.com/reearth/reearth-visualizer/commit/391c75)
- Export &amp; Import Project ([#1154](https://github.com/reearth/reearth-visualizer/pull/1154)) [`25f35c`](https://github.com/reearth/reearth-visualizer/commit/25f35c)
- Layer style node system ([#1143](https://github.com/reearth/reearth-visualizer/pull/1143)) [`16722a`](https://github.com/reearth/reearth-visualizer/commit/16722a)
- Preset layer style ([#1156](https://github.com/reearth/reearth-visualizer/pull/1156)) [`67cad9`](https://github.com/reearth/reearth-visualizer/commit/67cad9)
- Update @reearth&#x2F;core ([#1145](https://github.com/reearth/reearth-visualizer/pull/1145)) [`62c5a8`](https://github.com/reearth/reearth-visualizer/commit/62c5a8)
- Implement the basic panel structure  ([#1138](https://github.com/reearth/reearth-visualizer/pull/1138)) [`2f8bc8`](https://github.com/reearth/reearth-visualizer/commit/2f8bc8)
- Support infobox for plugin layer ([#1134](https://github.com/reearth/reearth-visualizer/pull/1134)) [`06aa78`](https://github.com/reearth/reearth-visualizer/commit/06aa78)
- Add textarea field in property field ([#1133](https://github.com/reearth/reearth-visualizer/pull/1133)) [`fc813b`](https://github.com/reearth/reearth-visualizer/commit/fc813b)
- Support custom domain function ([#1130](https://github.com/reearth/reearth-visualizer/pull/1130)) [`4cb63f`](https://github.com/reearth/reearth-visualizer/commit/4cb63f)
- Builtin infobox video and markdown block ([#1117](https://github.com/reearth/reearth-visualizer/pull/1117)) [`dd0a5f`](https://github.com/reearth/reearth-visualizer/commit/dd0a5f)
- Support delete sketch feature ([#1105](https://github.com/reearth/reearth-visualizer/pull/1105)) [`422db8`](https://github.com/reearth/reearth-visualizer/commit/422db8)
- Implements projects functionalities ([#1055](https://github.com/reearth/reearth-visualizer/pull/1055)) [`400b7b`](https://github.com/reearth/reearth-visualizer/commit/400b7b)
- Update custom properties schema ([#1088](https://github.com/reearth/reearth-visualizer/pull/1088)) [`f6330d`](https://github.com/reearth/reearth-visualizer/commit/f6330d)
- Support dev plugins ([#1059](https://github.com/reearth/reearth-visualizer/pull/1059)) [`2ccc95`](https://github.com/reearth/reearth-visualizer/commit/2ccc95)
- Basic structure of plugin playground ([#1036](https://github.com/reearth/reearth-visualizer/pull/1036)) [`0fe261`](https://github.com/reearth/reearth-visualizer/commit/0fe261)
- Support plugin block property ([#1029](https://github.com/reearth/reearth-visualizer/pull/1029)) [`c07a2a`](https://github.com/reearth/reearth-visualizer/commit/c07a2a)
- Upgrade core ([#969](https://github.com/reearth/reearth-visualizer/pull/969)) [`a36a00`](https://github.com/reearth/reearth-visualizer/commit/a36a00)
- Update cesium ([#951](https://github.com/reearth/reearth-visualizer/pull/951)) [`b77f58`](https://github.com/reearth/reearth-visualizer/commit/b77f58)
- Upgrade mvt lib [`daaa8f`](https://github.com/reearth/reearth-visualizer/commit/daaa8f)

#### 🔧 Bug Fixes

- Style code condition values need to be wrapped ([#1295](https://github.com/reearth/reearth-visualizer/pull/1295)) [`5fc8f1`](https://github.com/reearth/reearth-visualizer/commit/5fc8f1)
- Correct placeholder text for project search ([#1290](https://github.com/reearth/reearth-visualizer/pull/1290)) [`2d6e55`](https://github.com/reearth/reearth-visualizer/commit/2d6e55)
- Plugin playground&#x2F; Modify the behavior of the HTML Editor modal ([#1282](https://github.com/reearth/reearth-visualizer/pull/1282)) [`564eb7`](https://github.com/reearth/reearth-visualizer/commit/564eb7)
- Add functionality to reset 3d tile styles to default styles ([#1279](https://github.com/reearth/reearth-visualizer/pull/1279)) [`84ea4e`](https://github.com/reearth/reearth-visualizer/commit/84ea4e)
- Assets query not updated for coreSupport ([#1273](https://github.com/reearth/reearth-visualizer/pull/1273)) [`62ae80`](https://github.com/reearth/reearth-visualizer/commit/62ae80)
- Layer style editor condition item can&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t resize properly with a selector ([#1267](https://github.com/reearth/reearth-visualizer/pull/1267)) [`045742`](https://github.com/reearth/reearth-visualizer/commit/045742)
- 3d tiles&[#39](https://github.com/reearth/reearth-visualizer/pull/39); style cannot be reset ([#1262](https://github.com/reearth/reearth-visualizer/pull/1262)) [`c29f8a`](https://github.com/reearth/reearth-visualizer/commit/c29f8a)
- Terrain not applied properly on editor ([#1260](https://github.com/reearth/reearth-visualizer/pull/1260)) [`e51810`](https://github.com/reearth/reearth-visualizer/commit/e51810)
- Popup menu has an unexpected horizontal scroll bar ([#1259](https://github.com/reearth/reearth-visualizer/pull/1259)) [`093387`](https://github.com/reearth/reearth-visualizer/commit/093387)
- Sketch layer custom property in infobox ([#1248](https://github.com/reearth/reearth-visualizer/pull/1248)) [`283d11`](https://github.com/reearth/reearth-visualizer/commit/283d11)
- Number input been interrupted during the input on layer style editor ([#1252](https://github.com/reearth/reearth-visualizer/pull/1252)) [`de5b57`](https://github.com/reearth/reearth-visualizer/commit/de5b57)
- Camera returning to initial camera position after scene settings change ([#1251](https://github.com/reearth/reearth-visualizer/pull/1251)) [`2d0452`](https://github.com/reearth/reearth-visualizer/commit/2d0452)
- Several UI fix  ([#1250](https://github.com/reearth/reearth-visualizer/pull/1250)) [`8dbbe5`](https://github.com/reearth/reearth-visualizer/commit/8dbbe5)
- Check UI and fix language issue ([#1237](https://github.com/reearth/reearth-visualizer/pull/1237)) [`dff7dc`](https://github.com/reearth/reearth-visualizer/commit/dff7dc)
- Timeline block speed ([#1233](https://github.com/reearth/reearth-visualizer/pull/1233)) [`f333ed`](https://github.com/reearth/reearth-visualizer/commit/f333ed)
- Zoom to layer could go underground on first trigger ([#1242](https://github.com/reearth/reearth-visualizer/pull/1242)) [`3a7abb`](https://github.com/reearth/reearth-visualizer/commit/3a7abb)
- Remove &#x60;coverImageUrl&#x60; from Re:Earth connfig ([#1244](https://github.com/reearth/reearth-visualizer/pull/1244)) [`5a5798`](https://github.com/reearth/reearth-visualizer/commit/5a5798)
- Publish scene and story could use the same alias by mistake ([#1238](https://github.com/reearth/reearth-visualizer/pull/1238)) [`c91c2d`](https://github.com/reearth/reearth-visualizer/commit/c91c2d)
- Timezone selector unexpected closes the popup ([#1234](https://github.com/reearth/reearth-visualizer/pull/1234)) [`cb0fe8`](https://github.com/reearth/reearth-visualizer/commit/cb0fe8)
- Time disappear on cancel timeline popup ([#1220](https://github.com/reearth/reearth-visualizer/pull/1220)) [`6a96cb`](https://github.com/reearth/reearth-visualizer/commit/6a96cb)
- Scene settings fov not applied ([#1223](https://github.com/reearth/reearth-visualizer/pull/1223)) [`8e9556`](https://github.com/reearth/reearth-visualizer/commit/8e9556)
- Add notification when error occurs during asset upload ([#1225](https://github.com/reearth/reearth-visualizer/pull/1225)) [`31176c`](https://github.com/reearth/reearth-visualizer/commit/31176c)
- Fix status of member&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s setting page ([#1214](https://github.com/reearth/reearth-visualizer/pull/1214)) [`cf658e`](https://github.com/reearth/reearth-visualizer/commit/cf658e)
- Plugin playground display plugins ([#1189](https://github.com/reearth/reearth-visualizer/pull/1189)) [`d83191`](https://github.com/reearth/reearth-visualizer/commit/d83191)
- Error on load assets page ([#1219](https://github.com/reearth/reearth-visualizer/pull/1219)) [`9e5137`](https://github.com/reearth/reearth-visualizer/commit/9e5137)
- No project shows up when sort is first created ([#1210](https://github.com/reearth/reearth-visualizer/pull/1210)) [`b2e602`](https://github.com/reearth/reearth-visualizer/commit/b2e602)
- Exclude czml &amp; kml for the default layer style ([#1217](https://github.com/reearth/reearth-visualizer/pull/1217)) [`8baf2e`](https://github.com/reearth/reearth-visualizer/commit/8baf2e)
- Missing type gltf support for model asset input ([#1209](https://github.com/reearth/reearth-visualizer/pull/1209)) [`33e66e`](https://github.com/reearth/reearth-visualizer/commit/33e66e)
- Improve project import  ([#1199](https://github.com/reearth/reearth-visualizer/pull/1199)) [`d2a966`](https://github.com/reearth/reearth-visualizer/commit/d2a966)
- Sidebar layout ([#1194](https://github.com/reearth/reearth-visualizer/pull/1194)) [`88b536`](https://github.com/reearth/reearth-visualizer/commit/88b536)
- Dashboard projects is loading more than expected ([#1193](https://github.com/reearth/reearth-visualizer/pull/1193)) [`6a0d08`](https://github.com/reearth/reearth-visualizer/commit/6a0d08)
- Selection lost when update layer style etc. ([#1192](https://github.com/reearth/reearth-visualizer/pull/1192)) [`270a26`](https://github.com/reearth/reearth-visualizer/commit/270a26)
- Style code condition operator match ([#1191](https://github.com/reearth/reearth-visualizer/pull/1191)) [`8b7e48`](https://github.com/reearth/reearth-visualizer/commit/8b7e48)
- Refactor typos with text copy ([#1125](https://github.com/reearth/reearth-visualizer/pull/1125)) [`3c1b48`](https://github.com/reearth/reearth-visualizer/commit/3c1b48)
- Add prop to indicate version in marketplace extension ([#1177](https://github.com/reearth/reearth-visualizer/pull/1177)) [`ec10ce`](https://github.com/reearth/reearth-visualizer/commit/ec10ce)
- Update projects cache after delete ([#1167](https://github.com/reearth/reearth-visualizer/pull/1167)) [`6f6112`](https://github.com/reearth/reearth-visualizer/commit/6f6112)
- Update button on publish modal is always disabled on first time ([#1150](https://github.com/reearth/reearth-visualizer/pull/1150)) [`d428b4`](https://github.com/reearth/reearth-visualizer/commit/d428b4)
- Plugin iframe has an incorrect size ([#1149](https://github.com/reearth/reearth-visualizer/pull/1149)) [`13e4f7`](https://github.com/reearth/reearth-visualizer/commit/13e4f7)
- Page time not updated when switch story page ([#1147](https://github.com/reearth/reearth-visualizer/pull/1147)) [`08d5d2`](https://github.com/reearth/reearth-visualizer/commit/08d5d2)
- Tabs order ([#1139](https://github.com/reearth/reearth-visualizer/pull/1139)) [`c18275`](https://github.com/reearth/reearth-visualizer/commit/c18275)
- Assets load more not working properly sometimes ([#1137](https://github.com/reearth/reearth-visualizer/pull/1137)) [`58a108`](https://github.com/reearth/reearth-visualizer/commit/58a108)
- Publish status ([#1129](https://github.com/reearth/reearth-visualizer/pull/1129)) [`78c8eb`](https://github.com/reearth/reearth-visualizer/commit/78c8eb)
- Custom sketch property name ([#1126](https://github.com/reearth/reearth-visualizer/pull/1126)) [`375035`](https://github.com/reearth/reearth-visualizer/commit/375035)
- Support content input scroll ([#1122](https://github.com/reearth/reearth-visualizer/pull/1122)) [`ff375f`](https://github.com/reearth/reearth-visualizer/commit/ff375f)
- Dashboard projects loading ui ([#1121](https://github.com/reearth/reearth-visualizer/pull/1121)) [`e46553`](https://github.com/reearth/reearth-visualizer/commit/e46553)
- Assets upload &amp; sort &amp; size unit ([#1111](https://github.com/reearth/reearth-visualizer/pull/1111)) [`a930c0`](https://github.com/reearth/reearth-visualizer/commit/a930c0)
- Sketch feature id changes when update custom property ([#1102](https://github.com/reearth/reearth-visualizer/pull/1102)) [`b34d3a`](https://github.com/reearth/reearth-visualizer/commit/b34d3a)
- Camera duration bug ([#1107](https://github.com/reearth/reearth-visualizer/pull/1107)) [`bdf32d`](https://github.com/reearth/reearth-visualizer/commit/bdf32d)
- Disable link when id undefined ([#1104](https://github.com/reearth/reearth-visualizer/pull/1104)) [`e58f8c`](https://github.com/reearth/reearth-visualizer/commit/e58f8c)
- Pagination with duplicate data fetch ([#1090](https://github.com/reearth/reearth-visualizer/pull/1090)) [`29a09e`](https://github.com/reearth/reearth-visualizer/commit/29a09e)
- Story page property ([#1084](https://github.com/reearth/reearth-visualizer/pull/1084)) [`b8499c`](https://github.com/reearth/reearth-visualizer/commit/b8499c)
- Block icons and layer panel height ([#1082](https://github.com/reearth/reearth-visualizer/pull/1082)) [`716bb6`](https://github.com/reearth/reearth-visualizer/commit/716bb6)
- Fix property List Block Height ([#1072](https://github.com/reearth/reearth-visualizer/pull/1072)) [`11b2b4`](https://github.com/reearth/reearth-visualizer/commit/11b2b4)
- Mvt and wms add button ([#1071](https://github.com/reearth/reearth-visualizer/pull/1071)) [`c6c256`](https://github.com/reearth/reearth-visualizer/commit/c6c256)
- Sketch data not processed correctly ([#1054](https://github.com/reearth/reearth-visualizer/pull/1054)) [`e87230`](https://github.com/reearth/reearth-visualizer/commit/e87230)
- Embed git commit hash from vite in correct way ([#1049](https://github.com/reearth/reearth-visualizer/pull/1049)) [`f408ac`](https://github.com/reearth/reearth-visualizer/commit/f408ac)
- Expose git commit hash on window ([#1047](https://github.com/reearth/reearth-visualizer/pull/1047)) [`87a8e2`](https://github.com/reearth/reearth-visualizer/commit/87a8e2)
- Support shapefile based on esri ([#984](https://github.com/reearth/reearth-visualizer/pull/984)) [`263aaa`](https://github.com/reearth/reearth-visualizer/commit/263aaa)
- Catch error [`73351b`](https://github.com/reearth/reearth-visualizer/commit/73351b)
- Load cesium token from separate file ([#949](https://github.com/reearth/reearth-visualizer/pull/949)) [`782b98`](https://github.com/reearth/reearth-visualizer/commit/782b98)
- Load cesium token from separate file ([#907](https://github.com/reearth/reearth-visualizer/pull/907)) [`332a2e`](https://github.com/reearth/reearth-visualizer/commit/332a2e)
- Selection without groundPrimitives ([#938](https://github.com/reearth/reearth-visualizer/pull/938)) [`2f4293`](https://github.com/reearth/reearth-visualizer/commit/2f4293)
- Mvt with worker ([#928](https://github.com/reearth/reearth-visualizer/pull/928)) [`ab00ff`](https://github.com/reearth/reearth-visualizer/commit/ab00ff)
- Refactor routes ([#923](https://github.com/reearth/reearth-visualizer/pull/923)) [`d667cb`](https://github.com/reearth/reearth-visualizer/commit/d667cb)
- Feature index issue ([#924](https://github.com/reearth/reearth-visualizer/pull/924)) [`178b99`](https://github.com/reearth/reearth-visualizer/commit/178b99)
- Reset terrain material [`5ea131`](https://github.com/reearth/reearth-visualizer/commit/5ea131)
- Use id in default [`e09e99`](https://github.com/reearth/reearth-visualizer/commit/e09e99)
- Use feature properties for id [`1c8422`](https://github.com/reearth/reearth-visualizer/commit/1c8422)
- Use cesium&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s material ([#890](https://github.com/reearth/reearth-visualizer/pull/890)) [`351eb2`](https://github.com/reearth/reearth-visualizer/commit/351eb2)
- Use attribute&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s color without PBR [`941dac`](https://github.com/reearth/reearth-visualizer/commit/941dac)

#### ✨ Refactor

- Update page title as Re:Earth Visualizer ([#1291](https://github.com/reearth/reearth-visualizer/pull/1291)) [`563da5`](https://github.com/reearth/reearth-visualizer/commit/563da5)
- Clean up deprecated plugin api v1 ([#1286](https://github.com/reearth/reearth-visualizer/pull/1286)) [`07b4d2`](https://github.com/reearth/reearth-visualizer/commit/07b4d2)
- Remove unnecessary notification on user search ([#1284](https://github.com/reearth/reearth-visualizer/pull/1284)) [`b1355f`](https://github.com/reearth/reearth-visualizer/commit/b1355f)
- Update translation ([#1277](https://github.com/reearth/reearth-visualizer/pull/1277)) [`b65410`](https://github.com/reearth/reearth-visualizer/commit/b65410)
- Fix typo on screen when no asset appears and in settings dropdown ([#1269](https://github.com/reearth/reearth-visualizer/pull/1269)) [`43b1a4`](https://github.com/reearth/reearth-visualizer/commit/43b1a4)
- Add Slider and use in settings ([#1266](https://github.com/reearth/reearth-visualizer/pull/1266)) [`8977ee`](https://github.com/reearth/reearth-visualizer/commit/8977ee)
- Clean up console.log on data attribution widget ([#1268](https://github.com/reearth/reearth-visualizer/pull/1268)) [`4fed85`](https://github.com/reearth/reearth-visualizer/commit/4fed85)
- Improve recycle bin default image ([#1261](https://github.com/reearth/reearth-visualizer/pull/1261)) [`0e9a7b`](https://github.com/reearth/reearth-visualizer/commit/0e9a7b)
- Clean up utils ([#1254](https://github.com/reearth/reearth-visualizer/pull/1254)) [`68ae86`](https://github.com/reearth/reearth-visualizer/commit/68ae86)
- Use lang at api hooks ([#1247](https://github.com/reearth/reearth-visualizer/pull/1247)) [`8afefd`](https://github.com/reearth/reearth-visualizer/commit/8afefd)
- Improve default project image ([#1240](https://github.com/reearth/reearth-visualizer/pull/1240)) [`ca58bd`](https://github.com/reearth/reearth-visualizer/commit/ca58bd)
- Improve load projects on dashboard page ([#1241](https://github.com/reearth/reearth-visualizer/pull/1241)) [`76c1de`](https://github.com/reearth/reearth-visualizer/commit/76c1de)
- Add layer from resource ([#1212](https://github.com/reearth/reearth-visualizer/pull/1212)) [`3016a7`](https://github.com/reearth/reearth-visualizer/commit/3016a7)
- Add initial ui translations for ja ([#1215](https://github.com/reearth/reearth-visualizer/pull/1215)) [`14526f`](https://github.com/reearth/reearth-visualizer/commit/14526f)
- Improve cursor indicator ([#1213](https://github.com/reearth/reearth-visualizer/pull/1213)) [`10600b`](https://github.com/reearth/reearth-visualizer/commit/10600b)
- Update style filed default value &amp; input type model ([#1207](https://github.com/reearth/reearth-visualizer/pull/1207)) [`d837a9`](https://github.com/reearth/reearth-visualizer/commit/d837a9)
- Remove unsupported plugin API and options ([#1187](https://github.com/reearth/reearth-visualizer/pull/1187)) [`5679fa`](https://github.com/reearth/reearth-visualizer/commit/5679fa)
- Correct lang state in settings with meData ([#1182](https://github.com/reearth/reearth-visualizer/pull/1182)) [`fc6205`](https://github.com/reearth/reearth-visualizer/commit/fc6205)
- Clean up components in beta ([#1176](https://github.com/reearth/reearth-visualizer/pull/1176)) [`dab3db`](https://github.com/reearth/reearth-visualizer/commit/dab3db)
- Layer style editor node support typography ([#1168](https://github.com/reearth/reearth-visualizer/pull/1168)) [`e6fc8f`](https://github.com/reearth/reearth-visualizer/commit/e6fc8f)
- Refactor currentWorkspaceId ([#1165](https://github.com/reearth/reearth-visualizer/pull/1165)) [`cef4bd`](https://github.com/reearth/reearth-visualizer/commit/cef4bd)
- Hide WIP setting pages on tab ([#1163](https://github.com/reearth/reearth-visualizer/pull/1163)) [`023dee`](https://github.com/reearth/reearth-visualizer/commit/023dee)
- Infobox min max height ([#1162](https://github.com/reearth/reearth-visualizer/pull/1162)) [`9ce2da`](https://github.com/reearth/reearth-visualizer/commit/9ce2da)
- Style code update style on blur ([#1159](https://github.com/reearth/reearth-visualizer/pull/1159)) [`b00aca`](https://github.com/reearth/reearth-visualizer/commit/b00aca)
- Allow popups on plugin iframe ([#1158](https://github.com/reearth/reearth-visualizer/pull/1158)) [`43ad72`](https://github.com/reearth/reearth-visualizer/commit/43ad72)
- Add key to infobox ([#1152](https://github.com/reearth/reearth-visualizer/pull/1152)) [`ae4cad`](https://github.com/reearth/reearth-visualizer/commit/ae4cad)
- Correct naming ([#1136](https://github.com/reearth/reearth-visualizer/pull/1136)) [`32caf7`](https://github.com/reearth/reearth-visualizer/commit/32caf7)
- Remove unused component ([#1118](https://github.com/reearth/reearth-visualizer/pull/1118)) [`132e65`](https://github.com/reearth/reearth-visualizer/commit/132e65)
- Dashboard&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s starred project ([#1120](https://github.com/reearth/reearth-visualizer/pull/1120)) [`ae72d5`](https://github.com/reearth/reearth-visualizer/commit/ae72d5)
- Clear project cache when update project ([#1116](https://github.com/reearth/reearth-visualizer/pull/1116)) [`6fc36d`](https://github.com/reearth/reearth-visualizer/commit/6fc36d)
- Layer style container ([#1113](https://github.com/reearth/reearth-visualizer/pull/1113)) [`6bd28f`](https://github.com/reearth/reearth-visualizer/commit/6bd28f)
- Evict project cache after delete project ([#1103](https://github.com/reearth/reearth-visualizer/pull/1103)) [`b9401d`](https://github.com/reearth/reearth-visualizer/commit/b9401d)
- Link block  ([#1096](https://github.com/reearth/reearth-visualizer/pull/1096)) [`b46698`](https://github.com/reearth/reearth-visualizer/commit/b46698)
- Update sort for projects and assets ([#1101](https://github.com/reearth/reearth-visualizer/pull/1101)) [`ab9db9`](https://github.com/reearth/reearth-visualizer/commit/ab9db9)
- Sort for projects ([#1099](https://github.com/reearth/reearth-visualizer/pull/1099)) [`14837e`](https://github.com/reearth/reearth-visualizer/commit/14837e)
- Update UI on dashboard workspace menu &amp; nav bar &amp; infobox built in blocks ([#1093](https://github.com/reearth/reearth-visualizer/pull/1093)) [`393526`](https://github.com/reearth/reearth-visualizer/commit/393526)
- Project settings page ([#1086](https://github.com/reearth/reearth-visualizer/pull/1086)) [`278fd0`](https://github.com/reearth/reearth-visualizer/commit/278fd0)
- Amend navbar breadcrumb UI ([#1083](https://github.com/reearth/reearth-visualizer/pull/1083)) [`8bbbbd`](https://github.com/reearth/reearth-visualizer/commit/8bbbbd)
- Submit button for sketch feature custom property update ([#1091](https://github.com/reearth/reearth-visualizer/pull/1091)) [`8a1f46`](https://github.com/reearth/reearth-visualizer/commit/8a1f46)
- Assets manager ([#1085](https://github.com/reearth/reearth-visualizer/pull/1085)) [`1514da`](https://github.com/reearth/reearth-visualizer/commit/1514da)
- Plugin API v2.0.0 ([#1009](https://github.com/reearth/reearth-visualizer/pull/1009)) [`2a456e`](https://github.com/reearth/reearth-visualizer/commit/2a456e)
- Refactor storybook blocks &amp; infobox blocks ([#1079](https://github.com/reearth/reearth-visualizer/pull/1079)) [`bcf1b5`](https://github.com/reearth/reearth-visualizer/commit/bcf1b5)
- Layer inspector ([#1061](https://github.com/reearth/reearth-visualizer/pull/1061)) [`6d4689`](https://github.com/reearth/reearth-visualizer/commit/6d4689)
- Widget tab ([#1066](https://github.com/reearth/reearth-visualizer/pull/1066)) [`dde206`](https://github.com/reearth/reearth-visualizer/commit/dde206)
- Scene settings inspector ([#1058](https://github.com/reearth/reearth-visualizer/pull/1058)) [`1de9eb`](https://github.com/reearth/reearth-visualizer/commit/1de9eb)
- Sketch layer creator ([#1057](https://github.com/reearth/reearth-visualizer/pull/1057)) [`93521c`](https://github.com/reearth/reearth-visualizer/commit/93521c)
- New field components ([#1017](https://github.com/reearth/reearth-visualizer/pull/1017)) [`6c6734`](https://github.com/reearth/reearth-visualizer/commit/6c6734)
- Datasource layer creation ([#1050](https://github.com/reearth/reearth-visualizer/pull/1050)) [`8e3d8b`](https://github.com/reearth/reearth-visualizer/commit/8e3d8b)
- Selected items of multiple selector ([#1045](https://github.com/reearth/reearth-visualizer/pull/1045)) [`9a5af7`](https://github.com/reearth/reearth-visualizer/commit/9a5af7)
- Story page panel ([#1039](https://github.com/reearth/reearth-visualizer/pull/1039)) [`f5cbfd`](https://github.com/reearth/reearth-visualizer/commit/f5cbfd)
- Fix some state updates logic ([#1034](https://github.com/reearth/reearth-visualizer/pull/1034)) [`a1c571`](https://github.com/reearth/reearth-visualizer/commit/a1c571)

#### 🎨 Styling

- Move scroll bar styles to theme ([#1211](https://github.com/reearth/reearth-visualizer/pull/1211)) [`e9a0d1`](https://github.com/reearth/reearth-visualizer/commit/e9a0d1)
- Correct ui style for menu and project star ([#1204](https://github.com/reearth/reearth-visualizer/pull/1204)) [`f51e1a`](https://github.com/reearth/reearth-visualizer/commit/f51e1a)
- Fix add layer resource icon style ([#1188](https://github.com/reearth/reearth-visualizer/pull/1188)) [`73dc7b`](https://github.com/reearth/reearth-visualizer/commit/73dc7b)
- Update style for members&[#39](https://github.com/reearth/reearth-visualizer/pull/39); list wrapper ([#1044](https://github.com/reearth/reearth-visualizer/pull/1044)) [`dea102`](https://github.com/reearth/reearth-visualizer/commit/dea102)
- Make layer name nowrap ([#1035](https://github.com/reearth/reearth-visualizer/pull/1035)) [`c63cb5`](https://github.com/reearth/reearth-visualizer/commit/c63cb5)

#### 🧪 Testing

- Add e2e test example to visualizer ([#1140](https://github.com/reearth/reearth-visualizer/pull/1140)) [`ff3724`](https://github.com/reearth/reearth-visualizer/commit/ff3724)
- Enable vscode vitest extension [`e89291`](https://github.com/reearth/reearth-visualizer/commit/e89291)

#### Miscellaneous Tasks

- Update package version to 1.0.0-beta.1.0 ([#1287](https://github.com/reearth/reearth-visualizer/pull/1287)) [`753833`](https://github.com/reearth/reearth-visualizer/commit/753833)
- Update core version to 0.0.7-alpha.21 ([#1296](https://github.com/reearth/reearth-visualizer/pull/1296)) [`43cff2`](https://github.com/reearth/reearth-visualizer/commit/43cff2)
- Update core version ([#1281](https://github.com/reearth/reearth-visualizer/pull/1281)) [`9847bb`](https://github.com/reearth/reearth-visualizer/commit/9847bb)
- Support enter key to submit ([#1258](https://github.com/reearth/reearth-visualizer/pull/1258)) [`79e53f`](https://github.com/reearth/reearth-visualizer/commit/79e53f)
- Add type check in pre-commit hook ([#1257](https://github.com/reearth/reearth-visualizer/pull/1257)) [`43a131`](https://github.com/reearth/reearth-visualizer/commit/43a131)
- Update package version to 1.0.0-alpha.8 ([#1218](https://github.com/reearth/reearth-visualizer/pull/1218)) [`4358df`](https://github.com/reearth/reearth-visualizer/commit/4358df)
- Update package version to 1.0.0-alpha.7 ([#1206](https://github.com/reearth/reearth-visualizer/pull/1206)) [`69c3c2`](https://github.com/reearth/reearth-visualizer/commit/69c3c2)
- Use env var with prefix for cesium ion token ([#1197](https://github.com/reearth/reearth-visualizer/pull/1197)) [`cfbf54`](https://github.com/reearth/reearth-visualizer/commit/cfbf54)
- Support default built-in layer style ([#1183](https://github.com/reearth/reearth-visualizer/pull/1183)) [`bf5e7f`](https://github.com/reearth/reearth-visualizer/commit/bf5e7f)
- Update package version ([#1166](https://github.com/reearth/reearth-visualizer/pull/1166)) [`e64723`](https://github.com/reearth/reearth-visualizer/commit/e64723)
- Support resizable content in text-area  ([#1157](https://github.com/reearth/reearth-visualizer/pull/1157)) [`8a1128`](https://github.com/reearth/reearth-visualizer/commit/8a1128)
- Upgrade github action update artifact ([#1148](https://github.com/reearth/reearth-visualizer/pull/1148)) [`150e6f`](https://github.com/reearth/reearth-visualizer/commit/150e6f)
- Update package version ([#1146](https://github.com/reearth/reearth-visualizer/pull/1146)) [`193dda`](https://github.com/reearth/reearth-visualizer/commit/193dda)
- Add @testing-library&#x2F;user-event [`a40485`](https://github.com/reearth/reearth-visualizer/commit/a40485)
- Downgrade quickjs-emscripten to v0.24.0 ([#1132](https://github.com/reearth/reearth-visualizer/pull/1132)) [`a8fef0`](https://github.com/reearth/reearth-visualizer/commit/a8fef0)
- Update version to 1.0.0-alpha.4 ([#1131](https://github.com/reearth/reearth-visualizer/pull/1131)) [`bf535a`](https://github.com/reearth/reearth-visualizer/commit/bf535a)
- Upgrade dependencies ([#1124](https://github.com/reearth/reearth-visualizer/pull/1124)) [`65869e`](https://github.com/reearth/reearth-visualizer/commit/65869e)
- Update package.json version ([#1123](https://github.com/reearth/reearth-visualizer/pull/1123)) [`4e8cec`](https://github.com/reearth/reearth-visualizer/commit/4e8cec)
- Avoid using .env.local as the filename for example .env ([#1119](https://github.com/reearth/reearth-visualizer/pull/1119)) [`6af1e2`](https://github.com/reearth/reearth-visualizer/commit/6af1e2)
- Upgrade eslint and config ([#1112](https://github.com/reearth/reearth-visualizer/pull/1112)) [`0395c4`](https://github.com/reearth/reearth-visualizer/commit/0395c4)
- Update web README.md and local env ([#1078](https://github.com/reearth/reearth-visualizer/pull/1078)) [`51bfe8`](https://github.com/reearth/reearth-visualizer/commit/51bfe8)
- Remember the open status of Feature Inspector Groups ([#1109](https://github.com/reearth/reearth-visualizer/pull/1109)) [`84caa9`](https://github.com/reearth/reearth-visualizer/commit/84caa9)
- Upgrade vite plugin cesium ([#1106](https://github.com/reearth/reearth-visualizer/pull/1106)) [`984975`](https://github.com/reearth/reearth-visualizer/commit/984975)
- Update package.json ver [`a74428`](https://github.com/reearth/reearth-visualizer/commit/a74428)
- Show only viz assets [`9d1631`](https://github.com/reearth/reearth-visualizer/commit/9d1631)
- Refactor publishModal ([#1069](https://github.com/reearth/reearth-visualizer/pull/1069)) [`475e91`](https://github.com/reearth/reearth-visualizer/commit/475e91)
- Clean up some dependencies ([#1080](https://github.com/reearth/reearth-visualizer/pull/1080)) [`66ddb2`](https://github.com/reearth/reearth-visualizer/commit/66ddb2)
- Upgrade @reearth&#x2F;core ([#1081](https://github.com/reearth/reearth-visualizer/pull/1081)) [`eb55e9`](https://github.com/reearth/reearth-visualizer/commit/eb55e9)
- Refactor pageSettingpane and create checkbox ([#1065](https://github.com/reearth/reearth-visualizer/pull/1065)) [`66e03e`](https://github.com/reearth/reearth-visualizer/commit/66e03e)
- Upgrade &amp; clean up some dependencies &amp; fix errors ([#1074](https://github.com/reearth/reearth-visualizer/pull/1074)) [`6b2f91`](https://github.com/reearth/reearth-visualizer/commit/6b2f91)
- Correct EntryItem Theme Color ([#1067](https://github.com/reearth/reearth-visualizer/pull/1067)) [`a1e062`](https://github.com/reearth/reearth-visualizer/commit/a1e062)
- Upgrade yarn to 4.3.1 ([#1062](https://github.com/reearth/reearth-visualizer/pull/1062)) [`4b585e`](https://github.com/reearth/reearth-visualizer/commit/4b585e)
- Fix typo in layer style notifications ([#1063](https://github.com/reearth/reearth-visualizer/pull/1063)) [`bb1ceb`](https://github.com/reearth/reearth-visualizer/commit/bb1ceb)
- Migrate Jotai to v2 ([#1064](https://github.com/reearth/reearth-visualizer/pull/1064)) [`bac677`](https://github.com/reearth/reearth-visualizer/commit/bac677)
- Remove classic code from repository ([#1051](https://github.com/reearth/reearth-visualizer/pull/1051)) [`6af06a`](https://github.com/reearth/reearth-visualizer/commit/6af06a)
- Visualizer dashbord ([#1023](https://github.com/reearth/reearth-visualizer/pull/1023)) [`b8a491`](https://github.com/reearth/reearth-visualizer/commit/b8a491)
- Update gql and yarn i18n ([#1041](https://github.com/reearth/reearth-visualizer/pull/1041)) [`7d0a6f`](https://github.com/reearth/reearth-visualizer/commit/7d0a6f)
- Update some ux of layers item ([#1032](https://github.com/reearth/reearth-visualizer/pull/1032)) [`37908a`](https://github.com/reearth/reearth-visualizer/commit/37908a)
- Refactor scene panel and layers panel ([#1027](https://github.com/reearth/reearth-visualizer/pull/1027)) [`a002ec`](https://github.com/reearth/reearth-visualizer/commit/a002ec)
- Layer style panel ([#1025](https://github.com/reearth/reearth-visualizer/pull/1025)) [`babbaf`](https://github.com/reearth/reearth-visualizer/commit/babbaf)
- Support plugin block in story panel ([#1022](https://github.com/reearth/reearth-visualizer/pull/1022)) [`89eafe`](https://github.com/reearth/reearth-visualizer/commit/89eafe)
- Restrict sandbox iframe ([#1024](https://github.com/reearth/reearth-visualizer/pull/1024)) [`d382de`](https://github.com/reearth/reearth-visualizer/commit/d382de)
- Refactor editor layout ([#1019](https://github.com/reearth/reearth-visualizer/pull/1019)) [`b53ce8`](https://github.com/reearth/reearth-visualizer/commit/b53ce8)
- Create switchfield ([#1015](https://github.com/reearth/reearth-visualizer/pull/1015)) [`ace8ae`](https://github.com/reearth/reearth-visualizer/commit/ace8ae)
- Create color field ([#1016](https://github.com/reearth/reearth-visualizer/pull/1016)) [`936e65`](https://github.com/reearth/reearth-visualizer/commit/936e65)
- Implement selector component ([#997](https://github.com/reearth/reearth-visualizer/pull/997)) [`7c76a8`](https://github.com/reearth/reearth-visualizer/commit/7c76a8)
- Refactor layer selection ([#989](https://github.com/reearth/reearth-visualizer/pull/989)) [`cf388a`](https://github.com/reearth/reearth-visualizer/commit/cf388a)
- Refactor breadcrumb ([#1008](https://github.com/reearth/reearth-visualizer/pull/1008)) [`5b50d8`](https://github.com/reearth/reearth-visualizer/commit/5b50d8)
- Refactor tabs ([#1010](https://github.com/reearth/reearth-visualizer/pull/1010)) [`2f0c3a`](https://github.com/reearth/reearth-visualizer/commit/2f0c3a)
- Camera move in published page ([#1014](https://github.com/reearth/reearth-visualizer/pull/1014)) [`4a926d`](https://github.com/reearth/reearth-visualizer/commit/4a926d)
- Missing prop currentCamera for story built-in blocks ([#1011](https://github.com/reearth/reearth-visualizer/pull/1011)) [`1ef4c0`](https://github.com/reearth/reearth-visualizer/commit/1ef4c0)
- Upgrade @reearth&#x2F;core ([#1013](https://github.com/reearth/reearth-visualizer/pull/1013)) [`95c817`](https://github.com/reearth/reearth-visualizer/commit/95c817)
- Update reviewer ([#1012](https://github.com/reearth/reearth-visualizer/pull/1012)) [`bf5505`](https://github.com/reearth/reearth-visualizer/commit/bf5505)
- Missing visualizerRef on published page ([#1007](https://github.com/reearth/reearth-visualizer/pull/1007)) [`37030f`](https://github.com/reearth/reearth-visualizer/commit/37030f)
- Refactor modal ([#1000](https://github.com/reearth/reearth-visualizer/pull/1000)) [`d77d6d`](https://github.com/reearth/reearth-visualizer/commit/d77d6d)
- Color input component ([#992](https://github.com/reearth/reearth-visualizer/pull/992)) [`e47774`](https://github.com/reearth/reearth-visualizer/commit/e47774)
- Refactor date and time picker ([#993](https://github.com/reearth/reearth-visualizer/pull/993)) [`1b3120`](https://github.com/reearth/reearth-visualizer/commit/1b3120)
- Remove imports of classic components in beta ([#996](https://github.com/reearth/reearth-visualizer/pull/996)) [`bbe338`](https://github.com/reearth/reearth-visualizer/commit/bbe338)
- Switcher component ([#994](https://github.com/reearth/reearth-visualizer/pull/994)) [`8ecaaa`](https://github.com/reearth/reearth-visualizer/commit/8ecaaa)
- Implement collapse component ([#991](https://github.com/reearth/reearth-visualizer/pull/991)) [`637c56`](https://github.com/reearth/reearth-visualizer/commit/637c56)
- Implement codeinput beta ui lib ([#987](https://github.com/reearth/reearth-visualizer/pull/987)) [`076625`](https://github.com/reearth/reearth-visualizer/commit/076625)
- Update core version ([#990](https://github.com/reearth/reearth-visualizer/pull/990)) [`5c8cd7`](https://github.com/reearth/reearth-visualizer/commit/5c8cd7)
- Popup panel ui ([#986](https://github.com/reearth/reearth-visualizer/pull/986)) [`ddcca2`](https://github.com/reearth/reearth-visualizer/commit/ddcca2)
- Refactor popup ui ([#983](https://github.com/reearth/reearth-visualizer/pull/983)) [`dd3167`](https://github.com/reearth/reearth-visualizer/commit/dd3167)
- Implement icon component in beta ui lib ([#985](https://github.com/reearth/reearth-visualizer/pull/985)) [`bb0cde`](https://github.com/reearth/reearth-visualizer/commit/bb0cde)
- Refactor number input ([#979](https://github.com/reearth/reearth-visualizer/pull/979)) [`6aa54e`](https://github.com/reearth/reearth-visualizer/commit/6aa54e)
- Bind sketch plugin events ([#982](https://github.com/reearth/reearth-visualizer/pull/982)) [`fb2489`](https://github.com/reearth/reearth-visualizer/commit/fb2489)
- Apply font family on storybook and button ([#980](https://github.com/reearth/reearth-visualizer/pull/980)) [`2e6730`](https://github.com/reearth/reearth-visualizer/commit/2e6730)
- Implement UI lib Button ([#977](https://github.com/reearth/reearth-visualizer/pull/977)) [`1d4153`](https://github.com/reearth/reearth-visualizer/commit/1d4153)
- Implement UI lib TextInput TextArea Typograph ([#976](https://github.com/reearth/reearth-visualizer/pull/976)) [`5d603b`](https://github.com/reearth/reearth-visualizer/commit/5d603b)
- Update github reviewers ([#978](https://github.com/reearth/reearth-visualizer/pull/978)) [`cc33c8`](https://github.com/reearth/reearth-visualizer/commit/cc33c8)
- Basic strcture for ui lib ([#975](https://github.com/reearth/reearth-visualizer/pull/975)) [`9077bd`](https://github.com/reearth/reearth-visualizer/commit/9077bd)
- Refactor ui theme ([#971](https://github.com/reearth/reearth-visualizer/pull/971)) [`8463a1`](https://github.com/reearth/reearth-visualizer/commit/8463a1)
- Change beta editor jotai status to local ([#974](https://github.com/reearth/reearth-visualizer/pull/974)) [`e15e65`](https://github.com/reearth/reearth-visualizer/commit/e15e65)
- Enable sandboxed iframe by default ([#968](https://github.com/reearth/reearth-visualizer/pull/968)) [`55990d`](https://github.com/reearth/reearth-visualizer/commit/55990d)
- Use @reearth&#x2F;core ([#963](https://github.com/reearth/reearth-visualizer/pull/963)) [`15bf87`](https://github.com/reearth/reearth-visualizer/commit/15bf87)
- Fix sketch layer in published page ([#958](https://github.com/reearth/reearth-visualizer/pull/958)) [`7975b8`](https://github.com/reearth/reearth-visualizer/commit/7975b8)
- Fix beta infobox content error ([#956](https://github.com/reearth/reearth-visualizer/pull/956)) [`c7686e`](https://github.com/reearth/reearth-visualizer/commit/c7686e)
- Re-structure visualizer ([#954](https://github.com/reearth/reearth-visualizer/pull/954)) [`9317d2`](https://github.com/reearth/reearth-visualizer/commit/9317d2)
- Update node version ([#955](https://github.com/reearth/reearth-visualizer/pull/955)) [`5d1baf`](https://github.com/reearth/reearth-visualizer/commit/5d1baf)
- Improve storybook ([#952](https://github.com/reearth/reearth-visualizer/pull/952)) [`69b054`](https://github.com/reearth/reearth-visualizer/commit/69b054)
- Sketch layer step3 ([#937](https://github.com/reearth/reearth-visualizer/pull/937)) [`59c0ff`](https://github.com/reearth/reearth-visualizer/commit/59c0ff)
- Fix breaking infobox ui [`e5a3ab`](https://github.com/reearth/reearth-visualizer/commit/e5a3ab)
- Update mvt imagery provider ver [`9f0b23`](https://github.com/reearth/reearth-visualizer/commit/9f0b23)
- Select only first feature from imageryLayers in beta [`f32a2a`](https://github.com/reearth/reearth-visualizer/commit/f32a2a)
- Fix beta editor dnd ([#944](https://github.com/reearth/reearth-visualizer/pull/944)) [`276453`](https://github.com/reearth/reearth-visualizer/commit/276453)
- Use @reearth&#x2F;cesium-mvt-provider v1.5.3 [`902b14`](https://github.com/reearth/reearth-visualizer/commit/902b14)
- Update @reearth&#x2F;cesium-mvt-provider ver [`b4f613`](https://github.com/reearth/reearth-visualizer/commit/b4f613)
- Fix infobox blocks using old value when new value is undefined ([#943](https://github.com/reearth/reearth-visualizer/pull/943)) [`b43956`](https://github.com/reearth/reearth-visualizer/commit/b43956)
- Update cesium-mvt-provider for beta ([#942](https://github.com/reearth/reearth-visualizer/pull/942)) [`78bcd8`](https://github.com/reearth/reearth-visualizer/commit/78bcd8)
- Fix propertylist block not updating on feature change ([#941](https://github.com/reearth/reearth-visualizer/pull/941)) [`433093`](https://github.com/reearth/reearth-visualizer/commit/433093)
- Infobox support in beta ([#880](https://github.com/reearth/reearth-visualizer/pull/880)) [`6e0470`](https://github.com/reearth/reearth-visualizer/commit/6e0470)
- Fix caching issue where viz state is remembered ([#922](https://github.com/reearth/reearth-visualizer/pull/922)) [`404eda`](https://github.com/reearth/reearth-visualizer/commit/404eda)
- Update gql [`d8a1c4`](https://github.com/reearth/reearth-visualizer/commit/d8a1c4)
- Add layer select with drag event ([#932](https://github.com/reearth/reearth-visualizer/pull/932)) [`90aecf`](https://github.com/reearth/reearth-visualizer/commit/90aecf)
- Keep selecting id which is same even if the feature is updated [`da3bd4`](https://github.com/reearth/reearth-visualizer/commit/da3bd4)
- Disable indexing feature functionality [`a520a7`](https://github.com/reearth/reearth-visualizer/commit/a520a7)
- Add layerload event [`e8e6fe`](https://github.com/reearth/reearth-visualizer/commit/e8e6fe)
- Mvt provider refactor ([#909](https://github.com/reearth/reearth-visualizer/pull/909)) [`a4e06b`](https://github.com/reearth/reearth-visualizer/commit/a4e06b)
- Support draw clipping for 3dtiles ([#921](https://github.com/reearth/reearth-visualizer/pull/921)) [`0684cb`](https://github.com/reearth/reearth-visualizer/commit/0684cb)
- Improve performance to find and select feature ([#920](https://github.com/reearth/reearth-visualizer/pull/920)) [`3c5a29`](https://github.com/reearth/reearth-visualizer/commit/3c5a29)
- Update graphql on frontend ([#916](https://github.com/reearth/reearth-visualizer/pull/916)) [`6a18d1`](https://github.com/reearth/reearth-visualizer/commit/6a18d1)
- Hide indicator for resource ([#912](https://github.com/reearth/reearth-visualizer/pull/912)) [`e2df9f`](https://github.com/reearth/reearth-visualizer/commit/e2df9f)
- Fix the zoomlevel for url ([#914](https://github.com/reearth/reearth-visualizer/pull/914)) [`8c2fc8`](https://github.com/reearth/reearth-visualizer/commit/8c2fc8)
- Add colon as reserved word in style evaluator ([#910](https://github.com/reearth/reearth-visualizer/pull/910)) [`93d90c`](https://github.com/reearth/reearth-visualizer/commit/93d90c)
- Add colon as reserved word in style evaluator ([#906](https://github.com/reearth/reearth-visualizer/pull/906)) [`f4a84c`](https://github.com/reearth/reearth-visualizer/commit/f4a84c)
- Allow enter ground in clipping box [`fb0f6b`](https://github.com/reearth/reearth-visualizer/commit/fb0f6b)
- Fix resource appearance to be able to get the information of the feature ([#905](https://github.com/reearth/reearth-visualizer/pull/905)) [`10c0e6`](https://github.com/reearth/reearth-visualizer/commit/10c0e6)
- Correct timeline update params ([#904](https://github.com/reearth/reearth-visualizer/pull/904)) [`bbe74d`](https://github.com/reearth/reearth-visualizer/commit/bbe74d)
- Set overridden layers ref immediately ([#902](https://github.com/reearth/reearth-visualizer/pull/902)) [`39a3e5`](https://github.com/reearth/reearth-visualizer/commit/39a3e5)
- Add plugin API force horizontal roll ([#901](https://github.com/reearth/reearth-visualizer/pull/901)) [`1a5375`](https://github.com/reearth/reearth-visualizer/commit/1a5375)
- Avoid select clipping box in select mode ([#891](https://github.com/reearth/reearth-visualizer/pull/891)) [`eb45a5`](https://github.com/reearth/reearth-visualizer/commit/eb45a5)
- Fix camera field issues ([#898](https://github.com/reearth/reearth-visualizer/pull/898)) [`6fa22f`](https://github.com/reearth/reearth-visualizer/commit/6fa22f)
- Fix the issue that multiple selection isn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t working well ([#897](https://github.com/reearth/reearth-visualizer/pull/897)) [`5b1768`](https://github.com/reearth/reearth-visualizer/commit/5b1768)
- Add layer visibility event to core ([#896](https://github.com/reearth/reearth-visualizer/pull/896)) [`072802`](https://github.com/reearth/reearth-visualizer/commit/072802)
- Mvt multiple layer overlay plugin API ([#894](https://github.com/reearth/reearth-visualizer/pull/894)) [`a26dcc`](https://github.com/reearth/reearth-visualizer/commit/a26dcc)
- Support array equality or not in style evaluator ([#893](https://github.com/reearth/reearth-visualizer/pull/893)) [`7daa9e`](https://github.com/reearth/reearth-visualizer/commit/7daa9e)
- Improve IBL shader [`9aac45`](https://github.com/reearth/reearth-visualizer/commit/9aac45)
- Screen space camera ([#892](https://github.com/reearth/reearth-visualizer/pull/892)) [`7fa028`](https://github.com/reearth/reearth-visualizer/commit/7fa028)
- Hide indicator for box ([#889](https://github.com/reearth/reearth-visualizer/pull/889)) [`776fcc`](https://github.com/reearth/reearth-visualizer/commit/776fcc)
- Hide indicator for imagery layer ([#887](https://github.com/reearth/reearth-visualizer/pull/887)) [`37bef6`](https://github.com/reearth/reearth-visualizer/commit/37bef6)
- Add geojson as resource in beta datasource ([#869](https://github.com/reearth/reearth-visualizer/pull/869)) [`3e9b78`](https://github.com/reearth/reearth-visualizer/commit/3e9b78)
- Label for MVT ([#877](https://github.com/reearth/reearth-visualizer/pull/877)) [`ee71e2`](https://github.com/reearth/reearth-visualizer/commit/ee71e2)
- Allow undefined input for color and url fields ([#888](https://github.com/reearth/reearth-visualizer/pull/888)) [`099f55`](https://github.com/reearth/reearth-visualizer/commit/099f55)
- Extend sketch plugin API ([#886](https://github.com/reearth/reearth-visualizer/pull/886)) [`618972`](https://github.com/reearth/reearth-visualizer/commit/618972)
- Add rotateCameraOnCenter ([#883](https://github.com/reearth/reearth-visualizer/pull/883)) [`040ad9`](https://github.com/reearth/reearth-visualizer/commit/040ad9)
- Basic sketch system ([#872](https://github.com/reearth/reearth-visualizer/pull/872)) [`368be7`](https://github.com/reearth/reearth-visualizer/commit/368be7)
- Add withTexture PBR option [`4c0fd1`](https://github.com/reearth/reearth-visualizer/commit/4c0fd1)
- Add startsWith func in style evaluator ([#881](https://github.com/reearth/reearth-visualizer/pull/881)) [`3bb0a2`](https://github.com/reearth/reearth-visualizer/commit/3bb0a2)
- Support rootProperties built-in variables in evaluator ([#882](https://github.com/reearth/reearth-visualizer/pull/882)) [`0688ca`](https://github.com/reearth/reearth-visualizer/commit/0688ca)
- Refactor story panel ([#879](https://github.com/reearth/reearth-visualizer/pull/879)) [`dfaf6e`](https://github.com/reearth/reearth-visualizer/commit/dfaf6e)

### Server

#### 🚀 Features

- Enable original key filter ([#1285](https://github.com/reearth/reearth-visualizer/pull/1285)) [`58c184`](https://github.com/reearth/reearth-visualizer/commit/58c184)
- Add data attribute as default plugin when project gets created ([#1283](https://github.com/reearth/reearth-visualizer/pull/1283)) [`90ef02`](https://github.com/reearth/reearth-visualizer/commit/90ef02)
- Query filter coresupport ([#1265](https://github.com/reearth/reearth-visualizer/pull/1265)) [`69b1cd`](https://github.com/reearth/reearth-visualizer/commit/69b1cd)
- Add coreSupport to Asset ([#1246](https://github.com/reearth/reearth-visualizer/pull/1246)) [`d119c4`](https://github.com/reearth/reearth-visualizer/commit/d119c4)
- Query filter of core support ([#1231](https://github.com/reearth/reearth-visualizer/pull/1231)) [`f6a3cb`](https://github.com/reearth/reearth-visualizer/commit/f6a3cb)
- Export&#x2F;import project bug fix ([#1239](https://github.com/reearth/reearth-visualizer/pull/1239)) [`434309`](https://github.com/reearth/reearth-visualizer/commit/434309)
- Placeholder property schema field ([#1227](https://github.com/reearth/reearth-visualizer/pull/1227)) [`8a6cf0`](https://github.com/reearth/reearth-visualizer/commit/8a6cf0)
- Project import export external url ([#1205](https://github.com/reearth/reearth-visualizer/pull/1205)) [`1eba6e`](https://github.com/reearth/reearth-visualizer/commit/1eba6e)
- Fix export project ([#1201](https://github.com/reearth/reearth-visualizer/pull/1201)) [`3d4c50`](https://github.com/reearth/reearth-visualizer/commit/3d4c50)
- Change project import api ([#1178](https://github.com/reearth/reearth-visualizer/pull/1178)) [`61f707`](https://github.com/reearth/reearth-visualizer/commit/61f707)
- Get only what hasn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t been deleted ([#1179](https://github.com/reearth/reearth-visualizer/pull/1179)) [`fc1a29`](https://github.com/reearth/reearth-visualizer/commit/fc1a29)
- Projects Recycle bin ([#1169](https://github.com/reearth/reearth-visualizer/pull/1169)) [`e1f1b0`](https://github.com/reearth/reearth-visualizer/commit/e1f1b0)
- Import or Export Project Functionality (File resource) ([#1151](https://github.com/reearth/reearth-visualizer/pull/1151)) [`b240bf`](https://github.com/reearth/reearth-visualizer/commit/b240bf)
- Import or Export Project Functionality ([#1141](https://github.com/reearth/reearth-visualizer/pull/1141)) [`bce51c`](https://github.com/reearth/reearth-visualizer/commit/bce51c)
- Add new policy enforcement for visualizer ([#1094](https://github.com/reearth/reearth-visualizer/pull/1094)) [`32b3be`](https://github.com/reearth/reearth-visualizer/commit/32b3be)
- Starred projects query ([#1115](https://github.com/reearth/reearth-visualizer/pull/1115)) [`f99bca`](https://github.com/reearth/reearth-visualizer/commit/f99bca)
- Add sort direction to assets ([#1100](https://github.com/reearth/reearth-visualizer/pull/1100)) [`a9afa6`](https://github.com/reearth/reearth-visualizer/commit/a9afa6)
- Add sort, search and starred project functionality ([#1040](https://github.com/reearth/reearth-visualizer/pull/1040)) [`c27aad`](https://github.com/reearth/reearth-visualizer/commit/c27aad)
- Add coresupport as story and project metadata field ([#1028](https://github.com/reearth/reearth-visualizer/pull/1028)) [`502aa1`](https://github.com/reearth/reearth-visualizer/commit/502aa1)
- Style in-memory cache support ([#947](https://github.com/reearth/reearth-visualizer/pull/947)) [`e13d7d`](https://github.com/reearth/reearth-visualizer/commit/e13d7d)
- Support style and layer duplication ([#911](https://github.com/reearth/reearth-visualizer/pull/911)) [`3bfab1`](https://github.com/reearth/reearth-visualizer/commit/3bfab1)
- Support multiple tenants ([#885](https://github.com/reearth/reearth-visualizer/pull/885)) [`8006bf`](https://github.com/reearth/reearth-visualizer/commit/8006bf)
- Create List as a generic pkg ([#900](https://github.com/reearth/reearth-visualizer/pull/900)) [`35a2e5`](https://github.com/reearth/reearth-visualizer/commit/35a2e5)

#### 🔧 Bug Fixes

- Coresupport query missmatch ([#1293](https://github.com/reearth/reearth-visualizer/pull/1293)) [`421da5`](https://github.com/reearth/reearth-visualizer/commit/421da5)
- Pagination keyword fix ([#1289](https://github.com/reearth/reearth-visualizer/pull/1289)) [`62dd92`](https://github.com/reearth/reearth-visualizer/commit/62dd92)
- Fix filter bug ([#1276](https://github.com/reearth/reearth-visualizer/pull/1276)) [`9527d7`](https://github.com/reearth/reearth-visualizer/commit/9527d7)
- Debug export project file ([#1200](https://github.com/reearth/reearth-visualizer/pull/1200)) [`8f0e30`](https://github.com/reearth/reearth-visualizer/commit/8f0e30)
- Mockuser make command is incorrect [`e24b53`](https://github.com/reearth/reearth-visualizer/commit/e24b53)
- Fetch undeleted project correctly ([#1180](https://github.com/reearth/reearth-visualizer/pull/1180)) [`5f05ee`](https://github.com/reearth/reearth-visualizer/commit/5f05ee)
- Extension cahnge ([#1170](https://github.com/reearth/reearth-visualizer/pull/1170)) [`c3be98`](https://github.com/reearth/reearth-visualizer/commit/c3be98)
- Sorting of update is not working ([#1114](https://github.com/reearth/reearth-visualizer/pull/1114)) [`22bf39`](https://github.com/reearth/reearth-visualizer/commit/22bf39)
- Project sort with reverting options ([#1089](https://github.com/reearth/reearth-visualizer/pull/1089)) [`106049`](https://github.com/reearth/reearth-visualizer/commit/106049)
- Save project updated_at when features updated ([#1076](https://github.com/reearth/reearth-visualizer/pull/1076)) [`3ac1fc`](https://github.com/reearth/reearth-visualizer/commit/3ac1fc)
- Project name sort bug ([#1068](https://github.com/reearth/reearth-visualizer/pull/1068)) [`c13315`](https://github.com/reearth/reearth-visualizer/commit/c13315)
- New account cannot be created in multitenant mode [`68cda8`](https://github.com/reearth/reearth-visualizer/commit/68cda8)
- Support infobox on beta project publishing  ([#940](https://github.com/reearth/reearth-visualizer/pull/940)) [`dfdbd7`](https://github.com/reearth/reearth-visualizer/commit/dfdbd7)
- Update aws sdk to avoid s3 upload error [`71c6fd`](https://github.com/reearth/reearth-visualizer/commit/71c6fd)
- V2.Map is depreciated with mongo driver 2.0 [`5e396a`](https://github.com/reearth/reearth-visualizer/commit/5e396a)

#### ✨ Refactor

- Update camera description ([#1270](https://github.com/reearth/reearth-visualizer/pull/1270)) [`04d08b`](https://github.com/reearth/reearth-visualizer/commit/04d08b)
- Delete useless server stamen definition ([#1142](https://github.com/reearth/reearth-visualizer/pull/1142)) [`416f04`](https://github.com/reearth/reearth-visualizer/commit/416f04)

#### Miscellaneous Tasks

- Revert query filter of core support ([#1255](https://github.com/reearth/reearth-visualizer/pull/1255)) [`efaf4e`](https://github.com/reearth/reearth-visualizer/commit/efaf4e)
- Roolback download debug ([#1173](https://github.com/reearth/reearth-visualizer/pull/1173)) [`1d52c9`](https://github.com/reearth/reearth-visualizer/commit/1d52c9)
- Download debug ([#1171](https://github.com/reearth/reearth-visualizer/pull/1171)) [`8b13c6`](https://github.com/reearth/reearth-visualizer/commit/8b13c6)
- Upgrade reearthx version ([#1098](https://github.com/reearth/reearth-visualizer/pull/1098)) [`08d54a`](https://github.com/reearth/reearth-visualizer/commit/08d54a)
- Sketch layer in publishing ([#945](https://github.com/reearth/reearth-visualizer/pull/945)) [`86e66e`](https://github.com/reearth/reearth-visualizer/commit/86e66e)
- Add schema to nlslayer simple input ([#935](https://github.com/reearth/reearth-visualizer/pull/935)) [`06f701`](https://github.com/reearth/reearth-visualizer/commit/06f701)
- Support featureCollection in NLSLayer sketch ([#913](https://github.com/reearth/reearth-visualizer/pull/913)) [`6acbdd`](https://github.com/reearth/reearth-visualizer/commit/6acbdd)
- Beta infobox &amp; fixing array type when contents are objects ([#931](https://github.com/reearth/reearth-visualizer/pull/931)) [`cf42a2`](https://github.com/reearth/reearth-visualizer/commit/cf42a2)
- Support GA with projects ([#927](https://github.com/reearth/reearth-visualizer/pull/927)) [`748cbb`](https://github.com/reearth/reearth-visualizer/commit/748cbb)
- Add googleanalytics in cesium-beta manifest field ([#926](https://github.com/reearth/reearth-visualizer/pull/926)) [`3f9c65`](https://github.com/reearth/reearth-visualizer/commit/3f9c65)
- Seperate beta infobox blocks ([#918](https://github.com/reearth/reearth-visualizer/pull/918)) [`ae362a`](https://github.com/reearth/reearth-visualizer/commit/ae362a)
- Add infobox support for beta ([#915](https://github.com/reearth/reearth-visualizer/pull/915)) [`77714f`](https://github.com/reearth/reearth-visualizer/commit/77714f)

### Misc

#### 🔧 Bug Fixes

- Fix placeholder of condition style ([#1264](https://github.com/reearth/reearth-visualizer/pull/1264)) [`b7f98f`](https://github.com/reearth/reearth-visualizer/commit/b7f98f)
- Update sub-route for projects [`995954`](https://github.com/reearth/reearth-visualizer/commit/995954)

#### 📖 Documentation

- Update readme for renewal ReEarth 2025 ([#1274](https://github.com/reearth/reearth-visualizer/pull/1274)) [`fd566a`](https://github.com/reearth/reearth-visualizer/commit/fd566a)
- Update README.md ([#874](https://github.com/reearth/reearth-visualizer/pull/874)) [`a71085`](https://github.com/reearth/reearth-visualizer/commit/a71085)
- Fix getting started link URL in README ([#1042](https://github.com/reearth/reearth-visualizer/pull/1042)) [`ce80b6`](https://github.com/reearth/reearth-visualizer/commit/ce80b6)
- Update join us link in README.md [`ea8ad8`](https://github.com/reearth/reearth-visualizer/commit/ea8ad8)
- Add join us [`351856`](https://github.com/reearth/reearth-visualizer/commit/351856)

#### Miscellaneous Tasks

- Update README for docs link ([#1288](https://github.com/reearth/reearth-visualizer/pull/1288)) [`10b2c4`](https://github.com/reearth/reearth-visualizer/commit/10b2c4)
- Update README.md ([#867](https://github.com/reearth/reearth-visualizer/pull/867)) [`15b017`](https://github.com/reearth/reearth-visualizer/commit/15b017)
- Add coderabbit.yaml [`5dc095`](https://github.com/reearth/reearth-visualizer/commit/5dc095)
- Fix lint error ([#1048](https://github.com/reearth/reearth-visualizer/pull/1048)) [`66dd4d`](https://github.com/reearth/reearth-visualizer/commit/66dd4d)
- Update package version ([#1043](https://github.com/reearth/reearth-visualizer/pull/1043)) [`ea3d2d`](https://github.com/reearth/reearth-visualizer/commit/ea3d2d)
- Update docker-compose.yml [`e94aa7`](https://github.com/reearth/reearth-visualizer/commit/e94aa7)
- Remove no need force for git push ([#1006](https://github.com/reearth/reearth-visualizer/pull/1006)) [`560497`](https://github.com/reearth/reearth-visualizer/commit/560497)
- Revert addition of &#x60;--force&#x60; to push to protected branches ([#1004](https://github.com/reearth/reearth-visualizer/pull/1004)) [`f47ec0`](https://github.com/reearth/reearth-visualizer/commit/f47ec0)
- Upgrade core ([#1002](https://github.com/reearth/reearth-visualizer/pull/1002)) [`541baa`](https://github.com/reearth/reearth-visualizer/commit/541baa)
- Rename reearth&#x2F;reearth repo name to reearth&#x2F;reearth-visualizer ([#995](https://github.com/reearth/reearth-visualizer/pull/995)) [`c109ab`](https://github.com/reearth/reearth-visualizer/commit/c109ab)
- Update codeowners [`c1ce96`](https://github.com/reearth/reearth-visualizer/commit/c1ce96)
- Heat map - from takram ([#863](https://github.com/reearth/reearth-visualizer/pull/863)) [`60ae8d`](https://github.com/reearth/reearth-visualizer/commit/60ae8d)

#### 

- Support ga in published scene json [`325f8a`](https://github.com/reearth/reearth-visualizer/commit/325f8a)

### server, web

#### 🚀 Features

- Mock auth server for local ([#1135](https://github.com/reearth/reearth-visualizer/pull/1135)) [`0afc15`](https://github.com/reearth/reearth-visualizer/commit/0afc15)

#### 🔧 Bug Fixes

- Project fetch failing ([#1052](https://github.com/reearth/reearth-visualizer/pull/1052)) [`f3aa23`](https://github.com/reearth/reearth-visualizer/commit/f3aa23)

#### Miscellaneous Tasks

- Add sort direction to project sort ([#1097](https://github.com/reearth/reearth-visualizer/pull/1097)) [`33aa72`](https://github.com/reearth/reearth-visualizer/commit/33aa72)
- Filter out classic asset from visualizer ([#1095](https://github.com/reearth/reearth-visualizer/pull/1095)) [`a66503`](https://github.com/reearth/reearth-visualizer/commit/a66503)
- Support infoboxBlock extension type ([#936](https://github.com/reearth/reearth-visualizer/pull/936)) [`459c94`](https://github.com/reearth/reearth-visualizer/commit/459c94)

### sever

#### 🚀 Features

- Support update custom properties mutation ([#1087](https://github.com/reearth/reearth-visualizer/pull/1087)) [`e3a7b8`](https://github.com/reearth/reearth-visualizer/commit/e3a7b8)

### web, server

#### ✨ Refactor

- Refacting depth test against terrain to globe  ([#1161](https://github.com/reearth/reearth-visualizer/pull/1161)) [`e33d88`](https://github.com/reearth/reearth-visualizer/commit/e33d88)

#### Miscellaneous Tasks

- Fix ga on published page ([#933](https://github.com/reearth/reearth-visualizer/pull/933)) [`a15c8b`](https://github.com/reearth/reearth-visualizer/commit/a15c8b)
- Support google analytics for beta ([#925](https://github.com/reearth/reearth-visualizer/pull/925)) [`eaabe4`](https://github.com/reearth/reearth-visualizer/commit/eaabe4)

### web,server

#### 🚀 Features

- Support multi-tenant login ([#929](https://github.com/reearth/reearth-visualizer/pull/929)) [`2d5716`](https://github.com/reearth/reearth-visualizer/commit/2d5716)

### 

#### 🔧 Bug Fixes

- Fix placeholder of condition style ([#1264](https://github.com/reearth/reearth-visualizer/pull/1264)) [`b7f98f`](https://github.com/reearth/reearth-visualizer/commit/b7f98f)
- Update sub-route for projects [`995954`](https://github.com/reearth/reearth-visualizer/commit/995954)

#### 📖 Documentation

- Update readme for renewal ReEarth 2025 ([#1274](https://github.com/reearth/reearth-visualizer/pull/1274)) [`fd566a`](https://github.com/reearth/reearth-visualizer/commit/fd566a)
- Update README.md ([#874](https://github.com/reearth/reearth-visualizer/pull/874)) [`a71085`](https://github.com/reearth/reearth-visualizer/commit/a71085)
- Fix getting started link URL in README ([#1042](https://github.com/reearth/reearth-visualizer/pull/1042)) [`ce80b6`](https://github.com/reearth/reearth-visualizer/commit/ce80b6)
- Update join us link in README.md [`ea8ad8`](https://github.com/reearth/reearth-visualizer/commit/ea8ad8)
- Add join us [`351856`](https://github.com/reearth/reearth-visualizer/commit/351856)

#### Miscellaneous Tasks

- Update README for docs link ([#1288](https://github.com/reearth/reearth-visualizer/pull/1288)) [`10b2c4`](https://github.com/reearth/reearth-visualizer/commit/10b2c4)
- Update README.md ([#867](https://github.com/reearth/reearth-visualizer/pull/867)) [`15b017`](https://github.com/reearth/reearth-visualizer/commit/15b017)
- Add coderabbit.yaml [`5dc095`](https://github.com/reearth/reearth-visualizer/commit/5dc095)
- Fix lint error ([#1048](https://github.com/reearth/reearth-visualizer/pull/1048)) [`66dd4d`](https://github.com/reearth/reearth-visualizer/commit/66dd4d)
- Update package version ([#1043](https://github.com/reearth/reearth-visualizer/pull/1043)) [`ea3d2d`](https://github.com/reearth/reearth-visualizer/commit/ea3d2d)
- Update docker-compose.yml [`e94aa7`](https://github.com/reearth/reearth-visualizer/commit/e94aa7)
- Remove no need force for git push ([#1006](https://github.com/reearth/reearth-visualizer/pull/1006)) [`560497`](https://github.com/reearth/reearth-visualizer/commit/560497)
- Revert addition of &#x60;--force&#x60; to push to protected branches ([#1004](https://github.com/reearth/reearth-visualizer/pull/1004)) [`f47ec0`](https://github.com/reearth/reearth-visualizer/commit/f47ec0)
- Upgrade core ([#1002](https://github.com/reearth/reearth-visualizer/pull/1002)) [`541baa`](https://github.com/reearth/reearth-visualizer/commit/541baa)
- Rename reearth&#x2F;reearth repo name to reearth&#x2F;reearth-visualizer ([#995](https://github.com/reearth/reearth-visualizer/pull/995)) [`c109ab`](https://github.com/reearth/reearth-visualizer/commit/c109ab)
- Update codeowners [`c1ce96`](https://github.com/reearth/reearth-visualizer/commit/c1ce96)
- Heat map - from takram ([#863](https://github.com/reearth/reearth-visualizer/pull/863)) [`60ae8d`](https://github.com/reearth/reearth-visualizer/commit/60ae8d)

#### 

- Support ga in published scene json [`325f8a`](https://github.com/reearth/reearth-visualizer/commit/325f8a)

## 0.20.0 - 2024-01-24

### Web

#### 🔧 Bug Fixes

- GlobalModal not showing when it should ([#857](https://github.com/reearth/reearth-visualizer/pull/857)) [`8df7d0`](https://github.com/reearth/reearth-visualizer/commit/8df7d0)
- Support built-in widget visible on WAS ([#839](https://github.com/reearth/reearth-visualizer/pull/839)) [`227ae7`](https://github.com/reearth/reearth-visualizer/commit/227ae7)
- Core marker extrude check for coordinates height ([#834](https://github.com/reearth/reearth-visualizer/pull/834)) [`7fcaa2`](https://github.com/reearth/reearth-visualizer/commit/7fcaa2)

#### 🧪 Testing

- Fix useEngineRef [`854de7`](https://github.com/reearth/reearth-visualizer/commit/854de7)

#### Miscellaneous Tasks

- Handle invalid date in time convert ([#878](https://github.com/reearth/reearth-visualizer/pull/878)) [`c8e825`](https://github.com/reearth/reearth-visualizer/commit/c8e825)
- Timeline bug fixing ([#876](https://github.com/reearth/reearth-visualizer/pull/876)) [`46593d`](https://github.com/reearth/reearth-visualizer/commit/46593d)
- Disable PBR when material has texture ([#875](https://github.com/reearth/reearth-visualizer/pull/875)) [`969a63`](https://github.com/reearth/reearth-visualizer/commit/969a63)
- Add hideIndicator On Selecting ([#866](https://github.com/reearth/reearth-visualizer/pull/866)) [`9a1e32`](https://github.com/reearth/reearth-visualizer/commit/9a1e32)
- Fix scene undefined bug in heatmap ([#873](https://github.com/reearth/reearth-visualizer/pull/873)) [`ace172`](https://github.com/reearth/reearth-visualizer/commit/ace172)
- Invoke requestRender before capture screen [`86f666`](https://github.com/reearth/reearth-visualizer/commit/86f666)
- Sketch layer UI implementation ([#855](https://github.com/reearth/reearth-visualizer/pull/855)) [`9b9d4b`](https://github.com/reearth/reearth-visualizer/commit/9b9d4b)
- Add flyToBBox ([#865](https://github.com/reearth/reearth-visualizer/pull/865)) [`76ada0`](https://github.com/reearth/reearth-visualizer/commit/76ada0)
- Timeline with padding ([#853](https://github.com/reearth/reearth-visualizer/pull/853)) [`a16870`](https://github.com/reearth/reearth-visualizer/commit/a16870)
- Fix frustum instance [`146872`](https://github.com/reearth/reearth-visualizer/commit/146872)
- Add support for heatMap in beta ([#835](https://github.com/reearth/reearth-visualizer/pull/835)) [`0c4c02`](https://github.com/reearth/reearth-visualizer/commit/0c4c02)
- Add some functionalities for pedestrian ([#862](https://github.com/reearth/reearth-visualizer/pull/862)) [`293335`](https://github.com/reearth/reearth-visualizer/commit/293335)
- Remember the editor settings ([#825](https://github.com/reearth/reearth-visualizer/pull/825)) [`02aac2`](https://github.com/reearth/reearth-visualizer/commit/02aac2)
- Add frustum model ([#861](https://github.com/reearth/reearth-visualizer/pull/861)) [`2b6895`](https://github.com/reearth/reearth-visualizer/commit/2b6895)
- Add transition appearance ([#860](https://github.com/reearth/reearth-visualizer/pull/860)) [`fb496e`](https://github.com/reearth/reearth-visualizer/commit/fb496e)
- Refactoring web code ([#858](https://github.com/reearth/reearth-visualizer/pull/858)) [`7f0e76`](https://github.com/reearth/reearth-visualizer/commit/7f0e76)
- Extend camera and marker APIs for pedestrian ([#859](https://github.com/reearth/reearth-visualizer/pull/859)) [`1d35d9`](https://github.com/reearth/reearth-visualizer/commit/1d35d9)
- Improve Story Panel UX ([#856](https://github.com/reearth/reearth-visualizer/pull/856)) [`d8d9f3`](https://github.com/reearth/reearth-visualizer/commit/d8d9f3)
- Multiple bug fixes ([#854](https://github.com/reearth/reearth-visualizer/pull/854)) [`574037`](https://github.com/reearth/reearth-visualizer/commit/574037)
- Fix assets not refetching ([#852](https://github.com/reearth/reearth-visualizer/pull/852)) [`0b60ec`](https://github.com/reearth/reearth-visualizer/commit/0b60ec)
- Fix published WAS area padding ([#850](https://github.com/reearth/reearth-visualizer/pull/850)) [`569681`](https://github.com/reearth/reearth-visualizer/commit/569681)
- Fixing a few bugs ([#849](https://github.com/reearth/reearth-visualizer/pull/849)) [`c8ad89`](https://github.com/reearth/reearth-visualizer/commit/c8ad89)
- Color bug fix ([#843](https://github.com/reearth/reearth-visualizer/pull/843)) [`76f514`](https://github.com/reearth/reearth-visualizer/commit/76f514)
- Stringify label text ([#848](https://github.com/reearth/reearth-visualizer/pull/848)) [`17bcc6`](https://github.com/reearth/reearth-visualizer/commit/17bcc6)
- Next page button story block ([#846](https://github.com/reearth/reearth-visualizer/pull/846)) [`7aa346`](https://github.com/reearth/reearth-visualizer/commit/7aa346)
- Fix timeline block breaking when time set to current day ([#847](https://github.com/reearth/reearth-visualizer/pull/847)) [`a69d81`](https://github.com/reearth/reearth-visualizer/commit/a69d81)
- Fix unsafe builtin widget logic to work well on published page ([#845](https://github.com/reearth/reearth-visualizer/pull/845)) [`1b1e83`](https://github.com/reearth/reearth-visualizer/commit/1b1e83)
- Fix title padding changes updating page padding ([#840](https://github.com/reearth/reearth-visualizer/pull/840)) [`42d9ed`](https://github.com/reearth/reearth-visualizer/commit/42d9ed)
- Finalize Japanese translations ([#842](https://github.com/reearth/reearth-visualizer/pull/842)) [`1ff1f7`](https://github.com/reearth/reearth-visualizer/commit/1ff1f7)
- Add page name tag to indicator and fix some small bugs ([#841](https://github.com/reearth/reearth-visualizer/pull/841)) [`968b6b`](https://github.com/reearth/reearth-visualizer/commit/968b6b)
- Improve asset modal ([#838](https://github.com/reearth/reearth-visualizer/pull/838)) [`68c18d`](https://github.com/reearth/reearth-visualizer/commit/68c18d)
- Modify zoom level field ([#808](https://github.com/reearth/reearth-visualizer/pull/808)) [`1b79cf`](https://github.com/reearth/reearth-visualizer/commit/1b79cf)
- Fix story block creation and preview ([#837](https://github.com/reearth/reearth-visualizer/pull/837)) [`ebf99c`](https://github.com/reearth/reearth-visualizer/commit/ebf99c)
- Update switch layer block functionality  ([#833](https://github.com/reearth/reearth-visualizer/pull/833)) [`ed2931`](https://github.com/reearth/reearth-visualizer/commit/ed2931)
- Fix story block bugs ([#829](https://github.com/reearth/reearth-visualizer/pull/829)) [`d6bf3e`](https://github.com/reearth/reearth-visualizer/commit/d6bf3e)
- Timefield bug fix ([#828](https://github.com/reearth/reearth-visualizer/pull/828)) [`df99b1`](https://github.com/reearth/reearth-visualizer/commit/df99b1)
- Fix story page bugs ([#826](https://github.com/reearth/reearth-visualizer/pull/826)) [`09338f`](https://github.com/reearth/reearth-visualizer/commit/09338f)
- Fix type errors in align system [`91a821`](https://github.com/reearth/reearth-visualizer/commit/91a821)
- Fix camera behavior in interaction mode ([#824](https://github.com/reearth/reearth-visualizer/pull/824)) [`912d68`](https://github.com/reearth/reearth-visualizer/commit/912d68)
- Fix WAS gap [`b80a31`](https://github.com/reearth/reearth-visualizer/commit/b80a31)
- Fix padding settings for page ([#823](https://github.com/reearth/reearth-visualizer/pull/823)) [`f9a7d4`](https://github.com/reearth/reearth-visualizer/commit/f9a7d4)
- Reset current page on tab change ([#822](https://github.com/reearth/reearth-visualizer/pull/822)) [`972fda`](https://github.com/reearth/reearth-visualizer/commit/972fda)
- Fix timeline field component&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s popover ([#821](https://github.com/reearth/reearth-visualizer/pull/821)) [`a38df1`](https://github.com/reearth/reearth-visualizer/commit/a38df1)
- Story block edit Panel layout ([#810](https://github.com/reearth/reearth-visualizer/pull/810)) [`67a0d6`](https://github.com/reearth/reearth-visualizer/commit/67a0d6)
- Double click on page name ([#815](https://github.com/reearth/reearth-visualizer/pull/815)) [`ccf3c2`](https://github.com/reearth/reearth-visualizer/commit/ccf3c2)
- Drag in timeline blog ([#802](https://github.com/reearth/reearth-visualizer/pull/802)) [`f4fc80`](https://github.com/reearth/reearth-visualizer/commit/f4fc80)
- Add an API to get description from entity ([#813](https://github.com/reearth/reearth-visualizer/pull/813)) [`75c326`](https://github.com/reearth/reearth-visualizer/commit/75c326)
- Beta zindexes ([#751](https://github.com/reearth/reearth-visualizer/pull/751)) [`4b7161`](https://github.com/reearth/reearth-visualizer/commit/4b7161)
- Fix overriding layer structure ([#818](https://github.com/reearth/reearth-visualizer/pull/818)) [`034e98`](https://github.com/reearth/reearth-visualizer/commit/034e98)
- Fix layer freezing after feature selection [`030528`](https://github.com/reearth/reearth-visualizer/commit/030528)
- Fix feature unselection ([#812](https://github.com/reearth/reearth-visualizer/pull/812)) [`3e6b7c`](https://github.com/reearth/reearth-visualizer/commit/3e6b7c)
- Story page click away ([#806](https://github.com/reearth/reearth-visualizer/pull/806)) [`b97cd2`](https://github.com/reearth/reearth-visualizer/commit/b97cd2)
- Move doubleClick with debounce to utils ([#811](https://github.com/reearth/reearth-visualizer/pull/811)) [`80b65f`](https://github.com/reearth/reearth-visualizer/commit/80b65f)
- Ui and ux fixes ([#809](https://github.com/reearth/reearth-visualizer/pull/809)) [`770edb`](https://github.com/reearth/reearth-visualizer/commit/770edb)
- UI updates ([#805](https://github.com/reearth/reearth-visualizer/pull/805)) [`621416`](https://github.com/reearth/reearth-visualizer/commit/621416)
- Multi layer Select ([#757](https://github.com/reearth/reearth-visualizer/pull/757)) [`0e75fa`](https://github.com/reearth/reearth-visualizer/commit/0e75fa)
- Fix classic notification bar ([#804](https://github.com/reearth/reearth-visualizer/pull/804)) [`1ca153`](https://github.com/reearth/reearth-visualizer/commit/1ca153)
- Fix error in Timeline block [`0b0290`](https://github.com/reearth/reearth-visualizer/commit/0b0290)
- Fix story panel bg in published project [`f8df61`](https://github.com/reearth/reearth-visualizer/commit/f8df61)
- Handle misfiring of singleClick on doubleClick at layerName and layerStyleName ([#800](https://github.com/reearth/reearth-visualizer/pull/800)) [`d539d3`](https://github.com/reearth/reearth-visualizer/commit/d539d3)
- Bug fixes ([#803](https://github.com/reearth/reearth-visualizer/pull/803)) [`8e4ada`](https://github.com/reearth/reearth-visualizer/commit/8e4ada)
- Fix gap field component ([#801](https://github.com/reearth/reearth-visualizer/pull/801)) [`f9b18c`](https://github.com/reearth/reearth-visualizer/commit/f9b18c)
- Add story background setting ([#775](https://github.com/reearth/reearth-visualizer/pull/775)) [`f8ea05`](https://github.com/reearth/reearth-visualizer/commit/f8ea05)
- Collapse side panels ([#799](https://github.com/reearth/reearth-visualizer/pull/799)) [`8aa78f`](https://github.com/reearth/reearth-visualizer/commit/8aa78f)
- Visualizer clock update  ([#782](https://github.com/reearth/reearth-visualizer/pull/782)) [`9c4c84`](https://github.com/reearth/reearth-visualizer/commit/9c4c84)
- Timeline block ([#750](https://github.com/reearth/reearth-visualizer/pull/750)) [`f5ab49`](https://github.com/reearth/reearth-visualizer/commit/f5ab49)
- Fix text and camera button blocks ([#797](https://github.com/reearth/reearth-visualizer/pull/797)) [`b97d67`](https://github.com/reearth/reearth-visualizer/commit/b97d67)
- New beta notification ([#796](https://github.com/reearth/reearth-visualizer/pull/796)) [`607773`](https://github.com/reearth/reearth-visualizer/commit/607773)
- Slider fixes ([#795](https://github.com/reearth/reearth-visualizer/pull/795)) [`801396`](https://github.com/reearth/reearth-visualizer/commit/801396)
- Auto create page on project creation ([#794](https://github.com/reearth/reearth-visualizer/pull/794)) [`6d5360`](https://github.com/reearth/reearth-visualizer/commit/6d5360)
- Storyblock ux update ([#776](https://github.com/reearth/reearth-visualizer/pull/776)) [`0c16b4`](https://github.com/reearth/reearth-visualizer/commit/0c16b4)
- Misc bug fixes improvements ([#793](https://github.com/reearth/reearth-visualizer/pull/793)) [`b09909`](https://github.com/reearth/reearth-visualizer/commit/b09909)
- 3dtile feature select support in UI ([#792](https://github.com/reearth/reearth-visualizer/pull/792)) [`be18c6`](https://github.com/reearth/reearth-visualizer/commit/be18c6)
- Add scene setting ([#755](https://github.com/reearth/reearth-visualizer/pull/755)) [`f9e53a`](https://github.com/reearth/reearth-visualizer/commit/f9e53a)
- Minor fixes in map editor ([#789](https://github.com/reearth/reearth-visualizer/pull/789)) [`56c4c0`](https://github.com/reearth/reearth-visualizer/commit/56c4c0)

### Server

#### 🔧 Bug Fixes

- Cannot find storytelling by public name [`76b996`](https://github.com/reearth/reearth-visualizer/commit/76b996)
- Serve published metadata of storytelling ([#851](https://github.com/reearth/reearth-visualizer/pull/851)) [`7850d0`](https://github.com/reearth/reearth-visualizer/commit/7850d0)
- Repo filter remains between different contexts [`887daf`](https://github.com/reearth/reearth-visualizer/commit/887daf)

#### Miscellaneous Tasks

- Add panel setting to manifest ([#827](https://github.com/reearth/reearth-visualizer/pull/827)) [`89457b`](https://github.com/reearth/reearth-visualizer/commit/89457b)
- Modify zoom level in manifest ([#807](https://github.com/reearth/reearth-visualizer/pull/807)) [`ae5594`](https://github.com/reearth/reearth-visualizer/commit/ae5594)
- Remove empty property group [`7c5587`](https://github.com/reearth/reearth-visualizer/commit/7c5587)
- Update convert value in gql [`3bbd0f`](https://github.com/reearth/reearth-visualizer/commit/3bbd0f)
- Add array in convert value of gql [`ee5844`](https://github.com/reearth/reearth-visualizer/commit/ee5844)
- Add cameraDuration on the cameraButtonStoryBlock [`a69cd6`](https://github.com/reearth/reearth-visualizer/commit/a69cd6)
- Remove background setting from manifest [`86cc00`](https://github.com/reearth/reearth-visualizer/commit/86cc00)
- Remove debug statements [`a875a2`](https://github.com/reearth/reearth-visualizer/commit/a875a2)
- Add bgColor w story in memory, refactors and add test [`df9e95`](https://github.com/reearth/reearth-visualizer/commit/df9e95)
- Add position, bgColor &amp; title to story &amp; page json respectively for published story ([#787](https://github.com/reearth/reearth-visualizer/pull/787)) [`cea0d7`](https://github.com/reearth/reearth-visualizer/commit/cea0d7)
- Add bgColor to story mutation resolver [`c158b6`](https://github.com/reearth/reearth-visualizer/commit/c158b6)
- Add bgColor to story ([#791](https://github.com/reearth/reearth-visualizer/pull/791)) [`93aba7`](https://github.com/reearth/reearth-visualizer/commit/93aba7)

### Misc

#### Miscellaneous Tasks

- Wireframe for globe and tileset ([#870](https://github.com/reearth/reearth-visualizer/pull/870)) [`75c04f`](https://github.com/reearth/reearth-visualizer/commit/75c04f)
- Fix title&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s panel setting ([#831](https://github.com/reearth/reearth-visualizer/pull/831)) [`b60713`](https://github.com/reearth/reearth-visualizer/commit/b60713)
- Modify the description of zoom level ([#832](https://github.com/reearth/reearth-visualizer/pull/832)) [`021404`](https://github.com/reearth/reearth-visualizer/commit/021404)
- Fix input field popover ([#819](https://github.com/reearth/reearth-visualizer/pull/819)) [`d42279`](https://github.com/reearth/reearth-visualizer/commit/d42279)
- Remove the timeOut from text input ([#814](https://github.com/reearth/reearth-visualizer/pull/814)) [`4ad7bb`](https://github.com/reearth/reearth-visualizer/commit/4ad7bb)

#### 

- Fix feature selection...again [`5e3012`](https://github.com/reearth/reearth-visualizer/commit/5e3012)

### chore

#### 🔧 Bug Fixes

- Invoke requestRender in primitive features whenever component is updated ([#817](https://github.com/reearth/reearth-visualizer/pull/817)) [`e3ed8c`](https://github.com/reearth/reearth-visualizer/commit/e3ed8c)

### sever

#### Miscellaneous Tasks

- Fix story publishing for prod ([#844](https://github.com/reearth/reearth-visualizer/pull/844)) [`c250a2`](https://github.com/reearth/reearth-visualizer/commit/c250a2)

### 

#### Miscellaneous Tasks

- Wireframe for globe and tileset ([#870](https://github.com/reearth/reearth-visualizer/pull/870)) [`75c04f`](https://github.com/reearth/reearth-visualizer/commit/75c04f)
- Fix title&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s panel setting ([#831](https://github.com/reearth/reearth-visualizer/pull/831)) [`b60713`](https://github.com/reearth/reearth-visualizer/commit/b60713)
- Modify the description of zoom level ([#832](https://github.com/reearth/reearth-visualizer/pull/832)) [`021404`](https://github.com/reearth/reearth-visualizer/commit/021404)
- Fix input field popover ([#819](https://github.com/reearth/reearth-visualizer/pull/819)) [`d42279`](https://github.com/reearth/reearth-visualizer/commit/d42279)
- Remove the timeOut from text input ([#814](https://github.com/reearth/reearth-visualizer/pull/814)) [`4ad7bb`](https://github.com/reearth/reearth-visualizer/commit/4ad7bb)

#### 

- Fix feature selection...again [`5e3012`](https://github.com/reearth/reearth-visualizer/commit/5e3012)

## 0.19.0 - 2023-11-06

### Web

#### 🚀 Features

- Upgrade dependencies which don&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t include breaking changes ([#783](https://github.com/reearth/reearth-visualizer/pull/783)) [`930fce`](https://github.com/reearth/reearth-visualizer/commit/930fce)
- Story drag and drop ([#689](https://github.com/reearth/reearth-visualizer/pull/689)) [`f0338c`](https://github.com/reearth/reearth-visualizer/commit/f0338c)
- Add layers using wms and mvt ([#694](https://github.com/reearth/reearth-visualizer/pull/694)) [`5fe512`](https://github.com/reearth/reearth-visualizer/commit/5fe512)
- Add spacing input field and number input  ([#636](https://github.com/reearth/reearth-visualizer/pull/636)) [`f92113`](https://github.com/reearth/reearth-visualizer/commit/f92113)
- Toggle Field ([#651](https://github.com/reearth/reearth-visualizer/pull/651)) [`b13b18`](https://github.com/reearth/reearth-visualizer/commit/b13b18)
- Left Panel shows scene.propery.groups titles ([#634](https://github.com/reearth/reearth-visualizer/pull/634)) [`39b74f`](https://github.com/reearth/reearth-visualizer/commit/39b74f)
- Add color field component ([#627](https://github.com/reearth/reearth-visualizer/pull/627)) [`9e895b`](https://github.com/reearth/reearth-visualizer/commit/9e895b)

#### 🔧 Bug Fixes

- Disable changing my own role and deleting myself [`e40fe3`](https://github.com/reearth/reearth-visualizer/commit/e40fe3)
- Member role cannot be changed [`c11aae`](https://github.com/reearth/reearth-visualizer/commit/c11aae)
- Trim leading zeros from number fields ([#724](https://github.com/reearth/reearth-visualizer/pull/724)) [`410c75`](https://github.com/reearth/reearth-visualizer/commit/410c75)
- Remove video URL format verification ([#707](https://github.com/reearth/reearth-visualizer/pull/707)) [`a74292`](https://github.com/reearth/reearth-visualizer/commit/a74292)
- Use ga4 on classic ([#704](https://github.com/reearth/reearth-visualizer/pull/704)) [`90a46f`](https://github.com/reearth/reearth-visualizer/commit/90a46f)
- Allow mouse event for react-dnd ([#638](https://github.com/reearth/reearth-visualizer/pull/638)) [`2ed816`](https://github.com/reearth/reearth-visualizer/commit/2ed816)
- Include single selection to the selection mode ([#643](https://github.com/reearth/reearth-visualizer/pull/643)) [`864d09`](https://github.com/reearth/reearth-visualizer/commit/864d09)
- Suppress error in loading built-in plugin ([#635](https://github.com/reearth/reearth-visualizer/pull/635)) [`ae83bc`](https://github.com/reearth/reearth-visualizer/commit/ae83bc)
- Import builtin plugin from external url ([#625](https://github.com/reearth/reearth-visualizer/pull/625)) [`17b256`](https://github.com/reearth/reearth-visualizer/commit/17b256)

#### ✨ Refactor

- Remove dropdown component ([#725](https://github.com/reearth/reearth-visualizer/pull/725)) [`af62fb`](https://github.com/reearth/reearth-visualizer/commit/af62fb)

#### Miscellaneous Tasks

- Update reearth&#x2F;web ver [`5ca327`](https://github.com/reearth/reearth-visualizer/commit/5ca327)
- Add height to marker appearance ([#790](https://github.com/reearth/reearth-visualizer/pull/790)) [`8c84c8`](https://github.com/reearth/reearth-visualizer/commit/8c84c8)
- Beta story project publishing ([#784](https://github.com/reearth/reearth-visualizer/pull/784)) [`4e3883`](https://github.com/reearth/reearth-visualizer/commit/4e3883)
- Refactor property and revert core ([#788](https://github.com/reearth/reearth-visualizer/pull/788)) [`e844dd`](https://github.com/reearth/reearth-visualizer/commit/e844dd)
- Refactor beta properties ([#786](https://github.com/reearth/reearth-visualizer/pull/786)) [`a85ca4`](https://github.com/reearth/reearth-visualizer/commit/a85ca4)
- Fix layerName random on upload directly ([#781](https://github.com/reearth/reearth-visualizer/pull/781)) [`2d6962`](https://github.com/reearth/reearth-visualizer/commit/2d6962)
- Fix local name is random when added through asset ([#779](https://github.com/reearth/reearth-visualizer/pull/779)) [`16cbcd`](https://github.com/reearth/reearth-visualizer/commit/16cbcd)
- Czml and kml local not working ([#777](https://github.com/reearth/reearth-visualizer/pull/777)) [`12eddc`](https://github.com/reearth/reearth-visualizer/commit/12eddc)
- Fix mvt layer behaviour ([#780](https://github.com/reearth/reearth-visualizer/pull/780)) [`958178`](https://github.com/reearth/reearth-visualizer/commit/958178)
- Add consistency to react imports ([#778](https://github.com/reearth/reearth-visualizer/pull/778)) [`664139`](https://github.com/reearth/reearth-visualizer/commit/664139)
- Timeline field  ([#768](https://github.com/reearth/reearth-visualizer/pull/768)) [`05bbee`](https://github.com/reearth/reearth-visualizer/commit/05bbee)
- Beta publishing ([#744](https://github.com/reearth/reearth-visualizer/pull/744)) [`7fff78`](https://github.com/reearth/reearth-visualizer/commit/7fff78)
- Update layer title default value in beta and update add layerName behaviour for mvt &amp; wms ([#706](https://github.com/reearth/reearth-visualizer/pull/706)) [`3df69f`](https://github.com/reearth/reearth-visualizer/commit/3df69f)
- Refactor story dnd ([#723](https://github.com/reearth/reearth-visualizer/pull/723)) [`da57ac`](https://github.com/reearth/reearth-visualizer/commit/da57ac)
- Layer inspector ([#763](https://github.com/reearth/reearth-visualizer/pull/763)) [`648152`](https://github.com/reearth/reearth-visualizer/commit/648152)
- Date time field input ([#767](https://github.com/reearth/reearth-visualizer/pull/767)) [`466362`](https://github.com/reearth/reearth-visualizer/commit/466362)
- Updated fields in Settings ([#741](https://github.com/reearth/reearth-visualizer/pull/741)) [`7fa4d5`](https://github.com/reearth/reearth-visualizer/commit/7fa4d5)
- StoryBlock isList default fix ([#761](https://github.com/reearth/reearth-visualizer/pull/761)) [`a8fb53`](https://github.com/reearth/reearth-visualizer/commit/a8fb53)
- Fix flyTo giving error in beta ([#760](https://github.com/reearth/reearth-visualizer/pull/760)) [`b1fd2c`](https://github.com/reearth/reearth-visualizer/commit/b1fd2c)
- Fix the date time component ([#752](https://github.com/reearth/reearth-visualizer/pull/752)) [`615682`](https://github.com/reearth/reearth-visualizer/commit/615682)
- Update default layer style ([#754](https://github.com/reearth/reearth-visualizer/pull/754)) [`c1c3de`](https://github.com/reearth/reearth-visualizer/commit/c1c3de)
- Fixes and refactoring to layer style system ([#753](https://github.com/reearth/reearth-visualizer/pull/753)) [`464674`](https://github.com/reearth/reearth-visualizer/commit/464674)
- Add appearance support in beta ([#734](https://github.com/reearth/reearth-visualizer/pull/734)) [`cd5423`](https://github.com/reearth/reearth-visualizer/commit/cd5423)
- Fix visible state ([#747](https://github.com/reearth/reearth-visualizer/pull/747)) [`ba4382`](https://github.com/reearth/reearth-visualizer/commit/ba4382)
- Improve performance of flyTo ([#746](https://github.com/reearth/reearth-visualizer/pull/746)) [`25359f`](https://github.com/reearth/reearth-visualizer/commit/25359f)
- Hide and show layer ([#735](https://github.com/reearth/reearth-visualizer/pull/735)) [`90e2b9`](https://github.com/reearth/reearth-visualizer/commit/90e2b9)
- Fly to layers ([#739](https://github.com/reearth/reearth-visualizer/pull/739)) [`ce69e7`](https://github.com/reearth/reearth-visualizer/commit/ce69e7)
- Add date time field component ([#740](https://github.com/reearth/reearth-visualizer/pull/740)) [`6c8a42`](https://github.com/reearth/reearth-visualizer/commit/6c8a42)
- Story panel refactor ([#715](https://github.com/reearth/reearth-visualizer/pull/715)) [`86dbb5`](https://github.com/reearth/reearth-visualizer/commit/86dbb5)
- Camera block ([#729](https://github.com/reearth/reearth-visualizer/pull/729)) [`bac4ba`](https://github.com/reearth/reearth-visualizer/commit/bac4ba)
- Customize file extension in upload file&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s window ([#738](https://github.com/reearth/reearth-visualizer/pull/738)) [`c579c6`](https://github.com/reearth/reearth-visualizer/commit/c579c6)
- Add sorting functionality to assets ([#728](https://github.com/reearth/reearth-visualizer/pull/728)) [`e1edd9`](https://github.com/reearth/reearth-visualizer/commit/e1edd9)
- Story page update ([#714](https://github.com/reearth/reearth-visualizer/pull/714)) [`86d4b9`](https://github.com/reearth/reearth-visualizer/commit/86d4b9)
- Fix color field select ([#737](https://github.com/reearth/reearth-visualizer/pull/737)) [`ead2f5`](https://github.com/reearth/reearth-visualizer/commit/ead2f5)
- Refactor assets hooks ([#719](https://github.com/reearth/reearth-visualizer/pull/719)) [`53aa05`](https://github.com/reearth/reearth-visualizer/commit/53aa05)
- Fix some bugs around feature selection functionality ([#736](https://github.com/reearth/reearth-visualizer/pull/736)) [`2476c3`](https://github.com/reearth/reearth-visualizer/commit/2476c3)
- Add timeline manager ([#718](https://github.com/reearth/reearth-visualizer/pull/718)) [`d4127b`](https://github.com/reearth/reearth-visualizer/commit/d4127b)
- Camera issues in storytelling ([#730](https://github.com/reearth/reearth-visualizer/pull/730)) [`22a0e6`](https://github.com/reearth/reearth-visualizer/commit/22a0e6)
- Show installed widgets &amp; fix computed feature property ([#727](https://github.com/reearth/reearth-visualizer/pull/727)) [`5e9edd`](https://github.com/reearth/reearth-visualizer/commit/5e9edd)
- Add multi feature selection APIs ([#716](https://github.com/reearth/reearth-visualizer/pull/716)) [`124d3c`](https://github.com/reearth/reearth-visualizer/commit/124d3c)
- Fix upload file bug ([#717](https://github.com/reearth/reearth-visualizer/pull/717)) [`984e37`](https://github.com/reearth/reearth-visualizer/commit/984e37)
- Update story text block fontsize options ([#720](https://github.com/reearth/reearth-visualizer/pull/720)) [`55ac86`](https://github.com/reearth/reearth-visualizer/commit/55ac86)
- Add layers from local ([#702](https://github.com/reearth/reearth-visualizer/pull/702)) [`a4a580`](https://github.com/reearth/reearth-visualizer/commit/a4a580)
- Image and video blocks ([#708](https://github.com/reearth/reearth-visualizer/pull/708)) [`97f64a`](https://github.com/reearth/reearth-visualizer/commit/97f64a)
- MD Block ([#712](https://github.com/reearth/reearth-visualizer/pull/712)) [`8fd9d3`](https://github.com/reearth/reearth-visualizer/commit/8fd9d3)
- Story page layer UI ([#709](https://github.com/reearth/reearth-visualizer/pull/709)) [`4a62ab`](https://github.com/reearth/reearth-visualizer/commit/4a62ab)
- Various bug fixes and refactoring ([#713](https://github.com/reearth/reearth-visualizer/pull/713)) [`253641`](https://github.com/reearth/reearth-visualizer/commit/253641)
- Fix block creation [`c4cc87`](https://github.com/reearth/reearth-visualizer/commit/c4cc87)
- Fix layer update process [`a366ab`](https://github.com/reearth/reearth-visualizer/commit/a366ab)
- Fix a layer update process ([#711](https://github.com/reearth/reearth-visualizer/pull/711)) [`391ef0`](https://github.com/reearth/reearth-visualizer/commit/391ef0)
- Disable fxaa ([#710](https://github.com/reearth/reearth-visualizer/pull/710)) [`c7d071`](https://github.com/reearth/reearth-visualizer/commit/c7d071)
- Add line-height option to story text block ([#703](https://github.com/reearth/reearth-visualizer/pull/703)) [`fcf04f`](https://github.com/reearth/reearth-visualizer/commit/fcf04f)
- List field ([#687](https://github.com/reearth/reearth-visualizer/pull/687)) [`07bc84`](https://github.com/reearth/reearth-visualizer/commit/07bc84)
- Add URL field ([#674](https://github.com/reearth/reearth-visualizer/pull/674)) [`8c4b5b`](https://github.com/reearth/reearth-visualizer/commit/8c4b5b)
- Fix story page&#x2F;block ui&#x2F;ux ([#701](https://github.com/reearth/reearth-visualizer/pull/701)) [`af7d3b`](https://github.com/reearth/reearth-visualizer/commit/af7d3b)
- Fix create &amp; remove story block ([#700](https://github.com/reearth/reearth-visualizer/pull/700)) [`57bbc3`](https://github.com/reearth/reearth-visualizer/commit/57bbc3)
- Story page camera transition ([#699](https://github.com/reearth/reearth-visualizer/pull/699)) [`4afa47`](https://github.com/reearth/reearth-visualizer/commit/4afa47)
- Fix value input asset datatype ([#698](https://github.com/reearth/reearth-visualizer/pull/698)) [`bb362b`](https://github.com/reearth/reearth-visualizer/commit/bb362b)
- Refactor storypanel to remove any gql use ([#697](https://github.com/reearth/reearth-visualizer/pull/697)) [`70d1dd`](https://github.com/reearth/reearth-visualizer/commit/70d1dd)
- Select field - Minor fixes ([#696](https://github.com/reearth/reearth-visualizer/pull/696)) [`6b5db3`](https://github.com/reearth/reearth-visualizer/commit/6b5db3)
- Refactor&#x2F;update Camera field ([#692](https://github.com/reearth/reearth-visualizer/pull/692)) [`b15e42`](https://github.com/reearth/reearth-visualizer/commit/b15e42)
- Fix delimited layer input field type ([#695](https://github.com/reearth/reearth-visualizer/pull/695)) [`fa3627`](https://github.com/reearth/reearth-visualizer/commit/fa3627)
- Refactor plugin API camera.getFovInfo ([#691](https://github.com/reearth/reearth-visualizer/pull/691)) [`b77db4`](https://github.com/reearth/reearth-visualizer/commit/b77db4)
- Show scene settings ([#688](https://github.com/reearth/reearth-visualizer/pull/688)) [`884b76`](https://github.com/reearth/reearth-visualizer/commit/884b76)
- Fix default infobox behavior ([#681](https://github.com/reearth/reearth-visualizer/pull/681)) [`a36415`](https://github.com/reearth/reearth-visualizer/commit/a36415)
- Basic layer features API ([#683](https://github.com/reearth/reearth-visualizer/pull/683)) [`ba4409`](https://github.com/reearth/reearth-visualizer/commit/ba4409)
- Refactor storypanel ([#685](https://github.com/reearth/reearth-visualizer/pull/685)) [`3a35cb`](https://github.com/reearth/reearth-visualizer/commit/3a35cb)
- Update select field usage ([#678](https://github.com/reearth/reearth-visualizer/pull/678)) [`14b446`](https://github.com/reearth/reearth-visualizer/commit/14b446)
- Camera field responsiveness ([#686](https://github.com/reearth/reearth-visualizer/pull/686)) [`39d7c0`](https://github.com/reearth/reearth-visualizer/commit/39d7c0)
- Add support for layer name editing in beta ([#665](https://github.com/reearth/reearth-visualizer/pull/665)) [`02cb8d`](https://github.com/reearth/reearth-visualizer/commit/02cb8d)
- Camera field  ([#647](https://github.com/reearth/reearth-visualizer/pull/647)) [`dfa05b`](https://github.com/reearth/reearth-visualizer/commit/dfa05b)
- Fix HBAO error when Cesium is destroyed ([#675](https://github.com/reearth/reearth-visualizer/pull/675)) [`5e41ba`](https://github.com/reearth/reearth-visualizer/commit/5e41ba)
- Add location field ([#660](https://github.com/reearth/reearth-visualizer/pull/660)) [`65beea`](https://github.com/reearth/reearth-visualizer/commit/65beea)
- Add number field ([#669](https://github.com/reearth/reearth-visualizer/pull/669)) [`d21625`](https://github.com/reearth/reearth-visualizer/commit/d21625)
- Radio and radio group field components ([#650](https://github.com/reearth/reearth-visualizer/pull/650)) [`afaa24`](https://github.com/reearth/reearth-visualizer/commit/afaa24)
- Add pluginAPI camera.getFovCenter ([#673](https://github.com/reearth/reearth-visualizer/pull/673)) [`c2c2b0`](https://github.com/reearth/reearth-visualizer/commit/c2c2b0)
- Fix story page gap [`363a03`](https://github.com/reearth/reearth-visualizer/commit/363a03)
- Fix inifinite loop while selecting layer ([#672](https://github.com/reearth/reearth-visualizer/pull/672)) [`3b2295`](https://github.com/reearth/reearth-visualizer/commit/3b2295)
- Fix story page gap issue [`cb09be`](https://github.com/reearth/reearth-visualizer/commit/cb09be)
- Story page change on user scroll ([#671](https://github.com/reearth/reearth-visualizer/pull/671)) [`e03a0a`](https://github.com/reearth/reearth-visualizer/commit/e03a0a)
- Override default light ([#667](https://github.com/reearth/reearth-visualizer/pull/667)) [`b3c7e8`](https://github.com/reearth/reearth-visualizer/commit/b3c7e8)
- Correct style of story text block ([#668](https://github.com/reearth/reearth-visualizer/pull/668)) [`422dec`](https://github.com/reearth/reearth-visualizer/commit/422dec)
- Fix the layer delete behavior ([#666](https://github.com/reearth/reearth-visualizer/pull/666)) [`e91a24`](https://github.com/reearth/reearth-visualizer/commit/e91a24)
- Publish modal ([#658](https://github.com/reearth/reearth-visualizer/pull/658)) [`df854f`](https://github.com/reearth/reearth-visualizer/commit/df854f)
- Select Field ([#662](https://github.com/reearth/reearth-visualizer/pull/662)) [`4ee196`](https://github.com/reearth/reearth-visualizer/commit/4ee196)
- Publish tab type ([#659](https://github.com/reearth/reearth-visualizer/pull/659)) [`feca38`](https://github.com/reearth/reearth-visualizer/commit/feca38)
- Add some atmosphere properties ([#663](https://github.com/reearth/reearth-visualizer/pull/663)) [`caee55`](https://github.com/reearth/reearth-visualizer/commit/caee55)
- Add dataSource, layerSidePanel component in beta ([#633](https://github.com/reearth/reearth-visualizer/pull/633)) [`9972e6`](https://github.com/reearth/reearth-visualizer/commit/9972e6)
- Limit lexical css ([#664](https://github.com/reearth/reearth-visualizer/pull/664)) [`f01500`](https://github.com/reearth/reearth-visualizer/commit/f01500)
- Slider Field ([#652](https://github.com/reearth/reearth-visualizer/pull/652)) [`f7fe7f`](https://github.com/reearth/reearth-visualizer/commit/f7fe7f)
- Add story text block ([#653](https://github.com/reearth/reearth-visualizer/pull/653)) [`6abb7b`](https://github.com/reearth/reearth-visualizer/commit/6abb7b)
- Story page settings ([#639](https://github.com/reearth/reearth-visualizer/pull/639)) [`0eaeed`](https://github.com/reearth/reearth-visualizer/commit/0eaeed)
- Beta project settings pages ([#645](https://github.com/reearth/reearth-visualizer/pull/645)) [`d42294`](https://github.com/reearth/reearth-visualizer/commit/d42294)
- Revert cesium and resium ([#641](https://github.com/reearth/reearth-visualizer/pull/641)) [`6f7bab`](https://github.com/reearth/reearth-visualizer/commit/6f7bab)
- Add property update support to story blocks ([#629](https://github.com/reearth/reearth-visualizer/pull/629)) [`fdd4ee`](https://github.com/reearth/reearth-visualizer/commit/fdd4ee)
- TabsMenu for switching between tabs  ([#631](https://github.com/reearth/reearth-visualizer/pull/631)) [`42ad68`](https://github.com/reearth/reearth-visualizer/commit/42ad68)
- Upgrade dependencies ([#626](https://github.com/reearth/reearth-visualizer/pull/626)) [`19e4fd`](https://github.com/reearth/reearth-visualizer/commit/19e4fd)
- Story block system ([#619](https://github.com/reearth/reearth-visualizer/pull/619)) [`8a6ad6`](https://github.com/reearth/reearth-visualizer/commit/8a6ad6)
- Add container settings panel for widget area ([#620](https://github.com/reearth/reearth-visualizer/pull/620)) [`bea668`](https://github.com/reearth/reearth-visualizer/commit/bea668)

### Server

#### 🚀 Features

- Add env var to specify account database ([#640](https://github.com/reearth/reearth-visualizer/pull/640)) [`3b88ad`](https://github.com/reearth/reearth-visualizer/commit/3b88ad)

#### 🔧 Bug Fixes

- Typo in timeline value type [`9d33b4`](https://github.com/reearth/reearth-visualizer/commit/9d33b4)
- Increase default GraphQL complexity limit [`ade5cd`](https://github.com/reearth/reearth-visualizer/commit/ade5cd)
- Maintainer role cannot be handled correctly [`c8a175`](https://github.com/reearth/reearth-visualizer/commit/c8a175)
- Check project count to ensure policy on project republication ([#742](https://github.com/reearth/reearth-visualizer/pull/742)) [`576023`](https://github.com/reearth/reearth-visualizer/commit/576023)
- Apply default policy to workspaces [`8b1ef4`](https://github.com/reearth/reearth-visualizer/commit/8b1ef4)
- Workspace member count is not limited by policies ([#722](https://github.com/reearth/reearth-visualizer/pull/722)) [`4c7a8f`](https://github.com/reearth/reearth-visualizer/commit/4c7a8f)
- Workspace policy was not loaded from db correctly ([#721](https://github.com/reearth/reearth-visualizer/pull/721)) [`d8022a`](https://github.com/reearth/reearth-visualizer/commit/d8022a)
- Wrong account db name [`db2564`](https://github.com/reearth/reearth-visualizer/commit/db2564)
- Disable compat when account db is specified [`ba4555`](https://github.com/reearth/reearth-visualizer/commit/ba4555)
- Fix signup panic error [`ace22d`](https://github.com/reearth/reearth-visualizer/commit/ace22d)
- Story&#x2F;story page properties were not saved ([#637](https://github.com/reearth/reearth-visualizer/pull/637)) [`faf5f3`](https://github.com/reearth/reearth-visualizer/commit/faf5f3)
- Disable transaction for accountmongo in local [`0ef6a8`](https://github.com/reearth/reearth-visualizer/commit/0ef6a8)

#### ✨ Refactor

- Replace user&#x2F;workspace with account in reearthx ([#568](https://github.com/reearth/reearth-visualizer/pull/568)) [`958a1c`](https://github.com/reearth/reearth-visualizer/commit/958a1c)

#### Miscellaneous Tasks

- Add story background setting ([#774](https://github.com/reearth/reearth-visualizer/pull/774)) [`38f26c`](https://github.com/reearth/reearth-visualizer/commit/38f26c)
- Add layers in pageJSON of published story ([#785](https://github.com/reearth/reearth-visualizer/pull/785)) [`0ba17b`](https://github.com/reearth/reearth-visualizer/commit/0ba17b)
- Add play mode to timeline setting in manifest ([#773](https://github.com/reearth/reearth-visualizer/pull/773)) [`751e28`](https://github.com/reearth/reearth-visualizer/commit/751e28)
- Add layerStyles to publishing ([#772](https://github.com/reearth/reearth-visualizer/pull/772)) [`469f45`](https://github.com/reearth/reearth-visualizer/commit/469f45)
- Add array and timeline valuetype to property ([#770](https://github.com/reearth/reearth-visualizer/pull/770)) [`dcbe9d`](https://github.com/reearth/reearth-visualizer/commit/dcbe9d)
- Add nlslayer in project &amp; story publishing ([#769](https://github.com/reearth/reearth-visualizer/pull/769)) [`4a3d08`](https://github.com/reearth/reearth-visualizer/commit/4a3d08)
- Update manifest and plugin_schema to support collection in schemaGroup ([#748](https://github.com/reearth/reearth-visualizer/pull/748)) [`f70234`](https://github.com/reearth/reearth-visualizer/commit/f70234)
- Add cesium-beta viz support in server ([#743](https://github.com/reearth/reearth-visualizer/pull/743)) [`dcf9f3`](https://github.com/reearth/reearth-visualizer/commit/dcf9f3)
- Modify update method for config change in NLSLayer ([#732](https://github.com/reearth/reearth-visualizer/pull/732)) [`0853ba`](https://github.com/reearth/reearth-visualizer/commit/0853ba)
- Refactor and fix issue w style ([#733](https://github.com/reearth/reearth-visualizer/pull/733)) [`8573df`](https://github.com/reearth/reearth-visualizer/commit/8573df)
- Fix NLS simple update ([#705](https://github.com/reearth/reearth-visualizer/pull/705)) [`3e3549`](https://github.com/reearth/reearth-visualizer/commit/3e3549)
- Add extensionId and pluginId in block json of published story ([#693](https://github.com/reearth/reearth-visualizer/pull/693)) [`b2992d`](https://github.com/reearth/reearth-visualizer/commit/b2992d)
- Update layer for appearance support in beta ([#690](https://github.com/reearth/reearth-visualizer/pull/690)) [`eb82a8`](https://github.com/reearth/reearth-visualizer/commit/eb82a8)
- Handle visibility for nls layer  ([#661](https://github.com/reearth/reearth-visualizer/pull/661)) [`708833`](https://github.com/reearth/reearth-visualizer/commit/708833)
- Add e2e test for NLS CRUD ([#649](https://github.com/reearth/reearth-visualizer/pull/649)) [`69a88d`](https://github.com/reearth/reearth-visualizer/commit/69a88d)
- Storytelling publishing ([#648](https://github.com/reearth/reearth-visualizer/pull/648)) [`edb596`](https://github.com/reearth/reearth-visualizer/commit/edb596)
- Update parser.go [`fdc056`](https://github.com/reearth/reearth-visualizer/commit/fdc056)
- Revert changes made for debuggin in manifest parser [`178693`](https://github.com/reearth/reearth-visualizer/commit/178693)
- Add debug log to parsefromurl [`8834e0`](https://github.com/reearth/reearth-visualizer/commit/8834e0)
- Add min&#x2F;max to spacing fields ([#646](https://github.com/reearth/reearth-visualizer/pull/646)) [`8619e7`](https://github.com/reearth/reearth-visualizer/commit/8619e7)
- Add NLS layer support ([#632](https://github.com/reearth/reearth-visualizer/pull/632)) [`c83248`](https://github.com/reearth/reearth-visualizer/commit/c83248)
- Fix lint error from [#644](https://github.com/reearth/reearth-visualizer/pull/644) [`383ef9`](https://github.com/reearth/reearth-visualizer/commit/383ef9)
- Support appearance in server ([#644](https://github.com/reearth/reearth-visualizer/pull/644)) [`0876ae`](https://github.com/reearth/reearth-visualizer/commit/0876ae)
- Upgrade reearthx [`873104`](https://github.com/reearth/reearth-visualizer/commit/873104)
- Add test for story block properties ([#630](https://github.com/reearth/reearth-visualizer/pull/630)) [`562c51`](https://github.com/reearth/reearth-visualizer/commit/562c51)
- Add missing fields for story settings ([#628](https://github.com/reearth/reearth-visualizer/pull/628)) [`75d522`](https://github.com/reearth/reearth-visualizer/commit/75d522)

### Misc

#### 📖 Documentation

- Update README.md [`d3335c`](https://github.com/reearth/reearth-visualizer/commit/d3335c)

#### ✨ Refactor

- Use radio group in Data source manage ([#680](https://github.com/reearth/reearth-visualizer/pull/680)) [`72a00b`](https://github.com/reearth/reearth-visualizer/commit/72a00b)
- Add assets feature ([#679](https://github.com/reearth/reearth-visualizer/pull/679)) [`41326d`](https://github.com/reearth/reearth-visualizer/commit/41326d)
- Refactor text input component ([#677](https://github.com/reearth/reearth-visualizer/pull/677)) [`ee4fad`](https://github.com/reearth/reearth-visualizer/commit/ee4fad)

#### Miscellaneous Tasks

- Fix page title empty string ([#762](https://github.com/reearth/reearth-visualizer/pull/762)) [`44e573`](https://github.com/reearth/reearth-visualizer/commit/44e573)
- Fix delete last page doesn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t refresh the right panel ([#771](https://github.com/reearth/reearth-visualizer/pull/771)) [`66c6f9`](https://github.com/reearth/reearth-visualizer/commit/66c6f9)
- Add super admin configuration ([#766](https://github.com/reearth/reearth-visualizer/pull/766)) [`8bc811`](https://github.com/reearth/reearth-visualizer/commit/8bc811)
- Add idProperty to data ([#731](https://github.com/reearth/reearth-visualizer/pull/731)) [`ef5885`](https://github.com/reearth/reearth-visualizer/commit/ef5885)
- Add asset type to data source manager ([#726](https://github.com/reearth/reearth-visualizer/pull/726)) [`28cfb6`](https://github.com/reearth/reearth-visualizer/commit/28cfb6)
- Update CODEOWNERS [`3ed464`](https://github.com/reearth/reearth-visualizer/commit/3ed464)

### ci

#### Miscellaneous Tasks

- Update reviewer-lottery.yml [`8fea37`](https://github.com/reearth/reearth-visualizer/commit/8fea37)

### server, web

#### Miscellaneous Tasks

- Add collection to property schemaGroup ([#764](https://github.com/reearth/reearth-visualizer/pull/764)) [`9cab76`](https://github.com/reearth/reearth-visualizer/commit/9cab76)
- Add map valueType to property ([#759](https://github.com/reearth/reearth-visualizer/pull/759)) [`db515b`](https://github.com/reearth/reearth-visualizer/commit/db515b)

### sever

#### Miscellaneous Tasks

- Refactor around NLS layers ([#656](https://github.com/reearth/reearth-visualizer/pull/656)) [`1405dd`](https://github.com/reearth/reearth-visualizer/commit/1405dd)

### web,server

#### 🚀 Features

- Support maintainer role ([#749](https://github.com/reearth/reearth-visualizer/pull/749)) [`20b086`](https://github.com/reearth/reearth-visualizer/commit/20b086)

### 

#### 📖 Documentation

- Update README.md [`d3335c`](https://github.com/reearth/reearth-visualizer/commit/d3335c)

#### ✨ Refactor

- Use radio group in Data source manage ([#680](https://github.com/reearth/reearth-visualizer/pull/680)) [`72a00b`](https://github.com/reearth/reearth-visualizer/commit/72a00b)
- Add assets feature ([#679](https://github.com/reearth/reearth-visualizer/pull/679)) [`41326d`](https://github.com/reearth/reearth-visualizer/commit/41326d)
- Refactor text input component ([#677](https://github.com/reearth/reearth-visualizer/pull/677)) [`ee4fad`](https://github.com/reearth/reearth-visualizer/commit/ee4fad)

#### Miscellaneous Tasks

- Fix page title empty string ([#762](https://github.com/reearth/reearth-visualizer/pull/762)) [`44e573`](https://github.com/reearth/reearth-visualizer/commit/44e573)
- Fix delete last page doesn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t refresh the right panel ([#771](https://github.com/reearth/reearth-visualizer/pull/771)) [`66c6f9`](https://github.com/reearth/reearth-visualizer/commit/66c6f9)
- Add super admin configuration ([#766](https://github.com/reearth/reearth-visualizer/pull/766)) [`8bc811`](https://github.com/reearth/reearth-visualizer/commit/8bc811)
- Add idProperty to data ([#731](https://github.com/reearth/reearth-visualizer/pull/731)) [`ef5885`](https://github.com/reearth/reearth-visualizer/commit/ef5885)
- Add asset type to data source manager ([#726](https://github.com/reearth/reearth-visualizer/pull/726)) [`28cfb6`](https://github.com/reearth/reearth-visualizer/commit/28cfb6)
- Update CODEOWNERS [`3ed464`](https://github.com/reearth/reearth-visualizer/commit/3ed464)

## 0.18.0 - 2023-08-07

### Web

#### 🚀 Features

- Add VisualizerContext in NLS for beta ([#591](https://github.com/reearth/reearth-visualizer/pull/591)) [`39811d`](https://github.com/reearth/reearth-visualizer/commit/39811d)
- New beta modal design ([#579](https://github.com/reearth/reearth-visualizer/pull/579)) [`517b1b`](https://github.com/reearth/reearth-visualizer/commit/517b1b)
- Support google photorealistic ([#521](https://github.com/reearth/reearth-visualizer/pull/521)) [`ca71b3`](https://github.com/reearth/reearth-visualizer/commit/ca71b3)
- Support IBL for terrain ([#529](https://github.com/reearth/reearth-visualizer/pull/529)) [`743963`](https://github.com/reearth/reearth-visualizer/commit/743963)
- Support HBAO ([#569](https://github.com/reearth/reearth-visualizer/pull/569)) [`d5b3c9`](https://github.com/reearth/reearth-visualizer/commit/d5b3c9)

#### 🔧 Bug Fixes

- Wrong type error [`88ee7e`](https://github.com/reearth/reearth-visualizer/commit/88ee7e)
- Unsafe builtin implementation ([#623](https://github.com/reearth/reearth-visualizer/pull/623)) [`96faac`](https://github.com/reearth/reearth-visualizer/commit/96faac)
- Revert small change [`aa8680`](https://github.com/reearth/reearth-visualizer/commit/aa8680)
- Pr preview build failing ([#614](https://github.com/reearth/reearth-visualizer/pull/614)) [`031295`](https://github.com/reearth/reearth-visualizer/commit/031295)
- Crash app by ambient occlusion ([#611](https://github.com/reearth/reearth-visualizer/pull/611)) [`15bd99`](https://github.com/reearth/reearth-visualizer/commit/15bd99)
- Gpx parsing not working ([#590](https://github.com/reearth/reearth-visualizer/pull/590)) [`35d6da`](https://github.com/reearth/reearth-visualizer/commit/35d6da)
- Build ci failling [`54354b`](https://github.com/reearth/reearth-visualizer/commit/54354b)
- Create workspace  beta modal design ([#597](https://github.com/reearth/reearth-visualizer/pull/597)) [`141026`](https://github.com/reearth/reearth-visualizer/commit/141026)
- Performance issue when generate md5 with large data.url ([#587](https://github.com/reearth/reearth-visualizer/pull/587)) [`733862`](https://github.com/reearth/reearth-visualizer/commit/733862)
- AO invariant error [`b1875e`](https://github.com/reearth/reearth-visualizer/commit/b1875e)
- Ambient occlusion ([#574](https://github.com/reearth/reearth-visualizer/pull/574)) [`9ae1af`](https://github.com/reearth/reearth-visualizer/commit/9ae1af)

#### ✨ Refactor

- Config ([#575](https://github.com/reearth/reearth-visualizer/pull/575)) [`2ebdf5`](https://github.com/reearth/reearth-visualizer/commit/2ebdf5)
- Services&#x2F;api [`4ec0bc`](https://github.com/reearth/reearth-visualizer/commit/4ec0bc)

#### Miscellaneous Tasks

- Update hexadecimal colors ([#618](https://github.com/reearth/reearth-visualizer/pull/618)) [`ac2bb9`](https://github.com/reearth/reearth-visualizer/commit/ac2bb9)
- Version bump to 0.18.0 [`9c794d`](https://github.com/reearth/reearth-visualizer/commit/9c794d)
- Fix several issues around visualizer render ([#612](https://github.com/reearth/reearth-visualizer/pull/612)) [`62d28e`](https://github.com/reearth/reearth-visualizer/commit/62d28e)
- Update button beta design ([#613](https://github.com/reearth/reearth-visualizer/pull/613)) [`ed4e33`](https://github.com/reearth/reearth-visualizer/commit/ed4e33)
- Basic publish tab in beta ([#606](https://github.com/reearth/reearth-visualizer/pull/606)) [`5f3141`](https://github.com/reearth/reearth-visualizer/commit/5f3141)
- Hook up with story page API ([#592](https://github.com/reearth/reearth-visualizer/pull/592)) [`9eea0f`](https://github.com/reearth/reearth-visualizer/commit/9eea0f)
- Add widget and align system update functionality ([#604](https://github.com/reearth/reearth-visualizer/pull/604)) [`0738b7`](https://github.com/reearth/reearth-visualizer/commit/0738b7)
- Update widget tab ([#598](https://github.com/reearth/reearth-visualizer/pull/598)) [`a40c94`](https://github.com/reearth/reearth-visualizer/commit/a40c94)
- Enable visualizer explicit rendering ([#583](https://github.com/reearth/reearth-visualizer/pull/583)) [`7a2503`](https://github.com/reearth/reearth-visualizer/commit/7a2503)
- Unsafe plugin support ([#576](https://github.com/reearth/reearth-visualizer/pull/576)) [`1ebef7`](https://github.com/reearth/reearth-visualizer/commit/1ebef7)
- Add list style common DnD component ([#585](https://github.com/reearth/reearth-visualizer/pull/585)) [`ad4ae6`](https://github.com/reearth/reearth-visualizer/commit/ad4ae6)
- Add popover contents to left panel and related modification ([#581](https://github.com/reearth/reearth-visualizer/pull/581)) [`ca753c`](https://github.com/reearth/reearth-visualizer/commit/ca753c)
- Basic widget page ([#578](https://github.com/reearth/reearth-visualizer/pull/578)) [`3e8dc0`](https://github.com/reearth/reearth-visualizer/commit/3e8dc0)
- Add popover and basic content components ([#580](https://github.com/reearth/reearth-visualizer/pull/580)) [`53bf82`](https://github.com/reearth/reearth-visualizer/commit/53bf82)
- Panel resize functionality improvements ([#572](https://github.com/reearth/reearth-visualizer/pull/572)) [`99f5ad`](https://github.com/reearth/reearth-visualizer/commit/99f5ad)
- Add image-based lighting ([#519](https://github.com/reearth/reearth-visualizer/pull/519)) [`7622d7`](https://github.com/reearth/reearth-visualizer/commit/7622d7)
- Add storytelling static content of left panel  ([#565](https://github.com/reearth/reearth-visualizer/pull/565)) [`65c1a1`](https://github.com/reearth/reearth-visualizer/commit/65c1a1)

### Server

#### 🚀 Features

- Storytelling blocks CRUD ([#610](https://github.com/reearth/reearth-visualizer/pull/610)) [`5ac70f`](https://github.com/reearth/reearth-visualizer/commit/5ac70f)
- Support storytelling ([#553](https://github.com/reearth/reearth-visualizer/pull/553)) [`f9b310`](https://github.com/reearth/reearth-visualizer/commit/f9b310)
- Extension system ([#584](https://github.com/reearth/reearth-visualizer/pull/584)) [`847db6`](https://github.com/reearth/reearth-visualizer/commit/847db6)

#### 🔧 Bug Fixes

- Add missing plugin extensions types ([#624](https://github.com/reearth/reearth-visualizer/pull/624)) [`b98084`](https://github.com/reearth/reearth-visualizer/commit/b98084)
- Add missing fields to PropertySchema documents. ([#621](https://github.com/reearth/reearth-visualizer/pull/621)) [`827c0d`](https://github.com/reearth/reearth-visualizer/commit/827c0d)

#### ⚡️ Performance

- Add group.linkeddatasetschema index ([#563](https://github.com/reearth/reearth-visualizer/pull/563)) [`c4f2c1`](https://github.com/reearth/reearth-visualizer/commit/c4f2c1)
- Improve dataset index ([#562](https://github.com/reearth/reearth-visualizer/pull/562)) [`49ce87`](https://github.com/reearth/reearth-visualizer/commit/49ce87)

#### Miscellaneous Tasks

- Revert changes on ci_server.yml [`fb45e0`](https://github.com/reearth/reearth-visualizer/commit/fb45e0)
- Expand sys extensions to support storytelling pages&#x2F;blocks ([#622](https://github.com/reearth/reearth-visualizer/pull/622)) [`c4c46c`](https://github.com/reearth/reearth-visualizer/commit/c4c46c)
- Add JSON schema to built in manifest ([#617](https://github.com/reearth/reearth-visualizer/pull/617)) [`755931`](https://github.com/reearth/reearth-visualizer/commit/755931)
- Add spacing value type with padding and margin UI support ([#616](https://github.com/reearth/reearth-visualizer/pull/616)) [`99abf5`](https://github.com/reearth/reearth-visualizer/commit/99abf5)

### Misc

#### Miscellaneous Tasks

- Revert CHANGELOG.md to same as main [`ac3594`](https://github.com/reearth/reearth-visualizer/commit/ac3594)
- Remove prev CHANGELOG changes [`c248fc`](https://github.com/reearth/reearth-visualizer/commit/c248fc)
- Update reviewer-lottery.yml [`79aaf0`](https://github.com/reearth/reearth-visualizer/commit/79aaf0)
- Update theme&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s colors ([#589](https://github.com/reearth/reearth-visualizer/pull/589)) [`714fb9`](https://github.com/reearth/reearth-visualizer/commit/714fb9)
- Update CODEOWNERS [`0b8919`](https://github.com/reearth/reearth-visualizer/commit/0b8919)

### 

#### Miscellaneous Tasks

- Revert CHANGELOG.md to same as main [`ac3594`](https://github.com/reearth/reearth-visualizer/commit/ac3594)
- Remove prev CHANGELOG changes [`c248fc`](https://github.com/reearth/reearth-visualizer/commit/c248fc)
- Update reviewer-lottery.yml [`79aaf0`](https://github.com/reearth/reearth-visualizer/commit/79aaf0)
- Update theme&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s colors ([#589](https://github.com/reearth/reearth-visualizer/pull/589)) [`714fb9`](https://github.com/reearth/reearth-visualizer/commit/714fb9)
- Update CODEOWNERS [`0b8919`](https://github.com/reearth/reearth-visualizer/commit/0b8919)

## 0.17.0 - 2023-07-11

### Web

#### 🚀 Features

- Visualizer antialiasing ([#566](https://github.com/reearth/reearth-visualizer/pull/566)) [`dd1b39`](https://github.com/reearth/reearth-visualizer/commit/dd1b39)
- Visualizer supports shadow map ([#524](https://github.com/reearth/reearth-visualizer/pull/524)) [`748d9d`](https://github.com/reearth/reearth-visualizer/commit/748d9d)
- Add an option to disable default PBR to 3dtiles and model features in NLS ([#517](https://github.com/reearth/reearth-visualizer/pull/517)) [`29083d`](https://github.com/reearth/reearth-visualizer/commit/29083d)
- Interaction mode on beta ([#507](https://github.com/reearth/reearth-visualizer/pull/507)) [`d4bbd6`](https://github.com/reearth/reearth-visualizer/commit/d4bbd6)
- Add aws cognito support in auth ([#449](https://github.com/reearth/reearth-visualizer/pull/449)) [`414473`](https://github.com/reearth/reearth-visualizer/commit/414473)

#### 🔧 Bug Fixes

- Unexpect select undefined when select mvt layer ([#560](https://github.com/reearth/reearth-visualizer/pull/560)) [`7ec40f`](https://github.com/reearth/reearth-visualizer/commit/7ec40f)
- Show OSM buildings [`ac01eb`](https://github.com/reearth/reearth-visualizer/commit/ac01eb)
- Selection event for published page ([#549](https://github.com/reearth/reearth-visualizer/pull/549)) [`b4a111`](https://github.com/reearth/reearth-visualizer/commit/b4a111)
- Pass ion token to each layer ([#558](https://github.com/reearth/reearth-visualizer/pull/558)) [`822d03`](https://github.com/reearth/reearth-visualizer/commit/822d03)
- Support with Authentication function support for cognito backend ([#514](https://github.com/reearth/reearth-visualizer/pull/514)) [`c603f7`](https://github.com/reearth/reearth-visualizer/commit/c603f7)
- Skip cache feature for data has updateInterval ([#552](https://github.com/reearth/reearth-visualizer/pull/552)) [`38489c`](https://github.com/reearth/reearth-visualizer/commit/38489c)
- Add id to property group list [`466fac`](https://github.com/reearth/reearth-visualizer/commit/466fac)
- Workspace or userId being undefined ([#527](https://github.com/reearth/reearth-visualizer/pull/527)) [`d676dc`](https://github.com/reearth/reearth-visualizer/commit/d676dc)
- Infinite loop on network error ([#525](https://github.com/reearth/reearth-visualizer/pull/525)) [`fa30bc`](https://github.com/reearth/reearth-visualizer/commit/fa30bc)
- Revert functionality to remember last workspace opened ([#523](https://github.com/reearth/reearth-visualizer/pull/523)) [`05e32d`](https://github.com/reearth/reearth-visualizer/commit/05e32d)
- Typing for window in beta ([#518](https://github.com/reearth/reearth-visualizer/pull/518)) [`b815a9`](https://github.com/reearth/reearth-visualizer/commit/b815a9)
- Wrong workspace when sharing link ([#506](https://github.com/reearth/reearth-visualizer/pull/506)) [`5b939e`](https://github.com/reearth/reearth-visualizer/commit/5b939e)
- Revert published page VR layer selection ([#512](https://github.com/reearth/reearth-visualizer/pull/512)) [`02d7fa`](https://github.com/reearth/reearth-visualizer/commit/02d7fa)
- Published page not getting theme [`a797dd`](https://github.com/reearth/reearth-visualizer/commit/a797dd)

#### ⚡️ Performance

- Speed up fetching layers with datasets ([#544](https://github.com/reearth/reearth-visualizer/pull/544)) [`e12357`](https://github.com/reearth/reearth-visualizer/commit/e12357)

#### ✨ Refactor

- Split gql queries, fragments, etc ([#546](https://github.com/reearth/reearth-visualizer/pull/546)) [`591800`](https://github.com/reearth/reearth-visualizer/commit/591800)
- Handle cesium private property of shadow map ([#531](https://github.com/reearth/reearth-visualizer/pull/531)) [`ae4cdd`](https://github.com/reearth/reearth-visualizer/commit/ae4cdd)
- Handle GQL errors w useSetAtom ([#528](https://github.com/reearth/reearth-visualizer/pull/528)) [`ff2040`](https://github.com/reearth/reearth-visualizer/commit/ff2040)
- Update Beta theme ([#504](https://github.com/reearth/reearth-visualizer/pull/504)) [`248f1a`](https://github.com/reearth/reearth-visualizer/commit/248f1a)

#### Miscellaneous Tasks

- Remove duplication from canvas convert.ts ([#573](https://github.com/reearth/reearth-visualizer/pull/573)) [`988041`](https://github.com/reearth/reearth-visualizer/commit/988041)
- Update package.json to v0.17.0 ([#571](https://github.com/reearth/reearth-visualizer/pull/571)) [`ac87ec`](https://github.com/reearth/reearth-visualizer/commit/ac87ec)
- Update package.json to v0.17.0 ([#570](https://github.com/reearth/reearth-visualizer/pull/570)) [`215c73`](https://github.com/reearth/reearth-visualizer/commit/215c73)
- Refactor graphQL and set new standard ([#536](https://github.com/reearth/reearth-visualizer/pull/536)) [`a002e6`](https://github.com/reearth/reearth-visualizer/commit/a002e6)
- Add story page indicator ([#543](https://github.com/reearth/reearth-visualizer/pull/543)) [`7b47bb`](https://github.com/reearth/reearth-visualizer/commit/7b47bb)
- Add empty StoryPanel ([#541](https://github.com/reearth/reearth-visualizer/pull/541)) [`65ba8c`](https://github.com/reearth/reearth-visualizer/commit/65ba8c)
- Allow reearth_config.json to be set remotely for local development ([#559](https://github.com/reearth/reearth-visualizer/pull/559)) [`d1cba2`](https://github.com/reearth/reearth-visualizer/commit/d1cba2)
- Add SettingsButtons Component ([#513](https://github.com/reearth/reearth-visualizer/pull/513)) [`6d0ab3`](https://github.com/reearth/reearth-visualizer/commit/6d0ab3)
- Add SwitchButtonList Component ([#526](https://github.com/reearth/reearth-visualizer/pull/526)) [`34c54f`](https://github.com/reearth/reearth-visualizer/commit/34c54f)
- Reduce useless console.log on dataset load [`afcde1`](https://github.com/reearth/reearth-visualizer/commit/afcde1)
- Add actionItem to beta ([#497](https://github.com/reearth/reearth-visualizer/pull/497)) [`d48d54`](https://github.com/reearth/reearth-visualizer/commit/d48d54)
- Add CheckboxField component ([#508](https://github.com/reearth/reearth-visualizer/pull/508)) [`3a12f5`](https://github.com/reearth/reearth-visualizer/commit/3a12f5)
- Add SubTabButtonList component ([#509](https://github.com/reearth/reearth-visualizer/pull/509)) [`61c937`](https://github.com/reearth/reearth-visualizer/commit/61c937)
- Add SidePanelSectionField component ([#505](https://github.com/reearth/reearth-visualizer/pull/505)) [`4b7056`](https://github.com/reearth/reearth-visualizer/commit/4b7056)
- Update package.json version [`ff1daf`](https://github.com/reearth/reearth-visualizer/commit/ff1daf)

### Server

#### 🚀 Features

- Add dataset IDs and schema to dataset API ([#539](https://github.com/reearth/reearth-visualizer/pull/539)) [`765c29`](https://github.com/reearth/reearth-visualizer/commit/765c29)
- Dataset REST API ([#537](https://github.com/reearth/reearth-visualizer/pull/537)) [`62d6f0`](https://github.com/reearth/reearth-visualizer/commit/62d6f0)

#### 🔧 Bug Fixes

- Reduce size of queries sent to MongoDB ([#550](https://github.com/reearth/reearth-visualizer/pull/550)) [`56bef2`](https://github.com/reearth/reearth-visualizer/commit/56bef2)
- Filter properties in property.FindByIDs ([#548](https://github.com/reearth/reearth-visualizer/pull/548)) [`842252`](https://github.com/reearth/reearth-visualizer/commit/842252)
- Add schema field ID to dataset REST API ([#547](https://github.com/reearth/reearth-visualizer/pull/547)) [`241011`](https://github.com/reearth/reearth-visualizer/commit/241011)
- Use default mongo conn timeout [`f0e5cc`](https://github.com/reearth/reearth-visualizer/commit/f0e5cc)

#### ✨ Refactor

- Replace user&#x2F;workspace with account in reearthx ([#493](https://github.com/reearth/reearth-visualizer/pull/493)) [`5a612b`](https://github.com/reearth/reearth-visualizer/commit/5a612b)

#### Miscellaneous Tasks

- Go mod tidy [`a0d8b0`](https://github.com/reearth/reearth-visualizer/commit/a0d8b0)
- Add REEARTH_ASSETBASEURL to &#x2F;server&#x2F;.env.example ([#433](https://github.com/reearth/reearth-visualizer/pull/433)) [`02e25c`](https://github.com/reearth/reearth-visualizer/commit/02e25c)
- Print request ID to logs ([#530](https://github.com/reearth/reearth-visualizer/pull/530)) [`8081c9`](https://github.com/reearth/reearth-visualizer/commit/8081c9)
- Add logs on internal error [`4b79e9`](https://github.com/reearth/reearth-visualizer/commit/4b79e9)

### Misc

#### 🔧 Bug Fixes

- Force jpg for watercolor tile ([#564](https://github.com/reearth/reearth-visualizer/pull/564)) [`45ec8f`](https://github.com/reearth/reearth-visualizer/commit/45ec8f)

#### Miscellaneous Tasks

- Update node.js to v18 ([#515](https://github.com/reearth/reearth-visualizer/pull/515)) [`d34248`](https://github.com/reearth/reearth-visualizer/commit/d34248)
- Update CODEOWNERS [`55f82a`](https://github.com/reearth/reearth-visualizer/commit/55f82a)

#### 

- Chore(web): Add InsertionButton ([#496](https://github.com/reearth/reearth-visualizer/pull/496)) [`b55cc9`](https://github.com/reearth/reearth-visualizer/commit/b55cc9)
- Chore(web): Add StorytellingPageSectionItem ([#495](https://github.com/reearth/reearth-visualizer/pull/495)) [`36ddb2`](https://github.com/reearth/reearth-visualizer/commit/36ddb2)

### 

#### 🔧 Bug Fixes

- Force jpg for watercolor tile ([#564](https://github.com/reearth/reearth-visualizer/pull/564)) [`45ec8f`](https://github.com/reearth/reearth-visualizer/commit/45ec8f)

#### Miscellaneous Tasks

- Update node.js to v18 ([#515](https://github.com/reearth/reearth-visualizer/pull/515)) [`d34248`](https://github.com/reearth/reearth-visualizer/commit/d34248)
- Update CODEOWNERS [`55f82a`](https://github.com/reearth/reearth-visualizer/commit/55f82a)

#### 

- Chore(web): Add InsertionButton ([#496](https://github.com/reearth/reearth-visualizer/pull/496)) [`b55cc9`](https://github.com/reearth/reearth-visualizer/commit/b55cc9)
- Chore(web): Add StorytellingPageSectionItem ([#495](https://github.com/reearth/reearth-visualizer/pull/495)) [`36ddb2`](https://github.com/reearth/reearth-visualizer/commit/36ddb2)

## 0.16.3 - 2023-06-16

### Web

#### 🔧 Bug Fixes

- Don&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t show project select on project creation [`a2def8`](https://github.com/reearth/reearth-visualizer/commit/a2def8)
- Published page layer selection ([#503](https://github.com/reearth/reearth-visualizer/pull/503)) [`2a23f4`](https://github.com/reearth/reearth-visualizer/commit/2a23f4)

#### ✨ Refactor

- Theme system ([#498](https://github.com/reearth/reearth-visualizer/pull/498)) [`b7fa18`](https://github.com/reearth/reearth-visualizer/commit/b7fa18)
- Organize stories to classic group ([#488](https://github.com/reearth/reearth-visualizer/pull/488)) [`0eed12`](https://github.com/reearth/reearth-visualizer/commit/0eed12)
- Organize Resizable(beta) hooks ([#467](https://github.com/reearth/reearth-visualizer/pull/467)) [`449335`](https://github.com/reearth/reearth-visualizer/commit/449335)

#### Miscellaneous Tasks

- Update package.json for v0.16.3 [`116936`](https://github.com/reearth/reearth-visualizer/commit/116936)
- Design beta navBar ([#486](https://github.com/reearth/reearth-visualizer/pull/486)) [`e07837`](https://github.com/reearth/reearth-visualizer/commit/e07837)
- Add useManageSwitchState ([#471](https://github.com/reearth/reearth-visualizer/pull/471)) [`97f7f2`](https://github.com/reearth/reearth-visualizer/commit/97f7f2)

### Server

#### 🔧 Bug Fixes

- Ignore filter for project repo findByPublicName ([#499](https://github.com/reearth/reearth-visualizer/pull/499)) [`612e78`](https://github.com/reearth/reearth-visualizer/commit/612e78)
- Published metadata api should return error correctly [`073b30`](https://github.com/reearth/reearth-visualizer/commit/073b30)

### Misc

#### Miscellaneous Tasks

- Update CODEOWNERS [`338c7a`](https://github.com/reearth/reearth-visualizer/commit/338c7a)

### 

#### Miscellaneous Tasks

- Update CODEOWNERS [`338c7a`](https://github.com/reearth/reearth-visualizer/commit/338c7a)

## 0.16.2 - 2023-06-08

### Web

#### Miscellaneous Tasks

- Update package.json [`4051be`](https://github.com/reearth/reearth-visualizer/commit/4051be)

### web, server

## 0.16.1 - 2023-06-08

### Web


### Misc

#### Miscellaneous Tasks

- Update to 0.16.1 for the fix release [`707942`](https://github.com/reearth/reearth-visualizer/commit/707942)

### server, web


### web, server


### 

#### Miscellaneous Tasks

- Update to 0.16.1 for the fix release [`707942`](https://github.com/reearth/reearth-visualizer/commit/707942)

## 0.16.0 - 2023-06-08

### Web

#### 🚀 Features

- Support create beta project ([#451](https://github.com/reearth/reearth-visualizer/pull/451)) [`7c89bf`](https://github.com/reearth/reearth-visualizer/commit/7c89bf)
- Re:Earth Beta routing and basic component structure ([#444](https://github.com/reearth/reearth-visualizer/pull/444)) [`75b7bb`](https://github.com/reearth/reearth-visualizer/commit/75b7bb)
- Split code between beta and classic ([#434](https://github.com/reearth/reearth-visualizer/pull/434)) [`a8a680`](https://github.com/reearth/reearth-visualizer/commit/a8a680)

#### 🔧 Bug Fixes

- Infobox showing [object object] on click ([#487](https://github.com/reearth/reearth-visualizer/pull/487)) [`90c38e`](https://github.com/reearth/reearth-visualizer/commit/90c38e)
- Parse properties(feature) recursively before using in evaluator at core ([#479](https://github.com/reearth/reearth-visualizer/pull/479)) [`20635b`](https://github.com/reearth/reearth-visualizer/commit/20635b)
- UpdateClockLoad deafault true in beta-core ([#480](https://github.com/reearth/reearth-visualizer/pull/480)) [`6e27b8`](https://github.com/reearth/reearth-visualizer/commit/6e27b8)
- Set updateClockOnLoad default value as true ([#470](https://github.com/reearth/reearth-visualizer/pull/470)) [`b61d6e`](https://github.com/reearth/reearth-visualizer/commit/b61d6e)
- Use error boundary in core Visualizer ([#442](https://github.com/reearth/reearth-visualizer/pull/442)) [`c3bca4`](https://github.com/reearth/reearth-visualizer/commit/c3bca4)
- Stories name conflicts ([#439](https://github.com/reearth/reearth-visualizer/pull/439)) [`e59e2a`](https://github.com/reearth/reearth-visualizer/commit/e59e2a)
- Storybook v7 setup ([#438](https://github.com/reearth/reearth-visualizer/pull/438)) [`77fe8e`](https://github.com/reearth/reearth-visualizer/commit/77fe8e)
- Auth0 error when refresh token ([#436](https://github.com/reearth/reearth-visualizer/pull/436)) [`db7b69`](https://github.com/reearth/reearth-visualizer/commit/db7b69)

#### ✨ Refactor

- Beta visualizer ([#469](https://github.com/reearth/reearth-visualizer/pull/469)) [`332db7`](https://github.com/reearth/reearth-visualizer/commit/332db7)
- Storybook setup ([#457](https://github.com/reearth/reearth-visualizer/pull/457)) [`4b0c52`](https://github.com/reearth/reearth-visualizer/commit/4b0c52)
- Beta tab routing ([#448](https://github.com/reearth/reearth-visualizer/pull/448)) [`4f1678`](https://github.com/reearth/reearth-visualizer/commit/4f1678)
- Routing ([#447](https://github.com/reearth/reearth-visualizer/pull/447)) [`ca7216`](https://github.com/reearth/reearth-visualizer/commit/ca7216)

#### Miscellaneous Tasks

- Add theming support for components in storybook ([#481](https://github.com/reearth/reearth-visualizer/pull/481)) [`7cdea3`](https://github.com/reearth/reearth-visualizer/commit/7cdea3)
- Add TabButton component ([#464](https://github.com/reearth/reearth-visualizer/pull/464)) [`342a03`](https://github.com/reearth/reearth-visualizer/commit/342a03)
- Add beta editor layout ([#463](https://github.com/reearth/reearth-visualizer/pull/463)) [`96c473`](https://github.com/reearth/reearth-visualizer/commit/96c473)
- Move visualizer to beta ([#460](https://github.com/reearth/reearth-visualizer/pull/460)) [`5ed819`](https://github.com/reearth/reearth-visualizer/commit/5ed819)
- Copy Icon component from classic ([#455](https://github.com/reearth/reearth-visualizer/pull/455)) [`994287`](https://github.com/reearth/reearth-visualizer/commit/994287)
- Upgrade vite version ([#458](https://github.com/reearth/reearth-visualizer/pull/458)) [`3e3cb9`](https://github.com/reearth/reearth-visualizer/commit/3e3cb9)
- Improve storybook preview setting ([#456](https://github.com/reearth/reearth-visualizer/pull/456)) [`16d7ac`](https://github.com/reearth/reearth-visualizer/commit/16d7ac)
- Update eslint and tsconfig to include &#x60;any&#x60; use ([#452](https://github.com/reearth/reearth-visualizer/pull/452)) [`13ae38`](https://github.com/reearth/reearth-visualizer/commit/13ae38)

### Server

#### 🚀 Features

- Support AWS S3 storage ([#440](https://github.com/reearth/reearth-visualizer/pull/440)) [`8c56c7`](https://github.com/reearth/reearth-visualizer/commit/8c56c7)
- Support AWS Cognito auth server ([#450](https://github.com/reearth/reearth-visualizer/pull/450)) [`2002db`](https://github.com/reearth/reearth-visualizer/commit/2002db)
- Support AWS SES mailer ([#441](https://github.com/reearth/reearth-visualizer/pull/441)) [`23be7b`](https://github.com/reearth/reearth-visualizer/commit/23be7b)
- Add coreSupport flag to project ([#424](https://github.com/reearth/reearth-visualizer/pull/424)) [`dacc3d`](https://github.com/reearth/reearth-visualizer/commit/dacc3d)

#### 🔧 Bug Fixes

- Plugin migrator did not update layers [`d0524e`](https://github.com/reearth/reearth-visualizer/commit/d0524e)
- Plugin update cause layer corruption ([#431](https://github.com/reearth/reearth-visualizer/pull/431)) [`f2dd7b`](https://github.com/reearth/reearth-visualizer/commit/f2dd7b)
- Fs does not work on windows ([#430](https://github.com/reearth/reearth-visualizer/pull/430)) [`189039`](https://github.com/reearth/reearth-visualizer/commit/189039)

#### ✨ Refactor

- Use reearthx auth middleware ([#468](https://github.com/reearth/reearth-visualizer/pull/468)) [`e9e4c6`](https://github.com/reearth/reearth-visualizer/commit/e9e4c6)
- Graphql schema ([#446](https://github.com/reearth/reearth-visualizer/pull/446)) [`ee0710`](https://github.com/reearth/reearth-visualizer/commit/ee0710)
- Use reearthx mailer ([#445](https://github.com/reearth/reearth-visualizer/pull/445)) [`f27b78`](https://github.com/reearth/reearth-visualizer/commit/f27b78)

#### 🧪 Testing

- Fix project created at in unit test ([#477](https://github.com/reearth/reearth-visualizer/pull/477)) [`640c7e`](https://github.com/reearth/reearth-visualizer/commit/640c7e)

#### Miscellaneous Tasks

- Upgrade go to v1.20 [`e0790f`](https://github.com/reearth/reearth-visualizer/commit/e0790f)

### Misc

#### 📖 Documentation

- Add badges to server and web READMEs ([#454](https://github.com/reearth/reearth-visualizer/pull/454)) [`7cbce1`](https://github.com/reearth/reearth-visualizer/commit/7cbce1)

#### Miscellaneous Tasks

- Update to 0.16.0 for the release [`561ed8`](https://github.com/reearth/reearth-visualizer/commit/561ed8)
- Update CODEOWNERS ([#482](https://github.com/reearth/reearth-visualizer/pull/482)) [`dbac02`](https://github.com/reearth/reearth-visualizer/commit/dbac02)
- Add ActionButton icon ([#461](https://github.com/reearth/reearth-visualizer/pull/461)) [`ef30ad`](https://github.com/reearth/reearth-visualizer/commit/ef30ad)
- Remove netlify.toml ([#435](https://github.com/reearth/reearth-visualizer/pull/435)) [`48a8cf`](https://github.com/reearth/reearth-visualizer/commit/48a8cf)

#### 

- Update readmes [`976835`](https://github.com/reearth/reearth-visualizer/commit/976835)
- Update for v0.15.1 [`a4ada6`](https://github.com/reearth/reearth-visualizer/commit/a4ada6)

### 

#### 📖 Documentation

- Add badges to server and web READMEs ([#454](https://github.com/reearth/reearth-visualizer/pull/454)) [`7cbce1`](https://github.com/reearth/reearth-visualizer/commit/7cbce1)

#### Miscellaneous Tasks

- Update to 0.16.0 for the release [`561ed8`](https://github.com/reearth/reearth-visualizer/commit/561ed8)
- Update CODEOWNERS ([#482](https://github.com/reearth/reearth-visualizer/pull/482)) [`dbac02`](https://github.com/reearth/reearth-visualizer/commit/dbac02)
- Add ActionButton icon ([#461](https://github.com/reearth/reearth-visualizer/pull/461)) [`ef30ad`](https://github.com/reearth/reearth-visualizer/commit/ef30ad)
- Remove netlify.toml ([#435](https://github.com/reearth/reearth-visualizer/pull/435)) [`48a8cf`](https://github.com/reearth/reearth-visualizer/commit/48a8cf)

#### 

- Update readmes [`976835`](https://github.com/reearth/reearth-visualizer/commit/976835)
- Update for v0.15.1 [`a4ada6`](https://github.com/reearth/reearth-visualizer/commit/a4ada6)

## 0.15.0 - 2023-05-18

### Web

#### 🚀 Features

- Support nested style expression object in style evaluator ([#423](https://github.com/reearth/reearth-visualizer/pull/423)) [`60b52c`](https://github.com/reearth/reearth-visualizer/commit/60b52c)
- Add reearth ver support in profile header ([#428](https://github.com/reearth/reearth-visualizer/pull/428)) [`d1125e`](https://github.com/reearth/reearth-visualizer/commit/d1125e)
- Sandbox plugin iframe - alpha ([#399](https://github.com/reearth/reearth-visualizer/pull/399)) [`d77fcb`](https://github.com/reearth/reearth-visualizer/commit/d77fcb)
- Add netlify to web ([#413](https://github.com/reearth/reearth-visualizer/pull/413)) [`ce6935`](https://github.com/reearth/reearth-visualizer/commit/ce6935)
- Support csv download for Dataset in setting page  ([#410](https://github.com/reearth/reearth-visualizer/pull/410)) [`3bb0a0`](https://github.com/reearth/reearth-visualizer/commit/3bb0a0)
- Properties for widget areas ([#427](https://github.com/reearth/reearth-visualizer/pull/427)) [`e6e805`](https://github.com/reearth/reearth-visualizer/commit/e6e805)

#### 🔧 Bug Fixes

- Add data url to componentId for better tracking of component in core ([#421](https://github.com/reearth/reearth-visualizer/pull/421)) [`c3ab03`](https://github.com/reearth/reearth-visualizer/commit/c3ab03)
- Update cesium version to 1.105.2 from 1.105.1 ([#425](https://github.com/reearth/reearth-visualizer/pull/425)) [`de8896`](https://github.com/reearth/reearth-visualizer/commit/de8896)
- Create new workspace doesn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t save session ([#417](https://github.com/reearth/reearth-visualizer/pull/417)) [`2c36e7`](https://github.com/reearth/reearth-visualizer/commit/2c36e7)
- Classic infobox always shown for 3d tiles ([#416](https://github.com/reearth/reearth-visualizer/pull/416)) [`a7a944`](https://github.com/reearth/reearth-visualizer/commit/a7a944)
- Wrong last workspace value when multiple tabs ([#405](https://github.com/reearth/reearth-visualizer/pull/405)) [`d68440`](https://github.com/reearth/reearth-visualizer/commit/d68440)
- Feature containing layer show hide not working ([#412](https://github.com/reearth/reearth-visualizer/pull/412)) [`2a97ef`](https://github.com/reearth/reearth-visualizer/commit/2a97ef)
- Point cloud style converse error with undefined ([#398](https://github.com/reearth/reearth-visualizer/pull/398)) [`9bf955`](https://github.com/reearth/reearth-visualizer/commit/9bf955)
- Remove package.json yarn.lock from root ([#395](https://github.com/reearth/reearth-visualizer/pull/395)) [`a87a2c`](https://github.com/reearth/reearth-visualizer/commit/a87a2c)
- Pre-commit hook with husky [`b96641`](https://github.com/reearth/reearth-visualizer/commit/b96641)
- Widget align system ([#436](https://github.com/reearth/reearth-visualizer/pull/436)) [`0b8c85`](https://github.com/reearth/reearth-visualizer/commit/0b8c85)

#### Miscellaneous Tasks

- Upgrade auth0 to version 2 ([#420](https://github.com/reearth/reearth-visualizer/pull/420)) [`abfb4d`](https://github.com/reearth/reearth-visualizer/commit/abfb4d)
- Update dependencies ([#411](https://github.com/reearth/reearth-visualizer/pull/411)) [`58632a`](https://github.com/reearth/reearth-visualizer/commit/58632a)
- Remove redundant comments [`57aa3c`](https://github.com/reearth/reearth-visualizer/commit/57aa3c)
- Purge reearth-web of reference to team-Setting page ([#394](https://github.com/reearth/reearth-visualizer/pull/394)) [`bc6d01`](https://github.com/reearth/reearth-visualizer/commit/bc6d01)

### Server

#### 🚀 Features

- Export dataset as csv ([#409](https://github.com/reearth/reearth-visualizer/pull/409)) [`79077b`](https://github.com/reearth/reearth-visualizer/commit/79077b)
- Add experimental_sandbox option to scene settings [`8d688c`](https://github.com/reearth/reearth-visualizer/commit/8d688c)
- REEARTH_WEB_CONFIG envvar [`e6e79e`](https://github.com/reearth/reearth-visualizer/commit/e6e79e)
- Vr mode in scene property [`53030d`](https://github.com/reearth/reearth-visualizer/commit/53030d)
- Add config to disable web feature [`654758`](https://github.com/reearth/reearth-visualizer/commit/654758)
- Serve published pages on root path ([#386](https://github.com/reearth/reearth-visualizer/pull/386)) [`845531`](https://github.com/reearth/reearth-visualizer/commit/845531)
- Label background padding for markers [`160944`](https://github.com/reearth/reearth-visualizer/commit/160944)
- Label background color property field for markers [`ac10b4`](https://github.com/reearth/reearth-visualizer/commit/ac10b4)
- Add padding properties to widget align system area ([#381](https://github.com/reearth/reearth-visualizer/pull/381)) [`d5dbcf`](https://github.com/reearth/reearth-visualizer/commit/d5dbcf)
- Add Visible field to built-in widgets ([#380](https://github.com/reearth/reearth-visualizer/pull/380)) [`8c1d82`](https://github.com/reearth/reearth-visualizer/commit/8c1d82)

#### 🔧 Bug Fixes

- Fix favicon url [`12dafb`](https://github.com/reearth/reearth-visualizer/commit/12dafb)
- Rewrite title and favicon for published html [`03b5be`](https://github.com/reearth/reearth-visualizer/commit/03b5be)
- Env vars to change html title and favicon ([#390](https://github.com/reearth/reearth-visualizer/pull/390)) [`a9910c`](https://github.com/reearth/reearth-visualizer/commit/a9910c)
- Upload assets outside transaction [`afc7e2`](https://github.com/reearth/reearth-visualizer/commit/afc7e2)
- Handle transaction correctly [`4b164b`](https://github.com/reearth/reearth-visualizer/commit/4b164b)
- Prefer dataset values when merging properties ([#388](https://github.com/reearth/reearth-visualizer/pull/388)) [`8112f7`](https://github.com/reearth/reearth-visualizer/commit/8112f7)
- Add schema to published field in web config [`b17807`](https://github.com/reearth/reearth-visualizer/commit/b17807)
- Add published field to web config [`18fdf7`](https://github.com/reearth/reearth-visualizer/commit/18fdf7)
- Description of experimental flag in scene property [`b04157`](https://github.com/reearth/reearth-visualizer/commit/b04157)
- Htmlblock order ([#385](https://github.com/reearth/reearth-visualizer/pull/385)) [`bb1b9c`](https://github.com/reearth/reearth-visualizer/commit/bb1b9c)
- Use auth0 web client id for reearth_config.json [`634799`](https://github.com/reearth/reearth-visualizer/commit/634799)
- Make widget area gap optional ([#383](https://github.com/reearth/reearth-visualizer/pull/383)) [`1e00ca`](https://github.com/reearth/reearth-visualizer/commit/1e00ca)
- Widget padding fixes ([#382](https://github.com/reearth/reearth-visualizer/pull/382)) [`a019c5`](https://github.com/reearth/reearth-visualizer/commit/a019c5)
- Widget area could not be saved and loaded to mongo [`3f3adf`](https://github.com/reearth/reearth-visualizer/commit/3f3adf)
- Public plugin was deleted on installing privte plugin that has same name [`d24034`](https://github.com/reearth/reearth-visualizer/commit/d24034)

#### ✨ Refactor

- Use reearthx cache ([#401](https://github.com/reearth/reearth-visualizer/pull/401)) [`c4811d`](https://github.com/reearth/reearth-visualizer/commit/c4811d)

#### 🧪 Testing

- Some unit test fails on windows ([#392](https://github.com/reearth/reearth-visualizer/pull/392)) [`bc89f3`](https://github.com/reearth/reearth-visualizer/commit/bc89f3)

#### Miscellaneous Tasks

- Lowercase the error message [`c22565`](https://github.com/reearth/reearth-visualizer/commit/c22565)
- Upgrade ci go linter to 1.52.* ([#402](https://github.com/reearth/reearth-visualizer/pull/402)) [`2a87bb`](https://github.com/reearth/reearth-visualizer/commit/2a87bb)
- Advanced option to scene settings [`707601`](https://github.com/reearth/reearth-visualizer/commit/707601)
- Upgrade deps [`bed3f2`](https://github.com/reearth/reearth-visualizer/commit/bed3f2)
- Add logs to plugin download from marketplace [`436b68`](https://github.com/reearth/reearth-visualizer/commit/436b68)

### Misc

#### 🚀 Features

- Support polyline and point on reearth&#x2F;core ([#606](https://github.com/reearth/reearth-visualizer/pull/606)) [`abd9a3`](https://github.com/reearth/reearth-visualizer/commit/abd9a3)
- Add remembering last open workspace functionality ([#598](https://github.com/reearth/reearth-visualizer/pull/598)) [`968a9d`](https://github.com/reearth/reearth-visualizer/commit/968a9d)
- Support TileMapService(TMS) on reearth&#x2F;core ([#604](https://github.com/reearth/reearth-visualizer/pull/604)) [`284b35`](https://github.com/reearth/reearth-visualizer/commit/284b35)
- Support styling color &amp; show for 3dtiles model ([#599](https://github.com/reearth/reearth-visualizer/pull/599)) [`a82ca2`](https://github.com/reearth/reearth-visualizer/commit/a82ca2)
- Support tiles data type on reearth&#x2F;core ([#597](https://github.com/reearth/reearth-visualizer/pull/597) [`ae5c49`](https://github.com/reearth/reearth-visualizer/commit/ae5c49)
- Support classificationType property in some feature on reearth&#x2F;core ([#593](https://github.com/reearth/reearth-visualizer/pull/593)) [`897868`](https://github.com/reearth/reearth-visualizer/commit/897868)
- Upgrade cesium-mvt-imagery-provider ([#591](https://github.com/reearth/reearth-visualizer/pull/591)) [`d01d01`](https://github.com/reearth/reearth-visualizer/commit/d01d01)
- Upgrade cesium-mvt-imagery-provider ([#588](https://github.com/reearth/reearth-visualizer/pull/588)) [`e138bd`](https://github.com/reearth/reearth-visualizer/commit/e138bd)
- Add more styling properties to resource appearance in reearth&#x2F;core ([#586](https://github.com/reearth/reearth-visualizer/pull/586)) [`8f3625`](https://github.com/reearth/reearth-visualizer/commit/8f3625)
- Add built field in scene in plugin api ([#584](https://github.com/reearth/reearth-visualizer/pull/584)) [`e8050c`](https://github.com/reearth/reearth-visualizer/commit/e8050c)
- Add scene light ([#576](https://github.com/reearth/reearth-visualizer/pull/576)) [`43c2b8`](https://github.com/reearth/reearth-visualizer/commit/43c2b8)
- Upgrade mvt lib ([#575](https://github.com/reearth/reearth-visualizer/pull/575)) [`584cee`](https://github.com/reearth/reearth-visualizer/commit/584cee)
- Option to unselect layer when click infobox close ([#564](https://github.com/reearth/reearth-visualizer/pull/564)) [`f2b2f2`](https://github.com/reearth/reearth-visualizer/commit/f2b2f2)
- Add alpha property to raster appearance on reearth&#x2F;core ([#555](https://github.com/reearth/reearth-visualizer/pull/555)) [`541f30`](https://github.com/reearth/reearth-visualizer/commit/541f30)
- Support styling for point cloud on reearth&#x2F;core ([#549](https://github.com/reearth/reearth-visualizer/pull/549)) [`f410d6`](https://github.com/reearth/reearth-visualizer/commit/f410d6)
- Add defaultContent property for infobox in plugin API on reearth&#x2F;core ([#538](https://github.com/reearth/reearth-visualizer/pull/538)) [`31ba31`](https://github.com/reearth/reearth-visualizer/commit/31ba31)
- Add updateClockOnLoad  to data on reearth&#x2F;core ([#539](https://github.com/reearth/reearth-visualizer/pull/539)) [`3653e2`](https://github.com/reearth/reearth-visualizer/commit/3653e2)
- Support gltf data type on reearth&#x2F;core ([#535](https://github.com/reearth/reearth-visualizer/pull/535)) [`e086be`](https://github.com/reearth/reearth-visualizer/commit/e086be)
- Support ga4 ([#509](https://github.com/reearth/reearth-visualizer/pull/509)) [`39bfb0`](https://github.com/reearth/reearth-visualizer/commit/39bfb0)
- Select MVT feature on reearth&#x2F;core ([#527](https://github.com/reearth/reearth-visualizer/pull/527)) [`de605d`](https://github.com/reearth/reearth-visualizer/commit/de605d)
- Add parameters property to data on reearth&#x2F;core ([#520](https://github.com/reearth/reearth-visualizer/pull/520)) [`c698eb`](https://github.com/reearth/reearth-visualizer/commit/c698eb)
- Layer select event in reearth&#x2F;core ([#470](https://github.com/reearth/reearth-visualizer/pull/470)) [`fb22e6`](https://github.com/reearth/reearth-visualizer/commit/fb22e6)
- Show field in appearances of reearth&#x2F;core ([#469](https://github.com/reearth/reearth-visualizer/pull/469)) [`819eb6`](https://github.com/reearth/reearth-visualizer/commit/819eb6)
- ImageSizeInMeters field in marker proeperty ([#511](https://github.com/reearth/reearth-visualizer/pull/511)) [`290cb7`](https://github.com/reearth/reearth-visualizer/commit/290cb7)
- Override clock from scene setting on reearth&#x2F;core ([#505](https://github.com/reearth/reearth-visualizer/pull/505)) [`01bffd`](https://github.com/reearth/reearth-visualizer/commit/01bffd)
- Support features for CZML on reearth&#x2F;core ([#506](https://github.com/reearth/reearth-visualizer/pull/506)) [`e5c160`](https://github.com/reearth/reearth-visualizer/commit/e5c160)
- Update cesium ([#503](https://github.com/reearth/reearth-visualizer/pull/503)) [`5a649f`](https://github.com/reearth/reearth-visualizer/commit/5a649f)
- Color blend mode in tileset on reearth&#x2F;core ([#496](https://github.com/reearth/reearth-visualizer/pull/496)) [`ca43dc`](https://github.com/reearth/reearth-visualizer/commit/ca43dc)
- Change brand images and colors at the root page ([#495](https://github.com/reearth/reearth-visualizer/pull/495))Co-authored-by: rot1024 &lt;aayhrot@gmail.com&gt; [`4f07b9`](https://github.com/reearth/reearth-visualizer/commit/4f07b9)
- Add builtin clipping box on reearth&#x2F;core ([#487](https://github.com/reearth/reearth-visualizer/pull/487)) [`63bd4f`](https://github.com/reearth/reearth-visualizer/commit/63bd4f)
- ExtrudedHeight for polygon on reearth&#x2F;core ([#486](https://github.com/reearth/reearth-visualizer/pull/486)) [`523d35`](https://github.com/reearth/reearth-visualizer/commit/523d35)
- Support resource entity layerId on reearth&#x2F;core ([#485](https://github.com/reearth/reearth-visualizer/pull/485)) [`7bd7c5`](https://github.com/reearth/reearth-visualizer/commit/7bd7c5)
- Support distanceDisplayCondition on reearth&#x2F;core ([#475](https://github.com/reearth/reearth-visualizer/pull/475)) [`ce8270`](https://github.com/reearth/reearth-visualizer/commit/ce8270)
- Support GeoRSS and gml in reearth&#x2F;core ([#455](https://github.com/reearth/reearth-visualizer/pull/455)) [`58c25b`](https://github.com/reearth/reearth-visualizer/commit/58c25b)
- Add htmlblock on reearth&#x2F;core ([#454](https://github.com/reearth/reearth-visualizer/pull/454)) [`1b37e0`](https://github.com/reearth/reearth-visualizer/commit/1b37e0)
- Support clipping box direction on reearth&#x2F;core ([#467](https://github.com/reearth/reearth-visualizer/pull/467)) [`70f74e`](https://github.com/reearth/reearth-visualizer/commit/70f74e)
- Add sampleTerrainHeight on reearht&#x2F;core ([#466](https://github.com/reearth/reearth-visualizer/pull/466)) [`55334e`](https://github.com/reearth/reearth-visualizer/commit/55334e)
- Get brand from config ([#457](https://github.com/reearth/reearth-visualizer/pull/457)) [`d35361`](https://github.com/reearth/reearth-visualizer/commit/d35361)
- Support timeline on mobile on reearth&#x2F;core ([#462](https://github.com/reearth/reearth-visualizer/pull/462)) [`efeaf4`](https://github.com/reearth/reearth-visualizer/commit/efeaf4)
- Use visible field on reearth&#x2F;core ([#456](https://github.com/reearth/reearth-visualizer/pull/456)) [`333610`](https://github.com/reearth/reearth-visualizer/commit/333610)
- Add htmlblock to built-in plugin ([#384](https://github.com/reearth/reearth-visualizer/pull/384)) [`51c79a`](https://github.com/reearth/reearth-visualizer/commit/51c79a)
- Add override, replace and delete plugin API on reearth&#x2F;core ([#451](https://github.com/reearth/reearth-visualizer/pull/451)) [`2e1c41`](https://github.com/reearth/reearth-visualizer/commit/2e1c41)
- Selecting imagery features ([#450](https://github.com/reearth/reearth-visualizer/pull/450)) [`f24ef5`](https://github.com/reearth/reearth-visualizer/commit/f24ef5)
- Support interval fetching data on reearth&#x2F;core ([#449](https://github.com/reearth/reearth-visualizer/pull/449)) [`406174`](https://github.com/reearth/reearth-visualizer/commit/406174)
- Support select feature on reearth&#x2F;core ([#445](https://github.com/reearth/reearth-visualizer/pull/445)) [`3174b1`](https://github.com/reearth/reearth-visualizer/commit/3174b1)
- Use experimental core flag ([#448](https://github.com/reearth/reearth-visualizer/pull/448)) [`b04294`](https://github.com/reearth/reearth-visualizer/commit/b04294)
- Support time series features on reearth&#x2F;core ([#446](https://github.com/reearth/reearth-visualizer/pull/446)) [`8fc9b6`](https://github.com/reearth/reearth-visualizer/commit/8fc9b6)
- Scene property to enable VR mode ([#444](https://github.com/reearth/reearth-visualizer/pull/444)) [`3d35aa`](https://github.com/reearth/reearth-visualizer/commit/3d35aa)
- Support general transit feed ([#408](https://github.com/reearth/reearth-visualizer/pull/408)) [`49b4a4`](https://github.com/reearth/reearth-visualizer/commit/49b4a4)
- Support osm data type on reearth&#x2F;core ([#431](https://github.com/reearth/reearth-visualizer/pull/431)) [`0d4e0b`](https://github.com/reearth/reearth-visualizer/commit/0d4e0b)
- Label background color and padding property for markers ([#426](https://github.com/reearth/reearth-visualizer/pull/426) [`72cd0d`](https://github.com/reearth/reearth-visualizer/commit/72cd0d)
- Support entity base flyTo on reearth&#x2F;core ([#419](https://github.com/reearth/reearth-visualizer/pull/419)) [`3060cf`](https://github.com/reearth/reearth-visualizer/commit/3060cf)
- Support overriding czml appearance on reearth&#x2F;core ([#421](https://github.com/reearth/reearth-visualizer/pull/421)) [`e62f4d`](https://github.com/reearth/reearth-visualizer/commit/e62f4d)
- Support kml on reearth&#x2F;core ([#422](https://github.com/reearth/reearth-visualizer/pull/422)) [`052daf`](https://github.com/reearth/reearth-visualizer/commit/052daf)
- Support json properties on reearth&#x2F;core ([#412](https://github.com/reearth/reearth-visualizer/pull/412)) [`ac7986`](https://github.com/reearth/reearth-visualizer/commit/ac7986)
- Connect reearth&#x2F;core with existence pages ([#401](https://github.com/reearth/reearth-visualizer/pull/401)) [`0735c0`](https://github.com/reearth/reearth-visualizer/commit/0735c0)
- Add runTimes property to PluginInstance ([#404](https://github.com/reearth/reearth-visualizer/pull/404)) [`17d787`](https://github.com/reearth/reearth-visualizer/commit/17d787)
- Support plugin system on reearth&#x2F;core ([#399](https://github.com/reearth/reearth-visualizer/pull/399)) [`bab9e6`](https://github.com/reearth/reearth-visualizer/commit/bab9e6)
- Add selectedFeature and selectedComputedFeature on reearth&#x2F;core ([#398](https://github.com/reearth/reearth-visualizer/pull/398)) [`474b34`](https://github.com/reearth/reearth-visualizer/commit/474b34)
- Set modal above popup ([#397](https://github.com/reearth/reearth-visualizer/pull/397)) [`ff47c5`](https://github.com/reearth/reearth-visualizer/commit/ff47c5)
- Port 2d navigator to reearth&#x2F;core ([#394](https://github.com/reearth/reearth-visualizer/pull/394)) [`07a6b4`](https://github.com/reearth/reearth-visualizer/commit/07a6b4)
- Core&#x2F;Visualizer without plugins ([#372](https://github.com/reearth/reearth-visualizer/pull/372)) [`f97c38`](https://github.com/reearth/reearth-visualizer/commit/f97c38)
- Reearth style language ([#384](https://github.com/reearth/reearth-visualizer/pull/384)) [`a828ac`](https://github.com/reearth/reearth-visualizer/commit/a828ac)
- Support 3dtiles on reearth&#x2F;core ([#392](https://github.com/reearth/reearth-visualizer/pull/392)) [`e8068f`](https://github.com/reearth/reearth-visualizer/commit/e8068f)
- Support MVT on reearth&#x2F;core ([#388](https://github.com/reearth/reearth-visualizer/pull/388)) [`cac89c`](https://github.com/reearth/reearth-visualizer/commit/cac89c)
- Support WMS on reearth&#x2F;core ([#387](https://github.com/reearth/reearth-visualizer/pull/387)) [`666c1b`](https://github.com/reearth/reearth-visualizer/commit/666c1b)
- Support CZML in reearth&#x2F;core ([#383](https://github.com/reearth/reearth-visualizer/pull/383)) [`f44d98`](https://github.com/reearth/reearth-visualizer/commit/f44d98)
- Plugin api client storage ([#376](https://github.com/reearth/reearth-visualizer/pull/376)) [`4f36ad`](https://github.com/reearth/reearth-visualizer/commit/4f36ad)
- Support csv on the reearth&#x2F;core ([#382](https://github.com/reearth/reearth-visualizer/pull/382)) [`a8f5bf`](https://github.com/reearth/reearth-visualizer/commit/a8f5bf)

#### 🔧 Bug Fixes

- Merge conflict resolved [`39a37a`](https://github.com/reearth/reearth-visualizer/commit/39a37a)
- Use core hook may get value incorrectly ([#609](https://github.com/reearth/reearth-visualizer/pull/609)) [`d87e90`](https://github.com/reearth/reearth-visualizer/commit/d87e90)
- Resolve endsWith is not a function error with style in reearth&#x2F;core ([#603](https://github.com/reearth/reearth-visualizer/pull/603)) [`15fec3`](https://github.com/reearth/reearth-visualizer/commit/15fec3)
- Add % as special case for &#x60;Number()&#x60; in style lang of reearth&#x2F;core ([#601](https://github.com/reearth/reearth-visualizer/pull/601)) [`5a4a3d`](https://github.com/reearth/reearth-visualizer/commit/5a4a3d)
- Rename moveWidget to onMoveWidget on reearth&#x2F;core ([#600](https://github.com/reearth/reearth-visualizer/pull/600)) [`6c06ab`](https://github.com/reearth/reearth-visualizer/commit/6c06ab)
- Enable splash screen in preview page ([#596](https://github.com/reearth/reearth-visualizer/pull/596) [`e1f5ac`](https://github.com/reearth/reearth-visualizer/commit/e1f5ac)
- Timeline scroll should be fixed in initial render ([#571](https://github.com/reearth/reearth-visualizer/pull/571)) [`6a0aed`](https://github.com/reearth/reearth-visualizer/commit/6a0aed)
- Remove default height reference for modelGraphics in reearth&#x2F;core ([#592](https://github.com/reearth/reearth-visualizer/pull/592)) [`961b46`](https://github.com/reearth/reearth-visualizer/commit/961b46)
- Remove duplication of feature entity in reearth&#x2F;core ([#590](https://github.com/reearth/reearth-visualizer/pull/590)) [`8cc03e`](https://github.com/reearth/reearth-visualizer/commit/8cc03e)
- Prevent selecting not shown feature for MVT on reearth&#x2F;core ([#589](https://github.com/reearth/reearth-visualizer/pull/589)) [`41816d`](https://github.com/reearth/reearth-visualizer/commit/41816d)
- Infobox for 3dtiles feature ([#587](https://github.com/reearth/reearth-visualizer/pull/587)) [`70cfdb`](https://github.com/reearth/reearth-visualizer/commit/70cfdb)
- Use layer id with feature id for entity id on reearth&#x2F;core ([#585](https://github.com/reearth/reearth-visualizer/pull/585)) [`24cc88`](https://github.com/reearth/reearth-visualizer/commit/24cc88)
- Can&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t set iframe&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s width or height individually in crust  ([#583](https://github.com/reearth/reearth-visualizer/pull/583)) [`3494b4`](https://github.com/reearth/reearth-visualizer/commit/3494b4)
- MVT isn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t render correctly on reearth&#x2F;core ([#582](https://github.com/reearth/reearth-visualizer/pull/582)) [`988d1a`](https://github.com/reearth/reearth-visualizer/commit/988d1a)
- Sample terrain height API cannot properly return promise ([#581](https://github.com/reearth/reearth-visualizer/pull/581)) [`72eafd`](https://github.com/reearth/reearth-visualizer/commit/72eafd)
- Change logical operator evaluation behaviour in reearth&#x2F;core ([#580](https://github.com/reearth/reearth-visualizer/pull/580)) [`3d23ce`](https://github.com/reearth/reearth-visualizer/commit/3d23ce)
- Infobox style collapse for long names ([#578](https://github.com/reearth/reearth-visualizer/pull/578)) [`04775d`](https://github.com/reearth/reearth-visualizer/commit/04775d)
- Override currentTime on timeline widget when time is updated by CZML on reearth&#x2F;core ([#579](https://github.com/reearth/reearth-visualizer/pull/579)) [`dbe2e1`](https://github.com/reearth/reearth-visualizer/commit/dbe2e1)
- Rename scene light properties [`8b3a18`](https://github.com/reearth/reearth-visualizer/commit/8b3a18)
- Add none cesium value for heightReference ([#577](https://github.com/reearth/reearth-visualizer/pull/577)) [`2c92e3`](https://github.com/reearth/reearth-visualizer/commit/2c92e3)
- JSON Path condition on reearth&#x2F;core ([#572](https://github.com/reearth/reearth-visualizer/pull/572)) [`5f7024`](https://github.com/reearth/reearth-visualizer/commit/5f7024)
- Update html head [`f1780f`](https://github.com/reearth/reearth-visualizer/commit/f1780f)
- Sync selected feature with layer api on reearth&#x2F;core ([#570](https://github.com/reearth/reearth-visualizer/pull/570)) [`ded6b0`](https://github.com/reearth/reearth-visualizer/commit/ded6b0)
- Imagery index on reearth&#x2F;core ([#569](https://github.com/reearth/reearth-visualizer/pull/569)) [`6b233f`](https://github.com/reearth/reearth-visualizer/commit/6b233f)
- Revert add height to polygon in reearth&#x2F;core ([#566](https://github.com/reearth/reearth-visualizer/pull/566)) [`1f2f74`](https://github.com/reearth/reearth-visualizer/commit/1f2f74)
- Add clamp as default height reference for model in reearth&#x2F;core ([#567](https://github.com/reearth/reearth-visualizer/pull/567)) [`517386`](https://github.com/reearth/reearth-visualizer/commit/517386)
- Minimum timeline range on reearth&#x2F;core ([#565](https://github.com/reearth/reearth-visualizer/pull/565)) [`975c79`](https://github.com/reearth/reearth-visualizer/commit/975c79)
- Infobox html block styling ([#562](https://github.com/reearth/reearth-visualizer/pull/562)) [`32b248`](https://github.com/reearth/reearth-visualizer/commit/32b248)
- Imagery layer tile index on reearth&#x2F;core ([#561](https://github.com/reearth/reearth-visualizer/pull/561) [`25bdff`](https://github.com/reearth/reearth-visualizer/commit/25bdff)
- Add &quot;disabled&quot; as shadow mode on reearth&#x2F;core ([#560](https://github.com/reearth/reearth-visualizer/pull/560)) [`1632ea`](https://github.com/reearth/reearth-visualizer/commit/1632ea)
- Support multi layers in MVT on reearth&#x2F;core ([#559](https://github.com/reearth/reearth-visualizer/pull/559)) [`9c8c88`](https://github.com/reearth/reearth-visualizer/commit/9c8c88)
- Html block margin and height [`09f6ef`](https://github.com/reearth/reearth-visualizer/commit/09f6ef)
- UpdateClockOnLoad condition on reearth&#x2F;core ([#558](https://github.com/reearth/reearth-visualizer/pull/558)) [`f9076a`](https://github.com/reearth/reearth-visualizer/commit/f9076a)
- Add height to polygon in reearth&#x2F;core ([#557](https://github.com/reearth/reearth-visualizer/pull/557)) [`a84dbe`](https://github.com/reearth/reearth-visualizer/commit/a84dbe)
- Use computed feature on resource on reearth&#x2F;core ([#556](https://github.com/reearth/reearth-visualizer/pull/556)) [`006f40`](https://github.com/reearth/reearth-visualizer/commit/006f40)
- Point cloud dirty check on reearth&#x2F;core ([#554](https://github.com/reearth/reearth-visualizer/pull/554)) [`f95d27`](https://github.com/reearth/reearth-visualizer/commit/f95d27)
- Support default infobox and selection indicator on imagery layer on reearth&#x2F;core ([#553](https://github.com/reearth/reearth-visualizer/pull/553)) [`1946b3`](https://github.com/reearth/reearth-visualizer/commit/1946b3)
- Scrollbar in timeline widget always showing ([#550](https://github.com/reearth/reearth-visualizer/pull/550)) [`84d63d`](https://github.com/reearth/reearth-visualizer/commit/84d63d)
- Clipping box on point cloud on reearth&#x2F;core ([#552](https://github.com/reearth/reearth-visualizer/pull/552)) [`fb4455`](https://github.com/reearth/reearth-visualizer/commit/fb4455)
- Htmlblock on safari ([#548](https://github.com/reearth/reearth-visualizer/pull/548)) [`392fc7`](https://github.com/reearth/reearth-visualizer/commit/392fc7)
- Use attributes as default content for infobox on reearth&#x2F;core ([#547](https://github.com/reearth/reearth-visualizer/pull/547)) [`be3718`](https://github.com/reearth/reearth-visualizer/commit/be3718)
- Deleting feature process on reearth&#x2F;core ([#546](https://github.com/reearth/reearth-visualizer/pull/546)) [`39ecaf`](https://github.com/reearth/reearth-visualizer/commit/39ecaf)
- Trigger select event when featureId is changed on reearth&#x2F;core ([#545](https://github.com/reearth/reearth-visualizer/pull/545)) [`6f5401`](https://github.com/reearth/reearth-visualizer/commit/6f5401)
- Draw polylines on polygon on reearth&#x2F;core ([#544](https://github.com/reearth/reearth-visualizer/pull/544)) [`d35329`](https://github.com/reearth/reearth-visualizer/commit/d35329)
- Infobox html color ([#534](https://github.com/reearth/reearth-visualizer/pull/534)) [`c0e0a6`](https://github.com/reearth/reearth-visualizer/commit/c0e0a6)
- Use overriddenLayers to get infobox on reearth&#x2F;core ([#541](https://github.com/reearth/reearth-visualizer/pull/541)) [`c4e9db`](https://github.com/reearth/reearth-visualizer/commit/c4e9db)
- Fly to multiple entities added by a layer on reearth&#x2F;core ([#540](https://github.com/reearth/reearth-visualizer/pull/540)) [`95b3d3`](https://github.com/reearth/reearth-visualizer/commit/95b3d3)
- Add polyfill for requestIdleCallback in reearth&#x2F;core ([#537](https://github.com/reearth/reearth-visualizer/pull/537)) [`c4722f`](https://github.com/reearth/reearth-visualizer/commit/c4722f)
- Overriding timeline behavior on reearth&#x2F;core ([#532](https://github.com/reearth/reearth-visualizer/pull/532)) [`890dae`](https://github.com/reearth/reearth-visualizer/commit/890dae)
- Timeline bug on reearth&#x2F;core ([#531](https://github.com/reearth/reearth-visualizer/pull/531)) [`572678`](https://github.com/reearth/reearth-visualizer/commit/572678)
- Some error on reearth&#x2F;core ([#530](https://github.com/reearth/reearth-visualizer/pull/530)) [`4ee0b6`](https://github.com/reearth/reearth-visualizer/commit/4ee0b6)
- Abort fetching on data atom on reearth&#x2F;core ([#529](https://github.com/reearth/reearth-visualizer/pull/529)) [`e82c88`](https://github.com/reearth/reearth-visualizer/commit/e82c88)
- Timeline behavior on reearth&#x2F;core ([#528](https://github.com/reearth/reearth-visualizer/pull/528)) [`461d06`](https://github.com/reearth/reearth-visualizer/commit/461d06)
- Parse csv numeric strings as numbers in reearth&#x2F;core ([#526](https://github.com/reearth/reearth-visualizer/pull/526)) [`9c890f`](https://github.com/reearth/reearth-visualizer/commit/9c890f)
- Parse hyphen as reserved word in property key on reearth&#x2F;core ([#525](https://github.com/reearth/reearth-visualizer/pull/525)) [`d49058`](https://github.com/reearth/reearth-visualizer/commit/d49058)
- Condition for CZML on reearth&#x2F;core ([#524](https://github.com/reearth/reearth-visualizer/pull/524)) [`3c61ca`](https://github.com/reearth/reearth-visualizer/commit/3c61ca)
- Czml style for marker on reearth&#x2F;core ([#523](https://github.com/reearth/reearth-visualizer/pull/523)) [`67dccb`](https://github.com/reearth/reearth-visualizer/commit/67dccb)
- Use default block for entity on reearth&#x2F;core ([#522](https://github.com/reearth/reearth-visualizer/pull/522)) [`ecd09a`](https://github.com/reearth/reearth-visualizer/commit/ecd09a)
- Remove copyLazyLayer on reearth&#x2F;core ([#519](https://github.com/reearth/reearth-visualizer/pull/519)) [`e17218`](https://github.com/reearth/reearth-visualizer/commit/e17218)
- Copying lazy layers undefined behavior on reearth&#x2F;core ([#516](https://github.com/reearth/reearth-visualizer/pull/516)) [`7b2c5e`](https://github.com/reearth/reearth-visualizer/commit/7b2c5e)
- Copy lazy layer on plugin on reearth&#x2F;core ([#515](https://github.com/reearth/reearth-visualizer/pull/515)) [`046a3d`](https://github.com/reearth/reearth-visualizer/commit/046a3d)
- Attach style dynamically in resource on reearth&#x2F;core ([#514](https://github.com/reearth/reearth-visualizer/pull/514)) [`81d291`](https://github.com/reearth/reearth-visualizer/commit/81d291)
- Infinite infobox in CZML on reearth&#x2F;core ([#513](https://github.com/reearth/reearth-visualizer/pull/513)) [`3e49a1`](https://github.com/reearth/reearth-visualizer/commit/3e49a1)
- Selecting resource feature behavior on reearth&#x2F;core ([#512](https://github.com/reearth/reearth-visualizer/pull/512)) [`35f2c2`](https://github.com/reearth/reearth-visualizer/commit/35f2c2)
- Prevent unnecessary render on timeline on reearth&#x2F;core ([#510](https://github.com/reearth/reearth-visualizer/pull/510)) [`7cb9d5`](https://github.com/reearth/reearth-visualizer/commit/7cb9d5)
- Parse reserved word when property name includes reserved word on reearth&#x2F;core ([#508](https://github.com/reearth/reearth-visualizer/pull/508)) [`aa247e`](https://github.com/reearth/reearth-visualizer/commit/aa247e)
- Pass engine meta on plugin editor ([#507](https://github.com/reearth/reearth-visualizer/pull/507)) [`9cd1b5`](https://github.com/reearth/reearth-visualizer/commit/9cd1b5)
- Mvt line width on reearth&#x2F;core ([#504](https://github.com/reearth/reearth-visualizer/pull/504)) [`c1a939`](https://github.com/reearth/reearth-visualizer/commit/c1a939)
- It should not render entity when coordinate is undefined on reearth&#x2F;core [`23b6c6`](https://github.com/reearth/reearth-visualizer/commit/23b6c6)
- Allow enter ground option for clipping box on reearth&#x2F;core ([#500](https://github.com/reearth/reearth-visualizer/pull/500)) [`f8e129`](https://github.com/reearth/reearth-visualizer/commit/f8e129)
- Clip area with clipping box on reearth&#x2F;core ([#498](https://github.com/reearth/reearth-visualizer/pull/498)) [`4f647f`](https://github.com/reearth/reearth-visualizer/commit/4f647f)
- Mvt cache on reearth&#x2F;core ([#497](https://github.com/reearth/reearth-visualizer/pull/497)) [`ba2c7e`](https://github.com/reearth/reearth-visualizer/commit/ba2c7e)
- Recreate no feature component when data url is changed on reearth&#x2F;core ([#494](https://github.com/reearth/reearth-visualizer/pull/494)) [`93c805`](https://github.com/reearth/reearth-visualizer/commit/93c805)
- Ignore cesium ion token when it is empty [`6648be`](https://github.com/reearth/reearth-visualizer/commit/6648be)
- Feature type fix gpx on reearth&#x2F;core ([#493](https://github.com/reearth/reearth-visualizer/pull/493)) [`51b8e8`](https://github.com/reearth/reearth-visualizer/commit/51b8e8)
- Infobox error after layer delete ([#492](https://github.com/reearth/reearth-visualizer/pull/492)) [`8a59dd`](https://github.com/reearth/reearth-visualizer/commit/8a59dd)
- Delete bug that deletes necessary layer on reearth&#x2F;core ([#484](https://github.com/reearth/reearth-visualizer/pull/484)) [`a0f48f`](https://github.com/reearth/reearth-visualizer/commit/a0f48f)
- Force update when some data properties are updated on reearth&#x2F;core ([#483](https://github.com/reearth/reearth-visualizer/pull/483)) [`867238`](https://github.com/reearth/reearth-visualizer/commit/867238)
- Revert appearance to initial value when appearance is undefined on reearth&#x2F;core ([#482](https://github.com/reearth/reearth-visualizer/pull/482)) [`76b6f4`](https://github.com/reearth/reearth-visualizer/commit/76b6f4)
- Entity id is duplicated error on reearth&#x2F;core ([#481](https://github.com/reearth/reearth-visualizer/pull/481)) [`a2b0b6`](https://github.com/reearth/reearth-visualizer/commit/a2b0b6)
- Infobox property is undefined error on reearth&#x2F;core ([#480](https://github.com/reearth/reearth-visualizer/pull/480)) [`2b8b07`](https://github.com/reearth/reearth-visualizer/commit/2b8b07)
- Layers override behavior on rearth&#x2F;core ([#479](https://github.com/reearth/reearth-visualizer/pull/479)) [`faff37`](https://github.com/reearth/reearth-visualizer/commit/faff37)
- Error handling for time interval on reearth&#x2F;core ([#478](https://github.com/reearth/reearth-visualizer/pull/478)) [`edf546`](https://github.com/reearth/reearth-visualizer/commit/edf546)
- Overridden layers api on reearth&#x2F;core ([#477](https://github.com/reearth/reearth-visualizer/pull/477)) [`abaade`](https://github.com/reearth/reearth-visualizer/commit/abaade)
- Add properties in vehicle point for gtfs ([#476](https://github.com/reearth/reearth-visualizer/pull/476)) [`1058ab`](https://github.com/reearth/reearth-visualizer/commit/1058ab)
- Color function on reearth&#x2F;core ([#474](https://github.com/reearth/reearth-visualizer/pull/474)) [`7d9fca`](https://github.com/reearth/reearth-visualizer/commit/7d9fca)
- Errors when many functions are created in plugins ([#471](https://github.com/reearth/reearth-visualizer/pull/471)) [`ebb50d`](https://github.com/reearth/reearth-visualizer/commit/ebb50d)
- Coordinates for csv on reearth&#x2F;core ([#472](https://github.com/reearth/reearth-visualizer/pull/472)) [`4a6473`](https://github.com/reearth/reearth-visualizer/commit/4a6473)
- Lint and type error [`d00b9b`](https://github.com/reearth/reearth-visualizer/commit/d00b9b)
- Suppress screen flicker when judging useCore [`b1852d`](https://github.com/reearth/reearth-visualizer/commit/b1852d)
- Widget area has margin even if no widgets, disable widget area transition in built scene [`b51569`](https://github.com/reearth/reearth-visualizer/commit/b51569)
- Cesium crashes when VR mode is false [`efa3fd`](https://github.com/reearth/reearth-visualizer/commit/efa3fd)
- 3dtiles overriding appearance behavior on reearth&#x2F;core ([#468](https://github.com/reearth/reearth-visualizer/pull/468)) [`8c48bc`](https://github.com/reearth/reearth-visualizer/commit/8c48bc)
- Support visible and dynamic plane in clipping box on reearth&#x2F;core ([#465](https://github.com/reearth/reearth-visualizer/pull/465)) [`4c89aa`](https://github.com/reearth/reearth-visualizer/commit/4c89aa)
- SelectedFeature for 3dtiles on reearth&#x2F;core ([#463](https://github.com/reearth/reearth-visualizer/pull/463)) [`cd1777`](https://github.com/reearth/reearth-visualizer/commit/cd1777)
- Express undefined visible field on reearth&#x2F;core ([#461](https://github.com/reearth/reearth-visualizer/pull/461)) [`c74630`](https://github.com/reearth/reearth-visualizer/commit/c74630)
- Undefined behavior for visible field ([#460](https://github.com/reearth/reearth-visualizer/pull/460)) [`c41d70`](https://github.com/reearth/reearth-visualizer/commit/c41d70)
- Select entity on reearth&#x2F;core ([#458](https://github.com/reearth/reearth-visualizer/pull/458)) [`bc1824`](https://github.com/reearth/reearth-visualizer/commit/bc1824)
- Use default infobox on reearth&#x2F;core ([#453](https://github.com/reearth/reearth-visualizer/pull/453)) [`d3fec8`](https://github.com/reearth/reearth-visualizer/commit/d3fec8)
- Select event behavior on reearth&#x2F;core ([#452](https://github.com/reearth/reearth-visualizer/pull/452)) [`384488`](https://github.com/reearth/reearth-visualizer/commit/384488)
- Error in published page on reearth&#x2F;core ([#447](https://github.com/reearth/reearth-visualizer/pull/447)) [`4c8805`](https://github.com/reearth/reearth-visualizer/commit/4c8805)
- Expand timeline in initial load ([#443](https://github.com/reearth/reearth-visualizer/pull/443)) [`d6a742`](https://github.com/reearth/reearth-visualizer/commit/d6a742)
- Replace globe image when cesium ion token is updated ([#442](https://github.com/reearth/reearth-visualizer/pull/442)) [`64ffae`](https://github.com/reearth/reearth-visualizer/commit/64ffae)
- Layer fetch on reearth&#x2F;core ([#441](https://github.com/reearth/reearth-visualizer/pull/441)) [`597b82`](https://github.com/reearth/reearth-visualizer/commit/597b82)
- Dnd layer on reearth&#x2F;core ([#440](https://github.com/reearth/reearth-visualizer/pull/440)) [`a5a2b4`](https://github.com/reearth/reearth-visualizer/commit/a5a2b4)
- Disable requestRenderMode depends on widget on reearth&#x2F;core ([#439](https://github.com/reearth/reearth-visualizer/pull/439)) [`12ce63`](https://github.com/reearth/reearth-visualizer/commit/12ce63)
- Selected layer id is not propagated on reearth&#x2F;core ([#438](https://github.com/reearth/reearth-visualizer/pull/438)) [`24993b`](https://github.com/reearth/reearth-visualizer/commit/24993b)
- Handle featureId for 3dtiles and compat select plugin api on reearth&#x2F;core ([#417](https://github.com/reearth/reearth-visualizer/pull/417)) [`9144ad`](https://github.com/reearth/reearth-visualizer/commit/9144ad)
- Undefined behavior for resource on reearth&#x2F;core ([#437](https://github.com/reearth/reearth-visualizer/pull/437)) [`3f51f2`](https://github.com/reearth/reearth-visualizer/commit/3f51f2)
- Blocks cannot be displayed and updated as expected on reearth&#x2F;core ([#434](https://github.com/reearth/reearth-visualizer/pull/434)) [`b5f921`](https://github.com/reearth/reearth-visualizer/commit/b5f921)
- Layer appearances are not evaluated as expected ([#418](https://github.com/reearth/reearth-visualizer/pull/418)) [`20382c`](https://github.com/reearth/reearth-visualizer/commit/20382c)
- Support resource auto on reearth&#x2F;core ([#435](https://github.com/reearth/reearth-visualizer/pull/435)) [`595c66`](https://github.com/reearth/reearth-visualizer/commit/595c66)
- Cluster features on reearth&#x2F;core ([#430](https://github.com/reearth/reearth-visualizer/pull/430)) [`92dd47`](https://github.com/reearth/reearth-visualizer/commit/92dd47)
- 3D Tiles infobox on reearth&#x2F;core ([#433](https://github.com/reearth/reearth-visualizer/pull/433)) [`b4afd7`](https://github.com/reearth/reearth-visualizer/commit/b4afd7)
- GeoJSON with resource appearance on reearth&#x2F;core ([#432](https://github.com/reearth/reearth-visualizer/pull/432)) [`464d67`](https://github.com/reearth/reearth-visualizer/commit/464d67)
- Dnd layer on reearth&#x2F;core ([#424](https://github.com/reearth/reearth-visualizer/pull/424)) [`75e6a7`](https://github.com/reearth/reearth-visualizer/commit/75e6a7)
- WAS bug on reearth&#x2F;core ([#416](https://github.com/reearth/reearth-visualizer/pull/416)) [`045274`](https://github.com/reearth/reearth-visualizer/commit/045274)
- Cannot select features on reearth&#x2F;core ([#414](https://github.com/reearth/reearth-visualizer/pull/414)) [`f1a8dd`](https://github.com/reearth/reearth-visualizer/commit/f1a8dd)
- Support csv value string on reearth&#x2F;core ([#415](https://github.com/reearth/reearth-visualizer/pull/415)) [`4033f7`](https://github.com/reearth/reearth-visualizer/commit/4033f7)
- MoveTo widget to empty page on mobile on reearth&#x2F;core ([#413](https://github.com/reearth/reearth-visualizer/pull/413)) [`07a935`](https://github.com/reearth/reearth-visualizer/commit/07a935)
- Widget align system on mobile ([#409](https://github.com/reearth/reearth-visualizer/pull/409)) [`fce1ad`](https://github.com/reearth/reearth-visualizer/commit/fce1ad)
- Increment runTimes on preinit ([#410](https://github.com/reearth/reearth-visualizer/pull/410)) [`797020`](https://github.com/reearth/reearth-visualizer/commit/797020)
- Plugin instance runTimes property ([#405](https://github.com/reearth/reearth-visualizer/pull/405)) [`a06434`](https://github.com/reearth/reearth-visualizer/commit/a06434)
- Make iframe width or height assignable without the other ([#403](https://github.com/reearth/reearth-visualizer/pull/403)) [`e8647a`](https://github.com/reearth/reearth-visualizer/commit/e8647a)
- Cache ComputedFeature on reearth&#x2F;core ([#396](https://github.com/reearth/reearth-visualizer/pull/396)) [`775a8a`](https://github.com/reearth/reearth-visualizer/commit/775a8a)
- Missing type of API modal &amp; popup options.  ([#400](https://github.com/reearth/reearth-visualizer/pull/400)) [`a68b24`](https://github.com/reearth/reearth-visualizer/commit/a68b24)
- Visualizer on reearth&#x2F;core ([#395](https://github.com/reearth/reearth-visualizer/pull/395)) [`7ba0db`](https://github.com/reearth/reearth-visualizer/commit/7ba0db)
- Update mvt dynamically when appearance is updated ([#393](https://github.com/reearth/reearth-visualizer/pull/393)) [`7ca5d1`](https://github.com/reearth/reearth-visualizer/commit/7ca5d1)

#### 📖 Documentation

- Add diagrams of core architecture ([#396](https://github.com/reearth/reearth-visualizer/pull/396)) [`2dfa6b`](https://github.com/reearth/reearth-visualizer/commit/2dfa6b)

#### ⚡️ Performance

- Consider geojson as both delegate and active data type in reearth&#x2F;core ([#608](https://github.com/reearth/reearth-visualizer/pull/608)) [`94bc59`](https://github.com/reearth/reearth-visualizer/commit/94bc59)
- Improve styling in MVT on reearth&#x2F;core ([#574](https://github.com/reearth/reearth-visualizer/pull/574)) [`8ced77`](https://github.com/reearth/reearth-visualizer/commit/8ced77)
- Improve 3dtiles performance and disable requestRenderMode on reearth&#x2F;core ([#568](https://github.com/reearth/reearth-visualizer/pull/568)) [`e645ec`](https://github.com/reearth/reearth-visualizer/commit/e645ec)
- Reduce style evaluator memory signature in reearth&#x2F;core ([#563](https://github.com/reearth/reearth-visualizer/pull/563)) [`f74b56`](https://github.com/reearth/reearth-visualizer/commit/f74b56)
- Use private modifier on evaluator on reearth&#x2F;core ([#543](https://github.com/reearth/reearth-visualizer/pull/543)) [`532c66`](https://github.com/reearth/reearth-visualizer/commit/532c66)
- Improve regexp on reearth&#x2F;core ([#533](https://github.com/reearth/reearth-visualizer/pull/533)) [`ca7b05`](https://github.com/reearth/reearth-visualizer/commit/ca7b05)
- Stop synchronizing features in MVT on reearth&#x2F;core ([#521](https://github.com/reearth/reearth-visualizer/pull/521)) [`82ae2c`](https://github.com/reearth/reearth-visualizer/commit/82ae2c)
- Copy lazy layer lazily ([#517](https://github.com/reearth/reearth-visualizer/pull/517)) [`4a5ba4`](https://github.com/reearth/reearth-visualizer/commit/4a5ba4)
- Improve mvt rendering on reearth&#x2F;core ([#501](https://github.com/reearth/reearth-visualizer/pull/501)) [`8a681d`](https://github.com/reearth/reearth-visualizer/commit/8a681d)
- Compute features concurrently on reearth&#x2F;core ([#499](https://github.com/reearth/reearth-visualizer/pull/499)) [`6448ba`](https://github.com/reearth/reearth-visualizer/commit/6448ba)
- Improve skipping computing process for 3dtiles on reearth&#x2F;core ([#491](https://github.com/reearth/reearth-visualizer/pull/491)) [`253b58`](https://github.com/reearth/reearth-visualizer/commit/253b58)
- Improve 3dtiles features calculation on reearth&#x2F;core ([#489](https://github.com/reearth/reearth-visualizer/pull/489)) [`1204a6`](https://github.com/reearth/reearth-visualizer/commit/1204a6)
- Improve expression cache strategy on reearth&#x2F;core ([#488](https://github.com/reearth/reearth-visualizer/pull/488)) [`324e28`](https://github.com/reearth/reearth-visualizer/commit/324e28)
- Cache AST for evaluator on reearth&#x2F;core ([#473](https://github.com/reearth/reearth-visualizer/pull/473)) [`da6bb3`](https://github.com/reearth/reearth-visualizer/commit/da6bb3)
- Improve blink when feature is updated on reearth&#x2F;core ([#429](https://github.com/reearth/reearth-visualizer/pull/429)) [`c10a67`](https://github.com/reearth/reearth-visualizer/commit/c10a67)

#### ✨ Refactor

- Replace &quot;team&quot; word  related to Team state with &quot;workspace&quot; ([#607](https://github.com/reearth/reearth-visualizer/pull/607)) [`fb254b`](https://github.com/reearth/reearth-visualizer/commit/fb254b)

#### Miscellaneous Tasks

- Remove redundant workflows [`f2685d`](https://github.com/reearth/reearth-visualizer/commit/f2685d)
- Remove inter-dependency of web and server workflows [`999e73`](https://github.com/reearth/reearth-visualizer/commit/999e73)
- Change codeowner [`bffa05`](https://github.com/reearth/reearth-visualizer/commit/bffa05)
- Upgrade eslint [`d55795`](https://github.com/reearth/reearth-visualizer/commit/d55795)
- Update dependency cesium to v1.104.0 ([#594](https://github.com/reearth/reearth-visualizer/pull/594)) [`c57839`](https://github.com/reearth/reearth-visualizer/commit/c57839)
- Fix storybook is not working ([#536](https://github.com/reearth/reearth-visualizer/pull/536) [`d52124`](https://github.com/reearth/reearth-visualizer/commit/d52124)
- Rename asset dir to avoid conflicts with backend API endpoints [`1d9455`](https://github.com/reearth/reearth-visualizer/commit/1d9455)
- Add offline_access auth scope to support refresh tokens with built-in auth server ([#425](https://github.com/reearth/reearth-visualizer/pull/425) [`2a2af1`](https://github.com/reearth/reearth-visualizer/commit/2a2af1)
- Upgrade dependencies ([#391](https://github.com/reearth/reearth-visualizer/pull/391)) [`7280af`](https://github.com/reearth/reearth-visualizer/commit/7280af)

#### 

- Add updated SECURITY.md [`bc31ce`](https://github.com/reearth/reearth-visualizer/commit/bc31ce)
- Update to 0.15.0 for the release [`d9b693`](https://github.com/reearth/reearth-visualizer/commit/d9b693)
- Mono repo — moving reearth-web [`3b1d8d`](https://github.com/reearth/reearth-visualizer/commit/3b1d8d)
- Chore(server(: upgrade golangci-lint to v1.51 [`9c8714`](https://github.com/reearth/reearth-visualizer/commit/9c8714)

### ci

#### 🔧 Bug Fixes

- Set deafault working directory in build-docker-image [`c57909`](https://github.com/reearth/reearth-visualizer/commit/c57909)
- Path director fix on docker build and refactor on deply web nightly [`7c72ea`](https://github.com/reearth/reearth-visualizer/commit/7c72ea)

#### Miscellaneous Tasks

- Add conditional in ci-web and ci-server for renovate commits ([#406](https://github.com/reearth/reearth-visualizer/pull/406)) [`cc024b`](https://github.com/reearth/reearth-visualizer/commit/cc024b)
- Invoke workflows with their name [`fbbb76`](https://github.com/reearth/reearth-visualizer/commit/fbbb76)

### core

#### 🚀 Features

- Support shapefile in reearth&#x2F;core ([#420](https://github.com/reearth/reearth-visualizer/pull/420)) [`508502`](https://github.com/reearth/reearth-visualizer/commit/508502)
- Support gpx in reearth&#x2F;core ([#423](https://github.com/reearth/reearth-visualizer/pull/423)) [`b4b04b`](https://github.com/reearth/reearth-visualizer/commit/b4b04b)

### 

#### 🚀 Features

- Support polyline and point on reearth&#x2F;core ([#606](https://github.com/reearth/reearth-visualizer/pull/606)) [`abd9a3`](https://github.com/reearth/reearth-visualizer/commit/abd9a3)
- Add remembering last open workspace functionality ([#598](https://github.com/reearth/reearth-visualizer/pull/598)) [`968a9d`](https://github.com/reearth/reearth-visualizer/commit/968a9d)
- Support TileMapService(TMS) on reearth&#x2F;core ([#604](https://github.com/reearth/reearth-visualizer/pull/604)) [`284b35`](https://github.com/reearth/reearth-visualizer/commit/284b35)
- Support styling color &amp; show for 3dtiles model ([#599](https://github.com/reearth/reearth-visualizer/pull/599)) [`a82ca2`](https://github.com/reearth/reearth-visualizer/commit/a82ca2)
- Support tiles data type on reearth&#x2F;core ([#597](https://github.com/reearth/reearth-visualizer/pull/597) [`ae5c49`](https://github.com/reearth/reearth-visualizer/commit/ae5c49)
- Support classificationType property in some feature on reearth&#x2F;core ([#593](https://github.com/reearth/reearth-visualizer/pull/593)) [`897868`](https://github.com/reearth/reearth-visualizer/commit/897868)
- Upgrade cesium-mvt-imagery-provider ([#591](https://github.com/reearth/reearth-visualizer/pull/591)) [`d01d01`](https://github.com/reearth/reearth-visualizer/commit/d01d01)
- Upgrade cesium-mvt-imagery-provider ([#588](https://github.com/reearth/reearth-visualizer/pull/588)) [`e138bd`](https://github.com/reearth/reearth-visualizer/commit/e138bd)
- Add more styling properties to resource appearance in reearth&#x2F;core ([#586](https://github.com/reearth/reearth-visualizer/pull/586)) [`8f3625`](https://github.com/reearth/reearth-visualizer/commit/8f3625)
- Add built field in scene in plugin api ([#584](https://github.com/reearth/reearth-visualizer/pull/584)) [`e8050c`](https://github.com/reearth/reearth-visualizer/commit/e8050c)
- Add scene light ([#576](https://github.com/reearth/reearth-visualizer/pull/576)) [`43c2b8`](https://github.com/reearth/reearth-visualizer/commit/43c2b8)
- Upgrade mvt lib ([#575](https://github.com/reearth/reearth-visualizer/pull/575)) [`584cee`](https://github.com/reearth/reearth-visualizer/commit/584cee)
- Option to unselect layer when click infobox close ([#564](https://github.com/reearth/reearth-visualizer/pull/564)) [`f2b2f2`](https://github.com/reearth/reearth-visualizer/commit/f2b2f2)
- Add alpha property to raster appearance on reearth&#x2F;core ([#555](https://github.com/reearth/reearth-visualizer/pull/555)) [`541f30`](https://github.com/reearth/reearth-visualizer/commit/541f30)
- Support styling for point cloud on reearth&#x2F;core ([#549](https://github.com/reearth/reearth-visualizer/pull/549)) [`f410d6`](https://github.com/reearth/reearth-visualizer/commit/f410d6)
- Add defaultContent property for infobox in plugin API on reearth&#x2F;core ([#538](https://github.com/reearth/reearth-visualizer/pull/538)) [`31ba31`](https://github.com/reearth/reearth-visualizer/commit/31ba31)
- Add updateClockOnLoad  to data on reearth&#x2F;core ([#539](https://github.com/reearth/reearth-visualizer/pull/539)) [`3653e2`](https://github.com/reearth/reearth-visualizer/commit/3653e2)
- Support gltf data type on reearth&#x2F;core ([#535](https://github.com/reearth/reearth-visualizer/pull/535)) [`e086be`](https://github.com/reearth/reearth-visualizer/commit/e086be)
- Support ga4 ([#509](https://github.com/reearth/reearth-visualizer/pull/509)) [`39bfb0`](https://github.com/reearth/reearth-visualizer/commit/39bfb0)
- Select MVT feature on reearth&#x2F;core ([#527](https://github.com/reearth/reearth-visualizer/pull/527)) [`de605d`](https://github.com/reearth/reearth-visualizer/commit/de605d)
- Add parameters property to data on reearth&#x2F;core ([#520](https://github.com/reearth/reearth-visualizer/pull/520)) [`c698eb`](https://github.com/reearth/reearth-visualizer/commit/c698eb)
- Layer select event in reearth&#x2F;core ([#470](https://github.com/reearth/reearth-visualizer/pull/470)) [`fb22e6`](https://github.com/reearth/reearth-visualizer/commit/fb22e6)
- Show field in appearances of reearth&#x2F;core ([#469](https://github.com/reearth/reearth-visualizer/pull/469)) [`819eb6`](https://github.com/reearth/reearth-visualizer/commit/819eb6)
- ImageSizeInMeters field in marker proeperty ([#511](https://github.com/reearth/reearth-visualizer/pull/511)) [`290cb7`](https://github.com/reearth/reearth-visualizer/commit/290cb7)
- Override clock from scene setting on reearth&#x2F;core ([#505](https://github.com/reearth/reearth-visualizer/pull/505)) [`01bffd`](https://github.com/reearth/reearth-visualizer/commit/01bffd)
- Support features for CZML on reearth&#x2F;core ([#506](https://github.com/reearth/reearth-visualizer/pull/506)) [`e5c160`](https://github.com/reearth/reearth-visualizer/commit/e5c160)
- Update cesium ([#503](https://github.com/reearth/reearth-visualizer/pull/503)) [`5a649f`](https://github.com/reearth/reearth-visualizer/commit/5a649f)
- Color blend mode in tileset on reearth&#x2F;core ([#496](https://github.com/reearth/reearth-visualizer/pull/496)) [`ca43dc`](https://github.com/reearth/reearth-visualizer/commit/ca43dc)
- Change brand images and colors at the root page ([#495](https://github.com/reearth/reearth-visualizer/pull/495))Co-authored-by: rot1024 &lt;aayhrot@gmail.com&gt; [`4f07b9`](https://github.com/reearth/reearth-visualizer/commit/4f07b9)
- Add builtin clipping box on reearth&#x2F;core ([#487](https://github.com/reearth/reearth-visualizer/pull/487)) [`63bd4f`](https://github.com/reearth/reearth-visualizer/commit/63bd4f)
- ExtrudedHeight for polygon on reearth&#x2F;core ([#486](https://github.com/reearth/reearth-visualizer/pull/486)) [`523d35`](https://github.com/reearth/reearth-visualizer/commit/523d35)
- Support resource entity layerId on reearth&#x2F;core ([#485](https://github.com/reearth/reearth-visualizer/pull/485)) [`7bd7c5`](https://github.com/reearth/reearth-visualizer/commit/7bd7c5)
- Support distanceDisplayCondition on reearth&#x2F;core ([#475](https://github.com/reearth/reearth-visualizer/pull/475)) [`ce8270`](https://github.com/reearth/reearth-visualizer/commit/ce8270)
- Support GeoRSS and gml in reearth&#x2F;core ([#455](https://github.com/reearth/reearth-visualizer/pull/455)) [`58c25b`](https://github.com/reearth/reearth-visualizer/commit/58c25b)
- Add htmlblock on reearth&#x2F;core ([#454](https://github.com/reearth/reearth-visualizer/pull/454)) [`1b37e0`](https://github.com/reearth/reearth-visualizer/commit/1b37e0)
- Support clipping box direction on reearth&#x2F;core ([#467](https://github.com/reearth/reearth-visualizer/pull/467)) [`70f74e`](https://github.com/reearth/reearth-visualizer/commit/70f74e)
- Add sampleTerrainHeight on reearht&#x2F;core ([#466](https://github.com/reearth/reearth-visualizer/pull/466)) [`55334e`](https://github.com/reearth/reearth-visualizer/commit/55334e)
- Get brand from config ([#457](https://github.com/reearth/reearth-visualizer/pull/457)) [`d35361`](https://github.com/reearth/reearth-visualizer/commit/d35361)
- Support timeline on mobile on reearth&#x2F;core ([#462](https://github.com/reearth/reearth-visualizer/pull/462)) [`efeaf4`](https://github.com/reearth/reearth-visualizer/commit/efeaf4)
- Use visible field on reearth&#x2F;core ([#456](https://github.com/reearth/reearth-visualizer/pull/456)) [`333610`](https://github.com/reearth/reearth-visualizer/commit/333610)
- Add htmlblock to built-in plugin ([#384](https://github.com/reearth/reearth-visualizer/pull/384)) [`51c79a`](https://github.com/reearth/reearth-visualizer/commit/51c79a)
- Add override, replace and delete plugin API on reearth&#x2F;core ([#451](https://github.com/reearth/reearth-visualizer/pull/451)) [`2e1c41`](https://github.com/reearth/reearth-visualizer/commit/2e1c41)
- Selecting imagery features ([#450](https://github.com/reearth/reearth-visualizer/pull/450)) [`f24ef5`](https://github.com/reearth/reearth-visualizer/commit/f24ef5)
- Support interval fetching data on reearth&#x2F;core ([#449](https://github.com/reearth/reearth-visualizer/pull/449)) [`406174`](https://github.com/reearth/reearth-visualizer/commit/406174)
- Support select feature on reearth&#x2F;core ([#445](https://github.com/reearth/reearth-visualizer/pull/445)) [`3174b1`](https://github.com/reearth/reearth-visualizer/commit/3174b1)
- Use experimental core flag ([#448](https://github.com/reearth/reearth-visualizer/pull/448)) [`b04294`](https://github.com/reearth/reearth-visualizer/commit/b04294)
- Support time series features on reearth&#x2F;core ([#446](https://github.com/reearth/reearth-visualizer/pull/446)) [`8fc9b6`](https://github.com/reearth/reearth-visualizer/commit/8fc9b6)
- Scene property to enable VR mode ([#444](https://github.com/reearth/reearth-visualizer/pull/444)) [`3d35aa`](https://github.com/reearth/reearth-visualizer/commit/3d35aa)
- Support general transit feed ([#408](https://github.com/reearth/reearth-visualizer/pull/408)) [`49b4a4`](https://github.com/reearth/reearth-visualizer/commit/49b4a4)
- Support osm data type on reearth&#x2F;core ([#431](https://github.com/reearth/reearth-visualizer/pull/431)) [`0d4e0b`](https://github.com/reearth/reearth-visualizer/commit/0d4e0b)
- Label background color and padding property for markers ([#426](https://github.com/reearth/reearth-visualizer/pull/426) [`72cd0d`](https://github.com/reearth/reearth-visualizer/commit/72cd0d)
- Support entity base flyTo on reearth&#x2F;core ([#419](https://github.com/reearth/reearth-visualizer/pull/419)) [`3060cf`](https://github.com/reearth/reearth-visualizer/commit/3060cf)
- Support overriding czml appearance on reearth&#x2F;core ([#421](https://github.com/reearth/reearth-visualizer/pull/421)) [`e62f4d`](https://github.com/reearth/reearth-visualizer/commit/e62f4d)
- Support kml on reearth&#x2F;core ([#422](https://github.com/reearth/reearth-visualizer/pull/422)) [`052daf`](https://github.com/reearth/reearth-visualizer/commit/052daf)
- Support json properties on reearth&#x2F;core ([#412](https://github.com/reearth/reearth-visualizer/pull/412)) [`ac7986`](https://github.com/reearth/reearth-visualizer/commit/ac7986)
- Connect reearth&#x2F;core with existence pages ([#401](https://github.com/reearth/reearth-visualizer/pull/401)) [`0735c0`](https://github.com/reearth/reearth-visualizer/commit/0735c0)
- Add runTimes property to PluginInstance ([#404](https://github.com/reearth/reearth-visualizer/pull/404)) [`17d787`](https://github.com/reearth/reearth-visualizer/commit/17d787)
- Support plugin system on reearth&#x2F;core ([#399](https://github.com/reearth/reearth-visualizer/pull/399)) [`bab9e6`](https://github.com/reearth/reearth-visualizer/commit/bab9e6)
- Add selectedFeature and selectedComputedFeature on reearth&#x2F;core ([#398](https://github.com/reearth/reearth-visualizer/pull/398)) [`474b34`](https://github.com/reearth/reearth-visualizer/commit/474b34)
- Set modal above popup ([#397](https://github.com/reearth/reearth-visualizer/pull/397)) [`ff47c5`](https://github.com/reearth/reearth-visualizer/commit/ff47c5)
- Port 2d navigator to reearth&#x2F;core ([#394](https://github.com/reearth/reearth-visualizer/pull/394)) [`07a6b4`](https://github.com/reearth/reearth-visualizer/commit/07a6b4)
- Core&#x2F;Visualizer without plugins ([#372](https://github.com/reearth/reearth-visualizer/pull/372)) [`f97c38`](https://github.com/reearth/reearth-visualizer/commit/f97c38)
- Reearth style language ([#384](https://github.com/reearth/reearth-visualizer/pull/384)) [`a828ac`](https://github.com/reearth/reearth-visualizer/commit/a828ac)
- Support 3dtiles on reearth&#x2F;core ([#392](https://github.com/reearth/reearth-visualizer/pull/392)) [`e8068f`](https://github.com/reearth/reearth-visualizer/commit/e8068f)
- Support MVT on reearth&#x2F;core ([#388](https://github.com/reearth/reearth-visualizer/pull/388)) [`cac89c`](https://github.com/reearth/reearth-visualizer/commit/cac89c)
- Support WMS on reearth&#x2F;core ([#387](https://github.com/reearth/reearth-visualizer/pull/387)) [`666c1b`](https://github.com/reearth/reearth-visualizer/commit/666c1b)
- Support CZML in reearth&#x2F;core ([#383](https://github.com/reearth/reearth-visualizer/pull/383)) [`f44d98`](https://github.com/reearth/reearth-visualizer/commit/f44d98)
- Plugin api client storage ([#376](https://github.com/reearth/reearth-visualizer/pull/376)) [`4f36ad`](https://github.com/reearth/reearth-visualizer/commit/4f36ad)
- Support csv on the reearth&#x2F;core ([#382](https://github.com/reearth/reearth-visualizer/pull/382)) [`a8f5bf`](https://github.com/reearth/reearth-visualizer/commit/a8f5bf)

#### 🔧 Bug Fixes

- Merge conflict resolved [`39a37a`](https://github.com/reearth/reearth-visualizer/commit/39a37a)
- Use core hook may get value incorrectly ([#609](https://github.com/reearth/reearth-visualizer/pull/609)) [`d87e90`](https://github.com/reearth/reearth-visualizer/commit/d87e90)
- Resolve endsWith is not a function error with style in reearth&#x2F;core ([#603](https://github.com/reearth/reearth-visualizer/pull/603)) [`15fec3`](https://github.com/reearth/reearth-visualizer/commit/15fec3)
- Add % as special case for &#x60;Number()&#x60; in style lang of reearth&#x2F;core ([#601](https://github.com/reearth/reearth-visualizer/pull/601)) [`5a4a3d`](https://github.com/reearth/reearth-visualizer/commit/5a4a3d)
- Rename moveWidget to onMoveWidget on reearth&#x2F;core ([#600](https://github.com/reearth/reearth-visualizer/pull/600)) [`6c06ab`](https://github.com/reearth/reearth-visualizer/commit/6c06ab)
- Enable splash screen in preview page ([#596](https://github.com/reearth/reearth-visualizer/pull/596) [`e1f5ac`](https://github.com/reearth/reearth-visualizer/commit/e1f5ac)
- Timeline scroll should be fixed in initial render ([#571](https://github.com/reearth/reearth-visualizer/pull/571)) [`6a0aed`](https://github.com/reearth/reearth-visualizer/commit/6a0aed)
- Remove default height reference for modelGraphics in reearth&#x2F;core ([#592](https://github.com/reearth/reearth-visualizer/pull/592)) [`961b46`](https://github.com/reearth/reearth-visualizer/commit/961b46)
- Remove duplication of feature entity in reearth&#x2F;core ([#590](https://github.com/reearth/reearth-visualizer/pull/590)) [`8cc03e`](https://github.com/reearth/reearth-visualizer/commit/8cc03e)
- Prevent selecting not shown feature for MVT on reearth&#x2F;core ([#589](https://github.com/reearth/reearth-visualizer/pull/589)) [`41816d`](https://github.com/reearth/reearth-visualizer/commit/41816d)
- Infobox for 3dtiles feature ([#587](https://github.com/reearth/reearth-visualizer/pull/587)) [`70cfdb`](https://github.com/reearth/reearth-visualizer/commit/70cfdb)
- Use layer id with feature id for entity id on reearth&#x2F;core ([#585](https://github.com/reearth/reearth-visualizer/pull/585)) [`24cc88`](https://github.com/reearth/reearth-visualizer/commit/24cc88)
- Can&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t set iframe&[#39](https://github.com/reearth/reearth-visualizer/pull/39);s width or height individually in crust  ([#583](https://github.com/reearth/reearth-visualizer/pull/583)) [`3494b4`](https://github.com/reearth/reearth-visualizer/commit/3494b4)
- MVT isn&[#39](https://github.com/reearth/reearth-visualizer/pull/39);t render correctly on reearth&#x2F;core ([#582](https://github.com/reearth/reearth-visualizer/pull/582)) [`988d1a`](https://github.com/reearth/reearth-visualizer/commit/988d1a)
- Sample terrain height API cannot properly return promise ([#581](https://github.com/reearth/reearth-visualizer/pull/581)) [`72eafd`](https://github.com/reearth/reearth-visualizer/commit/72eafd)
- Change logical operator evaluation behaviour in reearth&#x2F;core ([#580](https://github.com/reearth/reearth-visualizer/pull/580)) [`3d23ce`](https://github.com/reearth/reearth-visualizer/commit/3d23ce)
- Infobox style collapse for long names ([#578](https://github.com/reearth/reearth-visualizer/pull/578)) [`04775d`](https://github.com/reearth/reearth-visualizer/commit/04775d)
- Override currentTime on timeline widget when time is updated by CZML on reearth&#x2F;core ([#579](https://github.com/reearth/reearth-visualizer/pull/579)) [`dbe2e1`](https://github.com/reearth/reearth-visualizer/commit/dbe2e1)
- Rename scene light properties [`8b3a18`](https://github.com/reearth/reearth-visualizer/commit/8b3a18)
- Add none cesium value for heightReference ([#577](https://github.com/reearth/reearth-visualizer/pull/577)) [`2c92e3`](https://github.com/reearth/reearth-visualizer/commit/2c92e3)
- JSON Path condition on reearth&#x2F;core ([#572](https://github.com/reearth/reearth-visualizer/pull/572)) [`5f7024`](https://github.com/reearth/reearth-visualizer/commit/5f7024)
- Update html head [`f1780f`](https://github.com/reearth/reearth-visualizer/commit/f1780f)
- Sync selected feature with layer api on reearth&#x2F;core ([#570](https://github.com/reearth/reearth-visualizer/pull/570)) [`ded6b0`](https://github.com/reearth/reearth-visualizer/commit/ded6b0)
- Imagery index on reearth&#x2F;core ([#569](https://github.com/reearth/reearth-visualizer/pull/569)) [`6b233f`](https://github.com/reearth/reearth-visualizer/commit/6b233f)
- Revert add height to polygon in reearth&#x2F;core ([#566](https://github.com/reearth/reearth-visualizer/pull/566)) [`1f2f74`](https://github.com/reearth/reearth-visualizer/commit/1f2f74)
- Add clamp as default height reference for model in reearth&#x2F;core ([#567](https://github.com/reearth/reearth-visualizer/pull/567)) [`517386`](https://github.com/reearth/reearth-visualizer/commit/517386)
- Minimum timeline range on reearth&#x2F;core ([#565](https://github.com/reearth/reearth-visualizer/pull/565)) [`975c79`](https://github.com/reearth/reearth-visualizer/commit/975c79)
- Infobox html block styling ([#562](https://github.com/reearth/reearth-visualizer/pull/562)) [`32b248`](https://github.com/reearth/reearth-visualizer/commit/32b248)
- Imagery layer tile index on reearth&#x2F;core ([#561](https://github.com/reearth/reearth-visualizer/pull/561) [`25bdff`](https://github.com/reearth/reearth-visualizer/commit/25bdff)
- Add &quot;disabled&quot; as shadow mode on reearth&#x2F;core ([#560](https://github.com/reearth/reearth-visualizer/pull/560)) [`1632ea`](https://github.com/reearth/reearth-visualizer/commit/1632ea)
- Support multi layers in MVT on reearth&#x2F;core ([#559](https://github.com/reearth/reearth-visualizer/pull/559)) [`9c8c88`](https://github.com/reearth/reearth-visualizer/commit/9c8c88)
- Html block margin and height [`09f6ef`](https://github.com/reearth/reearth-visualizer/commit/09f6ef)
- UpdateClockOnLoad condition on reearth&#x2F;core ([#558](https://github.com/reearth/reearth-visualizer/pull/558)) [`f9076a`](https://github.com/reearth/reearth-visualizer/commit/f9076a)
- Add height to polygon in reearth&#x2F;core ([#557](https://github.com/reearth/reearth-visualizer/pull/557)) [`a84dbe`](https://github.com/reearth/reearth-visualizer/commit/a84dbe)
- Use computed feature on resource on reearth&#x2F;core ([#556](https://github.com/reearth/reearth-visualizer/pull/556)) [`006f40`](https://github.com/reearth/reearth-visualizer/commit/006f40)
- Point cloud dirty check on reearth&#x2F;core ([#554](https://github.com/reearth/reearth-visualizer/pull/554)) [`f95d27`](https://github.com/reearth/reearth-visualizer/commit/f95d27)
- Support default infobox and selection indicator on imagery layer on reearth&#x2F;core ([#553](https://github.com/reearth/reearth-visualizer/pull/553)) [`1946b3`](https://github.com/reearth/reearth-visualizer/commit/1946b3)
- Scrollbar in timeline widget always showing ([#550](https://github.com/reearth/reearth-visualizer/pull/550)) [`84d63d`](https://github.com/reearth/reearth-visualizer/commit/84d63d)
- Clipping box on point cloud on reearth&#x2F;core ([#552](https://github.com/reearth/reearth-visualizer/pull/552)) [`fb4455`](https://github.com/reearth/reearth-visualizer/commit/fb4455)
- Htmlblock on safari ([#548](https://github.com/reearth/reearth-visualizer/pull/548)) [`392fc7`](https://github.com/reearth/reearth-visualizer/commit/392fc7)
- Use attributes as default content for infobox on reearth&#x2F;core ([#547](https://github.com/reearth/reearth-visualizer/pull/547)) [`be3718`](https://github.com/reearth/reearth-visualizer/commit/be3718)
- Deleting feature process on reearth&#x2F;core ([#546](https://github.com/reearth/reearth-visualizer/pull/546)) [`39ecaf`](https://github.com/reearth/reearth-visualizer/commit/39ecaf)
- Trigger select event when featureId is changed on reearth&#x2F;core ([#545](https://github.com/reearth/reearth-visualizer/pull/545)) [`6f5401`](https://github.com/reearth/reearth-visualizer/commit/6f5401)
- Draw polylines on polygon on reearth&#x2F;core ([#544](https://github.com/reearth/reearth-visualizer/pull/544)) [`d35329`](https://github.com/reearth/reearth-visualizer/commit/d35329)
- Infobox html color ([#534](https://github.com/reearth/reearth-visualizer/pull/534)) [`c0e0a6`](https://github.com/reearth/reearth-visualizer/commit/c0e0a6)
- Use overriddenLayers to get infobox on reearth&#x2F;core ([#541](https://github.com/reearth/reearth-visualizer/pull/541)) [`c4e9db`](https://github.com/reearth/reearth-visualizer/commit/c4e9db)
- Fly to multiple entities added by a layer on reearth&#x2F;core ([#540](https://github.com/reearth/reearth-visualizer/pull/540)) [`95b3d3`](https://github.com/reearth/reearth-visualizer/commit/95b3d3)
- Add polyfill for requestIdleCallback in reearth&#x2F;core ([#537](https://github.com/reearth/reearth-visualizer/pull/537)) [`c4722f`](https://github.com/reearth/reearth-visualizer/commit/c4722f)
- Overriding timeline behavior on reearth&#x2F;core ([#532](https://github.com/reearth/reearth-visualizer/pull/532)) [`890dae`](https://github.com/reearth/reearth-visualizer/commit/890dae)
- Timeline bug on reearth&#x2F;core ([#531](https://github.com/reearth/reearth-visualizer/pull/531)) [`572678`](https://github.com/reearth/reearth-visualizer/commit/572678)
- Some error on reearth&#x2F;core ([#530](https://github.com/reearth/reearth-visualizer/pull/530)) [`4ee0b6`](https://github.com/reearth/reearth-visualizer/commit/4ee0b6)
- Abort fetching on data atom on reearth&#x2F;core ([#529](https://github.com/reearth/reearth-visualizer/pull/529)) [`e82c88`](https://github.com/reearth/reearth-visualizer/commit/e82c88)
- Timeline behavior on reearth&#x2F;core ([#528](https://github.com/reearth/reearth-visualizer/pull/528)) [`461d06`](https://github.com/reearth/reearth-visualizer/commit/461d06)
- Parse csv numeric strings as numbers in reearth&#x2F;core ([#526](https://github.com/reearth/reearth-visualizer/pull/526)) [`9c890f`](https://github.com/reearth/reearth-visualizer/commit/9c890f)
- Parse hyphen as reserved word in property key on reearth&#x2F;core ([#525](https://github.com/reearth/reearth-visualizer/pull/525)) [`d49058`](https://github.com/reearth/reearth-visualizer/commit/d49058)
- Condition for CZML on reearth&#x2F;core ([#524](https://github.com/reearth/reearth-visualizer/pull/524)) [`3c61ca`](https://github.com/reearth/reearth-visualizer/commit/3c61ca)
- Czml style for marker on reearth&#x2F;core ([#523](https://github.com/reearth/reearth-visualizer/pull/523)) [`67dccb`](https://github.com/reearth/reearth-visualizer/commit/67dccb)
- Use default block for entity on reearth&#x2F;core ([#522](https://github.com/reearth/reearth-visualizer/pull/522)) [`ecd09a`](https://github.com/reearth/reearth-visualizer/commit/ecd09a)
- Remove copyLazyLayer on reearth&#x2F;core ([#519](https://github.com/reearth/reearth-visualizer/pull/519)) [`e17218`](https://github.com/reearth/reearth-visualizer/commit/e17218)
- Copying lazy layers undefined behavior on reearth&#x2F;core ([#516](https://github.com/reearth/reearth-visualizer/pull/516)) [`7b2c5e`](https://github.com/reearth/reearth-visualizer/commit/7b2c5e)
- Copy lazy layer on plugin on reearth&#x2F;core ([#515](https://github.com/reearth/reearth-visualizer/pull/515)) [`046a3d`](https://github.com/reearth/reearth-visualizer/commit/046a3d)
- Attach style dynamically in resource on reearth&#x2F;core ([#514](https://github.com/reearth/reearth-visualizer/pull/514)) [`81d291`](https://github.com/reearth/reearth-visualizer/commit/81d291)
- Infinite infobox in CZML on reearth&#x2F;core ([#513](https://github.com/reearth/reearth-visualizer/pull/513)) [`3e49a1`](https://github.com/reearth/reearth-visualizer/commit/3e49a1)
- Selecting resource feature behavior on reearth&#x2F;core ([#512](https://github.com/reearth/reearth-visualizer/pull/512)) [`35f2c2`](https://github.com/reearth/reearth-visualizer/commit/35f2c2)
- Prevent unnecessary render on timeline on reearth&#x2F;core ([#510](https://github.com/reearth/reearth-visualizer/pull/510)) [`7cb9d5`](https://github.com/reearth/reearth-visualizer/commit/7cb9d5)
- Parse reserved word when property name includes reserved word on reearth&#x2F;core ([#508](https://github.com/reearth/reearth-visualizer/pull/508)) [`aa247e`](https://github.com/reearth/reearth-visualizer/commit/aa247e)
- Pass engine meta on plugin editor ([#507](https://github.com/reearth/reearth-visualizer/pull/507)) [`9cd1b5`](https://github.com/reearth/reearth-visualizer/commit/9cd1b5)
- Mvt line width on reearth&#x2F;core ([#504](https://github.com/reearth/reearth-visualizer/pull/504)) [`c1a939`](https://github.com/reearth/reearth-visualizer/commit/c1a939)
- It should not render entity when coordinate is undefined on reearth&#x2F;core [`23b6c6`](https://github.com/reearth/reearth-visualizer/commit/23b6c6)
- Allow enter ground option for clipping box on reearth&#x2F;core ([#500](https://github.com/reearth/reearth-visualizer/pull/500)) [`f8e129`](https://github.com/reearth/reearth-visualizer/commit/f8e129)
- Clip area with clipping box on reearth&#x2F;core ([#498](https://github.com/reearth/reearth-visualizer/pull/498)) [`4f647f`](https://github.com/reearth/reearth-visualizer/commit/4f647f)
- Mvt cache on reearth&#x2F;core ([#497](https://github.com/reearth/reearth-visualizer/pull/497)) [`ba2c7e`](https://github.com/reearth/reearth-visualizer/commit/ba2c7e)
- Recreate no feature component when data url is changed on reearth&#x2F;core ([#494](https://github.com/reearth/reearth-visualizer/pull/494)) [`93c805`](https://github.com/reearth/reearth-visualizer/commit/93c805)
- Ignore cesium ion token when it is empty [`6648be`](https://github.com/reearth/reearth-visualizer/commit/6648be)
- Feature type fix gpx on reearth&#x2F;core ([#493](https://github.com/reearth/reearth-visualizer/pull/493)) [`51b8e8`](https://github.com/reearth/reearth-visualizer/commit/51b8e8)
- Infobox error after layer delete ([#492](https://github.com/reearth/reearth-visualizer/pull/492)) [`8a59dd`](https://github.com/reearth/reearth-visualizer/commit/8a59dd)
- Delete bug that deletes necessary layer on reearth&#x2F;core ([#484](https://github.com/reearth/reearth-visualizer/pull/484)) [`a0f48f`](https://github.com/reearth/reearth-visualizer/commit/a0f48f)
- Force update when some data properties are updated on reearth&#x2F;core ([#483](https://github.com/reearth/reearth-visualizer/pull/483)) [`867238`](https://github.com/reearth/reearth-visualizer/commit/867238)
- Revert appearance to initial value when appearance is undefined on reearth&#x2F;core ([#482](https://github.com/reearth/reearth-visualizer/pull/482)) [`76b6f4`](https://github.com/reearth/reearth-visualizer/commit/76b6f4)
- Entity id is duplicated error on reearth&#x2F;core ([#481](https://github.com/reearth/reearth-visualizer/pull/481)) [`a2b0b6`](https://github.com/reearth/reearth-visualizer/commit/a2b0b6)
- Infobox property is undefined error on reearth&#x2F;core ([#480](https://github.com/reearth/reearth-visualizer/pull/480)) [`2b8b07`](https://github.com/reearth/reearth-visualizer/commit/2b8b07)
- Layers override behavior on rearth&#x2F;core ([#479](https://github.com/reearth/reearth-visualizer/pull/479)) [`faff37`](https://github.com/reearth/reearth-visualizer/commit/faff37)
- Error handling for time interval on reearth&#x2F;core ([#478](https://github.com/reearth/reearth-visualizer/pull/478)) [`edf546`](https://github.com/reearth/reearth-visualizer/commit/edf546)
- Overridden layers api on reearth&#x2F;core ([#477](https://github.com/reearth/reearth-visualizer/pull/477)) [`abaade`](https://github.com/reearth/reearth-visualizer/commit/abaade)
- Add properties in vehicle point for gtfs ([#476](https://github.com/reearth/reearth-visualizer/pull/476)) [`1058ab`](https://github.com/reearth/reearth-visualizer/commit/1058ab)
- Color function on reearth&#x2F;core ([#474](https://github.com/reearth/reearth-visualizer/pull/474)) [`7d9fca`](https://github.com/reearth/reearth-visualizer/commit/7d9fca)
- Errors when many functions are created in plugins ([#471](https://github.com/reearth/reearth-visualizer/pull/471)) [`ebb50d`](https://github.com/reearth/reearth-visualizer/commit/ebb50d)
- Coordinates for csv on reearth&#x2F;core ([#472](https://github.com/reearth/reearth-visualizer/pull/472)) [`4a6473`](https://github.com/reearth/reearth-visualizer/commit/4a6473)
- Lint and type error [`d00b9b`](https://github.com/reearth/reearth-visualizer/commit/d00b9b)
- Suppress screen flicker when judging useCore [`b1852d`](https://github.com/reearth/reearth-visualizer/commit/b1852d)
- Widget area has margin even if no widgets, disable widget area transition in built scene [`b51569`](https://github.com/reearth/reearth-visualizer/commit/b51569)
- Cesium crashes when VR mode is false [`efa3fd`](https://github.com/reearth/reearth-visualizer/commit/efa3fd)
- 3dtiles overriding appearance behavior on reearth&#x2F;core ([#468](https://github.com/reearth/reearth-visualizer/pull/468)) [`8c48bc`](https://github.com/reearth/reearth-visualizer/commit/8c48bc)
- Support visible and dynamic plane in clipping box on reearth&#x2F;core ([#465](https://github.com/reearth/reearth-visualizer/pull/465)) [`4c89aa`](https://github.com/reearth/reearth-visualizer/commit/4c89aa)
- SelectedFeature for 3dtiles on reearth&#x2F;core ([#463](https://github.com/reearth/reearth-visualizer/pull/463)) [`cd1777`](https://github.com/reearth/reearth-visualizer/commit/cd1777)
- Express undefined visible field on reearth&#x2F;core ([#461](https://github.com/reearth/reearth-visualizer/pull/461)) [`c74630`](https://github.com/reearth/reearth-visualizer/commit/c74630)
- Undefined behavior for visible field ([#460](https://github.com/reearth/reearth-visualizer/pull/460)) [`c41d70`](https://github.com/reearth/reearth-visualizer/commit/c41d70)
- Select entity on reearth&#x2F;core ([#458](https://github.com/reearth/reearth-visualizer/pull/458)) [`bc1824`](https://github.com/reearth/reearth-visualizer/commit/bc1824)
- Use default infobox on reearth&#x2F;core ([#453](https://github.com/reearth/reearth-visualizer/pull/453)) [`d3fec8`](https://github.com/reearth/reearth-visualizer/commit/d3fec8)
- Select event behavior on reearth&#x2F;core ([#452](https://github.com/reearth/reearth-visualizer/pull/452)) [`384488`](https://github.com/reearth/reearth-visualizer/commit/384488)
- Error in published page on reearth&#x2F;core ([#447](https://github.com/reearth/reearth-visualizer/pull/447)) [`4c8805`](https://github.com/reearth/reearth-visualizer/commit/4c8805)
- Expand timeline in initial load ([#443](https://github.com/reearth/reearth-visualizer/pull/443)) [`d6a742`](https://github.com/reearth/reearth-visualizer/commit/d6a742)
- Replace globe image when cesium ion token is updated ([#442](https://github.com/reearth/reearth-visualizer/pull/442)) [`64ffae`](https://github.com/reearth/reearth-visualizer/commit/64ffae)
- Layer fetch on reearth&#x2F;core ([#441](https://github.com/reearth/reearth-visualizer/pull/441)) [`597b82`](https://github.com/reearth/reearth-visualizer/commit/597b82)
- Dnd layer on reearth&#x2F;core ([#440](https://github.com/reearth/reearth-visualizer/pull/440)) [`a5a2b4`](https://github.com/reearth/reearth-visualizer/commit/a5a2b4)
- Disable requestRenderMode depends on widget on reearth&#x2F;core ([#439](https://github.com/reearth/reearth-visualizer/pull/439)) [`12ce63`](https://github.com/reearth/reearth-visualizer/commit/12ce63)
- Selected layer id is not propagated on reearth&#x2F;core ([#438](https://github.com/reearth/reearth-visualizer/pull/438)) [`24993b`](https://github.com/reearth/reearth-visualizer/commit/24993b)
- Handle featureId for 3dtiles and compat select plugin api on reearth&#x2F;core ([#417](https://github.com/reearth/reearth-visualizer/pull/417)) [`9144ad`](https://github.com/reearth/reearth-visualizer/commit/9144ad)
- Undefined behavior for resource on reearth&#x2F;core ([#437](https://github.com/reearth/reearth-visualizer/pull/437)) [`3f51f2`](https://github.com/reearth/reearth-visualizer/commit/3f51f2)
- Blocks cannot be displayed and updated as expected on reearth&#x2F;core ([#434](https://github.com/reearth/reearth-visualizer/pull/434)) [`b5f921`](https://github.com/reearth/reearth-visualizer/commit/b5f921)
- Layer appearances are not evaluated as expected ([#418](https://github.com/reearth/reearth-visualizer/pull/418)) [`20382c`](https://github.com/reearth/reearth-visualizer/commit/20382c)
- Support resource auto on reearth&#x2F;core ([#435](https://github.com/reearth/reearth-visualizer/pull/435)) [`595c66`](https://github.com/reearth/reearth-visualizer/commit/595c66)
- Cluster features on reearth&#x2F;core ([#430](https://github.com/reearth/reearth-visualizer/pull/430)) [`92dd47`](https://github.com/reearth/reearth-visualizer/commit/92dd47)
- 3D Tiles infobox on reearth&#x2F;core ([#433](https://github.com/reearth/reearth-visualizer/pull/433)) [`b4afd7`](https://github.com/reearth/reearth-visualizer/commit/b4afd7)
- GeoJSON with resource appearance on reearth&#x2F;core ([#432](https://github.com/reearth/reearth-visualizer/pull/432)) [`464d67`](https://github.com/reearth/reearth-visualizer/commit/464d67)
- Dnd layer on reearth&#x2F;core ([#424](https://github.com/reearth/reearth-visualizer/pull/424)) [`75e6a7`](https://github.com/reearth/reearth-visualizer/commit/75e6a7)
- WAS bug on reearth&#x2F;core ([#416](https://github.com/reearth/reearth-visualizer/pull/416)) [`045274`](https://github.com/reearth/reearth-visualizer/commit/045274)
- Cannot select features on reearth&#x2F;core ([#414](https://github.com/reearth/reearth-visualizer/pull/414)) [`f1a8dd`](https://github.com/reearth/reearth-visualizer/commit/f1a8dd)
- Support csv value string on reearth&#x2F;core ([#415](https://github.com/reearth/reearth-visualizer/pull/415)) [`4033f7`](https://github.com/reearth/reearth-visualizer/commit/4033f7)
- MoveTo widget to empty page on mobile on reearth&#x2F;core ([#413](https://github.com/reearth/reearth-visualizer/pull/413)) [`07a935`](https://github.com/reearth/reearth-visualizer/commit/07a935)
- Widget align system on mobile ([#409](https://github.com/reearth/reearth-visualizer/pull/409)) [`fce1ad`](https://github.com/reearth/reearth-visualizer/commit/fce1ad)
- Increment runTimes on preinit ([#410](https://github.com/reearth/reearth-visualizer/pull/410)) [`797020`](https://github.com/reearth/reearth-visualizer/commit/797020)
- Plugin instance runTimes property ([#405](https://github.com/reearth/reearth-visualizer/pull/405)) [`a06434`](https://github.com/reearth/reearth-visualizer/commit/a06434)
- Make iframe width or height assignable without the other ([#403](https://github.com/reearth/reearth-visualizer/pull/403)) [`e8647a`](https://github.com/reearth/reearth-visualizer/commit/e8647a)
- Cache ComputedFeature on reearth&#x2F;core ([#396](https://github.com/reearth/reearth-visualizer/pull/396)) [`775a8a`](https://github.com/reearth/reearth-visualizer/commit/775a8a)
- Missing type of API modal &amp; popup options.  ([#400](https://github.com/reearth/reearth-visualizer/pull/400)) [`a68b24`](https://github.com/reearth/reearth-visualizer/commit/a68b24)
- Visualizer on reearth&#x2F;core ([#395](https://github.com/reearth/reearth-visualizer/pull/395)) [`7ba0db`](https://github.com/reearth/reearth-visualizer/commit/7ba0db)
- Update mvt dynamically when appearance is updated ([#393](https://github.com/reearth/reearth-visualizer/pull/393)) [`7ca5d1`](https://github.com/reearth/reearth-visualizer/commit/7ca5d1)

#### 📖 Documentation

- Add diagrams of core architecture ([#396](https://github.com/reearth/reearth-visualizer/pull/396)) [`2dfa6b`](https://github.com/reearth/reearth-visualizer/commit/2dfa6b)

#### ⚡️ Performance

- Consider geojson as both delegate and active data type in reearth&#x2F;core ([#608](https://github.com/reearth/reearth-visualizer/pull/608)) [`94bc59`](https://github.com/reearth/reearth-visualizer/commit/94bc59)
- Improve styling in MVT on reearth&#x2F;core ([#574](https://github.com/reearth/reearth-visualizer/pull/574)) [`8ced77`](https://github.com/reearth/reearth-visualizer/commit/8ced77)
- Improve 3dtiles performance and disable requestRenderMode on reearth&#x2F;core ([#568](https://github.com/reearth/reearth-visualizer/pull/568)) [`e645ec`](https://github.com/reearth/reearth-visualizer/commit/e645ec)
- Reduce style evaluator memory signature in reearth&#x2F;core ([#563](https://github.com/reearth/reearth-visualizer/pull/563)) [`f74b56`](https://github.com/reearth/reearth-visualizer/commit/f74b56)
- Use private modifier on evaluator on reearth&#x2F;core ([#543](https://github.com/reearth/reearth-visualizer/pull/543)) [`532c66`](https://github.com/reearth/reearth-visualizer/commit/532c66)
- Improve regexp on reearth&#x2F;core ([#533](https://github.com/reearth/reearth-visualizer/pull/533)) [`ca7b05`](https://github.com/reearth/reearth-visualizer/commit/ca7b05)
- Stop synchronizing features in MVT on reearth&#x2F;core ([#521](https://github.com/reearth/reearth-visualizer/pull/521)) [`82ae2c`](https://github.com/reearth/reearth-visualizer/commit/82ae2c)
- Copy lazy layer lazily ([#517](https://github.com/reearth/reearth-visualizer/pull/517)) [`4a5ba4`](https://github.com/reearth/reearth-visualizer/commit/4a5ba4)
- Improve mvt rendering on reearth&#x2F;core ([#501](https://github.com/reearth/reearth-visualizer/pull/501)) [`8a681d`](https://github.com/reearth/reearth-visualizer/commit/8a681d)
- Compute features concurrently on reearth&#x2F;core ([#499](https://github.com/reearth/reearth-visualizer/pull/499)) [`6448ba`](https://github.com/reearth/reearth-visualizer/commit/6448ba)
- Improve skipping computing process for 3dtiles on reearth&#x2F;core ([#491](https://github.com/reearth/reearth-visualizer/pull/491)) [`253b58`](https://github.com/reearth/reearth-visualizer/commit/253b58)
- Improve 3dtiles features calculation on reearth&#x2F;core ([#489](https://github.com/reearth/reearth-visualizer/pull/489)) [`1204a6`](https://github.com/reearth/reearth-visualizer/commit/1204a6)
- Improve expression cache strategy on reearth&#x2F;core ([#488](https://github.com/reearth/reearth-visualizer/pull/488)) [`324e28`](https://github.com/reearth/reearth-visualizer/commit/324e28)
- Cache AST for evaluator on reearth&#x2F;core ([#473](https://github.com/reearth/reearth-visualizer/pull/473)) [`da6bb3`](https://github.com/reearth/reearth-visualizer/commit/da6bb3)
- Improve blink when feature is updated on reearth&#x2F;core ([#429](https://github.com/reearth/reearth-visualizer/pull/429)) [`c10a67`](https://github.com/reearth/reearth-visualizer/commit/c10a67)

#### ✨ Refactor

- Replace &quot;team&quot; word  related to Team state with &quot;workspace&quot; ([#607](https://github.com/reearth/reearth-visualizer/pull/607)) [`fb254b`](https://github.com/reearth/reearth-visualizer/commit/fb254b)

#### Miscellaneous Tasks

- Remove redundant workflows [`f2685d`](https://github.com/reearth/reearth-visualizer/commit/f2685d)
- Remove inter-dependency of web and server workflows [`999e73`](https://github.com/reearth/reearth-visualizer/commit/999e73)
- Change codeowner [`bffa05`](https://github.com/reearth/reearth-visualizer/commit/bffa05)
- Upgrade eslint [`d55795`](https://github.com/reearth/reearth-visualizer/commit/d55795)
- Update dependency cesium to v1.104.0 ([#594](https://github.com/reearth/reearth-visualizer/pull/594)) [`c57839`](https://github.com/reearth/reearth-visualizer/commit/c57839)
- Fix storybook is not working ([#536](https://github.com/reearth/reearth-visualizer/pull/536) [`d52124`](https://github.com/reearth/reearth-visualizer/commit/d52124)
- Rename asset dir to avoid conflicts with backend API endpoints [`1d9455`](https://github.com/reearth/reearth-visualizer/commit/1d9455)
- Add offline_access auth scope to support refresh tokens with built-in auth server ([#425](https://github.com/reearth/reearth-visualizer/pull/425) [`2a2af1`](https://github.com/reearth/reearth-visualizer/commit/2a2af1)
- Upgrade dependencies ([#391](https://github.com/reearth/reearth-visualizer/pull/391)) [`7280af`](https://github.com/reearth/reearth-visualizer/commit/7280af)

#### 

- Add updated SECURITY.md [`bc31ce`](https://github.com/reearth/reearth-visualizer/commit/bc31ce)
- Update to 0.15.0 for the release [`d9b693`](https://github.com/reearth/reearth-visualizer/commit/d9b693)
- Mono repo — moving reearth-web [`3b1d8d`](https://github.com/reearth/reearth-visualizer/commit/3b1d8d)
- Chore(server(: upgrade golangci-lint to v1.51 [`9c8714`](https://github.com/reearth/reearth-visualizer/commit/9c8714)

## 0.14.1 - 2022-12-21

## 0.14.0 - 2022-12-20

## 0.13.0 - 2022-12-06

### Web

### 🔧 Bug Fixes

- Plugin API viewport.query destroys published pages ([#385](https://github.com/reearth/reearth-visualizer-web/pull/385)) [`de8c01`](https://github.com/reearth/reearth-visualizer-web/commit/de8c01)

### Web

### 🚀 Features

- Port the Box layer into the reearth&#x2F;core ([#377](https://github.com/reearth/reearth-visualizer-web/pull/377)) [`f235f1`](https://github.com/reearth/reearth-visualizer-web/commit/f235f1)
- Support multi feature for geojson ([#380](https://github.com/reearth/reearth-visualizer-web/pull/380)) [`d1ee59`](https://github.com/reearth/reearth-visualizer-web/commit/d1ee59)
- Extend plugin API supports get query ([#374](https://github.com/reearth/reearth-visualizer-web/pull/374)) [`ccae02`](https://github.com/reearth/reearth-visualizer-web/commit/ccae02)
- Extend plugin API supports communication ([#364](https://github.com/reearth/reearth-visualizer-web/pull/364)) [`61e67e`](https://github.com/reearth/reearth-visualizer-web/commit/61e67e)
- Support 2d mode in navigator ([#360](https://github.com/reearth/reearth-visualizer-web/pull/360)) [`595dd5`](https://github.com/reearth/reearth-visualizer-web/commit/595dd5)
- Main logic of the new layer system ([#370](https://github.com/reearth/reearth-visualizer-web/pull/370)) [`0dd63e`](https://github.com/reearth/reearth-visualizer-web/commit/0dd63e)

### 🔧 Bug Fixes

- Cache logic for feature ([#379](https://github.com/reearth/reearth-visualizer-web/pull/379)) [`67bc52`](https://github.com/reearth/reearth-visualizer-web/commit/67bc52)
- Rendering bug in new layer system ([#375](https://github.com/reearth/reearth-visualizer-web/pull/375)) [`172988`](https://github.com/reearth/reearth-visualizer-web/commit/172988)

### ⚡️ Performance

- Improve unnecessary loading the globe image ([#378](https://github.com/reearth/reearth-visualizer-web/pull/378)) [`4abbba`](https://github.com/reearth/reearth-visualizer-web/commit/4abbba)

### ✨ Refactor

- Move feature context ([#381](https://github.com/reearth/reearth-visualizer-web/pull/381)) [`7e18b8`](https://github.com/reearth/reearth-visualizer-web/commit/7e18b8)

### Miscellaneous Tasks

- Upgrade dependencies ([#373](https://github.com/reearth/reearth-visualizer-web/pull/373)) [`1fcc75`](https://github.com/reearth/reearth-visualizer-web/commit/1fcc75)

### Web

### 🚀 Features

- Support Cesium Ion terrain ([#331](https://github.com/reearth/reearth-visualizer-web/pull/331)) [`e0b99a`](https://github.com/reearth/reearth-visualizer-web/commit/e0b99a)
- Set Cesium Ion default access token via config ([#365](https://github.com/reearth/reearth-visualizer-web/pull/365)) [`a257b1`](https://github.com/reearth/reearth-visualizer-web/commit/a257b1)
- Display policy name on workspace title ([#362](https://github.com/reearth/reearth-visualizer-web/pull/362)) [`c1c632`](https://github.com/reearth/reearth-visualizer-web/commit/c1c632)
- Editable box ([#357](https://github.com/reearth/reearth-visualizer-web/pull/357)) [`92a159`](https://github.com/reearth/reearth-visualizer-web/commit/92a159)
- Extend plugin API supports move widget ([#346](https://github.com/reearth/reearth-visualizer-web/pull/346)) [`c82825`](https://github.com/reearth/reearth-visualizer-web/commit/c82825)
- Extend plugin API supports close widget ([#355](https://github.com/reearth/reearth-visualizer-web/pull/355)) [`d02578`](https://github.com/reearth/reearth-visualizer-web/commit/d02578)
- Extend plugin API supports get scene inEditor ([#351](https://github.com/reearth/reearth-visualizer-web/pull/351)) [`ec0b81`](https://github.com/reearth/reearth-visualizer-web/commit/ec0b81)
- Add clipping box ([#338](https://github.com/reearth/reearth-visualizer-web/pull/338)) [`af55f1`](https://github.com/reearth/reearth-visualizer-web/commit/af55f1)
- Extend plugin API event with modalclose popupclose ([#354](https://github.com/reearth/reearth-visualizer-web/pull/354)) [`9be75a`](https://github.com/reearth/reearth-visualizer-web/commit/9be75a)
- Extend plugin API supports get location from screen position ([#350](https://github.com/reearth/reearth-visualizer-web/pull/350)) [`9a826f`](https://github.com/reearth/reearth-visualizer-web/commit/9a826f)
- Extend plugin API supports get viewport&[#39](https://github.com/reearth/reearth-visualizer-web/pull/39);s size ([#342](https://github.com/reearth/reearth-visualizer-web/pull/342)) [`7b268b`](https://github.com/reearth/reearth-visualizer-web/commit/7b268b)
- Add Re:Earth favicon ([#349](https://github.com/reearth/reearth-visualizer-web/pull/349)) [`0395d2`](https://github.com/reearth/reearth-visualizer-web/commit/0395d2)
- Support acquiring locations with terrain ([#343](https://github.com/reearth/reearth-visualizer-web/pull/343)) [`596543`](https://github.com/reearth/reearth-visualizer-web/commit/596543)

### 🔧 Bug Fixes

- Policy messages not aligning with policy ([#368](https://github.com/reearth/reearth-visualizer-web/pull/368)) [`2871ed`](https://github.com/reearth/reearth-visualizer-web/commit/2871ed)
- Widget align system alignment issue with installed widgets [`e302cc`](https://github.com/reearth/reearth-visualizer-web/commit/e302cc)
- Rename animation option to withoutAnimation in lookAt ([#361](https://github.com/reearth/reearth-visualizer-web/pull/361)) [`846a6e`](https://github.com/reearth/reearth-visualizer-web/commit/846a6e)
- Post message queue doesn&[#39](https://github.com/reearth/reearth-visualizer-web/pull/39);t work for modal&#x2F;popup ([#359](https://github.com/reearth/reearth-visualizer-web/pull/359)) [`abb4ed`](https://github.com/reearth/reearth-visualizer-web/commit/abb4ed)
- Correct flyToGround destination camera ([#356](https://github.com/reearth/reearth-visualizer-web/pull/356)) [`225758`](https://github.com/reearth/reearth-visualizer-web/commit/225758)
- Navigator styles ([#353](https://github.com/reearth/reearth-visualizer-web/pull/353)) [`971323`](https://github.com/reearth/reearth-visualizer-web/commit/971323)
- Timeline styles ([#352](https://github.com/reearth/reearth-visualizer-web/pull/352)) [`c76d36`](https://github.com/reearth/reearth-visualizer-web/commit/c76d36)
- Alignment issues in Widget Align System ([#344](https://github.com/reearth/reearth-visualizer-web/pull/344)) [`0e12ea`](https://github.com/reearth/reearth-visualizer-web/commit/0e12ea)
- Cannot input camera altitude less than 500 with camera pane ([#339](https://github.com/reearth/reearth-visualizer-web/pull/339)) [`76a169`](https://github.com/reearth/reearth-visualizer-web/commit/76a169)
- Type error from apollo-client [`7dd2b3`](https://github.com/reearth/reearth-visualizer-web/commit/7dd2b3)
- Fix the camera offset when keep press on zoom to layer ([#335](https://github.com/reearth/reearth-visualizer-web/pull/335)) [`ccec33`](https://github.com/reearth/reearth-visualizer-web/commit/ccec33)

### ⚡️ Performance

- Use lodash-es rather than lodash [`731e54`](https://github.com/reearth/reearth-visualizer-web/commit/731e54)

### 🧪 Testing

- Gql func to e2e reearth page [`593780`](https://github.com/reearth/reearth-visualizer-web/commit/593780)
- Introduce playwright to run e2e tests ([#336](https://github.com/reearth/reearth-visualizer-web/pull/336)) [`3af520`](https://github.com/reearth/reearth-visualizer-web/commit/3af520)

### Miscellaneous Tasks

- Suppress errors output to the console by Icon [`bd9dc5`](https://github.com/reearth/reearth-visualizer-web/commit/bd9dc5)
- Upgrade cesium to v1.100.0 [`ec05a0`](https://github.com/reearth/reearth-visualizer-web/commit/ec05a0)
- Upgrade cesium to v1.99 [`be5b22`](https://github.com/reearth/reearth-visualizer-web/commit/be5b22)
- Upgrade dependencies ([#345](https://github.com/reearth/reearth-visualizer-web/pull/345)) [`1efe8c`](https://github.com/reearth/reearth-visualizer-web/commit/1efe8c)
- Remove eslint-plugin-graphql, add eslint-plugin-playwright, refresh yarn.lock [`28c846`](https://github.com/reearth/reearth-visualizer-web/commit/28c846)
- Use node 16 to avoid storybook build error with node 18 [`64819e`](https://github.com/reearth/reearth-visualizer-web/commit/64819e)

### Server

#### 🚀 Features

- Remove gsi terrain [`232b78`](https://github.com/reearth/reearth-visualizer/commit/232b78)
- Suppprt h2c [`ca0626`](https://github.com/reearth/reearth-visualizer/commit/ca0626)
- Add Cesium Ion and GSI terrain, transfer terrain properties ([#369](https://github.com/reearth/reearth-visualizer/pull/369)) [`104e59`](https://github.com/reearth/reearth-visualizer/commit/104e59)

#### 🔧 Bug Fixes

- Enforce policy of layer count on layer group creation correctly [`193c37`](https://github.com/reearth/reearth-visualizer/commit/193c37)
- Dataset limitation by policies, asset size calc [`e07b78`](https://github.com/reearth/reearth-visualizer/commit/e07b78)
- Apply default policy to workspaces [`2f7fb9`](https://github.com/reearth/reearth-visualizer/commit/2f7fb9)

### Misc

#### 🚀 Features

- Policy name, dataset limitation by policies [`b72132`](https://github.com/reearth/reearth-visualizer/commit/b72132)

#### 🔧 Bug Fixes

- Bugs with incorrectly applied policies ([#377](https://github.com/reearth/reearth-visualizer/pull/377)) [`67e79f`](https://github.com/reearth/reearth-visualizer/commit/67e79f)

### 

#### 🚀 Features

- Policy name, dataset limitation by policies [`b72132`](https://github.com/reearth/reearth-visualizer/commit/b72132)

#### 🔧 Bug Fixes

- Bugs with incorrectly applied policies ([#377](https://github.com/reearth/reearth-visualizer/pull/377)) [`67e79f`](https://github.com/reearth/reearth-visualizer/commit/67e79f)

## 0.12.0 - 2022-10-28

### Web

### Miscellaneous Tasks

- Update eslint-config-reearth to 0.2.1 ([#326](https://github.com/reearth/reearth-visualizer-web/pull/326)) [`25acdd`](https://github.com/reearth/reearth-visualizer-web/commit/25acdd)

### 🚀 Features

- Add plugin api modal &amp; popup ([#328](https://github.com/reearth/reearth-visualizer-web/pull/328)) [`27cd7a`](https://github.com/reearth/reearth-visualizer-web/commit/27cd7a)
- Zoom to layer ([#301](https://github.com/reearth/reearth-visualizer-web/pull/301)) [`1f5296`](https://github.com/reearth/reearth-visualizer-web/commit/1f5296)
- Fix layer(marker) extrdue line disapear  ([#330](https://github.com/reearth/reearth-visualizer-web/pull/330)) [`7c304f`](https://github.com/reearth/reearth-visualizer-web/commit/7c304f)
- Add option to allow camera to enter the earth&[#39](https://github.com/reearth/reearth-visualizer-web/pull/39);s surface ([#329](https://github.com/reearth/reearth-visualizer-web/pull/329)) [`6255ad`](https://github.com/reearth/reearth-visualizer-web/commit/6255ad)
- Add navigator as a built-in widget ([#323](https://github.com/reearth/reearth-visualizer-web/pull/323)) [`3befd4`](https://github.com/reearth/reearth-visualizer-web/commit/3befd4)

### 🔧 Bug Fixes

- Fix the story telling icon size when the layer name is too long  ([#334](https://github.com/reearth/reearth-visualizer-web/pull/334)) [`c70121`](https://github.com/reearth/reearth-visualizer-web/commit/c70121)
- Polyfill event target for old Safari [`227d64`](https://github.com/reearth/reearth-visualizer-web/commit/227d64)
- Zoom to layer functionality ([#332](https://github.com/reearth/reearth-visualizer-web/pull/332)) [`79b0dd`](https://github.com/reearth/reearth-visualizer-web/commit/79b0dd)
- Camera popup icon is too small and the icon on storytelling ([#324](https://github.com/reearth/reearth-visualizer-web/pull/324)) [`e676c3`](https://github.com/reearth/reearth-visualizer-web/commit/e676c3)

### Miscellaneous Tasks

- Update yarn.lock [`ae4660`](https://github.com/reearth/reearth-visualizer-web/commit/ae4660)
- Fix wdyr [`d4075a`](https://github.com/reearth/reearth-visualizer-web/commit/d4075a)
- Update dependency cesium to v1.98.1 ([#325](https://github.com/reearth/reearth-visualizer-web/pull/325)) [`16e38c`](https://github.com/reearth/reearth-visualizer-web/commit/16e38c)

### Server

#### 🚀 Features

- Add field to manifest to allow for entering the ground ([#353](https://github.com/reearth/reearth-visualizer/pull/353)) [`6a56ce`](https://github.com/reearth/reearth-visualizer/commit/6a56ce)
- Add builtint navigator widget manifest ([#342](https://github.com/reearth/reearth-visualizer/pull/342)) [`f6834f`](https://github.com/reearth/reearth-visualizer/commit/f6834f)

#### 🔧 Bug Fixes

- Tiles typo error ([#360](https://github.com/reearth/reearth-visualizer/pull/360)) [`ddf7d5`](https://github.com/reearth/reearth-visualizer/commit/ddf7d5)
- Japanese typo error ([#351](https://github.com/reearth/reearth-visualizer/pull/351)) [`d0292c`](https://github.com/reearth/reearth-visualizer/commit/d0292c)
- Mongo indexes deleted unexpectedly [`4a323b`](https://github.com/reearth/reearth-visualizer/commit/4a323b)

#### ⚡️ Performance

- Add mongo indexes [`cee2b2`](https://github.com/reearth/reearth-visualizer/commit/cee2b2)

#### Miscellaneous Tasks

- Fix make run-db [`944c0d`](https://github.com/reearth/reearth-visualizer/commit/944c0d)

## 0.11.0 - 2022-10-04

### Web

### 🔧 Bug Fixes

- Installed plugins are not displayed expectedly [`12d546`](https://github.com/reearth/reearth-visualizer-web/commit/12d546)

### 🚀 Features

- Add 3D OSM building tiles ([#315](https://github.com/reearth/reearth-visualizer-web/pull/315)) [`2eb89a`](https://github.com/reearth/reearth-visualizer-web/commit/2eb89a)
- Extend plugin API with camera control ([#311](https://github.com/reearth/reearth-visualizer-web/pull/311)) [`c1190b`](https://github.com/reearth/reearth-visualizer-web/commit/c1190b)
- Extend plugin api with captureScreen ([#310](https://github.com/reearth/reearth-visualizer-web/pull/310)) [`f03022`](https://github.com/reearth/reearth-visualizer-web/commit/f03022)
- Small update to dashboard UI&#x2F;UX and add marketplace button [`f580e6`](https://github.com/reearth/reearth-visualizer-web/commit/f580e6)
- Add global modal component and extension location ([#302](https://github.com/reearth/reearth-visualizer-web/pull/302)) [`7362aa`](https://github.com/reearth/reearth-visualizer-web/commit/7362aa)
- Add overlay warning to earth editor if browser width is too narrow ([#304](https://github.com/reearth/reearth-visualizer-web/pull/304)) [`7f5f91`](https://github.com/reearth/reearth-visualizer-web/commit/7f5f91)
- Add builtin timeline widget ([#285](https://github.com/reearth/reearth-visualizer-web/pull/285)) [`f774ee`](https://github.com/reearth/reearth-visualizer-web/commit/f774ee)
- Add plugin settings extension support ([#293](https://github.com/reearth/reearth-visualizer-web/pull/293)) [`abd1c2`](https://github.com/reearth/reearth-visualizer-web/commit/abd1c2)

### 🔧 Bug Fixes

- Remove &#x60;show&#x60; props from modal extension ([#321](https://github.com/reearth/reearth-visualizer-web/pull/321)) [`62eb73`](https://github.com/reearth/reearth-visualizer-web/commit/62eb73)
- Styles not working as expected in plugin ([#322](https://github.com/reearth/reearth-visualizer-web/pull/322)) [`21329d`](https://github.com/reearth/reearth-visualizer-web/commit/21329d)
- Small type error [`21c8bc`](https://github.com/reearth/reearth-visualizer-web/commit/21c8bc)
- Stop redirect when an error occurs on top page [`236354`](https://github.com/reearth/reearth-visualizer-web/commit/236354)
- Installed plugins are not correctly listed [`ec305d`](https://github.com/reearth/reearth-visualizer-web/commit/ec305d)
- Exposed plugin api add layer does not return layer id ([#320](https://github.com/reearth/reearth-visualizer-web/pull/320)) [`f504d2`](https://github.com/reearth/reearth-visualizer-web/commit/f504d2)
- Cannot to upgrade marketplace plugins ([#319](https://github.com/reearth/reearth-visualizer-web/pull/319)) [`444fce`](https://github.com/reearth/reearth-visualizer-web/commit/444fce)
- Timeline width exceeding browser width ([#316](https://github.com/reearth/reearth-visualizer-web/pull/316)) [`c6dbb3`](https://github.com/reearth/reearth-visualizer-web/commit/c6dbb3)
- 3d tile not updating until source type is selected ([#318](https://github.com/reearth/reearth-visualizer-web/pull/318)) [`49a07b`](https://github.com/reearth/reearth-visualizer-web/commit/49a07b)
- Wrapper styles in plugin section for plugin extension ([#317](https://github.com/reearth/reearth-visualizer-web/pull/317)) [`235440`](https://github.com/reearth/reearth-visualizer-web/commit/235440)
- Timeline speed bug ([#314](https://github.com/reearth/reearth-visualizer-web/pull/314)) [`984be8`](https://github.com/reearth/reearth-visualizer-web/commit/984be8)
- Pass extensions to a plugin library extension [`744154`](https://github.com/reearth/reearth-visualizer-web/commit/744154)
- Print errors when failed to load extensions [`35a63f`](https://github.com/reearth/reearth-visualizer-web/commit/35a63f)
- Icon button transition happening when undesired ([#313](https://github.com/reearth/reearth-visualizer-web/pull/313)) [`6a6d98`](https://github.com/reearth/reearth-visualizer-web/commit/6a6d98)
- Icon size being too small ([#309](https://github.com/reearth/reearth-visualizer-web/pull/309)) [`3574f0`](https://github.com/reearth/reearth-visualizer-web/commit/3574f0)
- Change query param used by marketplace to be more concise [`9ba28c`](https://github.com/reearth/reearth-visualizer-web/commit/9ba28c)
- Dashboard project name not showing ([#307](https://github.com/reearth/reearth-visualizer-web/pull/307)) [`6a30f5`](https://github.com/reearth/reearth-visualizer-web/commit/6a30f5)
- Plugin API update event gets called repeatedly, missing hook deps ([#306](https://github.com/reearth/reearth-visualizer-web/pull/306)) [`47ec24`](https://github.com/reearth/reearth-visualizer-web/commit/47ec24)
- Update cesium to 1.97.0 [`4d993a`](https://github.com/reearth/reearth-visualizer-web/commit/4d993a)
- Play button does not work and some unexpected style on timeline widget ([#305](https://github.com/reearth/reearth-visualizer-web/pull/305)) [`ce29a5`](https://github.com/reearth/reearth-visualizer-web/commit/ce29a5)
- Development error occurs when updating or DnD layers ([#299](https://github.com/reearth/reearth-visualizer-web/pull/299)) [`efd079`](https://github.com/reearth/reearth-visualizer-web/commit/efd079)
- Project creation not creating a scene before earth editor becoming accessible [`a0a03e`](https://github.com/reearth/reearth-visualizer-web/commit/a0a03e)
- Device settings menu icon getting squished ([#298](https://github.com/reearth/reearth-visualizer-web/pull/298)) [`91c312`](https://github.com/reearth/reearth-visualizer-web/commit/91c312)
- Remove unused GraphQL calls [`59f402`](https://github.com/reearth/reearth-visualizer-web/commit/59f402)

### 🎨 Styling

- Update button and icon UX [`75e6f4`](https://github.com/reearth/reearth-visualizer-web/commit/75e6f4)

### Miscellaneous Tasks

- Update dependency cesium to v1.97.0 ([#291](https://github.com/reearth/reearth-visualizer-web/pull/291)) [`dcdf93`](https://github.com/reearth/reearth-visualizer-web/commit/dcdf93)
- Add remaining props to plugin settings extensions ([#312](https://github.com/reearth/reearth-visualizer-web/pull/312)) [`893d32`](https://github.com/reearth/reearth-visualizer-web/commit/893d32)
- Plugin component supports modalContainer and popupContainer props ([#300](https://github.com/reearth/reearth-visualizer-web/pull/300)) [`fc5f58`](https://github.com/reearth/reearth-visualizer-web/commit/fc5f58)
- Update cesium to v1.96 ([#303](https://github.com/reearth/reearth-visualizer-web/pull/303)) [`4fc241`](https://github.com/reearth/reearth-visualizer-web/commit/4fc241)

### Server

#### 🚀 Features

- Notify plugin donwload to marketplace ([#341](https://github.com/reearth/reearth-visualizer/pull/341)) [`59f8a8`](https://github.com/reearth/reearth-visualizer/commit/59f8a8)
- Add 3D OSM building tiles ([#340](https://github.com/reearth/reearth-visualizer/pull/340)) [`b52132`](https://github.com/reearth/reearth-visualizer/commit/b52132)
- Allow defining policies to limit functionality on workspaces ([#325](https://github.com/reearth/reearth-visualizer/pull/325)) [`91ace0`](https://github.com/reearth/reearth-visualizer/commit/91ace0)

#### 🔧 Bug Fixes

- Prevent API caching [`76405b`](https://github.com/reearth/reearth-visualizer/commit/76405b)
- Auth server request indexes [`430da0`](https://github.com/reearth/reearth-visualizer/commit/430da0)
- Marketplace http client bug [`b652c8`](https://github.com/reearth/reearth-visualizer/commit/b652c8)
- Marketplace http client [`ce982d`](https://github.com/reearth/reearth-visualizer/commit/ce982d)
- Print marketplace donwload url [`6e1d50`](https://github.com/reearth/reearth-visualizer/commit/6e1d50)
- Marketplace client init [`752872`](https://github.com/reearth/reearth-visualizer/commit/752872)
- Support marketplace without auth [`4afe99`](https://github.com/reearth/reearth-visualizer/commit/4afe99)

#### ✨ Refactor

- Use mongox, update go to 1.19 ([#334](https://github.com/reearth/reearth-visualizer/pull/334)) [`cfff17`](https://github.com/reearth/reearth-visualizer/commit/cfff17)
- Separate Team from User, rename Team to Workspace ([#324](https://github.com/reearth/reearth-visualizer/pull/324)) [`03a94a`](https://github.com/reearth/reearth-visualizer/commit/03a94a)
- Replace some packages with reearthx ([#322](https://github.com/reearth/reearth-visualizer/pull/322)) [`3813a9`](https://github.com/reearth/reearth-visualizer/commit/3813a9)

#### 🧪 Testing

- Add package for e2e tests [`cf7ca5`](https://github.com/reearth/reearth-visualizer/commit/cf7ca5)

#### Miscellaneous Tasks

- Use reearthx logger [`6b6b21`](https://github.com/reearth/reearth-visualizer/commit/6b6b21)
- Upgrade mongo to v5 [`9d231d`](https://github.com/reearth/reearth-visualizer/commit/9d231d)
- Replace package name [`bc1ffe`](https://github.com/reearth/reearth-visualizer/commit/bc1ffe)

### Misc

#### 🚀 Features

- Installing plugins from marketplace ([#162](https://github.com/reearth/reearth-visualizer/pull/162)) [`276ef5`](https://github.com/reearth/reearth-visualizer/commit/276ef5)

#### 🔧 Bug Fixes

- Dataset fails to be loaded [`518f03`](https://github.com/reearth/reearth-visualizer/commit/518f03)

#### 📖 Documentation

- Update readme [`c8d2ec`](https://github.com/reearth/reearth-visualizer/commit/c8d2ec)

#### ✨ Refactor

- Use reearthx.authserver ([#335](https://github.com/reearth/reearth-visualizer/pull/335)) [`83dea5`](https://github.com/reearth/reearth-visualizer/commit/83dea5)

#### Miscellaneous Tasks

- Merge &#x60;reearth&#x2F;reearth-backend&#x60; ([#318](https://github.com/reearth/reearth-visualizer/pull/318)) [`98514b`](https://github.com/reearth/reearth-visualizer/commit/98514b)

### 

#### 🚀 Features

- Installing plugins from marketplace ([#162](https://github.com/reearth/reearth-visualizer/pull/162)) [`276ef5`](https://github.com/reearth/reearth-visualizer/commit/276ef5)

#### 🔧 Bug Fixes

- Dataset fails to be loaded [`518f03`](https://github.com/reearth/reearth-visualizer/commit/518f03)

#### 📖 Documentation

- Update readme [`c8d2ec`](https://github.com/reearth/reearth-visualizer/commit/c8d2ec)

#### ✨ Refactor

- Use reearthx.authserver ([#335](https://github.com/reearth/reearth-visualizer/pull/335)) [`83dea5`](https://github.com/reearth/reearth-visualizer/commit/83dea5)

#### Miscellaneous Tasks

- Merge &#x60;reearth&#x2F;reearth-backend&#x60; ([#318](https://github.com/reearth/reearth-visualizer/pull/318)) [`98514b`](https://github.com/reearth/reearth-visualizer/commit/98514b)

## 0.10.0 - 2022-08-10

### reearth-web

#### 🚀 Features

- Add mouse events to plugin API ([#280](https://github.com/reearth/reearth-visualizer-web/pull/280)) [`9445f0`](https://github.com/reearth/reearth-visualizer-web/commit/9445f0)

#### 🔧 Bug Fixes

- Select not working after pinch event on ipad ([#290](https://github.com/reearth/reearth-visualizer-web/pull/290)) [`821504`](https://github.com/reearth/reearth-visualizer-web/commit/821504)
- Translation for modal buttons [`7eead9`](https://github.com/reearth/reearth-visualizer-web/commit/7eead9)
- Plugin widget&[#39](https://github.com/reearth/reearth-visualizer-web/pull/39);s width using iframe&[#39](https://github.com/reearth/reearth-visualizer-web/pull/39);s default ([#283](https://github.com/reearth/reearth-visualizer-web/pull/283)) [`572da0`](https://github.com/reearth/reearth-visualizer-web/commit/572da0)
- Pointer events issues around widgets ([#279](https://github.com/reearth/reearth-visualizer-web/pull/279)) [`219ea4`](https://github.com/reearth/reearth-visualizer-web/commit/219ea4)

#### 🎨 Styling

- Fix icons of plugin install buttons ([#289](https://github.com/reearth/reearth-visualizer-web/pull/289)) [`af7a1b`](https://github.com/reearth/reearth-visualizer-web/commit/af7a1b)

#### 🧪 Testing

- Introduce vitest ([#284](https://github.com/reearth/reearth-visualizer-web/pull/284)) [`2152e0`](https://github.com/reearth/reearth-visualizer-web/commit/2152e0)

#### Miscellaneous Tasks

- Migrate to Vite, upgrade Cypress to v10 ([#287](https://github.com/reearth/reearth-visualizer-web/pull/287)) [`50f2b6`](https://github.com/reearth/reearth-visualizer-web/commit/50f2b6)
- Simplify ESLint config ([#282](https://github.com/reearth/reearth-visualizer-web/pull/282)) [`b3570a`](https://github.com/reearth/reearth-visualizer-web/commit/b3570a)
- Upgrade resium to v1.15.0 ([#281](https://github.com/reearth/reearth-visualizer-web/pull/281)) [`bd3968`](https://github.com/reearth/reearth-visualizer-web/commit/bd3968)
- Cosme changelog [`05084e`](https://github.com/reearth/reearth-visualizer-web/commit/05084e)
- Fix changelog [`48de86`](https://github.com/reearth/reearth-visualizer-web/commit/48de86)

### reearth-backend

#### 🚀 Features

- Configurable server host [`61b03a`](https://github.com/reearth/reearth-visualizer-backend/commit/61b03a)

#### Miscellaneous Tasks

- Add new frontend endpoint (for Vite@3) [`70fed0`](https://github.com/reearth/reearth-visualizer-backend/commit/70fed0)
- Fix changelog [skip ci] [`895a64`](https://github.com/reearth/reearth-visualizer-backend/commit/895a64)

## 0.9.0 - 2022-07-20

### reearth-web

#### 🚀 Features

- Plugin API to add layers ([#258](https://github.com/reearth/reearth-visualizer-web/pull/258)) [`6468e2`](https://github.com/reearth/reearth-visualizer-web/commit/6468e2)
- Change layer indicators from preset list ([#245](https://github.com/reearth/reearth-visualizer-web/pull/245)) [`db185e`](https://github.com/reearth/reearth-visualizer-web/commit/db185e)

#### 🔧 Bug Fixes

- Some menu not displayed at sidebar in proejct setting page [`7c0705`](https://github.com/reearth/reearth-visualizer-web/commit/7c0705)
- Nothing displayed at project setting page when there are many projects [`0a6744`](https://github.com/reearth/reearth-visualizer-web/commit/0a6744)
- Plugins do not work as expected, update quickjs-emscripten ([#276](https://github.com/reearth/reearth-visualizer-web/pull/276)) [`9336e6`](https://github.com/reearth/reearth-visualizer-web/commit/9336e6)
- Plugin editor changes do not take effect until run button is clicked ([#274](https://github.com/reearth/reearth-visualizer-web/pull/274)) [`39fdb2`](https://github.com/reearth/reearth-visualizer-web/commit/39fdb2)
- Storytelling widget does not get layers&[#39](https://github.com/reearth/reearth-visualizer-web/pull/39); title ([#273](https://github.com/reearth/reearth-visualizer-web/pull/273)) [`5ff72b`](https://github.com/reearth/reearth-visualizer-web/commit/5ff72b)
- Dataset icon not showing in layer list ([#275](https://github.com/reearth/reearth-visualizer-web/pull/275)) [`8dbc88`](https://github.com/reearth/reearth-visualizer-web/commit/8dbc88)
- Show full camera values in camera property field popup ([#270](https://github.com/reearth/reearth-visualizer-web/pull/270)) [`7d3eac`](https://github.com/reearth/reearth-visualizer-web/commit/7d3eac)
- Plugin dimensions and iframe issues ([#271](https://github.com/reearth/reearth-visualizer-web/pull/271)) [`f3a52a`](https://github.com/reearth/reearth-visualizer-web/commit/f3a52a)
- Camera jump not working ([#269](https://github.com/reearth/reearth-visualizer-web/pull/269)) [`48bbfe`](https://github.com/reearth/reearth-visualizer-web/commit/48bbfe)
- Layer select state not update properly ([#268](https://github.com/reearth/reearth-visualizer-web/pull/268)) [`5f7c69`](https://github.com/reearth/reearth-visualizer-web/commit/5f7c69)
- Unselect layer not work properly ([#266](https://github.com/reearth/reearth-visualizer-web/pull/266)) [`eb41da`](https://github.com/reearth/reearth-visualizer-web/commit/eb41da)
- Layer drag and drop does not work with indicators ([#265](https://github.com/reearth/reearth-visualizer-web/pull/265)) [`12ae04`](https://github.com/reearth/reearth-visualizer-web/commit/12ae04)
- Testing-library react 18 warnings ([#263](https://github.com/reearth/reearth-visualizer-web/pull/263)) [`4c9076`](https://github.com/reearth/reearth-visualizer-web/commit/4c9076)
- Auto fetch more items in dashboard page , project list , dataset page for big screens ([#255](https://github.com/reearth/reearth-visualizer-web/pull/255)) [`fb8bf9`](https://github.com/reearth/reearth-visualizer-web/commit/fb8bf9)
- Asset modal flushes when camera limiter is enabled ([#261](https://github.com/reearth/reearth-visualizer-web/pull/261)) [`204629`](https://github.com/reearth/reearth-visualizer-web/commit/204629)
- Not being able to override an image from the asset modal ([#260](https://github.com/reearth/reearth-visualizer-web/pull/260)) [`1d3c3f`](https://github.com/reearth/reearth-visualizer-web/commit/1d3c3f)
- Layers pane does not update after move layer or create folder  ([#259](https://github.com/reearth/reearth-visualizer-web/pull/259)) [`336d98`](https://github.com/reearth/reearth-visualizer-web/commit/336d98)
- Cesium flashes on camera change ([#257](https://github.com/reearth/reearth-visualizer-web/pull/257)) [`ad2c0e`](https://github.com/reearth/reearth-visualizer-web/commit/ad2c0e)
- Router typos ([#252](https://github.com/reearth/reearth-visualizer-web/pull/252)) [`19fcb6`](https://github.com/reearth/reearth-visualizer-web/commit/19fcb6)
- Dataset page showing errors on page refreshing  ([#253](https://github.com/reearth/reearth-visualizer-web/pull/253)) [`3f48e9`](https://github.com/reearth/reearth-visualizer-web/commit/3f48e9)

#### 🧪 Testing

- Fix test coverage target ([#272](https://github.com/reearth/reearth-visualizer-web/pull/272)) [`b9db10`](https://github.com/reearth/reearth-visualizer-web/commit/b9db10)

#### Miscellaneous Tasks

- Update dependency cesium to ^1.95.0 ([#262](https://github.com/reearth/reearth-visualizer-web/pull/262)) [`845e2a`](https://github.com/reearth/reearth-visualizer-web/commit/845e2a)
- Upgrade cesium [`363071`](https://github.com/reearth/reearth-visualizer-web/commit/363071)
- Upgrade to React 18 and switch to React Router ([#234](https://github.com/reearth/reearth-visualizer-web/pull/234)) [`b0e8e6`](https://github.com/reearth/reearth-visualizer-web/commit/b0e8e6)

### reearth-backend

#### 🚀 Features

- Change layer indicators from preset list from backend side ([#158](https://github.com/reearth/reearth-visualizer-backend/pull/158)) [`0267f1`](https://github.com/reearth/reearth-visualizer-backend/commit/0267f1)

#### 🔧 Bug Fixes

- Property fields in a property list cannot be removed ([#160](https://github.com/reearth/reearth-visualizer-backend/pull/160)) [`358237`](https://github.com/reearth/reearth-visualizer-backend/commit/358237)

#### 🧪 Testing

- Unit test for mongo auth request repo ([#159](https://github.com/reearth/reearth-visualizer-backend/pull/159)) [`5afc81`](https://github.com/reearth/reearth-visualizer-backend/commit/5afc81)

#### Miscellaneous Tasks

- Update Makefile to remove unused targets [`67780b`](https://github.com/reearth/reearth-visualizer-backend/commit/67780b)


## 0.8.0 - 2022-06-17

### reearth-web

#### 🚀 Features

- Add a basic timeline UI ([#232](https://github.com/reearth/reearth-visualizer-web/pull/232)) [`fc9732`](https://github.com/reearth/reearth-visualizer-web/commit/fc9732)
- Add infinite scroll for project lists and datasets in dashboard and setting pages ([#225](https://github.com/reearth/reearth-visualizer-web/pull/225)) [`28d377`](https://github.com/reearth/reearth-visualizer-web/commit/28d377)
- Adapt camera field to support 2d mode ([#233](https://github.com/reearth/reearth-visualizer-web/pull/233)) [`172de5`](https://github.com/reearth/reearth-visualizer-web/commit/172de5)
- Add scene property overriding to Re:Earth API ([#224](https://github.com/reearth/reearth-visualizer-web/pull/224)) [`b07603`](https://github.com/reearth/reearth-visualizer-web/commit/b07603)

#### 🔧 Bug Fixes

- Some plugin APIs were missing ([#248](https://github.com/reearth/reearth-visualizer-web/pull/248)) [`c83262`](https://github.com/reearth/reearth-visualizer-web/commit/c83262)
- Slight shift when capture a new position ([#246](https://github.com/reearth/reearth-visualizer-web/pull/246)) [`182406`](https://github.com/reearth/reearth-visualizer-web/commit/182406)
- Dataset counts are displayed incorrectly in dataset pane ([#235](https://github.com/reearth/reearth-visualizer-web/pull/235)) [`45a0c8`](https://github.com/reearth/reearth-visualizer-web/commit/45a0c8)
- Labeling hidden by marker symbol ([#238](https://github.com/reearth/reearth-visualizer-web/pull/238)) [`99c378`](https://github.com/reearth/reearth-visualizer-web/commit/99c378)
- Vertical position style in infobox image block ([#236](https://github.com/reearth/reearth-visualizer-web/pull/236)) [`647cf8`](https://github.com/reearth/reearth-visualizer-web/commit/647cf8)
- Unexpected values for theme and lang props of extension components [`723486`](https://github.com/reearth/reearth-visualizer-web/commit/723486)
- Wait until all extensions are loaded [`dfe2aa`](https://github.com/reearth/reearth-visualizer-web/commit/dfe2aa)
- Iframe not correctly sizing to plugin ([#230](https://github.com/reearth/reearth-visualizer-web/pull/230)) [`500ce8`](https://github.com/reearth/reearth-visualizer-web/commit/500ce8)
- Plugin API cameramove event is not emitted in published pages ([#227](https://github.com/reearth/reearth-visualizer-web/pull/227)) [`7a11b3`](https://github.com/reearth/reearth-visualizer-web/commit/7a11b3)

#### ✨ Refactor

- Migrate to react-intl from react-i18next ([#240](https://github.com/reearth/reearth-visualizer-web/pull/240)) [`404743`](https://github.com/reearth/reearth-visualizer-web/commit/404743)

#### 🧪 Testing

- Disable util/raf tests that do not always succeed [`45a450`](https://github.com/reearth/reearth-visualizer-web/commit/45a450)
- Fix unit test for utils/raf [`a060d9`](https://github.com/reearth/reearth-visualizer-web/commit/a060d9)
- Fix Cypress login test fails ([#241](https://github.com/reearth/reearth-visualizer-web/pull/241)) [`a5dbfb`](https://github.com/reearth/reearth-visualizer-web/commit/a5dbfb)

#### Miscellaneous Tasks

- Upgrade dependency cesium-dnd to 1.1.0 ([#244](https://github.com/reearth/reearth-visualizer-web/pull/244)) [`ba6b51`](https://github.com/reearth/reearth-visualizer-web/commit/ba6b51)
- Fix typos [`f98005`](https://github.com/reearth/reearth-visualizer-web/commit/f98005)
- Update config so extensionUrls can be declared in .env file for local development ([#237](https://github.com/reearth/reearth-visualizer-web/pull/237)) [`545b9e`](https://github.com/reearth/reearth-visualizer-web/commit/545b9e)

### reearth-backend

#### 🚀 Features

- Add totalCount field to DatasetSchema type of GraphQL schema ([#154](https://github.com/reearth/reearth-visualizer-backend/pull/154)) [`ab6334`](https://github.com/reearth/reearth-visualizer-backend/commit/ab6334)
- Add timeline settings to scene property ([#153](https://github.com/reearth/reearth-visualizer-backend/pull/153)) [`602ec0`](https://github.com/reearth/reearth-visualizer-backend/commit/602ec0)

#### 🔧 Bug Fixes

- Assets are not saved when files are uploaded ([#155](https://github.com/reearth/reearth-visualizer-backend/pull/155)) [`e444e4`](https://github.com/reearth/reearth-visualizer-backend/commit/e444e4)

#### ✨ Refactor

- Declarative description of use case structure (asset only) ([#151](https://github.com/reearth/reearth-visualizer-backend/pull/151)) [`c6e98c`](https://github.com/reearth/reearth-visualizer-backend/commit/c6e98c)

#### Miscellaneous Tasks

- Update go modules ([#150](https://github.com/reearth/reearth-visualizer-backend/pull/150)) [`6372bc`](https://github.com/reearth/reearth-visualizer-backend/commit/6372bc)

## 0.7.0 - 2022-05-17

### reearth-web

#### 🚀 Features

- Implementation of the avatar feature in workspaces screens ([#206](https://github.com/reearth/reearth-visualizer-web/pull/206)) [`42d7aa`](https://github.com/reearth/reearth-visualizer-web/commit/42d7aa)
- Update placehoder for color field ([#215](https://github.com/reearth/reearth-visualizer-web/pull/215)) [`c6c6e3`](https://github.com/reearth/reearth-visualizer-web/commit/c6c6e3)
- Add opacity field to map tiles ([#220](https://github.com/reearth/reearth-visualizer-web/pull/220)) [`006a8d`](https://github.com/reearth/reearth-visualizer-web/commit/006a8d)

#### 🔧 Bug Fixes

- Dropdown styles in right panel break when selected item's name is too long [`9a5993`](https://github.com/reearth/reearth-visualizer-web/commit/9a5993)
- Dashboard not updating on project creation [`4b5478`](https://github.com/reearth/reearth-visualizer-web/commit/4b5478)
- Query names in refetchQueries not updated ([#222](https://github.com/reearth/reearth-visualizer-web/pull/222)) [`711712`](https://github.com/reearth/reearth-visualizer-web/commit/711712)
- Published page uses GraphQL and reports errors [`3e3e45`](https://github.com/reearth/reearth-visualizer-web/commit/3e3e45)

#### ✨ Refactor

- Queries/mutation code into a single directory ([#208](https://github.com/reearth/reearth-visualizer-web/pull/208)) [`2afc16`](https://github.com/reearth/reearth-visualizer-web/commit/2afc16)
- Property, scene, tag, user, widget and workspace gql query files ([#221](https://github.com/reearth/reearth-visualizer-web/pull/221)) [`3bf421`](https://github.com/reearth/reearth-visualizer-web/commit/3bf421)

#### Miscellaneous Tasks

- Introduce i18next ([#212](https://github.com/reearth/reearth-visualizer-web/pull/212)) [`0ac0c2`](https://github.com/reearth/reearth-visualizer-web/commit/0ac0c2)
- Add reference to style guide in README [`e29024`](https://github.com/reearth/reearth-visualizer-web/commit/e29024)
- Add useT hook to i18n ([#223](https://github.com/reearth/reearth-visualizer-web/pull/223)) [`b96177`](https://github.com/reearth/reearth-visualizer-web/commit/b96177)
- Update dependency cesium to ^1.93.0 ([#216](https://github.com/reearth/reearth-visualizer-web/pull/216)) [`06b563`](https://github.com/reearth/reearth-visualizer-web/commit/06b563)
- Update all dependencies ([#226](https://github.com/reearth/reearth-visualizer-web/pull/226)) [`36fb79`](https://github.com/reearth/reearth-visualizer-web/commit/36fb79)

#### Refactor

- Clean gql pt1 asset ([#217](https://github.com/reearth/reearth-visualizer-web/pull/217)) [`b88a8c`](https://github.com/reearth/reearth-visualizer-web/commit/b88a8c)
- Cluster, dataset, infobox, layer, plugin and project gql query files ([#219](https://github.com/reearth/reearth-visualizer-web/pull/219)) [`e4dae9`](https://github.com/reearth/reearth-visualizer-web/commit/e4dae9)

### reearth-backend

#### 🚀 Features

- Add an opacity slider to map tiles ([#138](https://github.com/reearth/reearth-visualizer-backend/pull/138)) [`4f72b8`](https://github.com/reearth/reearth-visualizer-backend/commit/4f72b8)

#### 🔧 Bug Fixes

- Signup api requires password field [`a79376`](https://github.com/reearth/reearth-visualizer-backend/commit/a79376)
- "$in needs an array" error from mongo FindByIDs ([#142](https://github.com/reearth/reearth-visualizer-backend/pull/142)) [`58e1b0`](https://github.com/reearth/reearth-visualizer-backend/commit/58e1b0)
- Name field is available again in signup api ([#144](https://github.com/reearth/reearth-visualizer-backend/pull/144)) [`651852`](https://github.com/reearth/reearth-visualizer-backend/commit/651852)

#### ✨ Refactor

- Retry mongo lock ([#145](https://github.com/reearth/reearth-visualizer-backend/pull/145)) [`ddaeaa`](https://github.com/reearth/reearth-visualizer-backend/commit/ddaeaa)

#### 🧪 Testing

- Add Mongo Asset's [`FindByID`](https://github.com/reearth/reearth-visualizer-backend/commit/FindByID) unit testing ([#139](https://github.com/reearth/reearth-visualizer-backend/pull/139)) [`35f9db`](https://github.com/reearth/reearth-visualizer-backend/commit/35f9db)
- Refactor mongo connect helper function [`751e66`](https://github.com/reearth/reearth-visualizer-backend/commit/751e66)
- Util.SyncMap.Range test sometimes fails ([#143](https://github.com/reearth/reearth-visualizer-backend/pull/143)) [`c2b969`](https://github.com/reearth/reearth-visualizer-backend/commit/c2b969)

#### Miscellaneous Tasks

- Typo [`secrit`](https://github.com/reearth/reearth-visualizer-backend/commit/secrit) on env example ([#137](https://github.com/reearth/reearth-visualizer-backend/pull/137)) [`2c0220`](https://github.com/reearth/reearth-visualizer-backend/commit/2c0220)
- Update the go modules ([#146](https://github.com/reearth/reearth-visualizer-backend/pull/146)) [`89009b`](https://github.com/reearth/reearth-visualizer-backend/commit/89009b)

## 0.6.1 - 2022-04-20

### reearth-web

#### 🚀 Features

- Extend project publish settings and dataset import modal functionality through extension API ([#200](https://github.com/reearth/reearth-visualizer-web/pull/200)) [`96aa56`](https://github.com/reearth/reearth-visualizer-web/commit/96aa56)

#### 🔧 Bug Fixes

- Redirect after esc button in any setting page ([#193](https://github.com/reearth/reearth-visualizer-web/pull/193)) [`c8ec35`](https://github.com/reearth/reearth-visualizer-web/commit/c8ec35)

#### Miscellaneous Tasks

- Follow GraphQL schema updates ([#209](https://github.com/reearth/reearth-visualizer-web/pull/209)) [`8d9e75`](https://github.com/reearth/reearth-visualizer-web/commit/8d9e75)
- Update all dependencies ([#210](https://github.com/reearth/reearth-visualizer-web/pull/210)) [`c22b7a`](https://github.com/reearth/reearth-visualizer-web/commit/c22b7a)

### reearth-backend

#### 🔧 Bug Fixes

- Renovate bot not running on schedule ([#136](https://github.com/reearth/reearth-visualizer-backend/pull/136)) [`82843f`](https://github.com/reearth/reearth-visualizer-backend/commit/82843f)
- Aud was changed and jwt could not be validated correctly [`985100`](https://github.com/reearth/reearth-visualizer-backend/commit/985100)
- Auth audiences were unintentionally required [`7ec76a`](https://github.com/reearth/reearth-visualizer-backend/commit/7ec76a)

#### ✨ Refactor

- Introduce generics, reorganize GraphQL schema ([#135](https://github.com/reearth/reearth-visualizer-backend/pull/135)) [`04a098`](https://github.com/reearth/reearth-visualizer-backend/commit/04a098)

#### Miscellaneous Tasks

- Update dependencies ([#134](https://github.com/reearth/reearth-visualizer-backend/pull/134)) [`1b9b6b`](https://github.com/reearth/reearth-visualizer-backend/commit/1b9b6b)

## 0.6.0 - 2022-04-08

### reearth-web

#### 🚀 Features

- Add a plugin API to resize iframe by plugins ([#181](https://github.com/reearth/reearth-visualizer-web/pull/181)) [`7c1019`](https://github.com/reearth/reearth-visualizer-web/commit/7c1019)
- Authentication ([#121](https://github.com/reearth/reearth-visualizer-web/pull/121)) [`b63018`](https://github.com/reearth/reearth-visualizer-web/commit/b63018)
- Infinite scroll on assets ([#130](https://github.com/reearth/reearth-visualizer-web/pull/130)) [`11f2f2`](https://github.com/reearth/reearth-visualizer-web/commit/11f2f2)
- Basic plugin editor ([#184](https://github.com/reearth/reearth-visualizer-web/pull/184)) [`1c4e09`](https://github.com/reearth/reearth-visualizer-web/commit/1c4e09)

#### 🔧 Bug Fixes

- Unable to type RGBA values ([#180](https://github.com/reearth/reearth-visualizer-web/pull/180)) [`f7345c`](https://github.com/reearth/reearth-visualizer-web/commit/f7345c)
- Small height of block plugins [`8070a3`](https://github.com/reearth/reearth-visualizer-web/commit/8070a3)
- Button widget squishing its text & infobox mask click away ([#185](https://github.com/reearth/reearth-visualizer-web/pull/185)) [`ac7ef0`](https://github.com/reearth/reearth-visualizer-web/commit/ac7ef0)
- Cannot select layers that activate infobox mask ([#186](https://github.com/reearth/reearth-visualizer-web/pull/186)) [`d824b6`](https://github.com/reearth/reearth-visualizer-web/commit/d824b6)
- Display error messages from auth server ([#187](https://github.com/reearth/reearth-visualizer-web/pull/187)) [`e19fab`](https://github.com/reearth/reearth-visualizer-web/commit/e19fab)
- Duplicate asset results ([#188](https://github.com/reearth/reearth-visualizer-web/pull/188)) [`b3eb7f`](https://github.com/reearth/reearth-visualizer-web/commit/b3eb7f)
- Workspace name cannot be changed, error displayed when deleting assets ([#189](https://github.com/reearth/reearth-visualizer-web/pull/189)) [`a99cf3`](https://github.com/reearth/reearth-visualizer-web/commit/a99cf3)
- Multiple assets in infinite scroll and datasets not showing in DatasetPane  ([#192](https://github.com/reearth/reearth-visualizer-web/pull/192)) [`6f5c93`](https://github.com/reearth/reearth-visualizer-web/commit/6f5c93)
- Asset modal showing only image-based assets ([#196](https://github.com/reearth/reearth-visualizer-web/pull/196)) [`83a6bf`](https://github.com/reearth/reearth-visualizer-web/commit/83a6bf)
- Screen becomes inoperable when errors occur in sign up [`820a04`](https://github.com/reearth/reearth-visualizer-web/commit/820a04)
- Add missing translations [`a4c237`](https://github.com/reearth/reearth-visualizer-web/commit/a4c237)

#### Miscellaneous Tasks

- Update dependency cesium to ^1.91.0 ([#182](https://github.com/reearth/reearth-visualizer-web/pull/182)) [`603a5c`](https://github.com/reearth/reearth-visualizer-web/commit/603a5c)
- Set default auth config to start app with zero configuration ([#191](https://github.com/reearth/reearth-visualizer-web/pull/191)) [`d5a2aa`](https://github.com/reearth/reearth-visualizer-web/commit/d5a2aa)

### reearth-backend

#### 🚀 Features

- Authentication system ([#108](https://github.com/reearth/reearth-visualizer-backend/pull/108)) [`b89c32`](https://github.com/reearth/reearth-visualizer-backend/commit/b89c32)
- Default mailer that outputs mails into stdout [`aab26c`](https://github.com/reearth/reearth-visualizer-backend/commit/aab26c)
- Assets filtering & pagination ([#81](https://github.com/reearth/reearth-visualizer-backend/pull/81)) [`739943`](https://github.com/reearth/reearth-visualizer-backend/commit/739943)
- Support sign up with information provided by OIDC providers ([#130](https://github.com/reearth/reearth-visualizer-backend/pull/130)) [`fef60e`](https://github.com/reearth/reearth-visualizer-backend/commit/fef60e)

#### 🔧 Bug Fixes

- Load auth client domain from config ([#124](https://github.com/reearth/reearth-visualizer-backend/pull/124)) [`9bde8a`](https://github.com/reearth/reearth-visualizer-backend/commit/9bde8a)
- Signup fails when password is not set [`27c2f0`](https://github.com/reearth/reearth-visualizer-backend/commit/27c2f0)
- Logger panics [`d1e3a8`](https://github.com/reearth/reearth-visualizer-backend/commit/d1e3a8)
- Set auth server dev mode automatically [`83a66a`](https://github.com/reearth/reearth-visualizer-backend/commit/83a66a)
- Auth server bugs and auth client bugs ([#125](https://github.com/reearth/reearth-visualizer-backend/pull/125)) [`ce2309`](https://github.com/reearth/reearth-visualizer-backend/commit/ce2309)
- Auth0 setting is not used by JWT verification middleware [`232e75`](https://github.com/reearth/reearth-visualizer-backend/commit/232e75)
- Invalid mongo queries of pagination [`7caf68`](https://github.com/reearth/reearth-visualizer-backend/commit/7caf68)
- Auth config not loaded expectedly [`570fe7`](https://github.com/reearth/reearth-visualizer-backend/commit/570fe7)
- Users cannot creates a new team and scene [`5df25f`](https://github.com/reearth/reearth-visualizer-backend/commit/5df25f)
- Auth server certificate is not saved as pem format [`982a71`](https://github.com/reearth/reearth-visualizer-backend/commit/982a71)
- Repo filters are not merged expectedly [`f4cc3f`](https://github.com/reearth/reearth-visualizer-backend/commit/f4cc3f)
- Auth is no longer required for GraphQL endpoint [`58a6d1`](https://github.com/reearth/reearth-visualizer-backend/commit/58a6d1)
- Rename auth srv default client ID ([#128](https://github.com/reearth/reearth-visualizer-backend/pull/128)) [`89adc3`](https://github.com/reearth/reearth-visualizer-backend/commit/89adc3)
- Signup API is disabled when auth server is disabled, users and auth requests in mongo cannot be deleted ([#132](https://github.com/reearth/reearth-visualizer-backend/pull/132)) [`47be6a`](https://github.com/reearth/reearth-visualizer-backend/commit/47be6a)
- Auth to work with zero config ([#131](https://github.com/reearth/reearth-visualizer-backend/pull/131)) [`3cbb45`](https://github.com/reearth/reearth-visualizer-backend/commit/3cbb45)
- Property.SchemaListMap.List test fails [`3e6dff`](https://github.com/reearth/reearth-visualizer-backend/commit/3e6dff)
- Errors when auth srv domain is not specified [`10691a`](https://github.com/reearth/reearth-visualizer-backend/commit/10691a)
- Errors when auth srv domain is not specified [`648073`](https://github.com/reearth/reearth-visualizer-backend/commit/648073)
- Login redirect does not work [`cb6ca4`](https://github.com/reearth/reearth-visualizer-backend/commit/cb6ca4)
- Enable auth srv dev mode when no domain is specified [`0c0e28`](https://github.com/reearth/reearth-visualizer-backend/commit/0c0e28)
- Add a trailing slash to jwt audiences [`e96f78`](https://github.com/reearth/reearth-visualizer-backend/commit/e96f78)
- Allow separate auth server ui domain [`0ce79f`](https://github.com/reearth/reearth-visualizer-backend/commit/0ce79f)

#### ⚡️ Performance

- Reduce database queries to obtain scene IDs ([#119](https://github.com/reearth/reearth-visualizer-backend/pull/119)) [`784332`](https://github.com/reearth/reearth-visualizer-backend/commit/784332)

#### ✨ Refactor

- Remove filter args from repos to prevent implementation errors in the use case layer ([#122](https://github.com/reearth/reearth-visualizer-backend/pull/122)) [`82cf28`](https://github.com/reearth/reearth-visualizer-backend/commit/82cf28)
- Http api to export layers [`3f2582`](https://github.com/reearth/reearth-visualizer-backend/commit/3f2582)

#### Miscellaneous Tasks

- Update dependencies ([#117](https://github.com/reearth/reearth-visualizer-backend/pull/117)) [`d1a38e`](https://github.com/reearth/reearth-visualizer-backend/commit/d1a38e)
- Update docker-compose config [`83f9b1`](https://github.com/reearth/reearth-visualizer-backend/commit/83f9b1)
- Add log for GraphQL Playground endpoint ([#133](https://github.com/reearth/reearth-visualizer-backend/pull/133)) [`adeda4`](https://github.com/reearth/reearth-visualizer-backend/commit/adeda4)

## 0.5.0 - 2022-02-24

### reearth-web

#### 🚀 Features

- Allowing widget and block plugins to resize when they are expandable ([#170](https://github.com/reearth/reearth-visualizer-web/pull/170)) [`4fdf5f`](https://github.com/reearth/reearth-visualizer-web/commit/4fdf5f)
- Plugin APIs to get camera viewport and layers in the viewport ([#165](https://github.com/reearth/reearth-visualizer-web/pull/165)) [`f1f95a`](https://github.com/reearth/reearth-visualizer-web/commit/f1f95a)
- Improving the Infobox style  ([#176](https://github.com/reearth/reearth-visualizer-web/pull/176)) [`f1ddda`](https://github.com/reearth/reearth-visualizer-web/commit/f1ddda)

#### 🔧 Bug Fixes

- Plugin blocks cannot be deleted ([#164](https://github.com/reearth/reearth-visualizer-web/pull/164)) [`a4f17f`](https://github.com/reearth/reearth-visualizer-web/commit/a4f17f)
- Support tree-structured layers and tags in published pages ([#168](https://github.com/reearth/reearth-visualizer-web/pull/168)) [`17d968`](https://github.com/reearth/reearth-visualizer-web/commit/17d968)
- Workspace settings does not refresh ([#167](https://github.com/reearth/reearth-visualizer-web/pull/167)) [`0f3654`](https://github.com/reearth/reearth-visualizer-web/commit/0f3654)
- Plugin layersInViewport API returns errors for layers that have no location fields [`e52b44`](https://github.com/reearth/reearth-visualizer-web/commit/e52b44)

#### ✨ Refactor

- Format codes [`219ac6`](https://github.com/reearth/reearth-visualizer-web/commit/219ac6)
- Format codes [`4e5b61`](https://github.com/reearth/reearth-visualizer-web/commit/4e5b61)

#### Miscellaneous Tasks

- Upgrade dependencies ([#175](https://github.com/reearth/reearth-visualizer-web/pull/175)) [`dba959`](https://github.com/reearth/reearth-visualizer-web/commit/dba959)

### reearth-backend

#### 🚀 Features

- Implement property.Diff and plugin/manifest.Diff ([#107](https://github.com/reearth/reearth-visualizer-backend/pull/107)) [`700269`](https://github.com/reearth/reearth-visualizer-backend/commit/700269)
- Support 3rd party plugin translation ([#109](https://github.com/reearth/reearth-visualizer-backend/pull/109)) [`67a618`](https://github.com/reearth/reearth-visualizer-backend/commit/67a618)
- Improve the Infobox style (manifest) ([#110](https://github.com/reearth/reearth-visualizer-backend/pull/110)) [`7aebcd`](https://github.com/reearth/reearth-visualizer-backend/commit/7aebcd)
- Overwrite installation of new plug-ins without removing (automatic property migration) ([#113](https://github.com/reearth/reearth-visualizer-backend/pull/113)) [`2dc192`](https://github.com/reearth/reearth-visualizer-backend/commit/2dc192)
- Update infobox style fields ([#115](https://github.com/reearth/reearth-visualizer-backend/pull/115)) [`608436`](https://github.com/reearth/reearth-visualizer-backend/commit/608436)

#### 🔧 Bug Fixes

- Scene exporter should export layers and tags while maintaining the tree structure ([#104](https://github.com/reearth/reearth-visualizer-backend/pull/104)) [`805d78`](https://github.com/reearth/reearth-visualizer-backend/commit/805d78)
- Property field in groups in list cannot be updated correctly [`5009c5`](https://github.com/reearth/reearth-visualizer-backend/commit/5009c5)
- Scenes and properties are not updated properly when plugin is updated [`861c4b`](https://github.com/reearth/reearth-visualizer-backend/commit/861c4b)
- Scene widgets and blocks are not update properly when plugin is updated [`f66f9a`](https://github.com/reearth/reearth-visualizer-backend/commit/f66f9a)

#### ✨ Refactor

- Graphql resolvers ([#105](https://github.com/reearth/reearth-visualizer-backend/pull/105)) [`01a4e6`](https://github.com/reearth/reearth-visualizer-backend/commit/01a4e6)

#### Miscellaneous Tasks

- Update all dependencies ([#111](https://github.com/reearth/reearth-visualizer-backend/pull/111)) [`173881`](https://github.com/reearth/reearth-visualizer-backend/commit/173881)
- Increase batch size of db migration [ci skip] [`fbbca4`](https://github.com/reearth/reearth-visualizer-backend/commit/fbbca4)

## 0.4.0 - 2022-01-27

### reearth-web

#### 🚀 Features

- Add "clamp to filed" option to file primitive ([#155](https://github.com/reearth/reearth-visualizer-web/pull/155)) [`2e83ba`](https://github.com/reearth/reearth-visualizer-web/commit/2e83ba)
- Infobox padding ([#158](https://github.com/reearth/reearth-visualizer-web/pull/158)) [`90084f`](https://github.com/reearth/reearth-visualizer-web/commit/90084f)
- Support tags in plugin API ([#153](https://github.com/reearth/reearth-visualizer-web/pull/153)) [`1031c5`](https://github.com/reearth/reearth-visualizer-web/commit/1031c5)

#### 🔧 Bug Fixes

- Enable to select blocks of plugins ([#162](https://github.com/reearth/reearth-visualizer-web/pull/162)) [`458402`](https://github.com/reearth/reearth-visualizer-web/commit/458402)
- Cesium Ion acces token is not set expectedly ([#160](https://github.com/reearth/reearth-visualizer-web/pull/160)) [`e8e183`](https://github.com/reearth/reearth-visualizer-web/commit/e8e183)
- Cluster styling issue ([#161](https://github.com/reearth/reearth-visualizer-web/pull/161)) [`c78872`](https://github.com/reearth/reearth-visualizer-web/commit/c78872)
- Clusters and layers are not displayed correctly [`4fc124`](https://github.com/reearth/reearth-visualizer-web/commit/4fc124)
- Type error [`b01bc7`](https://github.com/reearth/reearth-visualizer-web/commit/b01bc7)
- The style of infobox block dropdown list is broken ([#163](https://github.com/reearth/reearth-visualizer-web/pull/163)) [`6e02a9`](https://github.com/reearth/reearth-visualizer-web/commit/6e02a9)
- Plugin blocks protrude from the infobox [`6cf0d3`](https://github.com/reearth/reearth-visualizer-web/commit/6cf0d3)

#### ✨ Refactor

- Layer clustering feature ([#157](https://github.com/reearth/reearth-visualizer-web/pull/157)) [`db6e6c`](https://github.com/reearth/reearth-visualizer-web/commit/db6e6c)
- Camera limiter ([#149](https://github.com/reearth/reearth-visualizer-web/pull/149)) [`105428`](https://github.com/reearth/reearth-visualizer-web/commit/105428)
- Layer clustering feature (GraphQL) ([#159](https://github.com/reearth/reearth-visualizer-web/pull/159)) [`4365b8`](https://github.com/reearth/reearth-visualizer-web/commit/4365b8)

### reearth-backend

#### 🚀 Features

- Add "clamp to ground" option to file primitive ([#95](https://github.com/reearth/reearth-visualizer-backend/pull/95)) [`559194`](https://github.com/reearth/reearth-visualizer-backend/commit/559194)
- Infobox and text block padding ([#100](https://github.com/reearth/reearth-visualizer-backend/pull/100)) [`ddd0db`](https://github.com/reearth/reearth-visualizer-backend/commit/ddd0db)

#### ⚡️ Performance

- Add indexes of mongo collections ([#98](https://github.com/reearth/reearth-visualizer-backend/pull/98)) [`691cb7`](https://github.com/reearth/reearth-visualizer-backend/commit/691cb7)

#### ✨ Refactor

- Pkg/id, use ID aliases, move JSON schemas ([#97](https://github.com/reearth/reearth-visualizer-backend/pull/97)) [`1265ac`](https://github.com/reearth/reearth-visualizer-backend/commit/1265ac)
- Unit tests ([#99](https://github.com/reearth/reearth-visualizer-backend/pull/99)) [`0d112c`](https://github.com/reearth/reearth-visualizer-backend/commit/0d112c)
- Pkg/property, pkg/layer, pkg/plugin ([#101](https://github.com/reearth/reearth-visualizer-backend/pull/101)) [`17a463`](https://github.com/reearth/reearth-visualizer-backend/commit/17a463)

## 0.3.0 - 2022-01-11

### reearth-web

#### 🚀 Features

- Enhance terrain feature (type selection, exaggeration) ([#138](https://github.com/reearth/reearth-visualizer-web/pull/138)) [`dae137`](https://github.com/reearth/reearth-visualizer-web/commit/dae137)
- Clustering layers ([#143](https://github.com/reearth/reearth-visualizer-web/pull/143)) [`3439cc`](https://github.com/reearth/reearth-visualizer-web/commit/3439cc)
- Camera limiter ([#142](https://github.com/reearth/reearth-visualizer-web/pull/142)) [`dec1dd`](https://github.com/reearth/reearth-visualizer-web/commit/dec1dd)
- Tagging of layers ([#144](https://github.com/reearth/reearth-visualizer-web/pull/144)) [`4d0a40`](https://github.com/reearth/reearth-visualizer-web/commit/4d0a40)

#### 🔧 Bug Fixes

- Indicator is not displayed on selecting of clustered layer ([#146](https://github.com/reearth/reearth-visualizer-web/pull/146)) [`e41f67`](https://github.com/reearth/reearth-visualizer-web/commit/e41f67)
- Use data URL for marker images [`576ea4`](https://github.com/reearth/reearth-visualizer-web/commit/576ea4)
- Layer clusters do not updated correctly [`ec74f6`](https://github.com/reearth/reearth-visualizer-web/commit/ec74f6)
- Position label in front of billboard ([#147](https://github.com/reearth/reearth-visualizer-web/pull/147)) [`81c533`](https://github.com/reearth/reearth-visualizer-web/commit/81c533)
- Public pages do not work due to clustering feature [`48d8b3`](https://github.com/reearth/reearth-visualizer-web/commit/48d8b3)
- Photooverlay transition does not work in Android ([#154](https://github.com/reearth/reearth-visualizer-web/pull/154)) [`decbfe`](https://github.com/reearth/reearth-visualizer-web/commit/decbfe)

#### 🎨 Styling

- Fix the height of the header [`9d6acc`](https://github.com/reearth/reearth-visualizer-web/commit/9d6acc)

#### Miscellaneous Tasks

- Upgrade dependencies ([#134](https://github.com/reearth/reearth-visualizer-web/pull/134)) [`740821`](https://github.com/reearth/reearth-visualizer-web/commit/740821)
- Update dependency cesium to ^1.88.0 ([#139](https://github.com/reearth/reearth-visualizer-web/pull/139)) [`7afdfb`](https://github.com/reearth/reearth-visualizer-web/commit/7afdfb)
- Fix webpack dev server config [`8d06fa`](https://github.com/reearth/reearth-visualizer-web/commit/8d06fa)
- Update dependency cesium to ^1.89.0 ([#156](https://github.com/reearth/reearth-visualizer-web/pull/156)) [`d436ce`](https://github.com/reearth/reearth-visualizer-web/commit/d436ce)

### reearth-backend

#### 🚀 Features

- Clusters for scenes ([#75](https://github.com/reearth/reearth-visualizer-backend/pull/75)) [`3512c0`](https://github.com/reearth/reearth-visualizer-backend/commit/3512c0)
- Add fields of scene property for terrain [`8693b4`](https://github.com/reearth/reearth-visualizer-backend/commit/8693b4)
- Camera limiter  ([#87](https://github.com/reearth/reearth-visualizer-backend/pull/87)) [`63c582`](https://github.com/reearth/reearth-visualizer-backend/commit/63c582)

#### 🔧 Bug Fixes

- Terrain fields of scene property [`5e3d25`](https://github.com/reearth/reearth-visualizer-backend/commit/5e3d25)
- Numbers are not decoded from gql to value [`2ddbc8`](https://github.com/reearth/reearth-visualizer-backend/commit/2ddbc8)
- Layers have their own tags separate from the scene ([#90](https://github.com/reearth/reearth-visualizer-backend/pull/90)) [`c4fb9a`](https://github.com/reearth/reearth-visualizer-backend/commit/c4fb9a)
- Return property with clusters data ([#89](https://github.com/reearth/reearth-visualizer-backend/pull/89)) [`1b99c6`](https://github.com/reearth/reearth-visualizer-backend/commit/1b99c6)
- Cast values, rename value.OptionalValue ([#93](https://github.com/reearth/reearth-visualizer-backend/pull/93)) [`ba4b18`](https://github.com/reearth/reearth-visualizer-backend/commit/ba4b18)
- Synchronize mongo migration ([#94](https://github.com/reearth/reearth-visualizer-backend/pull/94)) [`db4cea`](https://github.com/reearth/reearth-visualizer-backend/commit/db4cea)

#### 📖 Documentation

- Add pkg.go.dev badge to readme [`91f9b3`](https://github.com/reearth/reearth-visualizer-backend/commit/91f9b3)

#### ✨ Refactor

- Make property.Value and dataset.Value independent in pkg/value ([#77](https://github.com/reearth/reearth-visualizer-backend/pull/77)) [`73143b`](https://github.com/reearth/reearth-visualizer-backend/commit/73143b)

#### Miscellaneous Tasks

- Fix plugin manifest JSON schema [`2b57b1`](https://github.com/reearth/reearth-visualizer-backend/commit/2b57b1)


## 0.2.0 - 2021-11-18

#### reearth-web

#### 🚀 Features

- Widget align system for mobile ([#115](https://github.com/reearth/reearth-visualizer-web/pull/115)) [`afa4ba`](https://github.com/reearth/reearth-visualizer-web/commit/afa4ba)
- Support dataset schema preview and create layer group from selected primitive type ([#74](https://github.com/reearth/reearth-visualizer-web/pull/74)) [`769b86`](https://github.com/reearth/reearth-visualizer-web/commit/769b86)

#### 🔧 Bug Fixes

- Markdown background color is not transparent ([#123](https://github.com/reearth/reearth-visualizer-web/pull/123)) [`f16706`](https://github.com/reearth/reearth-visualizer-web/commit/f16706)
- Layers would not be marshalled correctly ([#126](https://github.com/reearth/reearth-visualizer-web/pull/126)) [`886302`](https://github.com/reearth/reearth-visualizer-web/commit/886302)
- Widget align system issues ([#124](https://github.com/reearth/reearth-visualizer-web/pull/124)) [`3bc9fa`](https://github.com/reearth/reearth-visualizer-web/commit/3bc9fa)
- Project setting page does not display correctly after creating a new project ([#127](https://github.com/reearth/reearth-visualizer-web/pull/127)) [`c120dc`](https://github.com/reearth/reearth-visualizer-web/commit/c120dc)
- Dataset info pane shows its property though after selected dataset schema is deleted ([#131](https://github.com/reearth/reearth-visualizer-web/pull/131)) [`2307d8`](https://github.com/reearth/reearth-visualizer-web/commit/2307d8)

#### Miscellaneous Tasks

- Disable storybook workflow for release commit [`80f4d2`](https://github.com/reearth/reearth-visualizer-web/commit/80f4d2)
- Change semantic commit type of renovate PRs, omit ci skip in changelog [`4a3e9e`](https://github.com/reearth/reearth-visualizer-web/commit/4a3e9e)
- Follow backend GraphQL schema update ([#120](https://github.com/reearth/reearth-visualizer-web/pull/120)) [`aeee1f`](https://github.com/reearth/reearth-visualizer-web/commit/aeee1f)
- Load local reearth-config.json for debugging ([#119](https://github.com/reearth/reearth-visualizer-web/pull/119)) [`6115ee`](https://github.com/reearth/reearth-visualizer-web/commit/6115ee)
- Update dependency cesium to ^1.87.0 ([#118](https://github.com/reearth/reearth-visualizer-web/pull/118)) [`7c65d0`](https://github.com/reearth/reearth-visualizer-web/commit/7c65d0)
- Update dependency cesium to ^1.87.1 ([#128](https://github.com/reearth/reearth-visualizer-web/pull/128)) [`a63aa7`](https://github.com/reearth/reearth-visualizer-web/commit/a63aa7)
- Update codecov.yml to add ignored files [`b72f17`](https://github.com/reearth/reearth-visualizer-web/commit/b72f17)


### reearth-backend

#### 🚀 Features

- Support opentelemetry ([#68](https://github.com/reearth/reearth-visualizer-backend/pull/68)) [`25c581`](https://github.com/reearth/reearth-visualizer-backend/commit/25c581)

#### 🔧 Bug Fixes

- Add an index to mongo project collection to prevent creating projects whose alias is duplicated [`10f745`](https://github.com/reearth/reearth-visualizer-backend/commit/10f745)
- Check project alias duplication on project update [`443f2c`](https://github.com/reearth/reearth-visualizer-backend/commit/443f2c)

#### ✨ Refactor

- Add PropertySchemaGroupID to pkg/id ([#70](https://github.com/reearth/reearth-visualizer-backend/pull/70)) [`9ece9e`](https://github.com/reearth/reearth-visualizer-backend/commit/9ece9e)

#### Miscellaneous Tasks

- Fix typo in github actions [`4a9dc5`](https://github.com/reearth/reearth-visualizer-backend/commit/4a9dc5)
- Clean up unused code [`b5b01b`](https://github.com/reearth/reearth-visualizer-backend/commit/b5b01b)
- Update codecov.yml to add ignored files [`d54309`](https://github.com/reearth/reearth-visualizer-backend/commit/d54309)
- Ignore generated files in codecov [`9d3822`](https://github.com/reearth/reearth-visualizer-backend/commit/9d3822)
- Upgrade dependencies [`215947`](https://github.com/reearth/reearth-visualizer-backend/commit/215947)


## 0.1.0 - 2021-11-02

### reearth-web

#### 🚀 Features

- Support Auth0 audience ([#2](https://github.com/reearth/reearth-visualizer-web/pull/2)) [`0ad0f6`](https://github.com/reearth/reearth-visualizer-web/commit/0ad0f6)
- Asset modal redesign ([#1](https://github.com/reearth/reearth-visualizer-web/pull/1)) [`f71117`](https://github.com/reearth/reearth-visualizer-web/commit/f71117)
- Basic auth for projects ([#3](https://github.com/reearth/reearth-visualizer-web/pull/3)) [`372c4e`](https://github.com/reearth/reearth-visualizer-web/commit/372c4e)
- Google analytics ([#6](https://github.com/reearth/reearth-visualizer-web/pull/6)) [`01aadf`](https://github.com/reearth/reearth-visualizer-web/commit/01aadf)
- Refine setting page ([#19](https://github.com/reearth/reearth-visualizer-web/pull/19)) [`d06ee7`](https://github.com/reearth/reearth-visualizer-web/commit/d06ee7)
- Add  delete assets confirm modal and fix bugs ([#25](https://github.com/reearth/reearth-visualizer-web/pull/25)) [`0310f5`](https://github.com/reearth/reearth-visualizer-web/commit/0310f5)
- Update link system and UI ([#12](https://github.com/reearth/reearth-visualizer-web/pull/12)) [`51de77`](https://github.com/reearth/reearth-visualizer-web/commit/51de77)
- Import google sheet dataset ([#14](https://github.com/reearth/reearth-visualizer-web/pull/14)) [`21b167`](https://github.com/reearth/reearth-visualizer-web/commit/21b167)
- Support multi-line infobox titles ([#40](https://github.com/reearth/reearth-visualizer-web/pull/40)) [`4cddcc`](https://github.com/reearth/reearth-visualizer-web/commit/4cddcc)
- Public settings page ([#32](https://github.com/reearth/reearth-visualizer-web/pull/32)) [`ebfd41`](https://github.com/reearth/reearth-visualizer-web/commit/ebfd41)
- Refine readme ([#51](https://github.com/reearth/reearth-visualizer-web/pull/51)) [`41ddb3`](https://github.com/reearth/reearth-visualizer-web/commit/41ddb3)
- Add light theme ([#52](https://github.com/reearth/reearth-visualizer-web/pull/52)) [`26159b`](https://github.com/reearth/reearth-visualizer-web/commit/26159b)
- Add a short discription for light theme ([#56](https://github.com/reearth/reearth-visualizer-web/pull/56)) [`8b092d`](https://github.com/reearth/reearth-visualizer-web/commit/8b092d)
- Plugins settings page, install/uninstall plugins ([#22](https://github.com/reearth/reearth-visualizer-web/pull/22)) [`018674`](https://github.com/reearth/reearth-visualizer-web/commit/018674)
- Plugin system, refactoring visualizer ([#50](https://github.com/reearth/reearth-visualizer-web/pull/50)) [`172939`](https://github.com/reearth/reearth-visualizer-web/commit/172939)
- 3D tileset, model, rectangle primitive, more properties for marker and scene ([#63](https://github.com/reearth/reearth-visualizer-web/pull/63)) [`a88600`](https://github.com/reearth/reearth-visualizer-web/commit/a88600)
- Graphiql page ([#70](https://github.com/reearth/reearth-visualizer-web/pull/70)) [`aa5d10`](https://github.com/reearth/reearth-visualizer-web/commit/aa5d10)
- Enable to set theme for the scene ([#67](https://github.com/reearth/reearth-visualizer-web/pull/67)) [`58e670`](https://github.com/reearth/reearth-visualizer-web/commit/58e670)
- Notification system update ([#73](https://github.com/reearth/reearth-visualizer-web/pull/73)) [`92cdbb`](https://github.com/reearth/reearth-visualizer-web/commit/92cdbb)
- Widget align system ([#61](https://github.com/reearth/reearth-visualizer-web/pull/61)) [`ed2940`](https://github.com/reearth/reearth-visualizer-web/commit/ed2940)
- Plugin system beta ([#87](https://github.com/reearth/reearth-visualizer-web/pull/87)) [`d76f1c`](https://github.com/reearth/reearth-visualizer-web/commit/d76f1c)
- Enhance extended field of widget in plugin API ([#90](https://github.com/reearth/reearth-visualizer-web/pull/90)) [`06cb14`](https://github.com/reearth/reearth-visualizer-web/commit/06cb14)
- Add overrideProperty to plugin layers API ([#92](https://github.com/reearth/reearth-visualizer-web/pull/92)) [`563f88`](https://github.com/reearth/reearth-visualizer-web/commit/563f88)
- Add a fallback icon for extensions that do not have an icon ([#98](https://github.com/reearth/reearth-visualizer-web/pull/98)) [`50de1f`](https://github.com/reearth/reearth-visualizer-web/commit/50de1f)
- Add password validation ([#86](https://github.com/reearth/reearth-visualizer-web/pull/86)) [`2017aa`](https://github.com/reearth/reearth-visualizer-web/commit/2017aa)
- Draggable layer ([#58](https://github.com/reearth/reearth-visualizer-web/pull/58)) [`25a217`](https://github.com/reearth/reearth-visualizer-web/commit/25a217)
- Multi widgets ([#99](https://github.com/reearth/reearth-visualizer-web/pull/99)) [`bea1a3`](https://github.com/reearth/reearth-visualizer-web/commit/bea1a3)
- Front-end for new authentication system ([#102](https://github.com/reearth/reearth-visualizer-web/pull/102)) [`964d92`](https://github.com/reearth/reearth-visualizer-web/commit/964d92)
- Add layers.overriddenProperties, find, findAll, walk ([#110](https://github.com/reearth/reearth-visualizer-web/pull/110)) [`ebe131`](https://github.com/reearth/reearth-visualizer-web/commit/ebe131)

#### 🔧 Bug Fixes

- Reorganize config [`f2e947`](https://github.com/reearth/reearth-visualizer-web/commit/f2e947)
- Update gql schema [`0905b6`](https://github.com/reearth/reearth-visualizer-web/commit/0905b6)
- Update dependency cesium to ^1.82.1 ([#4](https://github.com/reearth/reearth-visualizer-web/pull/4)) [`0627bf`](https://github.com/reearth/reearth-visualizer-web/commit/0627bf)
- Google analytics ([#7](https://github.com/reearth/reearth-visualizer-web/pull/7)) [`7505ca`](https://github.com/reearth/reearth-visualizer-web/commit/7505ca)
- Sprint15 bugs ([#8](https://github.com/reearth/reearth-visualizer-web/pull/8)) [`e2fe0a`](https://github.com/reearth/reearth-visualizer-web/commit/e2fe0a)
- Google analytics typo ([#9](https://github.com/reearth/reearth-visualizer-web/pull/9)) [`943b5e`](https://github.com/reearth/reearth-visualizer-web/commit/943b5e)
- Ga-typo2 ([#10](https://github.com/reearth/reearth-visualizer-web/pull/10)) [`b498de`](https://github.com/reearth/reearth-visualizer-web/commit/b498de)
- Force logout when me query returns null ([#15](https://github.com/reearth/reearth-visualizer-web/pull/15)) [`339d61`](https://github.com/reearth/reearth-visualizer-web/commit/339d61)
- Infinit logout loop ([#17](https://github.com/reearth/reearth-visualizer-web/pull/17)) [`0d510f`](https://github.com/reearth/reearth-visualizer-web/commit/0d510f)
- Change data.json path [`38a69a`](https://github.com/reearth/reearth-visualizer-web/commit/38a69a)
- Menu button width ([#21](https://github.com/reearth/reearth-visualizer-web/pull/21)) [`d08eba`](https://github.com/reearth/reearth-visualizer-web/commit/d08eba)
- Menu widget bugs ([#37](https://github.com/reearth/reearth-visualizer-web/pull/37)) [`5d5483`](https://github.com/reearth/reearth-visualizer-web/commit/5d5483)
- Marker label position is oposite to actual display ([#39](https://github.com/reearth/reearth-visualizer-web/pull/39)) [`38de46`](https://github.com/reearth/reearth-visualizer-web/commit/38de46)
- Disable default cesium mouse event ([#42](https://github.com/reearth/reearth-visualizer-web/pull/42)) [`129ae3`](https://github.com/reearth/reearth-visualizer-web/commit/129ae3)
- Show layers in storytelling without names ([#45](https://github.com/reearth/reearth-visualizer-web/pull/45)) [`00ae3c`](https://github.com/reearth/reearth-visualizer-web/commit/00ae3c)
- Infobox colors ([#47](https://github.com/reearth/reearth-visualizer-web/pull/47)) [`2a6a36`](https://github.com/reearth/reearth-visualizer-web/commit/2a6a36)
- Project public image ([#48](https://github.com/reearth/reearth-visualizer-web/pull/48)) [`91b5ee`](https://github.com/reearth/reearth-visualizer-web/commit/91b5ee)
- Auth0 redirect uri [`8336a3`](https://github.com/reearth/reearth-visualizer-web/commit/8336a3)
- Storybook ([#54](https://github.com/reearth/reearth-visualizer-web/pull/54)) [`fde0c0`](https://github.com/reearth/reearth-visualizer-web/commit/fde0c0)
- Published data url [`e3d5b0`](https://github.com/reearth/reearth-visualizer-web/commit/e3d5b0)
- Icon background ([#64](https://github.com/reearth/reearth-visualizer-web/pull/64)) [`9c69a4`](https://github.com/reearth/reearth-visualizer-web/commit/9c69a4)
- Prevent extra render, cannot rename layers, cannot display infobox on dataset layers ([#65](https://github.com/reearth/reearth-visualizer-web/pull/65)) [`e3d618`](https://github.com/reearth/reearth-visualizer-web/commit/e3d618)
- Remove visibility icon from layer actions [`0ad8aa`](https://github.com/reearth/reearth-visualizer-web/commit/0ad8aa)
- Default published url, rename layer when focus is removed from text box [`f9accc`](https://github.com/reearth/reearth-visualizer-web/commit/f9accc)
- Storybook error ([#75](https://github.com/reearth/reearth-visualizer-web/pull/75)) [`f27f9b`](https://github.com/reearth/reearth-visualizer-web/commit/f27f9b)
- Showing members section for personal workspace ([#85](https://github.com/reearth/reearth-visualizer-web/pull/85)) [`8e78f9`](https://github.com/reearth/reearth-visualizer-web/commit/8e78f9)
- Widget bugs, language ([#89](https://github.com/reearth/reearth-visualizer-web/pull/89)) [`9de9df`](https://github.com/reearth/reearth-visualizer-web/commit/9de9df)
- Update dependency cesium to ^1.86.0 ([#93](https://github.com/reearth/reearth-visualizer-web/pull/93)) [`7ca298`](https://github.com/reearth/reearth-visualizer-web/commit/7ca298)
- Show properties of 3D tile features on infobox ([#95](https://github.com/reearth/reearth-visualizer-web/pull/95)) [`a9cc23`](https://github.com/reearth/reearth-visualizer-web/commit/a9cc23)
- Navigator.language should be used as fallback lang ([#91](https://github.com/reearth/reearth-visualizer-web/pull/91)) [`15df16`](https://github.com/reearth/reearth-visualizer-web/commit/15df16)
- Camera property panel bugs ([#96](https://github.com/reearth/reearth-visualizer-web/pull/96)) [`2c3eaa`](https://github.com/reearth/reearth-visualizer-web/commit/2c3eaa)
- Camera flight bugs ([#97](https://github.com/reearth/reearth-visualizer-web/pull/97)) [`b4f1ae`](https://github.com/reearth/reearth-visualizer-web/commit/b4f1ae)
- Storytelling image crop does not work [`9c23b3`](https://github.com/reearth/reearth-visualizer-web/commit/9c23b3)
- Export pane is not displayed [`58ceda`](https://github.com/reearth/reearth-visualizer-web/commit/58ceda)
- 1st bug hunt of october ([#100](https://github.com/reearth/reearth-visualizer-web/pull/100)) [`1b9032`](https://github.com/reearth/reearth-visualizer-web/commit/1b9032)
- Layers disappearing when in nested folders ([#101](https://github.com/reearth/reearth-visualizer-web/pull/101)) [`778395`](https://github.com/reearth/reearth-visualizer-web/commit/778395)
- Update dependency cesium to ^1.86.1 ([#103](https://github.com/reearth/reearth-visualizer-web/pull/103)) [`385582`](https://github.com/reearth/reearth-visualizer-web/commit/385582)
- Bug bounty #2 ([#105](https://github.com/reearth/reearth-visualizer-web/pull/105)) [`da4815`](https://github.com/reearth/reearth-visualizer-web/commit/da4815)
- Button widget ([#111](https://github.com/reearth/reearth-visualizer-web/pull/111)) [`b93485`](https://github.com/reearth/reearth-visualizer-web/commit/b93485)
- Create team redirect + translations update ([#112](https://github.com/reearth/reearth-visualizer-web/pull/112)) [`bafcfd`](https://github.com/reearth/reearth-visualizer-web/commit/bafcfd)
- 3d tile styles not updating sometimes ([#109](https://github.com/reearth/reearth-visualizer-web/pull/109)) [`1e92b8`](https://github.com/reearth/reearth-visualizer-web/commit/1e92b8)
- Layers.overrideProperty property merging and rerendering ([#108](https://github.com/reearth/reearth-visualizer-web/pull/108)) [`e5c255`](https://github.com/reearth/reearth-visualizer-web/commit/e5c255)
- Password policy conversion in config ([#113](https://github.com/reearth/reearth-visualizer-web/pull/113)) [`5d57c4`](https://github.com/reearth/reearth-visualizer-web/commit/5d57c4)
- Password validation, add autofocus ([#117](https://github.com/reearth/reearth-visualizer-web/pull/117)) [`348454`](https://github.com/reearth/reearth-visualizer-web/commit/348454)
- Password verification, add better feedback [`bd1725`](https://github.com/reearth/reearth-visualizer-web/commit/bd1725)

#### ✨ Refactor

- Use jotai instead of redux ([#68](https://github.com/reearth/reearth-visualizer-web/pull/68)) [`ea980c`](https://github.com/reearth/reearth-visualizer-web/commit/ea980c)
- Replace deprecated gql fields, pass widgetId to widget mutations ([#72](https://github.com/reearth/reearth-visualizer-web/pull/72)) [`f36c86`](https://github.com/reearth/reearth-visualizer-web/commit/f36c86)

#### 🎨 Styling

- Refine font ([#49](https://github.com/reearth/reearth-visualizer-web/pull/49)) [`8b3755`](https://github.com/reearth/reearth-visualizer-web/commit/8b3755)
- Refine color vo.1 ([#59](https://github.com/reearth/reearth-visualizer-web/pull/59)) [`ab7bce`](https://github.com/reearth/reearth-visualizer-web/commit/ab7bce)

#### 🧪 Testing

- Fix e2e test [`3bcd2d`](https://github.com/reearth/reearth-visualizer-web/commit/3bcd2d)
- Fix e2e test [`b3e512`](https://github.com/reearth/reearth-visualizer-web/commit/b3e512)
- Fix e2e test [`277f4e`](https://github.com/reearth/reearth-visualizer-web/commit/277f4e)
- Fix e2e test [`396f71`](https://github.com/reearth/reearth-visualizer-web/commit/396f71)
- Fix e2e test [`a8bd0c`](https://github.com/reearth/reearth-visualizer-web/commit/a8bd0c)
- Fix e2e test [`fd7cf5`](https://github.com/reearth/reearth-visualizer-web/commit/fd7cf5)
- Fix e2e test [`8c300b`](https://github.com/reearth/reearth-visualizer-web/commit/8c300b)
- Fix e2e test [`ea5050`](https://github.com/reearth/reearth-visualizer-web/commit/ea5050)
- Fix e2e test [`866c8c`](https://github.com/reearth/reearth-visualizer-web/commit/866c8c)
- Support display name in e2e test [`0edf58`](https://github.com/reearth/reearth-visualizer-web/commit/0edf58)

#### Miscellaneous Tasks

- Update workflows, set up nightly release [`0ea0ff`](https://github.com/reearth/reearth-visualizer-web/commit/0ea0ff)
- Fix nightly release workflow [`d7d1d3`](https://github.com/reearth/reearth-visualizer-web/commit/d7d1d3)
- Fix config [`7a6ed3`](https://github.com/reearth/reearth-visualizer-web/commit/7a6ed3)
- Set up cd workflows [`a6f0f5`](https://github.com/reearth/reearth-visualizer-web/commit/a6f0f5)
- Fix workflows [`97ecf8`](https://github.com/reearth/reearth-visualizer-web/commit/97ecf8)
- Fix workflows [`a4d451`](https://github.com/reearth/reearth-visualizer-web/commit/a4d451)
- Fix workflows [`d77b53`](https://github.com/reearth/reearth-visualizer-web/commit/d77b53)
- Remove unused deps [`81d0eb`](https://github.com/reearth/reearth-visualizer-web/commit/81d0eb)
- Update cesium [`414b37`](https://github.com/reearth/reearth-visualizer-web/commit/414b37)
- Update renovate config [`b36740`](https://github.com/reearth/reearth-visualizer-web/commit/b36740)
- Use .env instead of .env.local [`0b8720`](https://github.com/reearth/reearth-visualizer-web/commit/0b8720)
- Add storybook workflow [`c624bd`](https://github.com/reearth/reearth-visualizer-web/commit/c624bd)
- Set up sentry ([#18](https://github.com/reearth/reearth-visualizer-web/pull/18)) [`8a2d38`](https://github.com/reearth/reearth-visualizer-web/commit/8a2d38)
- Testable published page ([#43](https://github.com/reearth/reearth-visualizer-web/pull/43)) [`90c37d`](https://github.com/reearth/reearth-visualizer-web/commit/90c37d)
- Update netlify.toml [`230e12`](https://github.com/reearth/reearth-visualizer-web/commit/230e12)
- Add gql sclar types [`09fb76`](https://github.com/reearth/reearth-visualizer-web/commit/09fb76)
- Update cesium and resium ([#79](https://github.com/reearth/reearth-visualizer-web/pull/79)) [`c41601`](https://github.com/reearth/reearth-visualizer-web/commit/c41601)
- Update eslint, enable eslint-plugin-import, perform formatting ([#82](https://github.com/reearth/reearth-visualizer-web/pull/82)) [`117bab`](https://github.com/reearth/reearth-visualizer-web/commit/117bab)
- Upgrade dependencies [`4924f9`](https://github.com/reearth/reearth-visualizer-web/commit/4924f9)
- Fix cypress and unit test [`97f74e`](https://github.com/reearth/reearth-visualizer-web/commit/97f74e)
- Support for dotenv switching ([#106](https://github.com/reearth/reearth-visualizer-web/pull/106)) [`cd1974`](https://github.com/reearth/reearth-visualizer-web/commit/cd1974)
- Upgrade modules oct ([#107](https://github.com/reearth/reearth-visualizer-web/pull/107)) [`24c145`](https://github.com/reearth/reearth-visualizer-web/commit/24c145)
- Upgrade react-align ([#116](https://github.com/reearth/reearth-visualizer-web/pull/116)) [`7f4b98`](https://github.com/reearth/reearth-visualizer-web/commit/7f4b98)
- Add github workflows to release [`331afb`](https://github.com/reearth/reearth-visualizer-web/commit/331afb)
- Update translations + format ([#114](https://github.com/reearth/reearth-visualizer-web/pull/114)) [`7f191e`](https://github.com/reearth/reearth-visualizer-web/commit/7f191e)
- Lock file maintenance ([#66](https://github.com/reearth/reearth-visualizer-web/pull/66)) [`6d2a2d`](https://github.com/reearth/reearth-visualizer-web/commit/6d2a2d)
- Fix slack notifications in workflow [skip ci] [`b4fa35`](https://github.com/reearth/reearth-visualizer-web/commit/b4fa35)
- Fix sed in release workflow [skip ci] [`f3cd74`](https://github.com/reearth/reearth-visualizer-web/commit/f3cd74)


### reearth-backend

#### 🚀 Features

- Support Auth0 audience ([#3](https://github.com/reearth/reearth-visualizer-backend/pull/3)) [`c3758e`](https://github.com/reearth/reearth-visualizer-backend/commit/c3758e)
- Basic auth for projects ([#6](https://github.com/reearth/reearth-visualizer-backend/pull/6)) [`5db065`](https://github.com/reearth/reearth-visualizer-backend/commit/5db065)
- Google analytics for scene ([#10](https://github.com/reearth/reearth-visualizer-backend/pull/10)) [`b44249`](https://github.com/reearth/reearth-visualizer-backend/commit/b44249)
- Create installable plugins ([#1](https://github.com/reearth/reearth-visualizer-backend/pull/1)) [`5b7a5f`](https://github.com/reearth/reearth-visualizer-backend/commit/5b7a5f)
- Add thumbnail, author fields on plugin metadata query ([#15](https://github.com/reearth/reearth-visualizer-backend/pull/15)) [`888fe0`](https://github.com/reearth/reearth-visualizer-backend/commit/888fe0)
- Published page api ([#11](https://github.com/reearth/reearth-visualizer-backend/pull/11)) [`aebac3`](https://github.com/reearth/reearth-visualizer-backend/commit/aebac3)
- Import dataset from google sheets ([#16](https://github.com/reearth/reearth-visualizer-backend/pull/16)) [`2ef7ef`](https://github.com/reearth/reearth-visualizer-backend/commit/2ef7ef)
- Add scenePlugin resolver to layers ([#20](https://github.com/reearth/reearth-visualizer-backend/pull/20)) [`5213f3`](https://github.com/reearth/reearth-visualizer-backend/commit/5213f3)
- Marker label position [`bb9e4c`](https://github.com/reearth/reearth-visualizer-backend/commit/bb9e4c)
- Refine dataset import ([#26](https://github.com/reearth/reearth-visualizer-backend/pull/26)) [`5dd3db`](https://github.com/reearth/reearth-visualizer-backend/commit/5dd3db)
- Plugin upload and deletion ([#33](https://github.com/reearth/reearth-visualizer-backend/pull/33)) [`8742db`](https://github.com/reearth/reearth-visualizer-backend/commit/8742db)
- New primitives, new properties on primitives [`108711`](https://github.com/reearth/reearth-visualizer-backend/commit/108711)
- Set scene theme ([#35](https://github.com/reearth/reearth-visualizer-backend/pull/35)) [`2e4f52`](https://github.com/reearth/reearth-visualizer-backend/commit/2e4f52)
- Widget align system ([#19](https://github.com/reearth/reearth-visualizer-backend/pull/19)) [`94611f`](https://github.com/reearth/reearth-visualizer-backend/commit/94611f)
- Tag system ([#67](https://github.com/reearth/reearth-visualizer-backend/pull/67)) [`163fcf`](https://github.com/reearth/reearth-visualizer-backend/commit/163fcf)

#### 🔧 Bug Fixes

- Add mutex for each memory repo ([#2](https://github.com/reearth/reearth-visualizer-backend/pull/2)) [`f4c3b0`](https://github.com/reearth/reearth-visualizer-backend/commit/f4c3b0)
- Auth0 audience in reearth_config.json [`72e3ed`](https://github.com/reearth/reearth-visualizer-backend/commit/72e3ed)
- Auth0 domain and multiple auds [`835a02`](https://github.com/reearth/reearth-visualizer-backend/commit/835a02)
- Signing up and deleting user [`f17b9d`](https://github.com/reearth/reearth-visualizer-backend/commit/f17b9d)
- Deleting user [`e9b8c9`](https://github.com/reearth/reearth-visualizer-backend/commit/e9b8c9)
- Sign up and update user [`e5ab87`](https://github.com/reearth/reearth-visualizer-backend/commit/e5ab87)
- Make gql mutation payloads optional [`9b1c4a`](https://github.com/reearth/reearth-visualizer-backend/commit/9b1c4a)
- Auth0 [`6a27c6`](https://github.com/reearth/reearth-visualizer-backend/commit/6a27c6)
- Errors are be overwriten by tx [`2d08c5`](https://github.com/reearth/reearth-visualizer-backend/commit/2d08c5)
- Deleting user [`f531bd`](https://github.com/reearth/reearth-visualizer-backend/commit/f531bd)
- Always enable dev mode in debug [`0815d3`](https://github.com/reearth/reearth-visualizer-backend/commit/0815d3)
- User deletion [`a5eeae`](https://github.com/reearth/reearth-visualizer-backend/commit/a5eeae)
- Invisible layer issue in published project ([#7](https://github.com/reearth/reearth-visualizer-backend/pull/7)) [`06cd44`](https://github.com/reearth/reearth-visualizer-backend/commit/06cd44)
- Dataset link merge bug #378 ([#18](https://github.com/reearth/reearth-visualizer-backend/pull/18)) [`25da0d`](https://github.com/reearth/reearth-visualizer-backend/commit/25da0d)
- Ogp image for published page ([#17](https://github.com/reearth/reearth-visualizer-backend/pull/17)) [`dcb4b0`](https://github.com/reearth/reearth-visualizer-backend/commit/dcb4b0)
- Change default value of marker label position [`a2059e`](https://github.com/reearth/reearth-visualizer-backend/commit/a2059e)
- Import dataset from google sheet bug ([#23](https://github.com/reearth/reearth-visualizer-backend/pull/23)) [`077558`](https://github.com/reearth/reearth-visualizer-backend/commit/077558)
- Public api param [`846957`](https://github.com/reearth/reearth-visualizer-backend/commit/846957)
- Replace strings.Split() with strings.field() ([#25](https://github.com/reearth/reearth-visualizer-backend/pull/25)) [`ba7d16`](https://github.com/reearth/reearth-visualizer-backend/commit/ba7d16)
- Project public image type [`e82b54`](https://github.com/reearth/reearth-visualizer-backend/commit/e82b54)
- Published API ([#27](https://github.com/reearth/reearth-visualizer-backend/pull/27)) [`8ad1f8`](https://github.com/reearth/reearth-visualizer-backend/commit/8ad1f8)
- Plugin manifest parser bugs ([#32](https://github.com/reearth/reearth-visualizer-backend/pull/32)) [`78ac13`](https://github.com/reearth/reearth-visualizer-backend/commit/78ac13)
- Dataset layers are not exported correctly ([#36](https://github.com/reearth/reearth-visualizer-backend/pull/36)) [`0b8c00`](https://github.com/reearth/reearth-visualizer-backend/commit/0b8c00)
- Hide parent infobox fields when child infobox is not nil ([#37](https://github.com/reearth/reearth-visualizer-backend/pull/37)) [`d8c8cd`](https://github.com/reearth/reearth-visualizer-backend/commit/d8c8cd)
- Mongo.PropertySchema.FindByIDs, propertySchemaID.Equal [`be00da`](https://github.com/reearth/reearth-visualizer-backend/commit/be00da)
- Gql propertySchemaGroup.translatedTitle resolver [`a4770e`](https://github.com/reearth/reearth-visualizer-backend/commit/a4770e)
- Use PropertySchemaID.Equal [`8a6459`](https://github.com/reearth/reearth-visualizer-backend/commit/8a6459)
- Use PropertySchemaID.Equal [`1c3cf1`](https://github.com/reearth/reearth-visualizer-backend/commit/1c3cf1)
- Tweak field names of model primitive [`080ab9`](https://github.com/reearth/reearth-visualizer-backend/commit/080ab9)
- Layer importing bug ([#41](https://github.com/reearth/reearth-visualizer-backend/pull/41)) [`02b17f`](https://github.com/reearth/reearth-visualizer-backend/commit/02b17f)
- Skip nil geometries ([#42](https://github.com/reearth/reearth-visualizer-backend/pull/42)) [`90c327`](https://github.com/reearth/reearth-visualizer-backend/commit/90c327)
- Validate widget extended when moved [`a7daf7`](https://github.com/reearth/reearth-visualizer-backend/commit/a7daf7)
- Widget extended validation [`98db7e`](https://github.com/reearth/reearth-visualizer-backend/commit/98db7e)
- Nil error in mongodoc plugin [`d236be`](https://github.com/reearth/reearth-visualizer-backend/commit/d236be)
- Add widget to default location [`eb1db4`](https://github.com/reearth/reearth-visualizer-backend/commit/eb1db4)
- Invalid extension data from GraphQL, plugin manifest schema improvement, more friendly error from manifest parser ([#56](https://github.com/reearth/reearth-visualizer-backend/pull/56)) [`92d137`](https://github.com/reearth/reearth-visualizer-backend/commit/92d137)
- Translated fields in plugin gql [`0a658a`](https://github.com/reearth/reearth-visualizer-backend/commit/0a658a)
- Fallback widgetLocation [`579b7a`](https://github.com/reearth/reearth-visualizer-backend/commit/579b7a)

#### 📖 Documentation

- Refine readme ([#28](https://github.com/reearth/reearth-visualizer-backend/pull/28)) [`a9d209`](https://github.com/reearth/reearth-visualizer-backend/commit/a9d209)
- Add badges to readme [skip ci] [`cc63cd`](https://github.com/reearth/reearth-visualizer-backend/commit/cc63cd)

#### ✨ Refactor

- Remove unused code [`37b2c2`](https://github.com/reearth/reearth-visualizer-backend/commit/37b2c2)
- Pkg/error ([#31](https://github.com/reearth/reearth-visualizer-backend/pull/31)) [`a3f8b6`](https://github.com/reearth/reearth-visualizer-backend/commit/a3f8b6)
- Graphql adapter ([#40](https://github.com/reearth/reearth-visualizer-backend/pull/40)) [`2a1d4f`](https://github.com/reearth/reearth-visualizer-backend/commit/2a1d4f)
- Reorganize graphql schema ([#43](https://github.com/reearth/reearth-visualizer-backend/pull/43)) [`d3360b`](https://github.com/reearth/reearth-visualizer-backend/commit/d3360b)

#### 🧪 Testing

- Pkg/shp ([#5](https://github.com/reearth/reearth-visualizer-backend/pull/5)) [`72ed8e`](https://github.com/reearth/reearth-visualizer-backend/commit/72ed8e)
- Pkg/id ([#4](https://github.com/reearth/reearth-visualizer-backend/pull/4)) [`c31bdb`](https://github.com/reearth/reearth-visualizer-backend/commit/c31bdb)

#### Miscellaneous Tasks

- Enable nightly release workflow [`16c037`](https://github.com/reearth/reearth-visualizer-backend/commit/16c037)
- Set up workflows [`819639`](https://github.com/reearth/reearth-visualizer-backend/commit/819639)
- Fix workflows [`c022a4`](https://github.com/reearth/reearth-visualizer-backend/commit/c022a4)
- Print config [`0125aa`](https://github.com/reearth/reearth-visualizer-backend/commit/0125aa)
- Load .env instead of .env.local [`487a73`](https://github.com/reearth/reearth-visualizer-backend/commit/487a73)
- Add godoc workflow [`9629dd`](https://github.com/reearth/reearth-visualizer-backend/commit/9629dd)
- Fix godoc workflow [`cc45b5`](https://github.com/reearth/reearth-visualizer-backend/commit/cc45b5)
- Fix godoc workflow [`0db163`](https://github.com/reearth/reearth-visualizer-backend/commit/0db163)
- Fix godoc workflow [`9b78fc`](https://github.com/reearth/reearth-visualizer-backend/commit/9b78fc)
- Fix godoc workflow [`f1e5a7`](https://github.com/reearth/reearth-visualizer-backend/commit/f1e5a7)
- Fix godoc workflow [`f7866c`](https://github.com/reearth/reearth-visualizer-backend/commit/f7866c)
- Fix godoc workflow [`5bc089`](https://github.com/reearth/reearth-visualizer-backend/commit/5bc089)
- Fix godoc workflow [`5f808b`](https://github.com/reearth/reearth-visualizer-backend/commit/5f808b)
- Fix godoc workflow [`9f8e11`](https://github.com/reearth/reearth-visualizer-backend/commit/9f8e11)
- Fix godoc workflow [`150550`](https://github.com/reearth/reearth-visualizer-backend/commit/150550)
- Use go:embed ([#24](https://github.com/reearth/reearth-visualizer-backend/pull/24)) [`f7866e`](https://github.com/reearth/reearth-visualizer-backend/commit/f7866e)
- Add internal error log [`41c377`](https://github.com/reearth/reearth-visualizer-backend/commit/41c377)
- Support multiple platform docker image [`3651e2`](https://github.com/reearth/reearth-visualizer-backend/commit/3651e2)
- Stop using upx as it doesn't work on arm64 [`3b5f93`](https://github.com/reearth/reearth-visualizer-backend/commit/3b5f93)
- Update golang version and modules ([#51](https://github.com/reearth/reearth-visualizer-backend/pull/51)) [`33f4c7`](https://github.com/reearth/reearth-visualizer-backend/commit/33f4c7)
- Updating modules ([#62](https://github.com/reearth/reearth-visualizer-backend/pull/62)) [`65ae32`](https://github.com/reearth/reearth-visualizer-backend/commit/65ae32)
- Add github workflows to release [`fbcdef`](https://github.com/reearth/reearth-visualizer-backend/commit/fbcdef)
- Fix release workflow, fix build comment [skip ci] [`cfc79a`](https://github.com/reearth/reearth-visualizer-backend/commit/cfc79a)
- Fix renaming file names in release workflow [`96f0b3`](https://github.com/reearth/reearth-visualizer-backend/commit/96f0b3)
- Fix and refactor release workflow [skip ci] [`d5466b`](https://github.com/reearth/reearth-visualizer-backend/commit/d5466b)