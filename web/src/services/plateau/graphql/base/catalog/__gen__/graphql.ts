/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  /**
   * 行政コードを表す文字列。
   * 都道府県の場合は、2桁の数字で構成された文字列です。
   * 自治体の場合は、先頭に2桁の都道府県コードを含む、5桁の数字で構成された文字列です。
   */
  AreaCode: { input: any; output: any; }
};

/**
 * 地域。都道府県（Prefecture）・市区町村（City）・区（政令指定都市のみ・Ward）のいずれかです。
 * 政令指定都市の場合のみ、市の下に区が存在します。
 */
export type Area = {
  /** 地域に属する子地域。 */
  children: Array<Area>;
  /**
   * 地域コード。行政コードや市区町村コードとも呼ばれます。
   * 都道府県の場合は二桁の数字から成る文字列です。
   * 市区町村の場合は、先頭に都道府県コードを含む5桁の数字から成る文字列です。
   */
  code: Scalars['AreaCode']['output'];
  /** 地域に属するデータセット（DatasetInput内のareasCodeの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** 地域名 */
  name: Scalars['String']['output'];
  /** 地域の親となる地域。 */
  parent?: Maybe<Area>;
  /** 地域の親となる地域のID。市区町村の親は都道府県です。政令指定都市の区の親は市です。 */
  parentId?: Maybe<Scalars['ID']['output']>;
  /** 地域の種類 */
  type: AreaType;
};


/**
 * 地域。都道府県（Prefecture）・市区町村（City）・区（政令指定都市のみ・Ward）のいずれかです。
 * 政令指定都市の場合のみ、市の下に区が存在します。
 */
export type AreaDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

export enum AreaType {
  /** 市町村 */
  City = 'CITY',
  /** 全球（グローバル） */
  Global = 'GLOBAL',
  /** 都道府県 */
  Prefecture = 'PREFECTURE',
  /** 区（政令指定都市のみ） */
  Ward = 'WARD'
}

/** 地域を検索するためのクエリ。 */
export type AreasInput = {
  /**
   * 地域の種類。例えば、市を検索したい場合は CITY を指定します。複数指定するとOR条件で検索を行います。
   * 未指定の場合、全ての地域を対象に検索します。
   */
  areaTypes?: InputMaybe<Array<AreaType>>;
  /**
   * データセットの種類のカテゴリ。例えば、PLATEAU都市モデルデータセットが存在する地域を検索したい場合は PLATEAU を指定します。複数指定するとOR条件で検索を行います。
   * 未指定の場合、全てのカテゴリのデータセットを対象に検索します。
   */
  categories?: InputMaybe<Array<DatasetTypeCategory>>;
  /**
   * データセットの種類コード。例えば、建築物モデルのデータセットが存在する地域を検索したい場合は "bldg" を指定します。複数指定するとOR条件で検索を行います。
   * 未指定の場合、全てのデータセットの種類を対象に検索します。
   */
  datasetTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** parentCode が指定された場合に、その地域に間接的に属している地域も検索対象にするかどうか。デフォルトは false です。 */
  deep?: InputMaybe<Scalars['Boolean']['input']>;
  /** 属しているDatasetが存在しない都市を含めます。通常のデータセットは存在しないが、 CityGMLDataset の city として使用されている都市が含まれます。 */
  includeEmpty?: InputMaybe<Scalars['Boolean']['input']>;
  /** datasetTypes が指定された場合に、検索結果にその地域の親も含めるかどうか。デフォルトは false です。 */
  includeParents?: InputMaybe<Scalars['Boolean']['input']>;
  /** 検索したい地域が属する親となる地域のコード。例えば東京都に属する都市を検索したい場合は "13" を指定します。 */
  parentCode?: InputMaybe<Scalars['AreaCode']['input']>;
  /** 検索文字列。複数指定するとAND条件で絞り込み検索が行えます。 */
  searchTokens?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** 市区町村 */
export type City = Area & Node & {
  __typename?: 'City';
  /** 地域に属する子地域。 */
  children: Array<Area>;
  /** CityGMLデータセット。 */
  citygml?: Maybe<CityGmlDataset>;
  /** CityGMLデータセットのID。 */
  citygmlId?: Maybe<Scalars['ID']['output']>;
  /** 市区町村コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  code: Scalars['AreaCode']['output'];
  /** 市区町村に属するデータセット（DatasetInput内のareasCodeの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** 市区町村名 */
  name: Scalars['String']['output'];
  /** 地域の親となる地域。 */
  parent: Prefecture;
  /** 地域の親となる地域のID。市区町村の親は都道府県です。政令指定都市の区の親は市です。 */
  parentId?: Maybe<Scalars['ID']['output']>;
  /** 平面直角座標系のEPSGコード。例えば、東京都の場合は "6677" です。 */
  planarCrsEpsgCode?: Maybe<Scalars['String']['output']>;
  /** 市区町村の都道府県。 */
  prefecture?: Maybe<Prefecture>;
  /** 市区町村が属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode: Scalars['AreaCode']['output'];
  /** 市区町村が属する都道府県のID。 */
  prefectureId: Scalars['ID']['output'];
  /** 地域の種類 */
  type: AreaType;
  /** 市区町村に属する区。政令指定都市の場合のみ存在します。 */
  wards: Array<Ward>;
};


/** 市区町村 */
export type CityDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** PLATEAU標準製品仕様書に基づくCityGMLのデータセット。 */
export type CityGmlDataset = Node & {
  __typename?: 'CityGMLDataset';
  /** 管理者用 */
  admin?: Maybe<Scalars['Any']['output']>;
  /** データセットが属する市。 */
  city: City;
  /** データセットが属する市コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  cityCode: Scalars['AreaCode']['output'];
  /** データセットが属する市のID。 */
  cityId: Scalars['ID']['output'];
  /** CityGMLが含む地物型コードのリスト。 */
  featureTypes: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** CityGMLのメタデータを含むzipファイルURLのリスト。 */
  metadataZipUrls: Array<Scalars['String']['output']>;
  /** データセットが準拠するPLATEAU都市モデルの仕様。 */
  plateauSpecMinor: PlateauSpecMinor;
  /** データセットが準拠するPLATEAU都市モデルの仕様のマイナーバージョンへのID。 */
  plateauSpecMinorId: Scalars['ID']['output'];
  /** データセットが属する都道府県。 */
  prefecture: Prefecture;
  /** データセットが属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode: Scalars['AreaCode']['output'];
  /** データセットが属する都道府県のID。 */
  prefectureId: Scalars['ID']['output'];
  /** データセットの登録年度（西暦）。 */
  registrationYear: Scalars['Int']['output'];
  /** CityGMLのzip形式のファイルのURL。 */
  url: Scalars['String']['output'];
  /** データセットの整備年度（西暦）。 */
  year: Scalars['Int']['output'];
};

/** データセット。 */
export type Dataset = {
  /** 管理者用 */
  admin?: Maybe<Scalars['Any']['output']>;
  /** PLATEAU ARで閲覧可能なデータセットかどうか。 */
  ar: Scalars['Boolean']['output'];
  /** データセットが属する市。 */
  city?: Maybe<City>;
  /** データセットが属する市コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  cityCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する市のID。 */
  cityId?: Maybe<Scalars['ID']['output']>;
  /** データセットの説明 */
  description?: Maybe<Scalars['String']['output']>;
  /** データセットを分類するグループ。グループが階層構造になっている場合は、親から子の順番で複数のグループ名が存在することがあります。 */
  groups?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  /** データセットのアイテム。 */
  items: Array<DatasetItem>;
  /** データセット名 */
  name: Scalars['String']['output'];
  /** データセットの公開データのURL。 */
  openDataUrl?: Maybe<Scalars['String']['output']>;
  /** データセットが属する都道府県。 */
  prefecture?: Maybe<Prefecture>;
  /** データセットが属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する都道府県のID。 */
  prefectureId?: Maybe<Scalars['ID']['output']>;
  /** データセットの登録年度（西暦） */
  registerationYear: Scalars['Int']['output'];
  /** データセットの種類。 */
  type: DatasetType;
  /** データセットの種類コード。 */
  typeCode: Scalars['String']['output'];
  /** データセットの種類のID。 */
  typeId: Scalars['ID']['output'];
  /** データセットが属する区。 */
  ward?: Maybe<Ward>;
  /** データセットが属する区コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  wardCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する区のID。 */
  wardId?: Maybe<Scalars['ID']['output']>;
  /** データセットの整備年度（西暦） */
  year: Scalars['Int']['output'];
};

/** データセットのフォーマット。 */
export enum DatasetFormat {
  /** 3D Tiles */
  Cesium3Dtiles = 'CESIUM3DTILES',
  /** CSV */
  Csv = 'CSV',
  /** CZML */
  Czml = 'CZML',
  /** GeoJSON */
  Geojson = 'GEOJSON',
  /** GlTF */
  Gltf = 'GLTF',
  /** GTFS Realtime */
  GtfsRealtime = 'GTFS_REALTIME',
  /** Mapbox Vector Tile */
  Mvt = 'MVT',
  /** XYZで分割された画像タイル。/{z}/{x}/{y}.png のようなURLになります。 */
  Tiles = 'TILES',
  /** Tile Map Service */
  Tms = 'TMS',
  /** Web Map Service */
  Wms = 'WMS'
}

/** データセットのアイテム。 */
export type DatasetItem = {
  /** データセットのアイテムのフォーマット。 */
  format: DatasetFormat;
  id: Scalars['ID']['output'];
  /**
   * データセットのアイテムのレイヤー名。MVTやWMSなどのフォーマットの場合のみ存在。
   * レイヤー名が複数存在する場合は、同時に複数のレイヤーを表示可能であることを意味します。
   */
  layers?: Maybe<Array<Scalars['String']['output']>>;
  /** データセットのアイテム名。 */
  name: Scalars['String']['output'];
  /** データセットのアイテムが属するデータセット。 */
  parent?: Maybe<Dataset>;
  /** データセットのアイテムが属するデータセットのID。 */
  parentId: Scalars['ID']['output'];
  /** データセットのアイテムのURL。 */
  url: Scalars['String']['output'];
};

/** データセットの種類。 */
export type DatasetType = {
  /** データセットの種類のカテゴリ。 */
  category: DatasetTypeCategory;
  /** データセットの種類コード。 "bldg" など。 */
  code: Scalars['String']['output'];
  /** データセット（DatasetInput内のincludeTypesとexcludeTypesの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** データセットの種類名。 */
  name: Scalars['String']['output'];
  /** データセットの種類の順番を示す数字。大きいほど後に表示されます。 */
  order: Scalars['Int']['output'];
};


/** データセットの種類。 */
export type DatasetTypeDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** データセットの種類のカテゴリ。 */
export enum DatasetTypeCategory {
  /** その他のデータセット */
  Generic = 'GENERIC',
  /** PLATEAU都市モデルデータセット */
  Plateau = 'PLATEAU',
  /** 関連データセット */
  Related = 'RELATED'
}

/** データセットの種類を検索するためのクエリ。 */
export type DatasetTypesInput = {
  /** データセットの種類のカテゴリ。 */
  category?: InputMaybe<DatasetTypeCategory>;
  /** データセットの種類が属するPLATEAU都市モデルの仕様名。 */
  plateauSpec?: InputMaybe<Scalars['String']['input']>;
  /** データセットの種類が属するPLATEAU都市モデルの仕様の公開年度（西暦）。 */
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** データセットを検索するためのクエリ。 */
export type DatasetsInput = {
  /**
   * PLATEAU ARで閲覧可能なデータセットを含めるかどうか。
   * trueの場合はARで閲覧可能なデータセットのみ、falseの場合はARで閲覧不可能なデータセットのみを返します。
   */
  ar?: InputMaybe<Scalars['Boolean']['input']>;
  /** データセットの地域コード（都道府県コードや市区町村コードが使用可能）。複数指定するとOR条件で検索を行います。 */
  areaCodes?: InputMaybe<Array<Scalars['AreaCode']['input']>>;
  /** 検索結果から除外するデータセットの種類コード。種類コードは例えば "bldg"（建築物モデル）の他、"plateau"（PLATEAU都市モデルデータセット）、"related"（関連データセット）、"generic"（その他のデータセット）が使用可能です。 */
  excludeTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 特殊なグループを持つデータセットのみを検索対象にするかどうか。デフォルトはfalseです。 */
  groupedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** 検索結果に含めるデータセットの種類コード。未指定の場合、全てのデータセットの種類を対象に検索し、指定するとその種類で検索結果を絞り込みます。種類コードは例えば "bldg"（建築物モデル）の他、"plateau"（PLATEAU都市モデルデータセット）、"related"（関連データセット）、"generic"（その他のデータセット）が使用可能です。 */
  includeTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 仕様書のバージョン。「第2.3版」「2.3」「2」などの文字列が使用可能です。 */
  plateauSpec?: InputMaybe<Scalars['String']['input']>;
  /** データの公開年度（西暦）。 */
  registrationYear?: InputMaybe<Scalars['Int']['input']>;
  /** 検索文字列。複数指定するとAND条件で絞り込み検索が行えます。 */
  searchTokens?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * areaCodesで指定された地域に直接属しているデータセットのみを検索対象にするかどうか。
   * デフォルトはfalseで、指定された地域に間接的に属するデータセットも全て検索します。
   * 例えば、札幌市を対象にした場合、札幌市には中央区や北区といった区のデータセットも存在しますが、trueにすると札幌市のデータセットのみを返します。
   */
  shallow?: InputMaybe<Scalars['Boolean']['input']>;
  /** データの整備年度（西暦）。 */
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** 浸水想定区域モデルにおける浸水規模。 */
export enum FloodingScale {
  /** 想定最大規模 */
  ExpectedMaximum = 'EXPECTED_MAXIMUM',
  /** 計画規模 */
  Planned = 'PLANNED'
}

/** ユースケースデータなどを含む、その他のデータセット。 */
export type GenericDataset = Dataset & Node & {
  __typename?: 'GenericDataset';
  /** 管理者用 */
  admin?: Maybe<Scalars['Any']['output']>;
  /** PLATEAU ARで閲覧可能なデータセットかどうか。 */
  ar: Scalars['Boolean']['output'];
  /** データセットが属する市。 */
  city?: Maybe<City>;
  /** データセットが属する市コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  cityCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する市のID。 */
  cityId?: Maybe<Scalars['ID']['output']>;
  /** データセットの説明 */
  description?: Maybe<Scalars['String']['output']>;
  /** データセットを分類するグループ。グループが階層構造になっている場合は、親から子の順番で複数のグループ名が存在することがあります。 */
  groups?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  /** データセットのアイテム。 */
  items: Array<GenericDatasetItem>;
  /** データセット名 */
  name: Scalars['String']['output'];
  /** データセットの公開データのURL。 */
  openDataUrl?: Maybe<Scalars['String']['output']>;
  /** データセットが属する都道府県。 */
  prefecture?: Maybe<Prefecture>;
  /** データセットが属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する都道府県のID。 */
  prefectureId?: Maybe<Scalars['ID']['output']>;
  /** データセットの公開年度（西暦） */
  registerationYear: Scalars['Int']['output'];
  /** データセットの種類。 */
  type: GenericDatasetType;
  /** データセットの種類コード。 */
  typeCode: Scalars['String']['output'];
  /** データセットの種類のID。 */
  typeId: Scalars['ID']['output'];
  /** データセットが属する区。 */
  ward?: Maybe<Ward>;
  /** データセットが属する区コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  wardCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する区のID。 */
  wardId?: Maybe<Scalars['ID']['output']>;
  /** データセットの整備年度（西暦） */
  year: Scalars['Int']['output'];
};

/** その他のデータセットのアイテム。 */
export type GenericDatasetItem = DatasetItem & Node & {
  __typename?: 'GenericDatasetItem';
  /** データセットのアイテムのフォーマット。 */
  format: DatasetFormat;
  id: Scalars['ID']['output'];
  /**
   * データセットのアイテムのレイヤー名。MVTやWMSなどのフォーマットの場合のみ存在。
   * レイヤー名が複数存在する場合は、同時に複数のレイヤーを表示可能であることを意味します。
   */
  layers?: Maybe<Array<Scalars['String']['output']>>;
  /** データセットのアイテム名。 */
  name: Scalars['String']['output'];
  /** データセットのアイテムが属するデータセット。 */
  parent?: Maybe<GenericDataset>;
  /** データセットのアイテムが属するデータセットのID。 */
  parentId: Scalars['ID']['output'];
  /** データセットのアイテムのURL。 */
  url: Scalars['String']['output'];
};

/** その他のデータセットの種類。 */
export type GenericDatasetType = DatasetType & Node & {
  __typename?: 'GenericDatasetType';
  /** データセットの種類のカテゴリ。 */
  category: DatasetTypeCategory;
  /** データセットの種類コード。「usecase」など。 */
  code: Scalars['String']['output'];
  /** データセット（DatasetInput内のincludeTypesとexcludeTypesの指定は無視されます）。 */
  datasets: Array<GenericDataset>;
  id: Scalars['ID']['output'];
  /** データセットの種類名。 */
  name: Scalars['String']['output'];
  /** データセットの種類の順番を示す数字。大きいほど後に表示されます。 */
  order: Scalars['Int']['output'];
};


/** その他のデータセットの種類。 */
export type GenericDatasetTypeDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** 全球（グローバル）エリア。特定の地域に属さない全球データを扱うための特殊なエリア。 */
export type GlobalArea = Area & Node & {
  __typename?: 'GlobalArea';
  /** 地域に属する子地域。GlobalAreaの場合は常に空配列。 */
  children: Array<Area>;
  /** 地域コード。"global" という固定値。 */
  code: Scalars['AreaCode']['output'];
  /** 全球データセット（DatasetInput内のareasCodeの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** 地域名。"全球" という固定値。 */
  name: Scalars['String']['output'];
  /** 地域の親となる地域。GlobalAreaの場合は常にnull。 */
  parent?: Maybe<Area>;
  /** 地域の親となる地域のID。GlobalAreaの場合は常にnull。 */
  parentId?: Maybe<Scalars['ID']['output']>;
  /** 地域の種類 */
  type: AreaType;
};


/** 全球（グローバル）エリア。特定の地域に属さない全球データを扱うための特殊なエリア。 */
export type GlobalAreaDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** IDを持つオブジェクト。nodeまたはnodesクエリでIDを指定して検索可能です。 */
export type Node = {
  /** オブジェクトのID */
  id: Scalars['ID']['output'];
};

/** PLATEAU都市モデルの通常のデータセット。例えば、地物型が建築物モデル（bldg）などのデータセットです。 */
export type PlateauDataset = Dataset & Node & {
  __typename?: 'PlateauDataset';
  /** 管理者用 */
  admin?: Maybe<Scalars['Any']['output']>;
  /** PLATEAU ARで閲覧可能なデータセットかどうか。 */
  ar: Scalars['Boolean']['output'];
  /** データセットが属する市。 */
  city?: Maybe<City>;
  /** データセットが属する市コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  cityCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する市のID。 */
  cityId?: Maybe<Scalars['ID']['output']>;
  /** データセットの説明 */
  description?: Maybe<Scalars['String']['output']>;
  /** データセットを分類するグループ。グループが階層構造になっている場合は、親から子の順番で複数のグループ名が存在することがあります。 */
  groups?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  /** データセットのアイテム。 */
  items: Array<PlateauDatasetItem>;
  /** データセット名 */
  name: Scalars['String']['output'];
  /** データセットの公開データのURL。 */
  openDataUrl?: Maybe<Scalars['String']['output']>;
  /** データセットが準拠するPLATEAU都市モデルの仕様。 */
  plateauSpecMinor: PlateauSpecMinor;
  /** データセットが準拠するPLATEAU都市モデルの仕様のマイナーバージョンへのID。 */
  plateauSpecMinorId: Scalars['ID']['output'];
  /** データセットが属する都道府県。 */
  prefecture?: Maybe<Prefecture>;
  /** データセットが属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する都道府県のID。 */
  prefectureId?: Maybe<Scalars['ID']['output']>;
  /** データセットの公開年度（西暦） */
  registerationYear: Scalars['Int']['output'];
  /** 河川。地物型が洪水浸水想定区域モデル（fld）の場合のみ存在します。 */
  river?: Maybe<River>;
  /** データセットのサブコード。都市計画決定情報の○○区域や洪水浸水想定区域の河川名などのコード表現が含まれます。 */
  subcode?: Maybe<Scalars['String']['output']>;
  /** データセットのサブ名。都市計画決定情報の○○区域や洪水浸水想定区域の河川名などが含まれます。 */
  subname?: Maybe<Scalars['String']['output']>;
  /** データセットのサブコードの順番。大きいほど後に表示されます。 */
  suborder?: Maybe<Scalars['Int']['output']>;
  /** データセットの種類。 */
  type: PlateauDatasetType;
  /** データセットの種類コード。 */
  typeCode: Scalars['String']['output'];
  /** データセットの種類のID。 */
  typeId: Scalars['ID']['output'];
  /** データセットが属する区。 */
  ward?: Maybe<Ward>;
  /** データセットが属する区コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  wardCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する区のID。 */
  wardId?: Maybe<Scalars['ID']['output']>;
  /** データセットの整備年度（西暦） */
  year: Scalars['Int']['output'];
};

/** PLATEAU都市モデルのデータセットのアイテム。 */
export type PlateauDatasetItem = DatasetItem & Node & {
  __typename?: 'PlateauDatasetItem';
  /** 浸水規模。地物型が災害リスク（浸水）モデルの場合のみ存在することがあります。 */
  floodingScale?: Maybe<FloodingScale>;
  /** 浸水規模の枝番。地物型が災害リスク（浸水）モデルの場合のみ存在することがあります。 */
  floodingScaleSuffix?: Maybe<Scalars['String']['output']>;
  /** データセットのアイテムのフォーマット。 */
  format: DatasetFormat;
  id: Scalars['ID']['output'];
  /**
   * データセットのアイテムのレイヤー名。MVTやWMSなどのフォーマットの場合のみ存在。
   * レイヤー名が複数存在する場合は、同時に複数のレイヤーを表示可能であることを意味します。
   */
  layers?: Maybe<Array<Scalars['String']['output']>>;
  /** データセットのアイテムのLOD（詳細度・Level of Detail）。1、2、3、4などの整数値です。 */
  lod?: Maybe<Scalars['Int']['output']>;
  /** データセットのアイテムのLOD（詳細度・Level of Detail）のうち、小数点以下の値が存在する場合に定義されます。例えばLOD3.1の場合は1、3.0の場合は0となります。LODがnullの場合はnullとなります。 */
  lodEx?: Maybe<Scalars['Int']['output']>;
  /** データセットのアイテム名。 */
  name: Scalars['String']['output'];
  /** データセットのアイテムが属するデータセット。 */
  parent?: Maybe<PlateauDataset>;
  /** データセットのアイテムが属するデータセットのID。 */
  parentId: Scalars['ID']['output'];
  /** データセットのアイテムのテクスチャの種類。 */
  texture?: Maybe<Texture>;
  /** データセットのアイテムのURL。 */
  url: Scalars['String']['output'];
};

/** PLATEAU都市モデルのデータセットの種類。 */
export type PlateauDatasetType = DatasetType & Node & {
  __typename?: 'PlateauDatasetType';
  /** データセットの種類のカテゴリ。 */
  category: DatasetTypeCategory;
  /** データセットの種類コード。「bldg」など。 */
  code: Scalars['String']['output'];
  /** データセット（DatasetInput内のincludeTypesとexcludeTypesの指定は無視されます）。 */
  datasets: Array<PlateauDataset>;
  /** 災害リスク（浸水）モデルかどうか。河川などの情報が利用可能です。 */
  flood: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  /** データセットの種類名。 */
  name: Scalars['String']['output'];
  /** データセットの種類の順番を示す数字。大きいほど後に表示されます。 */
  order: Scalars['Int']['output'];
  /** データセットの種類が属するPLATEAU都市モデルの仕様。 */
  plateauSpec?: Maybe<PlateauSpec>;
  /** データセットの種類が属するPLATEAU都市モデルの仕様のID。 */
  plateauSpecId: Scalars['ID']['output'];
  /** データセットの種類が属するPLATEAU都市モデルの仕様の公開年度（西暦）。 */
  year: Scalars['Int']['output'];
};


/** PLATEAU都市モデルのデータセットの種類。 */
export type PlateauDatasetTypeDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** PLATEAU都市モデルの仕様のメジャーバージョン。 */
export type PlateauSpec = Node & {
  __typename?: 'PlateauSpec';
  /** その仕様に含まれるデータセットの種類。 */
  datasetTypes: Array<PlateauDatasetType>;
  id: Scalars['ID']['output'];
  /** PLATEAU都市モデルの仕様のバージョン番号。 */
  majorVersion: Scalars['Int']['output'];
  /** その仕様のマイナーバージョン。 */
  minorVersions: Array<PlateauSpecMinor>;
  /** 仕様の公開年度（西暦）。 */
  year: Scalars['Int']['output'];
};

/** PLATEAU都市モデルの仕様のマイナーバージョン。 */
export type PlateauSpecMinor = Node & {
  __typename?: 'PlateauSpecMinor';
  /** その仕様に準拠して整備されたPLATEAU都市モデルデータセット（DatasetInput内のplateauSpecの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** メジャーバージョン番号。 2のような整数です。 */
  majorVersion: Scalars['Int']['output'];
  /** PLATEAU都市モデルの仕様の名前。 "第2.3版" のような文字列です。 */
  name: Scalars['String']['output'];
  /** その仕様が属する仕様のメジャーバージョン。 */
  parent: PlateauSpec;
  /** その仕様が属する仕様のメジャーバージョンのID。 */
  parentId: Scalars['ID']['output'];
  /** バージョンを表す文字列。 "2.3" のような文字列です。 */
  version: Scalars['String']['output'];
  /** 仕様の公開年度（西暦）。 */
  year: Scalars['Int']['output'];
};


/** PLATEAU都市モデルの仕様のマイナーバージョン。 */
export type PlateauSpecMinorDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** 都道府県 */
export type Prefecture = Area & Node & {
  __typename?: 'Prefecture';
  /** 地域に属する子地域。 */
  children: Array<Area>;
  /** 都道府県に属する市区町村 */
  cities: Array<City>;
  /** 都道府県コード。2桁の数字から成る文字列です。 */
  code: Scalars['AreaCode']['output'];
  /** 都道府県に属するデータセット（DatasetInput内のareasCodeの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** 都道府県名 */
  name: Scalars['String']['output'];
  /** 地域の親となる地域。 */
  parent?: Maybe<Area>;
  /** 地域の親となる地域のID。市区町村の親は都道府県です。政令指定都市の区の親は市です。 */
  parentId?: Maybe<Scalars['ID']['output']>;
  /** 地域の種類 */
  type: AreaType;
};


/** 都道府県 */
export type PrefectureDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** PLATEAU GraphQL API のクエリルート。 */
export type Query = {
  __typename?: 'Query';
  /** 地域コード（都道府県コードや市区町村コード）で地域を取得します。 */
  area?: Maybe<Area>;
  /** 地域を検索します。 */
  areas: Array<Area>;
  /** データセットの種類を検索します。 */
  datasetTypes: Array<DatasetType>;
  /** データセットを検索します。 */
  datasets: Array<Dataset>;
  /** 指定されたIDでオブジェクトを取得します。 */
  node?: Maybe<Node>;
  /** 指定されたIDのリストからオブジェクトを検索します。 */
  nodes: Array<Maybe<Node>>;
  /** 利用可能な全てのPLATEAU都市モデルの仕様を取得します。 */
  plateauSpecs: Array<PlateauSpec>;
  /** 利用可能な全てのデータセットの年度（西暦）を取得します。 */
  years: Array<Scalars['Int']['output']>;
};


/** PLATEAU GraphQL API のクエリルート。 */
export type QueryAreaArgs = {
  code: Scalars['AreaCode']['input'];
};


/** PLATEAU GraphQL API のクエリルート。 */
export type QueryAreasArgs = {
  input?: InputMaybe<AreasInput>;
};


/** PLATEAU GraphQL API のクエリルート。 */
export type QueryDatasetTypesArgs = {
  input?: InputMaybe<DatasetTypesInput>;
};


/** PLATEAU GraphQL API のクエリルート。 */
export type QueryDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};


/** PLATEAU GraphQL API のクエリルート。 */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** PLATEAU GraphQL API のクエリルート。 */
export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};

/**
 * PLATEAU都市モデルデータセットと併せて表示することで情報を補完できる、関連データセット。
 * 避難施設・ランドマーク・鉄道駅・鉄道・緊急輸送道路・公園・行政界などのデータセット。
 */
export type RelatedDataset = Dataset & Node & {
  __typename?: 'RelatedDataset';
  /** 管理者用 */
  admin?: Maybe<Scalars['Any']['output']>;
  /** PLATEAU ARで閲覧可能なデータセットかどうか。 */
  ar: Scalars['Boolean']['output'];
  /** データセットが属する市。 */
  city?: Maybe<City>;
  /** データセットが属する市コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  cityCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する市のID。 */
  cityId?: Maybe<Scalars['ID']['output']>;
  /** データセットの説明 */
  description?: Maybe<Scalars['String']['output']>;
  /** データセットを分類するグループ。グループが階層構造になっている場合は、親から子の順番で複数のグループ名が存在することがあります。 */
  groups?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  /** データセットのアイテム。 */
  items: Array<RelatedDatasetItem>;
  /** データセット名 */
  name: Scalars['String']['output'];
  /** データセットの公開データのURL。 */
  openDataUrl?: Maybe<Scalars['String']['output']>;
  /** データセットが属する都道府県。 */
  prefecture?: Maybe<Prefecture>;
  /** データセットが属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する都道府県のID。 */
  prefectureId?: Maybe<Scalars['ID']['output']>;
  /** データセットの公開年度（西暦） */
  registerationYear: Scalars['Int']['output'];
  /** データセットの種類。 */
  type: RelatedDatasetType;
  /** データセットの種類コード。 */
  typeCode: Scalars['String']['output'];
  /** データセットの種類のID。 */
  typeId: Scalars['ID']['output'];
  /** データセットが属する区。 */
  ward?: Maybe<Ward>;
  /** データセットが属する区コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  wardCode?: Maybe<Scalars['AreaCode']['output']>;
  /** データセットが属する区のID。 */
  wardId?: Maybe<Scalars['ID']['output']>;
  /** データセットの整備年度（西暦） */
  year: Scalars['Int']['output'];
};

/** 関連データセットのアイテム。 */
export type RelatedDatasetItem = DatasetItem & Node & {
  __typename?: 'RelatedDatasetItem';
  /** データセットのアイテムのフォーマット。 */
  format: DatasetFormat;
  id: Scalars['ID']['output'];
  /**
   * データセットのアイテムのレイヤー名。MVTやWMSなどのフォーマットの場合のみ存在。
   * レイヤー名が複数存在する場合は、同時に複数のレイヤーを表示可能であることを意味します。
   */
  layers?: Maybe<Array<Scalars['String']['output']>>;
  /** データセットのアイテム名。 */
  name: Scalars['String']['output'];
  /**
   * データセットのアイテムの変換前データのフォーマット。
   * originalUrlフィールドが存在する場合のみ存在します。
   */
  originalFormat?: Maybe<DatasetFormat>;
  /**
   * データセットのアイテムの変換前データのURL。
   * 鉄道駅情報・ランドマーク情報はurlフィールドではCZML形式で提供されていますが、元となったGeoJSONデータが存在します。
   */
  originalUrl?: Maybe<Scalars['String']['output']>;
  /** データセットのアイテムが属するデータセット。 */
  parent?: Maybe<RelatedDataset>;
  /** データセットのアイテムが属するデータセットのID。 */
  parentId: Scalars['ID']['output'];
  /** データセットのアイテムのURL。 */
  url: Scalars['String']['output'];
};

/** 関連データセットの種類。 */
export type RelatedDatasetType = DatasetType & Node & {
  __typename?: 'RelatedDatasetType';
  /** データセットの種類のカテゴリ。 */
  category: DatasetTypeCategory;
  /** データセットの種類コード。「park」など。 */
  code: Scalars['String']['output'];
  /** データセット（DatasetInput内のincludeTypesとexcludeTypesの指定は無視されます）。 */
  datasets: Array<RelatedDataset>;
  id: Scalars['ID']['output'];
  /** データセットの種類名。 */
  name: Scalars['String']['output'];
  /** データセットの種類の順番を示す数字。大きいほど後に表示されます。 */
  order: Scalars['Int']['output'];
};


/** 関連データセットの種類。 */
export type RelatedDatasetTypeDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

/** 洪水浸水想定区域モデルにおける河川。 */
export type River = {
  __typename?: 'River';
  /** 管理区間 */
  admin: RiverAdmin;
  /** 河川名。通常、「〜水系〜川」という形式になります。 */
  name: Scalars['String']['output'];
};

/** 河川の管理区間 */
export enum RiverAdmin {
  /** 国管理区間 */
  National = 'NATIONAL',
  /** 都道府県管理区間 */
  Prefecture = 'PREFECTURE'
}

/** 建築物モデルのテクスチャの種類。 */
export enum Texture {
  /** テクスチャなし */
  None = 'NONE',
  /** テクスチャあり */
  Texture = 'TEXTURE'
}

/** 区（政令指定都市のみ） */
export type Ward = Area & Node & {
  __typename?: 'Ward';
  /** 地域に属する子地域。 */
  children: Array<Area>;
  /** 区が属する市。 */
  city?: Maybe<City>;
  /** 区が属する市のコード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  cityCode: Scalars['AreaCode']['output'];
  /** 区が属する市のID。 */
  cityId: Scalars['ID']['output'];
  /** 区コード。先頭に都道府県コードを含む5桁の数字から成る文字列です。 */
  code: Scalars['AreaCode']['output'];
  /** 区に属するデータセット（DatasetInput内のareasCodeの指定は無視されます）。 */
  datasets: Array<Dataset>;
  id: Scalars['ID']['output'];
  /** 区名 */
  name: Scalars['String']['output'];
  /** 地域の親となる地域。 */
  parent: City;
  /** 地域の親となる地域のID。市区町村の親は都道府県です。政令指定都市の区の親は市です。 */
  parentId?: Maybe<Scalars['ID']['output']>;
  /** 区が属する都道府県。 */
  prefecture?: Maybe<Prefecture>;
  /** 区が属する都道府県コード。2桁の数字から成る文字列です。 */
  prefectureCode: Scalars['AreaCode']['output'];
  /** 区が属する都道府県のID。 */
  prefectureId: Scalars['ID']['output'];
  /** 種類 */
  type: AreaType;
};


/** 区（政令指定都市のみ） */
export type WardDatasetsArgs = {
  input?: InputMaybe<DatasetsInput>;
};

type DatasetFragment_GenericDataset_Fragment = { __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> };

type DatasetFragment_PlateauDataset_Fragment = { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> };

type DatasetFragment_RelatedDataset_Fragment = { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> };

export type DatasetFragmentFragment = DatasetFragment_GenericDataset_Fragment | DatasetFragment_PlateauDataset_Fragment | DatasetFragment_RelatedDataset_Fragment;

export type AreasQueryVariables = Exact<{
  input: AreasInput;
}>;


export type AreasQuery = { __typename?: 'Query', areas: Array<{ __typename?: 'City', id: string, code: any, name: string } | { __typename?: 'GlobalArea', id: string, code: any, name: string } | { __typename?: 'Prefecture', id: string, code: any, name: string } | { __typename?: 'Ward', id: string, code: any, name: string }> };

export type AreaDatasetsQueryVariables = Exact<{
  code: Scalars['AreaCode']['input'];
  input: DatasetsInput;
}>;


export type AreaDatasetsQuery = { __typename?: 'Query', area?: { __typename?: 'City', id: string, code: any, name: string, datasets: Array<{ __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> }> } | { __typename?: 'GlobalArea', id: string, code: any, name: string, datasets: Array<{ __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> }> } | { __typename?: 'Prefecture', id: string, code: any, name: string, datasets: Array<{ __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> }> } | { __typename?: 'Ward', id: string, code: any, name: string, datasets: Array<{ __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> }> } | null };

export type DatasetsQueryVariables = Exact<{
  input: DatasetsInput;
}>;


export type DatasetsQuery = { __typename?: 'Query', datasets: Array<{ __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> }> };

export type DatasetByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DatasetByIdQuery = { __typename?: 'Query', node?: { __typename?: 'City' } | { __typename?: 'CityGMLDataset' } | { __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'GenericDatasetItem' } | { __typename?: 'GenericDatasetType' } | { __typename?: 'GlobalArea' } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDatasetItem' } | { __typename?: 'PlateauDatasetType' } | { __typename?: 'PlateauSpec' } | { __typename?: 'PlateauSpecMinor' } | { __typename?: 'Prefecture' } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDatasetItem' } | { __typename?: 'RelatedDatasetType' } | { __typename?: 'Ward' } | null };

export type DatasetsByIdsQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type DatasetsByIdsQuery = { __typename?: 'Query', nodes: Array<{ __typename?: 'City' } | { __typename?: 'CityGMLDataset' } | { __typename?: 'GenericDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'GenericDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'GenericDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'GenericDatasetItem' } | { __typename?: 'GenericDatasetType' } | { __typename?: 'GlobalArea' } | { __typename?: 'PlateauDataset', subname?: string | null, id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, plateauSpecMinor: { __typename?: 'PlateauSpecMinor', majorVersion: number }, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'PlateauDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'PlateauDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'PlateauDatasetItem' } | { __typename?: 'PlateauDatasetType' } | { __typename?: 'PlateauSpec' } | { __typename?: 'PlateauSpecMinor' } | { __typename?: 'Prefecture' } | { __typename?: 'RelatedDataset', id: string, name: string, description?: string | null, year: number, groups?: Array<string> | null, openDataUrl?: string | null, prefectureId?: string | null, prefectureCode?: any | null, cityId?: string | null, cityCode?: any | null, wardId?: string | null, wardCode?: any | null, admin?: any | null, prefecture?: { __typename?: 'Prefecture', name: string, code: any } | null, city?: { __typename?: 'City', name: string, code: any } | null, ward?: { __typename?: 'Ward', name: string, code: any } | null, type: { __typename?: 'RelatedDatasetType', id: string, code: string, name: string, category: DatasetTypeCategory, order: number }, items: Array<{ __typename?: 'RelatedDatasetItem', id: string, format: DatasetFormat, name: string, url: string, layers?: Array<string> | null }> } | { __typename?: 'RelatedDatasetItem' } | { __typename?: 'RelatedDatasetType' } | { __typename?: 'Ward' } | null> };

export type DatasetTypesQueryVariables = Exact<{
  input?: InputMaybe<DatasetTypesInput>;
}>;


export type DatasetTypesQuery = { __typename?: 'Query', datasetTypes: Array<{ __typename?: 'GenericDatasetType', id: string, name: string, code: string, order: number } | { __typename?: 'PlateauDatasetType', id: string, name: string, code: string, order: number } | { __typename?: 'RelatedDatasetType', id: string, name: string, code: string, order: number }> };

export type PlateauSpecsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlateauSpecsQuery = { __typename?: 'Query', plateauSpecs: Array<{ __typename?: 'PlateauSpec', majorVersion: number }> };

export const DatasetFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"groups"}},{"kind":"Field","name":{"kind":"Name","value":"openDataUrl"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureId"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureCode"}},{"kind":"Field","name":{"kind":"Name","value":"cityId"}},{"kind":"Field","name":{"kind":"Name","value":"cityCode"}},{"kind":"Field","name":{"kind":"Name","value":"wardId"}},{"kind":"Field","name":{"kind":"Name","value":"wardCode"}},{"kind":"Field","name":{"kind":"Name","value":"prefecture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"layers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlateauDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subname"}},{"kind":"Field","name":{"kind":"Name","value":"plateauSpecMinor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"majorVersion"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetFragmentFragment, unknown>;
export const AreasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Areas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AreasInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AreasQuery, AreasQueryVariables>;
export const AreaDatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AreaDatasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AreaCode"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"area"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"groups"}},{"kind":"Field","name":{"kind":"Name","value":"openDataUrl"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureId"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureCode"}},{"kind":"Field","name":{"kind":"Name","value":"cityId"}},{"kind":"Field","name":{"kind":"Name","value":"cityCode"}},{"kind":"Field","name":{"kind":"Name","value":"wardId"}},{"kind":"Field","name":{"kind":"Name","value":"wardCode"}},{"kind":"Field","name":{"kind":"Name","value":"prefecture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"layers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlateauDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subname"}},{"kind":"Field","name":{"kind":"Name","value":"plateauSpecMinor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"majorVersion"}}]}}]}}]}}]} as unknown as DocumentNode<AreaDatasetsQuery, AreaDatasetsQueryVariables>;
export const DatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Datasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"groups"}},{"kind":"Field","name":{"kind":"Name","value":"openDataUrl"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureId"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureCode"}},{"kind":"Field","name":{"kind":"Name","value":"cityId"}},{"kind":"Field","name":{"kind":"Name","value":"cityCode"}},{"kind":"Field","name":{"kind":"Name","value":"wardId"}},{"kind":"Field","name":{"kind":"Name","value":"wardCode"}},{"kind":"Field","name":{"kind":"Name","value":"prefecture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"layers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlateauDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subname"}},{"kind":"Field","name":{"kind":"Name","value":"plateauSpecMinor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"majorVersion"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetsQuery, DatasetsQueryVariables>;
export const DatasetByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DatasetById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"groups"}},{"kind":"Field","name":{"kind":"Name","value":"openDataUrl"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureId"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureCode"}},{"kind":"Field","name":{"kind":"Name","value":"cityId"}},{"kind":"Field","name":{"kind":"Name","value":"cityCode"}},{"kind":"Field","name":{"kind":"Name","value":"wardId"}},{"kind":"Field","name":{"kind":"Name","value":"wardCode"}},{"kind":"Field","name":{"kind":"Name","value":"prefecture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"layers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlateauDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subname"}},{"kind":"Field","name":{"kind":"Name","value":"plateauSpecMinor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"majorVersion"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetByIdQuery, DatasetByIdQueryVariables>;
export const DatasetsByIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DatasetsByIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"groups"}},{"kind":"Field","name":{"kind":"Name","value":"openDataUrl"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureId"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureCode"}},{"kind":"Field","name":{"kind":"Name","value":"cityId"}},{"kind":"Field","name":{"kind":"Name","value":"cityCode"}},{"kind":"Field","name":{"kind":"Name","value":"wardId"}},{"kind":"Field","name":{"kind":"Name","value":"wardCode"}},{"kind":"Field","name":{"kind":"Name","value":"prefecture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"city"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"layers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlateauDataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subname"}},{"kind":"Field","name":{"kind":"Name","value":"plateauSpecMinor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"majorVersion"}}]}}]}}]}}]} as unknown as DocumentNode<DatasetsByIdsQuery, DatasetsByIdsQueryVariables>;
export const DatasetTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DatasetTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DatasetTypesInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datasetTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]} as unknown as DocumentNode<DatasetTypesQuery, DatasetTypesQueryVariables>;
export const PlateauSpecsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlateauSpecs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plateauSpecs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"majorVersion"}}]}}]}}]} as unknown as DocumentNode<PlateauSpecsQuery, PlateauSpecsQueryVariables>;