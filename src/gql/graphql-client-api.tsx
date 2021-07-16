import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Any: any;
  Cursor: string;
  DateTime: Date;
  FileSize: number;
  Lang: any;
  PluginExtensionID: string;
  PluginID: string;
  PropertySchemaFieldID: string;
  PropertySchemaID: string;
  TranslatedString: any;
  URL: string;
  Upload: any;
};



export type AddDatasetSchemaInput = {
  sceneId: Scalars['ID'];
  name: Scalars['String'];
  representativefield?: Maybe<Scalars['ID']>;
};

export type AddDatasetSchemaPayload = {
  __typename?: 'AddDatasetSchemaPayload';
  datasetSchema?: Maybe<DatasetSchema>;
};

export type AddDynamicDatasetInput = {
  datasetSchemaId: Scalars['ID'];
  author: Scalars['String'];
  content: Scalars['String'];
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  target?: Maybe<Scalars['String']>;
};

export type AddDynamicDatasetPayload = {
  __typename?: 'AddDynamicDatasetPayload';
  datasetSchema?: Maybe<DatasetSchema>;
  dataset?: Maybe<Dataset>;
};

export type AddDynamicDatasetSchemaInput = {
  sceneId: Scalars['ID'];
};

export type AddDynamicDatasetSchemaPayload = {
  __typename?: 'AddDynamicDatasetSchemaPayload';
  datasetSchema?: Maybe<DatasetSchema>;
};

export type AddInfoboxFieldInput = {
  layerId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  index?: Maybe<Scalars['Int']>;
};

export type AddInfoboxFieldPayload = {
  __typename?: 'AddInfoboxFieldPayload';
  infoboxField: InfoboxField;
  layer: Layer;
};

export type AddLayerGroupInput = {
  parentLayerId: Scalars['ID'];
  pluginId?: Maybe<Scalars['PluginID']>;
  extensionId?: Maybe<Scalars['PluginExtensionID']>;
  index?: Maybe<Scalars['Int']>;
  linkedDatasetSchemaID?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
};

export type AddLayerGroupPayload = {
  __typename?: 'AddLayerGroupPayload';
  layer: LayerGroup;
  parentLayer: LayerGroup;
  index?: Maybe<Scalars['Int']>;
};

export type AddLayerItemInput = {
  parentLayerId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  index?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
};

export type AddLayerItemPayload = {
  __typename?: 'AddLayerItemPayload';
  layer: LayerItem;
  parentLayer: LayerGroup;
  index?: Maybe<Scalars['Int']>;
};

export type AddMemberToTeamInput = {
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
};

export type AddMemberToTeamPayload = {
  __typename?: 'AddMemberToTeamPayload';
  team: Team;
};

export type AddPropertyItemInput = {
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  index?: Maybe<Scalars['Int']>;
  nameFieldValue?: Maybe<Scalars['Any']>;
  nameFieldType?: Maybe<ValueType>;
};

export type AddWidgetInput = {
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
};

export type AddWidgetPayload = {
  __typename?: 'AddWidgetPayload';
  scene: Scene;
  sceneWidget: SceneWidget;
};


export type Asset = Node & {
  __typename?: 'Asset';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  teamId: Scalars['ID'];
  name: Scalars['String'];
  size: Scalars['FileSize'];
  url: Scalars['String'];
  contentType: Scalars['String'];
  team?: Maybe<Team>;
};

export type AssetConnection = {
  __typename?: 'AssetConnection';
  edges: Array<AssetEdge>;
  nodes: Array<Maybe<Asset>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type AssetEdge = {
  __typename?: 'AssetEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Asset>;
};

export type Camera = {
  __typename?: 'Camera';
  lat: Scalars['Float'];
  lng: Scalars['Float'];
  altitude: Scalars['Float'];
  heading: Scalars['Float'];
  pitch: Scalars['Float'];
  roll: Scalars['Float'];
  fov: Scalars['Float'];
};

export type CheckProjectAliasPayload = {
  __typename?: 'CheckProjectAliasPayload';
  alias: Scalars['String'];
  available: Scalars['Boolean'];
};

export type CreateAssetInput = {
  teamId: Scalars['ID'];
  file: Scalars['Upload'];
};

export type CreateAssetPayload = {
  __typename?: 'CreateAssetPayload';
  asset: Asset;
};

export type CreateInfoboxInput = {
  layerId: Scalars['ID'];
};

export type CreateInfoboxPayload = {
  __typename?: 'CreateInfoboxPayload';
  layer: Layer;
};

export type CreateProjectInput = {
  teamId: Scalars['ID'];
  visualizer: Visualizer;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['URL']>;
  alias?: Maybe<Scalars['String']>;
  archived?: Maybe<Scalars['Boolean']>;
};

export type CreateSceneInput = {
  projectId: Scalars['ID'];
};

export type CreateScenePayload = {
  __typename?: 'CreateScenePayload';
  scene: Scene;
};

export type CreateTeamInput = {
  name: Scalars['String'];
};

export type CreateTeamPayload = {
  __typename?: 'CreateTeamPayload';
  team: Team;
};


export type Dataset = Node & {
  __typename?: 'Dataset';
  id: Scalars['ID'];
  source: Scalars['String'];
  schemaId: Scalars['ID'];
  fields: Array<DatasetField>;
  schema?: Maybe<DatasetSchema>;
  name?: Maybe<Scalars['String']>;
};

export type DatasetConnection = {
  __typename?: 'DatasetConnection';
  edges: Array<DatasetEdge>;
  nodes: Array<Maybe<Dataset>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type DatasetEdge = {
  __typename?: 'DatasetEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Dataset>;
};

export type DatasetField = {
  __typename?: 'DatasetField';
  fieldId: Scalars['ID'];
  schemaId: Scalars['ID'];
  source: Scalars['String'];
  type: ValueType;
  value?: Maybe<Scalars['Any']>;
  schema?: Maybe<DatasetSchema>;
  field?: Maybe<DatasetSchemaField>;
  valueRef?: Maybe<Dataset>;
};

export type DatasetSchema = Node & {
  __typename?: 'DatasetSchema';
  id: Scalars['ID'];
  source: Scalars['String'];
  name: Scalars['String'];
  sceneId: Scalars['ID'];
  fields: Array<DatasetSchemaField>;
  representativeFieldId?: Maybe<Scalars['ID']>;
  dynamic?: Maybe<Scalars['Boolean']>;
  datasets: DatasetConnection;
  scene?: Maybe<Scene>;
  representativeField?: Maybe<DatasetSchemaField>;
};


export type DatasetSchemaDatasetsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};

export type DatasetSchemaConnection = {
  __typename?: 'DatasetSchemaConnection';
  edges: Array<DatasetSchemaEdge>;
  nodes: Array<Maybe<DatasetSchema>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type DatasetSchemaEdge = {
  __typename?: 'DatasetSchemaEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<DatasetSchema>;
};

export type DatasetSchemaField = Node & {
  __typename?: 'DatasetSchemaField';
  id: Scalars['ID'];
  source: Scalars['String'];
  name: Scalars['String'];
  type: ValueType;
  schemaId: Scalars['ID'];
  refId?: Maybe<Scalars['ID']>;
  schema?: Maybe<DatasetSchema>;
  ref?: Maybe<DatasetSchema>;
};


export type DeleteMeInput = {
  userId: Scalars['ID'];
};

export type DeleteMePayload = {
  __typename?: 'DeleteMePayload';
  userId: Scalars['ID'];
};

export type DeleteProjectInput = {
  projectId: Scalars['ID'];
};

export type DeleteProjectPayload = {
  __typename?: 'DeleteProjectPayload';
  projectId: Scalars['ID'];
};

export type DeleteTeamInput = {
  teamId: Scalars['ID'];
};

export type DeleteTeamPayload = {
  __typename?: 'DeleteTeamPayload';
  teamId: Scalars['ID'];
};


export type ImportDatasetFromGoogleSheetInput = {
  accessToken: Scalars['String'];
  fileId: Scalars['String'];
  sheetName: Scalars['String'];
  sceneId: Scalars['ID'];
  datasetSchemaId?: Maybe<Scalars['ID']>;
};

export type ImportDatasetInput = {
  file: Scalars['Upload'];
  sceneId: Scalars['ID'];
  datasetSchemaId?: Maybe<Scalars['ID']>;
};

export type ImportDatasetPayload = {
  __typename?: 'ImportDatasetPayload';
  datasetSchema: DatasetSchema;
};

export type ImportLayerInput = {
  layerId: Scalars['ID'];
  file: Scalars['Upload'];
  format: LayerEncodingFormat;
};

export type ImportLayerPayload = {
  __typename?: 'ImportLayerPayload';
  layers: Array<Layer>;
  parentLayer: LayerGroup;
};

export type Infobox = {
  __typename?: 'Infobox';
  sceneId: Scalars['ID'];
  layerId: Scalars['ID'];
  propertyId: Scalars['ID'];
  fields: Array<InfoboxField>;
  linkedDatasetId?: Maybe<Scalars['ID']>;
  layer: Layer;
  property?: Maybe<Property>;
  linkedDataset?: Maybe<Dataset>;
  merged?: Maybe<MergedInfobox>;
  scene?: Maybe<Scene>;
};

export type InfoboxField = {
  __typename?: 'InfoboxField';
  id: Scalars['ID'];
  sceneId: Scalars['ID'];
  layerId: Scalars['ID'];
  propertyId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  linkedDatasetId?: Maybe<Scalars['ID']>;
  layer: Layer;
  infobox: Infobox;
  property?: Maybe<Property>;
  plugin?: Maybe<Plugin>;
  extension?: Maybe<PluginExtension>;
  linkedDataset?: Maybe<Dataset>;
  merged?: Maybe<MergedInfoboxField>;
  scene?: Maybe<Scene>;
  scenePlugin?: Maybe<ScenePlugin>;
};

export type InstallPluginInput = {
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
};

export type InstallPluginPayload = {
  __typename?: 'InstallPluginPayload';
  scene: Scene;
  scenePlugin: ScenePlugin;
};


export type LatLng = {
  __typename?: 'LatLng';
  lat: Scalars['Float'];
  lng: Scalars['Float'];
};

export type LatLngHeight = {
  __typename?: 'LatLngHeight';
  lat: Scalars['Float'];
  lng: Scalars['Float'];
  height: Scalars['Float'];
};

export type Layer = {
  id: Scalars['ID'];
  sceneId: Scalars['ID'];
  name: Scalars['String'];
  isVisible: Scalars['Boolean'];
  propertyId?: Maybe<Scalars['ID']>;
  pluginId?: Maybe<Scalars['PluginID']>;
  extensionId?: Maybe<Scalars['PluginExtensionID']>;
  infobox?: Maybe<Infobox>;
  parentId?: Maybe<Scalars['ID']>;
  parent?: Maybe<LayerGroup>;
  property?: Maybe<Property>;
  plugin?: Maybe<Plugin>;
  extension?: Maybe<PluginExtension>;
  scenePlugin?: Maybe<ScenePlugin>;
};

export enum LayerEncodingFormat {
  Kml = 'KML',
  Czml = 'CZML',
  Geojson = 'GEOJSON',
  Shape = 'SHAPE',
  Reearth = 'REEARTH'
}

export type LayerGroup = Layer & {
  __typename?: 'LayerGroup';
  id: Scalars['ID'];
  sceneId: Scalars['ID'];
  name: Scalars['String'];
  isVisible: Scalars['Boolean'];
  propertyId?: Maybe<Scalars['ID']>;
  pluginId?: Maybe<Scalars['PluginID']>;
  extensionId?: Maybe<Scalars['PluginExtensionID']>;
  infobox?: Maybe<Infobox>;
  parentId?: Maybe<Scalars['ID']>;
  linkedDatasetSchemaId?: Maybe<Scalars['ID']>;
  root: Scalars['Boolean'];
  layerIds: Array<Scalars['ID']>;
  parent?: Maybe<LayerGroup>;
  property?: Maybe<Property>;
  plugin?: Maybe<Plugin>;
  extension?: Maybe<PluginExtension>;
  linkedDatasetSchema?: Maybe<DatasetSchema>;
  layers: Array<Maybe<Layer>>;
  scene?: Maybe<Scene>;
  scenePlugin?: Maybe<ScenePlugin>;
};

export type LayerItem = Layer & {
  __typename?: 'LayerItem';
  id: Scalars['ID'];
  sceneId: Scalars['ID'];
  name: Scalars['String'];
  isVisible: Scalars['Boolean'];
  propertyId?: Maybe<Scalars['ID']>;
  pluginId?: Maybe<Scalars['PluginID']>;
  extensionId?: Maybe<Scalars['PluginExtensionID']>;
  infobox?: Maybe<Infobox>;
  parentId?: Maybe<Scalars['ID']>;
  linkedDatasetId?: Maybe<Scalars['ID']>;
  parent?: Maybe<LayerGroup>;
  property?: Maybe<Property>;
  plugin?: Maybe<Plugin>;
  extension?: Maybe<PluginExtension>;
  linkedDataset?: Maybe<Dataset>;
  merged?: Maybe<MergedLayer>;
  scene?: Maybe<Scene>;
  scenePlugin?: Maybe<ScenePlugin>;
};

export type Layers = LayerItem | LayerGroup;

export type LinkDatasetToPropertyValueInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  datasetSchemaIds: Array<Scalars['ID']>;
  datasetSchemaFieldIds: Array<Scalars['ID']>;
  datasetIds?: Maybe<Array<Scalars['ID']>>;
};

export enum ListOperation {
  Add = 'ADD',
  Move = 'MOVE',
  Remove = 'REMOVE'
}

export type MergedInfobox = {
  __typename?: 'MergedInfobox';
  sceneID: Scalars['ID'];
  property?: Maybe<MergedProperty>;
  fields: Array<MergedInfoboxField>;
  scene?: Maybe<Scene>;
};

export type MergedInfoboxField = {
  __typename?: 'MergedInfoboxField';
  originalId: Scalars['ID'];
  sceneID: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  property?: Maybe<MergedProperty>;
  plugin?: Maybe<Plugin>;
  extension?: Maybe<PluginExtension>;
  scene?: Maybe<Scene>;
  scenePlugin?: Maybe<ScenePlugin>;
};

export type MergedLayer = {
  __typename?: 'MergedLayer';
  originalId: Scalars['ID'];
  parentId?: Maybe<Scalars['ID']>;
  sceneID: Scalars['ID'];
  property?: Maybe<MergedProperty>;
  infobox?: Maybe<MergedInfobox>;
  original?: Maybe<LayerItem>;
  parent?: Maybe<LayerGroup>;
  scene?: Maybe<Scene>;
};

export type MergedProperty = {
  __typename?: 'MergedProperty';
  originalId?: Maybe<Scalars['ID']>;
  parentId?: Maybe<Scalars['ID']>;
  schemaId?: Maybe<Scalars['PropertySchemaID']>;
  linkedDatasetId?: Maybe<Scalars['ID']>;
  original?: Maybe<Property>;
  parent?: Maybe<Property>;
  schema?: Maybe<PropertySchema>;
  linkedDataset?: Maybe<Dataset>;
  groups: Array<MergedPropertyGroup>;
};

export type MergedPropertyField = {
  __typename?: 'MergedPropertyField';
  schemaId: Scalars['PropertySchemaID'];
  fieldId: Scalars['PropertySchemaFieldID'];
  value?: Maybe<Scalars['Any']>;
  type: ValueType;
  links?: Maybe<Array<PropertyFieldLink>>;
  overridden: Scalars['Boolean'];
  schema?: Maybe<PropertySchema>;
  field?: Maybe<PropertySchemaField>;
  actualValue?: Maybe<Scalars['Any']>;
};

export type MergedPropertyGroup = {
  __typename?: 'MergedPropertyGroup';
  originalPropertyId?: Maybe<Scalars['ID']>;
  parentPropertyId?: Maybe<Scalars['ID']>;
  originalId?: Maybe<Scalars['ID']>;
  parentId?: Maybe<Scalars['ID']>;
  schemaGroupId: Scalars['PropertySchemaFieldID'];
  schemaId?: Maybe<Scalars['PropertySchemaID']>;
  linkedDatasetId?: Maybe<Scalars['ID']>;
  fields: Array<MergedPropertyField>;
  groups: Array<MergedPropertyGroup>;
  originalProperty?: Maybe<Property>;
  parentProperty?: Maybe<Property>;
  original?: Maybe<PropertyGroup>;
  parent?: Maybe<PropertyGroup>;
  schema?: Maybe<PropertySchema>;
  linkedDataset?: Maybe<Dataset>;
};

export type MoveInfoboxFieldInput = {
  layerId: Scalars['ID'];
  infoboxFieldId: Scalars['ID'];
  index: Scalars['Int'];
};

export type MoveInfoboxFieldPayload = {
  __typename?: 'MoveInfoboxFieldPayload';
  infoboxFieldId: Scalars['ID'];
  layer: Layer;
  index: Scalars['Int'];
};

export type MoveLayerInput = {
  layerId: Scalars['ID'];
  destLayerId?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
};

export type MoveLayerPayload = {
  __typename?: 'MoveLayerPayload';
  layerId: Scalars['ID'];
  fromParentLayer: LayerGroup;
  toParentLayer: LayerGroup;
  index: Scalars['Int'];
};

export type MovePropertyItemInput = {
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  itemId: Scalars['ID'];
  index: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAsset?: Maybe<CreateAssetPayload>;
  removeAsset?: Maybe<RemoveAssetPayload>;
  signup?: Maybe<SignupPayload>;
  updateMe?: Maybe<UpdateMePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  deleteMe?: Maybe<DeleteMePayload>;
  createTeam?: Maybe<CreateTeamPayload>;
  deleteTeam?: Maybe<DeleteTeamPayload>;
  updateTeam?: Maybe<UpdateTeamPayload>;
  addMemberToTeam?: Maybe<AddMemberToTeamPayload>;
  removeMemberFromTeam?: Maybe<RemoveMemberFromTeamPayload>;
  updateMemberOfTeam?: Maybe<UpdateMemberOfTeamPayload>;
  createProject?: Maybe<ProjectPayload>;
  updateProject?: Maybe<ProjectPayload>;
  publishProject?: Maybe<ProjectPayload>;
  deleteProject?: Maybe<DeleteProjectPayload>;
  uploadPlugin?: Maybe<UploadPluginPayload>;
  createScene?: Maybe<CreateScenePayload>;
  addWidget?: Maybe<AddWidgetPayload>;
  updateWidget?: Maybe<UpdateWidgetPayload>;
  removeWidget?: Maybe<RemoveWidgetPayload>;
  installPlugin?: Maybe<InstallPluginPayload>;
  uninstallPlugin?: Maybe<UninstallPluginPayload>;
  upgradePlugin?: Maybe<UpgradePluginPayload>;
  updateDatasetSchema?: Maybe<UpdateDatasetSchemaPayload>;
  syncDataset?: Maybe<SyncDatasetPayload>;
  addDynamicDatasetSchema?: Maybe<AddDynamicDatasetSchemaPayload>;
  addDynamicDataset?: Maybe<AddDynamicDatasetPayload>;
  removeDatasetSchema?: Maybe<RemoveDatasetSchemaPayload>;
  importDataset?: Maybe<ImportDatasetPayload>;
  importDatasetFromGoogleSheet?: Maybe<ImportDatasetPayload>;
  addDatasetSchema?: Maybe<AddDatasetSchemaPayload>;
  updatePropertyValue?: Maybe<PropertyFieldPayload>;
  updatePropertyValueLatLng?: Maybe<PropertyFieldPayload>;
  updatePropertyValueLatLngHeight?: Maybe<PropertyFieldPayload>;
  updatePropertyValueCamera?: Maybe<PropertyFieldPayload>;
  updatePropertyValueTypography?: Maybe<PropertyFieldPayload>;
  removePropertyField?: Maybe<PropertyFieldPayload>;
  uploadFileToProperty?: Maybe<PropertyFieldPayload>;
  linkDatasetToPropertyValue?: Maybe<PropertyFieldPayload>;
  unlinkPropertyValue?: Maybe<PropertyFieldPayload>;
  addPropertyItem?: Maybe<PropertyItemPayload>;
  movePropertyItem?: Maybe<PropertyItemPayload>;
  removePropertyItem?: Maybe<PropertyItemPayload>;
  updatePropertyItems?: Maybe<PropertyItemPayload>;
  addLayerItem?: Maybe<AddLayerItemPayload>;
  addLayerGroup?: Maybe<AddLayerGroupPayload>;
  removeLayer?: Maybe<RemoveLayerPayload>;
  updateLayer?: Maybe<UpdateLayerPayload>;
  moveLayer?: Maybe<MoveLayerPayload>;
  createInfobox?: Maybe<CreateInfoboxPayload>;
  removeInfobox?: Maybe<RemoveInfoboxPayload>;
  addInfoboxField?: Maybe<AddInfoboxFieldPayload>;
  moveInfoboxField?: Maybe<MoveInfoboxFieldPayload>;
  removeInfoboxField?: Maybe<RemoveInfoboxFieldPayload>;
  importLayer?: Maybe<ImportLayerPayload>;
};


export type MutationCreateAssetArgs = {
  input: CreateAssetInput;
};


export type MutationRemoveAssetArgs = {
  input: RemoveAssetInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};


export type MutationRemoveMyAuthArgs = {
  input: RemoveMyAuthInput;
};


export type MutationDeleteMeArgs = {
  input: DeleteMeInput;
};


export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
};


export type MutationDeleteTeamArgs = {
  input: DeleteTeamInput;
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
};


export type MutationAddMemberToTeamArgs = {
  input: AddMemberToTeamInput;
};


export type MutationRemoveMemberFromTeamArgs = {
  input: RemoveMemberFromTeamInput;
};


export type MutationUpdateMemberOfTeamArgs = {
  input: UpdateMemberOfTeamInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationPublishProjectArgs = {
  input: PublishProjectInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationUploadPluginArgs = {
  input: UploadPluginInput;
};


export type MutationCreateSceneArgs = {
  input: CreateSceneInput;
};


export type MutationAddWidgetArgs = {
  input: AddWidgetInput;
};


export type MutationUpdateWidgetArgs = {
  input: UpdateWidgetInput;
};


export type MutationRemoveWidgetArgs = {
  input: RemoveWidgetInput;
};


export type MutationInstallPluginArgs = {
  input: InstallPluginInput;
};


export type MutationUninstallPluginArgs = {
  input: UninstallPluginInput;
};


export type MutationUpgradePluginArgs = {
  input: UpgradePluginInput;
};


export type MutationUpdateDatasetSchemaArgs = {
  input: UpdateDatasetSchemaInput;
};


export type MutationSyncDatasetArgs = {
  input: SyncDatasetInput;
};


export type MutationAddDynamicDatasetSchemaArgs = {
  input: AddDynamicDatasetSchemaInput;
};


export type MutationAddDynamicDatasetArgs = {
  input: AddDynamicDatasetInput;
};


export type MutationRemoveDatasetSchemaArgs = {
  input: RemoveDatasetSchemaInput;
};


export type MutationImportDatasetArgs = {
  input: ImportDatasetInput;
};


export type MutationImportDatasetFromGoogleSheetArgs = {
  input: ImportDatasetFromGoogleSheetInput;
};


export type MutationAddDatasetSchemaArgs = {
  input: AddDatasetSchemaInput;
};


export type MutationUpdatePropertyValueArgs = {
  input: UpdatePropertyValueInput;
};


export type MutationUpdatePropertyValueLatLngArgs = {
  input: UpdatePropertyValueLatLngInput;
};


export type MutationUpdatePropertyValueLatLngHeightArgs = {
  input: UpdatePropertyValueLatLngHeightInput;
};


export type MutationUpdatePropertyValueCameraArgs = {
  input: UpdatePropertyValueCameraInput;
};


export type MutationUpdatePropertyValueTypographyArgs = {
  input: UpdatePropertyValueTypographyInput;
};


export type MutationRemovePropertyFieldArgs = {
  input: RemovePropertyFieldInput;
};


export type MutationUploadFileToPropertyArgs = {
  input: UploadFileToPropertyInput;
};


export type MutationLinkDatasetToPropertyValueArgs = {
  input: LinkDatasetToPropertyValueInput;
};


export type MutationUnlinkPropertyValueArgs = {
  input: UnlinkPropertyValueInput;
};


export type MutationAddPropertyItemArgs = {
  input: AddPropertyItemInput;
};


export type MutationMovePropertyItemArgs = {
  input: MovePropertyItemInput;
};


export type MutationRemovePropertyItemArgs = {
  input: RemovePropertyItemInput;
};


export type MutationUpdatePropertyItemsArgs = {
  input: UpdatePropertyItemInput;
};


export type MutationAddLayerItemArgs = {
  input: AddLayerItemInput;
};


export type MutationAddLayerGroupArgs = {
  input: AddLayerGroupInput;
};


export type MutationRemoveLayerArgs = {
  input: RemoveLayerInput;
};


export type MutationUpdateLayerArgs = {
  input: UpdateLayerInput;
};


export type MutationMoveLayerArgs = {
  input: MoveLayerInput;
};


export type MutationCreateInfoboxArgs = {
  input: CreateInfoboxInput;
};


export type MutationRemoveInfoboxArgs = {
  input: RemoveInfoboxInput;
};


export type MutationAddInfoboxFieldArgs = {
  input: AddInfoboxFieldInput;
};


export type MutationMoveInfoboxFieldArgs = {
  input: MoveInfoboxFieldInput;
};


export type MutationRemoveInfoboxFieldArgs = {
  input: RemoveInfoboxFieldInput;
};


export type MutationImportLayerArgs = {
  input: ImportLayerInput;
};

export type Node = {
  id: Scalars['ID'];
};

export enum NodeType {
  User = 'USER',
  Team = 'TEAM',
  Project = 'PROJECT',
  Plugin = 'PLUGIN',
  Scene = 'SCENE',
  PropertySchema = 'PROPERTY_SCHEMA',
  Property = 'PROPERTY',
  DatasetSchema = 'DATASET_SCHEMA',
  Dataset = 'DATASET',
  LayerGroup = 'LAYER_GROUP',
  LayerItem = 'LAYER_ITEM'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  startCursor?: Maybe<Scalars['Cursor']>;
  endCursor?: Maybe<Scalars['Cursor']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
};

export type Plugin = {
  __typename?: 'Plugin';
  id: Scalars['PluginID'];
  name: Scalars['String'];
  version: Scalars['String'];
  description: Scalars['String'];
  author: Scalars['String'];
  repositoryUrl: Scalars['String'];
  propertySchemaId?: Maybe<Scalars['PropertySchemaID']>;
  extensions: Array<PluginExtension>;
  scenePlugin?: Maybe<ScenePlugin>;
  allTranslatedDescription?: Maybe<Scalars['TranslatedString']>;
  allTranslatedName?: Maybe<Scalars['TranslatedString']>;
  translatedName: Scalars['String'];
  translatedDescription: Scalars['String'];
  propertySchema?: Maybe<PropertySchema>;
};


export type PluginScenePluginArgs = {
  sceneId: Scalars['ID'];
};


export type PluginTranslatedNameArgs = {
  lang?: Maybe<Scalars['String']>;
};


export type PluginTranslatedDescriptionArgs = {
  lang?: Maybe<Scalars['String']>;
};

export type PluginExtension = {
  __typename?: 'PluginExtension';
  extensionId: Scalars['PluginExtensionID'];
  pluginId: Scalars['PluginID'];
  type: PluginExtensionType;
  name: Scalars['String'];
  description: Scalars['String'];
  icon: Scalars['String'];
  visualizer: Visualizer;
  propertySchemaId: Scalars['PropertySchemaID'];
  allTranslatedName?: Maybe<Scalars['TranslatedString']>;
  allTranslatedDescription?: Maybe<Scalars['TranslatedString']>;
  plugin?: Maybe<Plugin>;
  sceneWidget?: Maybe<SceneWidget>;
  propertySchema?: Maybe<PropertySchema>;
  translatedName: Scalars['String'];
  translatedDescription: Scalars['String'];
};


export type PluginExtensionSceneWidgetArgs = {
  sceneId: Scalars['ID'];
};


export type PluginExtensionTranslatedNameArgs = {
  lang?: Maybe<Scalars['String']>;
};


export type PluginExtensionTranslatedDescriptionArgs = {
  lang?: Maybe<Scalars['String']>;
};


export enum PluginExtensionType {
  Primitive = 'PRIMITIVE',
  Widget = 'WIDGET',
  Block = 'BLOCK',
  Visualizer = 'VISUALIZER',
  Infobox = 'INFOBOX'
}


export type PluginMetadata = {
  __typename?: 'PluginMetadata';
  name: Scalars['String'];
  description: Scalars['String'];
  author: Scalars['String'];
  thumbnailUrl: Scalars['String'];
  createdAt: Scalars['DateTime'];
};

export type Project = Node & {
  __typename?: 'Project';
  id: Scalars['ID'];
  isArchived: Scalars['Boolean'];
  isBasicAuthActive: Scalars['Boolean'];
  basicAuthUsername: Scalars['String'];
  basicAuthPassword: Scalars['String'];
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  publishedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  description: Scalars['String'];
  alias: Scalars['String'];
  publicTitle: Scalars['String'];
  publicDescription: Scalars['String'];
  publicImage: Scalars['String'];
  publicNoIndex: Scalars['Boolean'];
  imageUrl?: Maybe<Scalars['URL']>;
  teamId: Scalars['ID'];
  visualizer: Visualizer;
  publishmentStatus: PublishmentStatus;
  team?: Maybe<Team>;
  scene?: Maybe<Scene>;
};

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  edges: Array<ProjectEdge>;
  nodes: Array<Maybe<Project>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  cursor: Scalars['Cursor'];
  node?: Maybe<Project>;
};

export type ProjectPayload = {
  __typename?: 'ProjectPayload';
  project: Project;
};

export type Property = Node & {
  __typename?: 'Property';
  id: Scalars['ID'];
  schemaId: Scalars['PropertySchemaID'];
  items: Array<PropertyItem>;
  schema?: Maybe<PropertySchema>;
  layer?: Maybe<Layer>;
  merged?: Maybe<MergedProperty>;
};

export type PropertyCondition = {
  __typename?: 'PropertyCondition';
  fieldId: Scalars['PropertySchemaFieldID'];
  type: ValueType;
  value?: Maybe<Scalars['Any']>;
};

export type PropertyField = {
  __typename?: 'PropertyField';
  id: Scalars['PropertySchemaFieldID'];
  parentId: Scalars['ID'];
  schemaId: Scalars['PropertySchemaID'];
  fieldId: Scalars['PropertySchemaFieldID'];
  links?: Maybe<Array<PropertyFieldLink>>;
  type: ValueType;
  value?: Maybe<Scalars['Any']>;
  parent?: Maybe<Property>;
  schema?: Maybe<PropertySchema>;
  field?: Maybe<PropertySchemaField>;
  actualValue?: Maybe<Scalars['Any']>;
};

export type PropertyFieldLink = {
  __typename?: 'PropertyFieldLink';
  datasetId?: Maybe<Scalars['ID']>;
  datasetSchemaId: Scalars['ID'];
  datasetSchemaFieldId: Scalars['ID'];
  dataset?: Maybe<Dataset>;
  datasetField?: Maybe<DatasetField>;
  datasetSchema?: Maybe<DatasetSchema>;
  datasetSchemaField?: Maybe<DatasetSchemaField>;
};

export type PropertyFieldPayload = {
  __typename?: 'PropertyFieldPayload';
  property: Property;
  propertyField?: Maybe<PropertyField>;
};

export type PropertyGroup = {
  __typename?: 'PropertyGroup';
  id: Scalars['ID'];
  schemaId: Scalars['PropertySchemaID'];
  schemaGroupId: Scalars['PropertySchemaFieldID'];
  fields: Array<PropertyField>;
  schema?: Maybe<PropertySchema>;
  schemaGroup?: Maybe<PropertySchemaGroup>;
};

export type PropertyGroupList = {
  __typename?: 'PropertyGroupList';
  id: Scalars['ID'];
  schemaId: Scalars['PropertySchemaID'];
  schemaGroupId: Scalars['PropertySchemaFieldID'];
  groups: Array<PropertyGroup>;
  schema?: Maybe<PropertySchema>;
  schemaGroup?: Maybe<PropertySchemaGroup>;
};

export type PropertyItem = PropertyGroup | PropertyGroupList;

export type PropertyItemPayload = {
  __typename?: 'PropertyItemPayload';
  property: Property;
  propertyItem?: Maybe<PropertyItem>;
};

export type PropertyLinkableFields = {
  __typename?: 'PropertyLinkableFields';
  schemaId: Scalars['PropertySchemaID'];
  latlng?: Maybe<Scalars['PropertySchemaFieldID']>;
  url?: Maybe<Scalars['PropertySchemaFieldID']>;
  latlngField?: Maybe<PropertySchemaField>;
  urlField?: Maybe<PropertySchemaField>;
  schema?: Maybe<PropertySchema>;
};

export type PropertySchema = {
  __typename?: 'PropertySchema';
  id: Scalars['PropertySchemaID'];
  groups: Array<PropertySchemaGroup>;
  linkableFields: PropertyLinkableFields;
};

export type PropertySchemaField = {
  __typename?: 'PropertySchemaField';
  fieldId: Scalars['PropertySchemaFieldID'];
  type: ValueType;
  title: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
  prefix?: Maybe<Scalars['String']>;
  suffix?: Maybe<Scalars['String']>;
  defaultValue?: Maybe<Scalars['Any']>;
  ui?: Maybe<PropertySchemaFieldUi>;
  min?: Maybe<Scalars['Float']>;
  max?: Maybe<Scalars['Float']>;
  choices?: Maybe<Array<PropertySchemaFieldChoice>>;
  isAvailableIf?: Maybe<PropertyCondition>;
  allTranslatedTitle?: Maybe<Scalars['TranslatedString']>;
  allTranslatedName?: Maybe<Scalars['TranslatedString']>;
  allTranslatedDescription?: Maybe<Scalars['TranslatedString']>;
  translatedTitle: Scalars['String'];
  translatedName: Scalars['String'];
  translatedDescription: Scalars['String'];
};


export type PropertySchemaFieldTranslatedTitleArgs = {
  lang?: Maybe<Scalars['String']>;
};


export type PropertySchemaFieldTranslatedNameArgs = {
  lang?: Maybe<Scalars['String']>;
};


export type PropertySchemaFieldTranslatedDescriptionArgs = {
  lang?: Maybe<Scalars['String']>;
};

export type PropertySchemaFieldChoice = {
  __typename?: 'PropertySchemaFieldChoice';
  key: Scalars['String'];
  title: Scalars['String'];
  label: Scalars['String'];
  icon?: Maybe<Scalars['String']>;
  allTranslatedTitle?: Maybe<Scalars['TranslatedString']>;
  allTranslatedLabel?: Maybe<Scalars['TranslatedString']>;
  translatedTitle: Scalars['String'];
  translatedLabel: Scalars['String'];
};


export type PropertySchemaFieldChoiceTranslatedTitleArgs = {
  lang?: Maybe<Scalars['String']>;
};


export type PropertySchemaFieldChoiceTranslatedLabelArgs = {
  lang?: Maybe<Scalars['String']>;
};


export enum PropertySchemaFieldUi {
  Layer = 'LAYER',
  Multiline = 'MULTILINE',
  Selection = 'SELECTION',
  Color = 'COLOR',
  Range = 'RANGE',
  Image = 'IMAGE',
  Video = 'VIDEO',
  File = 'FILE',
  CameraPose = 'CAMERA_POSE'
}

export type PropertySchemaGroup = {
  __typename?: 'PropertySchemaGroup';
  schemaGroupId: Scalars['PropertySchemaFieldID'];
  schemaId: Scalars['PropertySchemaID'];
  fields: Array<PropertySchemaField>;
  isList: Scalars['Boolean'];
  isAvailableIf?: Maybe<PropertyCondition>;
  title?: Maybe<Scalars['String']>;
  allTranslatedTitle?: Maybe<Scalars['TranslatedString']>;
  name?: Maybe<Scalars['PropertySchemaFieldID']>;
  representativeFieldId?: Maybe<Scalars['PropertySchemaFieldID']>;
  representativeField?: Maybe<PropertySchemaField>;
  schema?: Maybe<PropertySchema>;
  translatedTitle: Scalars['String'];
};


export type PropertySchemaGroupTranslatedTitleArgs = {
  lang?: Maybe<Scalars['String']>;
};


export type PublishProjectInput = {
  projectId: Scalars['ID'];
  alias?: Maybe<Scalars['String']>;
  status: PublishmentStatus;
};

export enum PublishmentStatus {
  Public = 'PUBLIC',
  Limited = 'LIMITED',
  Private = 'PRIVATE'
}

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  propertySchema?: Maybe<PropertySchema>;
  propertySchemas: Array<PropertySchema>;
  plugin?: Maybe<Plugin>;
  plugins: Array<Plugin>;
  layer?: Maybe<Layer>;
  scene?: Maybe<Scene>;
  assets: AssetConnection;
  projects: ProjectConnection;
  datasetSchemas: DatasetSchemaConnection;
  datasets: DatasetConnection;
  sceneLock?: Maybe<SceneLockMode>;
  dynamicDatasetSchemas: Array<DatasetSchema>;
  searchUser?: Maybe<SearchedUser>;
  checkProjectAlias: CheckProjectAliasPayload;
  installablePlugins: Array<PluginMetadata>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
  type: NodeType;
};


export type QueryNodesArgs = {
  id: Array<Scalars['ID']>;
  type: NodeType;
};


export type QueryPropertySchemaArgs = {
  id: Scalars['PropertySchemaID'];
};


export type QueryPropertySchemasArgs = {
  id: Array<Scalars['PropertySchemaID']>;
};


export type QueryPluginArgs = {
  id: Scalars['PluginID'];
};


export type QueryPluginsArgs = {
  id: Array<Scalars['PluginID']>;
};


export type QueryLayerArgs = {
  id: Scalars['ID'];
};


export type QuerySceneArgs = {
  projectId: Scalars['ID'];
};


export type QueryAssetsArgs = {
  teamId: Scalars['ID'];
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};


export type QueryProjectsArgs = {
  teamId: Scalars['ID'];
  includeArchived?: Maybe<Scalars['Boolean']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};


export type QueryDatasetSchemasArgs = {
  sceneId: Scalars['ID'];
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};


export type QueryDatasetsArgs = {
  datasetSchemaId: Scalars['ID'];
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};


export type QuerySceneLockArgs = {
  sceneId: Scalars['ID'];
};


export type QueryDynamicDatasetSchemasArgs = {
  sceneId: Scalars['ID'];
};


export type QuerySearchUserArgs = {
  nameOrEmail: Scalars['String'];
};


export type QueryCheckProjectAliasArgs = {
  alias: Scalars['String'];
};

export type Rect = {
  __typename?: 'Rect';
  west: Scalars['Float'];
  south: Scalars['Float'];
  east: Scalars['Float'];
  north: Scalars['Float'];
};

export type RemoveAssetInput = {
  assetId: Scalars['ID'];
};

export type RemoveAssetPayload = {
  __typename?: 'RemoveAssetPayload';
  assetId: Scalars['ID'];
};

export type RemoveDatasetSchemaInput = {
  schemaId: Scalars['ID'];
  force?: Maybe<Scalars['Boolean']>;
};

export type RemoveDatasetSchemaPayload = {
  __typename?: 'RemoveDatasetSchemaPayload';
  schemaId: Scalars['ID'];
};

export type RemoveInfoboxFieldInput = {
  layerId: Scalars['ID'];
  infoboxFieldId: Scalars['ID'];
};

export type RemoveInfoboxFieldPayload = {
  __typename?: 'RemoveInfoboxFieldPayload';
  infoboxFieldId: Scalars['ID'];
  layer: Layer;
};

export type RemoveInfoboxInput = {
  layerId: Scalars['ID'];
};

export type RemoveInfoboxPayload = {
  __typename?: 'RemoveInfoboxPayload';
  layer: Layer;
};

export type RemoveLayerInput = {
  layerId: Scalars['ID'];
};

export type RemoveLayerPayload = {
  __typename?: 'RemoveLayerPayload';
  layerId: Scalars['ID'];
  parentLayer: LayerGroup;
};

export type RemoveMemberFromTeamInput = {
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
};

export type RemoveMemberFromTeamPayload = {
  __typename?: 'RemoveMemberFromTeamPayload';
  team: Team;
};

export type RemoveMyAuthInput = {
  auth: Scalars['String'];
};

export type RemovePropertyFieldInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
};

export type RemovePropertyItemInput = {
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  itemId: Scalars['ID'];
};

export type RemoveWidgetInput = {
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
};

export type RemoveWidgetPayload = {
  __typename?: 'RemoveWidgetPayload';
  scene: Scene;
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
};

export enum Role {
  Reader = 'READER',
  Writer = 'WRITER',
  Owner = 'OWNER'
}

export type Scene = Node & {
  __typename?: 'Scene';
  id: Scalars['ID'];
  projectId: Scalars['ID'];
  teamId: Scalars['ID'];
  propertyId: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  rootLayerId: Scalars['ID'];
  widgets: Array<SceneWidget>;
  plugins: Array<ScenePlugin>;
  dynamicDatasetSchemas: Array<DatasetSchema>;
  project?: Maybe<Project>;
  team?: Maybe<Team>;
  property?: Maybe<Property>;
  rootLayer?: Maybe<LayerGroup>;
  lockMode: SceneLockMode;
  datasetSchemas: DatasetSchemaConnection;
};


export type SceneDatasetSchemasArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};

export enum SceneLockMode {
  Free = 'FREE',
  Pending = 'PENDING',
  DatasetSyncing = 'DATASET_SYNCING',
  PluginUpgrading = 'PLUGIN_UPGRADING',
  Publishing = 'PUBLISHING'
}

export type ScenePlugin = {
  __typename?: 'ScenePlugin';
  pluginId: Scalars['PluginID'];
  propertyId?: Maybe<Scalars['ID']>;
  plugin?: Maybe<Plugin>;
  property?: Maybe<Property>;
};

export type SceneWidget = {
  __typename?: 'SceneWidget';
  id: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  propertyId: Scalars['ID'];
  enabled: Scalars['Boolean'];
  plugin?: Maybe<Plugin>;
  extension?: Maybe<PluginExtension>;
  property?: Maybe<Property>;
};

export type SearchedUser = {
  __typename?: 'SearchedUser';
  userId: Scalars['ID'];
  userName: Scalars['String'];
  userEmail: Scalars['String'];
};

export type SignupInput = {
  lang?: Maybe<Scalars['Lang']>;
  theme?: Maybe<Theme>;
  userId?: Maybe<Scalars['ID']>;
  teamId?: Maybe<Scalars['ID']>;
  secret?: Maybe<Scalars['String']>;
};

export type SignupPayload = {
  __typename?: 'SignupPayload';
  user: User;
  team: Team;
};

export type SyncDatasetInput = {
  sceneId: Scalars['ID'];
  url: Scalars['String'];
};

export type SyncDatasetPayload = {
  __typename?: 'SyncDatasetPayload';
  sceneId: Scalars['ID'];
  url: Scalars['String'];
  datasetSchema: Array<DatasetSchema>;
  dataset: Array<Dataset>;
};

export type Team = Node & {
  __typename?: 'Team';
  id: Scalars['ID'];
  name: Scalars['String'];
  members: Array<TeamMember>;
  personal: Scalars['Boolean'];
  assets: AssetConnection;
  projects: ProjectConnection;
};


export type TeamAssetsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};


export type TeamProjectsArgs = {
  includeArchived?: Maybe<Scalars['Boolean']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['Cursor']>;
  before?: Maybe<Scalars['Cursor']>;
};

export type TeamMember = {
  __typename?: 'TeamMember';
  userId: Scalars['ID'];
  role: Role;
  user?: Maybe<User>;
};

export enum TextAlign {
  Left = 'LEFT',
  Center = 'CENTER',
  Right = 'RIGHT',
  Justify = 'JUSTIFY',
  JustifyAll = 'JUSTIFY_ALL'
}

export enum Theme {
  Default = 'DEFAULT',
  Light = 'LIGHT',
  Dark = 'DARK'
}


export type Typography = {
  __typename?: 'Typography';
  fontFamily?: Maybe<Scalars['String']>;
  fontWeight?: Maybe<Scalars['String']>;
  fontSize?: Maybe<Scalars['Int']>;
  color?: Maybe<Scalars['String']>;
  textAlign?: Maybe<TextAlign>;
  bold?: Maybe<Scalars['Boolean']>;
  italic?: Maybe<Scalars['Boolean']>;
  underline?: Maybe<Scalars['Boolean']>;
};


export type UninstallPluginInput = {
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
};

export type UninstallPluginPayload = {
  __typename?: 'UninstallPluginPayload';
  scene: Scene;
  scenePlugin: ScenePlugin;
};

export type UnlinkPropertyValueInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
};

export type UpdateDatasetSchemaInput = {
  schemaId: Scalars['ID'];
  name: Scalars['String'];
};

export type UpdateDatasetSchemaPayload = {
  __typename?: 'UpdateDatasetSchemaPayload';
  datasetSchema?: Maybe<DatasetSchema>;
};

export type UpdateLayerInput = {
  layerId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  visible?: Maybe<Scalars['Boolean']>;
};

export type UpdateLayerPayload = {
  __typename?: 'UpdateLayerPayload';
  layer: Layer;
};

export type UpdateMeInput = {
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  lang?: Maybe<Scalars['Lang']>;
  theme?: Maybe<Theme>;
  password?: Maybe<Scalars['String']>;
  passwordConfirmation?: Maybe<Scalars['String']>;
};

export type UpdateMePayload = {
  __typename?: 'UpdateMePayload';
  user: User;
};

export type UpdateMemberOfTeamInput = {
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
};

export type UpdateMemberOfTeamPayload = {
  __typename?: 'UpdateMemberOfTeamPayload';
  team: Team;
};

export type UpdateProjectInput = {
  projectId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  archived?: Maybe<Scalars['Boolean']>;
  isBasicAuthActive?: Maybe<Scalars['Boolean']>;
  basicAuthUsername?: Maybe<Scalars['String']>;
  basicAuthPassword?: Maybe<Scalars['String']>;
  alias?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['URL']>;
  publicTitle?: Maybe<Scalars['String']>;
  publicDescription?: Maybe<Scalars['String']>;
  publicImage?: Maybe<Scalars['Upload']>;
  publicNoIndex?: Maybe<Scalars['Boolean']>;
  deleteImageUrl?: Maybe<Scalars['Boolean']>;
  deletePublicImage?: Maybe<Scalars['Boolean']>;
};

export type UpdatePropertyItemInput = {
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  operations: Array<UpdatePropertyItemOperationInput>;
};

export type UpdatePropertyItemOperationInput = {
  operation: ListOperation;
  itemId?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
  nameFieldValue?: Maybe<Scalars['Any']>;
  nameFieldType?: Maybe<ValueType>;
};

export type UpdatePropertyValueCameraInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  lat: Scalars['Float'];
  lng: Scalars['Float'];
  altitude: Scalars['Float'];
  heading: Scalars['Float'];
  pitch: Scalars['Float'];
  roll: Scalars['Float'];
  fov: Scalars['Float'];
};

export type UpdatePropertyValueInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  value?: Maybe<Scalars['Any']>;
  type: ValueType;
};

export type UpdatePropertyValueLatLngHeightInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  lat: Scalars['Float'];
  lng: Scalars['Float'];
  height: Scalars['Float'];
};

export type UpdatePropertyValueLatLngInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  lat: Scalars['Float'];
  lng: Scalars['Float'];
};

export type UpdatePropertyValueTypographyInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  fontFamily?: Maybe<Scalars['String']>;
  fontWeight?: Maybe<Scalars['String']>;
  fontSize?: Maybe<Scalars['Int']>;
  color?: Maybe<Scalars['String']>;
  textAlign?: Maybe<TextAlign>;
  bold?: Maybe<Scalars['Boolean']>;
  italic?: Maybe<Scalars['Boolean']>;
  underline?: Maybe<Scalars['Boolean']>;
};

export type UpdateTeamInput = {
  teamId: Scalars['ID'];
  name: Scalars['String'];
};

export type UpdateTeamPayload = {
  __typename?: 'UpdateTeamPayload';
  team: Team;
};

export type UpdateWidgetInput = {
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  enabled?: Maybe<Scalars['Boolean']>;
};

export type UpdateWidgetPayload = {
  __typename?: 'UpdateWidgetPayload';
  scene: Scene;
  sceneWidget: SceneWidget;
};

export type UpgradePluginInput = {
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  toPluginId: Scalars['PluginID'];
};

export type UpgradePluginPayload = {
  __typename?: 'UpgradePluginPayload';
  scene: Scene;
  scenePlugin: ScenePlugin;
};


export type UploadFileToPropertyInput = {
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  file: Scalars['Upload'];
};

export type UploadPluginInput = {
  file: Scalars['Upload'];
};

export type UploadPluginPayload = {
  __typename?: 'UploadPluginPayload';
  plugin: Plugin;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  email: Scalars['String'];
  lang: Scalars['Lang'];
  theme: Theme;
  myTeamId: Scalars['ID'];
  auths: Array<Scalars['String']>;
  teams: Array<Team>;
  myTeam: Team;
};

export enum ValueType {
  Bool = 'BOOL',
  Number = 'NUMBER',
  String = 'STRING',
  Ref = 'REF',
  Url = 'URL',
  Latlng = 'LATLNG',
  Latlngheight = 'LATLNGHEIGHT',
  Camera = 'CAMERA',
  Typography = 'TYPOGRAPHY',
  Coordinates = 'COORDINATES',
  Polygon = 'POLYGON',
  Rect = 'RECT'
}

export enum Visualizer {
  Cesium = 'CESIUM'
}

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name' | 'email' | 'auths'>
    & { myTeam: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name'>
      & { projects: (
        { __typename?: 'ProjectConnection' }
        & { nodes: Array<Maybe<(
          { __typename?: 'Project' }
          & Pick<Project, 'id' | 'publishmentStatus' | 'isArchived' | 'name' | 'imageUrl' | 'description' | 'visualizer'>
          & { scene?: Maybe<(
            { __typename?: 'Scene' }
            & Pick<Scene, 'id'>
          )> }
        )>> }
      ) }
    ), teams: Array<(
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name'>
      & { members: Array<(
        { __typename?: 'TeamMember' }
        & { user?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'id' | 'name'>
        )> }
      )>, projects: (
        { __typename?: 'ProjectConnection' }
        & { nodes: Array<Maybe<(
          { __typename?: 'Project' }
          & Pick<Project, 'id' | 'publishmentStatus' | 'isArchived' | 'name' | 'imageUrl' | 'description' | 'visualizer'>
          & { scene?: Maybe<(
            { __typename?: 'Scene' }
            & Pick<Scene, 'id'>
          )> }
        )>> }
      ) }
    )> }
  )> }
);

export type CreateProjectMutationVariables = Exact<{
  teamId: Scalars['ID'];
  visualizer: Visualizer;
  name: Scalars['String'];
  description: Scalars['String'];
  imageUrl?: Maybe<Scalars['URL']>;
}>;


export type CreateProjectMutation = (
  { __typename?: 'Mutation' }
  & { createProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'imageUrl'>
    ) }
  )> }
);

export type CreateSceneMutationVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type CreateSceneMutation = (
  { __typename?: 'Mutation' }
  & { createScene?: Maybe<(
    { __typename?: 'CreateScenePayload' }
    & { scene: (
      { __typename?: 'Scene' }
      & Pick<Scene, 'id'>
    ) }
  )> }
);

export type EarthLayerItemFragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id' | 'linkedDatasetId'>
  & { merged?: Maybe<(
    { __typename?: 'MergedLayer' }
    & Pick<MergedLayer, 'parentId'>
    & { property?: Maybe<(
      { __typename?: 'MergedProperty' }
      & MergedPropertyFragmentWithoutSchemaFragment
    )>, infobox?: Maybe<(
      { __typename?: 'MergedInfobox' }
      & { property?: Maybe<(
        { __typename?: 'MergedProperty' }
        & MergedPropertyFragmentWithoutSchemaFragment
      )>, fields: Array<(
        { __typename?: 'MergedInfoboxField' }
        & Pick<MergedInfoboxField, 'originalId' | 'pluginId' | 'extensionId'>
        & { property?: Maybe<(
          { __typename?: 'MergedProperty' }
          & MergedPropertyFragmentWithoutSchemaFragment
        )> }
      )> }
    )> }
  )> }
);

type EarthLayer_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'linkedDatasetSchemaId' | 'id' | 'name' | 'isVisible' | 'pluginId' | 'extensionId'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
  )>>, property?: Maybe<(
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
    & PropertyFragmentWithoutSchemaFragment
  )>, infobox?: Maybe<(
    { __typename?: 'Infobox' }
    & Pick<Infobox, 'propertyId'>
    & { property?: Maybe<(
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & PropertyFragmentWithoutSchemaFragment
    )>, fields: Array<(
      { __typename?: 'InfoboxField' }
      & Pick<InfoboxField, 'id' | 'pluginId' | 'extensionId' | 'propertyId'>
      & { property?: Maybe<(
        { __typename?: 'Property' }
        & Pick<Property, 'id'>
        & PropertyFragmentWithoutSchemaFragment
      )> }
    )> }
  )> }
);

type EarthLayer_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id' | 'name' | 'isVisible' | 'pluginId' | 'extensionId'>
  & { property?: Maybe<(
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
    & PropertyFragmentWithoutSchemaFragment
  )>, infobox?: Maybe<(
    { __typename?: 'Infobox' }
    & Pick<Infobox, 'propertyId'>
    & { property?: Maybe<(
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & PropertyFragmentWithoutSchemaFragment
    )>, fields: Array<(
      { __typename?: 'InfoboxField' }
      & Pick<InfoboxField, 'id' | 'pluginId' | 'extensionId' | 'propertyId'>
      & { property?: Maybe<(
        { __typename?: 'Property' }
        & Pick<Property, 'id'>
        & PropertyFragmentWithoutSchemaFragment
      )> }
    )> }
  )> }
  & EarthLayerItemFragment
);

export type EarthLayerFragment = EarthLayer_LayerGroup_Fragment | EarthLayer_LayerItem_Fragment;

type EarthLayer1_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & EarthLayer_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & EarthLayer_LayerItem_Fragment
  )>> }
  & EarthLayer_LayerGroup_Fragment
);

type EarthLayer1_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & EarthLayer_LayerItem_Fragment
);

export type EarthLayer1Fragment = EarthLayer1_LayerGroup_Fragment | EarthLayer1_LayerItem_Fragment;

type EarthLayer2_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & EarthLayer1_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & EarthLayer1_LayerItem_Fragment
  )>> }
  & EarthLayer_LayerGroup_Fragment
);

type EarthLayer2_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & EarthLayer_LayerItem_Fragment
);

export type EarthLayer2Fragment = EarthLayer2_LayerGroup_Fragment | EarthLayer2_LayerItem_Fragment;

type EarthLayer3_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & EarthLayer2_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & EarthLayer2_LayerItem_Fragment
  )>> }
  & EarthLayer_LayerGroup_Fragment
);

type EarthLayer3_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & EarthLayer_LayerItem_Fragment
);

export type EarthLayer3Fragment = EarthLayer3_LayerGroup_Fragment | EarthLayer3_LayerItem_Fragment;

type EarthLayer4_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & EarthLayer3_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & EarthLayer3_LayerItem_Fragment
  )>> }
  & EarthLayer_LayerGroup_Fragment
);

type EarthLayer4_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & EarthLayer_LayerItem_Fragment
);

export type EarthLayer4Fragment = EarthLayer4_LayerGroup_Fragment | EarthLayer4_LayerItem_Fragment;

type EarthLayer5_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & EarthLayer4_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & EarthLayer4_LayerItem_Fragment
  )>> }
  & EarthLayer_LayerGroup_Fragment
);

type EarthLayer5_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & EarthLayer_LayerItem_Fragment
);

export type EarthLayer5Fragment = EarthLayer5_LayerGroup_Fragment | EarthLayer5_LayerItem_Fragment;

export type GetLayersQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetLayersQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { rootLayer?: Maybe<(
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & EarthLayer5_LayerGroup_Fragment
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type GetEarthWidgetsQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetEarthWidgetsQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { project?: Maybe<(
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'publicTitle'>
    )>, property?: Maybe<(
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & PropertyFragmentFragment
    )>, widgets: Array<(
      { __typename?: 'SceneWidget' }
      & Pick<SceneWidget, 'id' | 'enabled' | 'pluginId' | 'extensionId'>
      & { plugin?: Maybe<(
        { __typename?: 'Plugin' }
        & Pick<Plugin, 'id'>
        & { scenePlugin?: Maybe<(
          { __typename?: 'ScenePlugin' }
          & { property?: Maybe<(
            { __typename?: 'Property' }
            & Pick<Property, 'id'>
            & PropertyFragmentFragment
          )> }
        )> }
      )>, property?: Maybe<(
        { __typename?: 'Property' }
        & Pick<Property, 'id'>
        & PropertyFragmentFragment
      )> }
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type MoveInfoboxFieldMutationVariables = Exact<{
  layerId: Scalars['ID'];
  infoboxFieldId: Scalars['ID'];
  index: Scalars['Int'];
}>;


export type MoveInfoboxFieldMutation = (
  { __typename?: 'Mutation' }
  & { moveInfoboxField?: Maybe<(
    { __typename?: 'MoveInfoboxFieldPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & EarthLayer_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & EarthLayer_LayerItem_Fragment
    ) }
  )> }
);

export type RemoveInfoboxFieldMutationVariables = Exact<{
  layerId: Scalars['ID'];
  infoboxFieldId: Scalars['ID'];
}>;


export type RemoveInfoboxFieldMutation = (
  { __typename?: 'Mutation' }
  & { removeInfoboxField?: Maybe<(
    { __typename?: 'RemoveInfoboxFieldPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerFragment_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    ) }
  )> }
);

export type GetBlocksQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetBlocksQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { plugins: Array<(
      { __typename?: 'ScenePlugin' }
      & { plugin?: Maybe<(
        { __typename?: 'Plugin' }
        & Pick<Plugin, 'id'>
        & { extensions: Array<(
          { __typename?: 'PluginExtension' }
          & Pick<PluginExtension, 'extensionId' | 'type' | 'name' | 'description' | 'icon'>
        )> }
      )> }
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type AddInfoboxFieldMutationVariables = Exact<{
  layerId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  index?: Maybe<Scalars['Int']>;
}>;


export type AddInfoboxFieldMutation = (
  { __typename?: 'Mutation' }
  & { addInfoboxField?: Maybe<(
    { __typename?: 'AddInfoboxFieldPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerFragment_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    ) }
  )> }
);

export type GetAllDataSetsQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetAllDataSetsQuery = (
  { __typename?: 'Query' }
  & { datasetSchemas: (
    { __typename?: 'DatasetSchemaConnection' }
    & { nodes: Array<Maybe<(
      { __typename?: 'DatasetSchema' }
      & Pick<DatasetSchema, 'id' | 'source' | 'name' | 'sceneId'>
      & { fields: Array<(
        { __typename?: 'DatasetSchemaField' }
        & Pick<DatasetSchemaField, 'id' | 'name' | 'type'>
      )>, datasets: (
        { __typename?: 'DatasetConnection' }
        & Pick<DatasetConnection, 'totalCount'>
      ) }
    )>> }
  ) }
);

export type SyncDatasetMutationVariables = Exact<{
  sceneId: Scalars['ID'];
  url: Scalars['String'];
}>;


export type SyncDatasetMutation = (
  { __typename?: 'Mutation' }
  & { syncDataset?: Maybe<(
    { __typename?: 'SyncDatasetPayload' }
    & Pick<SyncDatasetPayload, 'sceneId' | 'url'>
    & { datasetSchema: Array<(
      { __typename?: 'DatasetSchema' }
      & Pick<DatasetSchema, 'id' | 'name'>
    )> }
  )> }
);

export type ImportGoogleSheetDatasetMutationVariables = Exact<{
  accessToken: Scalars['String'];
  fileId: Scalars['String'];
  sheetName: Scalars['String'];
  sceneId: Scalars['ID'];
  datasetSchemaId?: Maybe<Scalars['ID']>;
}>;


export type ImportGoogleSheetDatasetMutation = (
  { __typename?: 'Mutation' }
  & { importDatasetFromGoogleSheet?: Maybe<(
    { __typename?: 'ImportDatasetPayload' }
    & { datasetSchema: (
      { __typename?: 'DatasetSchema' }
      & Pick<DatasetSchema, 'id' | 'name'>
    ) }
  )> }
);

export type ImportDatasetMutationVariables = Exact<{
  file: Scalars['Upload'];
  sceneId: Scalars['ID'];
  datasetSchemaId?: Maybe<Scalars['ID']>;
}>;


export type ImportDatasetMutation = (
  { __typename?: 'Mutation' }
  & { importDataset?: Maybe<(
    { __typename?: 'ImportDatasetPayload' }
    & { datasetSchema: (
      { __typename?: 'DatasetSchema' }
      & Pick<DatasetSchema, 'id' | 'name'>
    ) }
  )> }
);

export type RemoveDatasetMutationVariables = Exact<{
  schemaId: Scalars['ID'];
  force?: Maybe<Scalars['Boolean']>;
}>;


export type RemoveDatasetMutation = (
  { __typename?: 'Mutation' }
  & { removeDatasetSchema?: Maybe<(
    { __typename?: 'RemoveDatasetSchemaPayload' }
    & Pick<RemoveDatasetSchemaPayload, 'schemaId'>
  )> }
);

export type AddLayerGroupFromDatasetSchemaMutationVariables = Exact<{
  parentLayerId: Scalars['ID'];
  pluginId?: Maybe<Scalars['PluginID']>;
  extensionId?: Maybe<Scalars['PluginExtensionID']>;
  datasetSchemaId?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
}>;


export type AddLayerGroupFromDatasetSchemaMutation = (
  { __typename?: 'Mutation' }
  & { addLayerGroup?: Maybe<(
    { __typename?: 'AddLayerGroupPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & Layer1Fragment_LayerGroup_Fragment
    ), parentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & Layer0Fragment_LayerGroup_Fragment
    ) }
  )> }
);

export type GetProjectQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetProjectQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'teamId' | 'projectId' | 'id'>
    & { project?: Maybe<(
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'alias' | 'publishmentStatus' | 'name'>
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type GetTeamProjectsQueryVariables = Exact<{
  teamId: Scalars['ID'];
  includeArchived?: Maybe<Scalars['Boolean']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}>;


export type GetTeamProjectsQuery = (
  { __typename?: 'Query' }
  & { projects: (
    { __typename?: 'ProjectConnection' }
    & { nodes: Array<Maybe<(
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name'>
    )>> }
  ) }
);

export type CheckProjectAliasQueryVariables = Exact<{
  alias: Scalars['String'];
}>;


export type CheckProjectAliasQuery = (
  { __typename?: 'Query' }
  & { checkProjectAlias: (
    { __typename?: 'CheckProjectAliasPayload' }
    & Pick<CheckProjectAliasPayload, 'alias' | 'available'>
  ) }
);

export type PublishProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
  alias?: Maybe<Scalars['String']>;
  status: PublishmentStatus;
}>;


export type PublishProjectMutation = (
  { __typename?: 'Mutation' }
  & { publishProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

type LayerSystemLayer_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'linkedDatasetSchemaId' | 'id' | 'name' | 'isVisible' | 'pluginId' | 'extensionId'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
  )>> }
);

type LayerSystemLayer_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'linkedDatasetId' | 'id' | 'name' | 'isVisible' | 'pluginId' | 'extensionId'>
);

export type LayerSystemLayerFragment = LayerSystemLayer_LayerGroup_Fragment | LayerSystemLayer_LayerItem_Fragment;

type LayerSystemLayer1_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerSystemLayer_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerSystemLayer_LayerItem_Fragment
  )>> }
  & LayerSystemLayer_LayerGroup_Fragment
);

type LayerSystemLayer1_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerSystemLayer_LayerItem_Fragment
);

export type LayerSystemLayer1Fragment = LayerSystemLayer1_LayerGroup_Fragment | LayerSystemLayer1_LayerItem_Fragment;

type LayerSystemLayer2_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerSystemLayer1_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerSystemLayer1_LayerItem_Fragment
  )>> }
  & LayerSystemLayer_LayerGroup_Fragment
);

type LayerSystemLayer2_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerSystemLayer_LayerItem_Fragment
);

export type LayerSystemLayer2Fragment = LayerSystemLayer2_LayerGroup_Fragment | LayerSystemLayer2_LayerItem_Fragment;

type LayerSystemLayer3_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerSystemLayer2_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerSystemLayer2_LayerItem_Fragment
  )>> }
  & LayerSystemLayer_LayerGroup_Fragment
);

type LayerSystemLayer3_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerSystemLayer_LayerItem_Fragment
);

export type LayerSystemLayer3Fragment = LayerSystemLayer3_LayerGroup_Fragment | LayerSystemLayer3_LayerItem_Fragment;

type LayerSystemLayer4_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerSystemLayer3_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerSystemLayer3_LayerItem_Fragment
  )>> }
  & LayerSystemLayer_LayerGroup_Fragment
);

type LayerSystemLayer4_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerSystemLayer_LayerItem_Fragment
);

export type LayerSystemLayer4Fragment = LayerSystemLayer4_LayerGroup_Fragment | LayerSystemLayer4_LayerItem_Fragment;

type LayerSystemLayer5_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerSystemLayer4_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerSystemLayer4_LayerItem_Fragment
  )>> }
  & LayerSystemLayer_LayerGroup_Fragment
);

type LayerSystemLayer5_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerSystemLayer_LayerItem_Fragment
);

export type LayerSystemLayer5Fragment = LayerSystemLayer5_LayerGroup_Fragment | LayerSystemLayer5_LayerItem_Fragment;

export type GetLayersFromLayerIdQueryVariables = Exact<{
  layerId: Scalars['ID'];
}>;


export type GetLayersFromLayerIdQuery = (
  { __typename?: 'Query' }
  & { layer?: Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerSystemLayer5_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerSystemLayer5_LayerItem_Fragment
  )> }
);

export type MoveLayerMutationVariables = Exact<{
  layerId: Scalars['ID'];
  destLayerId?: Maybe<Scalars['ID']>;
  index?: Maybe<Scalars['Int']>;
}>;


export type MoveLayerMutation = (
  { __typename?: 'Mutation' }
  & { moveLayer?: Maybe<(
    { __typename?: 'MoveLayerPayload' }
    & { fromParentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer_LayerGroup_Fragment
    ), toParentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer_LayerGroup_Fragment
    ) }
  )> }
);

export type UpdateLayerMutationVariables = Exact<{
  layerId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  visible?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateLayerMutation = (
  { __typename?: 'Mutation' }
  & { updateLayer?: Maybe<(
    { __typename?: 'UpdateLayerPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerSystemLayer_LayerItem_Fragment
    ) }
  )> }
);

export type RemoveLayerMutationVariables = Exact<{
  layerId: Scalars['ID'];
}>;


export type RemoveLayerMutation = (
  { __typename?: 'Mutation' }
  & { removeLayer?: Maybe<(
    { __typename?: 'RemoveLayerPayload' }
    & Pick<RemoveLayerPayload, 'layerId'>
    & { parentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer_LayerGroup_Fragment
    ) }
  )> }
);

export type ImportLayerMutationVariables = Exact<{
  layerId: Scalars['ID'];
  file: Scalars['Upload'];
  format: LayerEncodingFormat;
}>;


export type ImportLayerMutation = (
  { __typename?: 'Mutation' }
  & { importLayer?: Maybe<(
    { __typename?: 'ImportLayerPayload' }
    & { layers: Array<(
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer5_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerSystemLayer5_LayerItem_Fragment
    )>, parentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer_LayerGroup_Fragment
    ) }
  )> }
);

export type AddLayerGroupMutationVariables = Exact<{
  parentLayerId: Scalars['ID'];
  index?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
}>;


export type AddLayerGroupMutation = (
  { __typename?: 'Mutation' }
  & { addLayerGroup?: Maybe<(
    { __typename?: 'AddLayerGroupPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer5_LayerGroup_Fragment
    ), parentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerSystemLayer_LayerGroup_Fragment
    ) }
  )> }
);

export type GetWidgetsQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetWidgetsQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { plugins: Array<(
      { __typename?: 'ScenePlugin' }
      & { plugin?: Maybe<(
        { __typename?: 'Plugin' }
        & Pick<Plugin, 'id'>
        & { extensions: Array<(
          { __typename?: 'PluginExtension' }
          & Pick<PluginExtension, 'extensionId' | 'description' | 'name' | 'translatedDescription' | 'translatedName' | 'icon' | 'type'>
        )> }
      )> }
    )>, widgets: Array<(
      { __typename?: 'SceneWidget' }
      & Pick<SceneWidget, 'id' | 'enabled' | 'pluginId' | 'extensionId' | 'propertyId'>
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type GetPrimitivesQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetPrimitivesQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { plugins: Array<(
      { __typename?: 'ScenePlugin' }
      & { plugin?: Maybe<(
        { __typename?: 'Plugin' }
        & Pick<Plugin, 'id'>
        & { extensions: Array<(
          { __typename?: 'PluginExtension' }
          & Pick<PluginExtension, 'extensionId' | 'translatedDescription' | 'translatedName' | 'icon' | 'type'>
        )> }
      )> }
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type AddLayerItemFromPrimitiveMutationVariables = Exact<{
  parentLayerId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  name?: Maybe<Scalars['String']>;
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  index?: Maybe<Scalars['Int']>;
}>;


export type AddLayerItemFromPrimitiveMutation = (
  { __typename?: 'Mutation' }
  & { addLayerItem?: Maybe<(
    { __typename?: 'AddLayerItemPayload' }
    & { parentLayer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & Layer3Fragment_LayerGroup_Fragment
    ), layer: (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    ) }
  )> }
);

export type ChangePropertyValueMutationVariables = Exact<{
  value?: Maybe<Scalars['Any']>;
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  type: ValueType;
}>;


export type ChangePropertyValueMutation = (
  { __typename?: 'Mutation' }
  & { updatePropertyValue?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type ChangePropertyValueLatLngMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  lat: Scalars['Float'];
  lng: Scalars['Float'];
}>;


export type ChangePropertyValueLatLngMutation = (
  { __typename?: 'Mutation' }
  & { updatePropertyValueLatLng?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type ChangePropertyValueLatLngHeightMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  lat: Scalars['Float'];
  lng: Scalars['Float'];
  height: Scalars['Float'];
}>;


export type ChangePropertyValueLatLngHeightMutation = (
  { __typename?: 'Mutation' }
  & { updatePropertyValueLatLngHeight?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type LinkDatasetMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  itemId?: Maybe<Scalars['ID']>;
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  datasetSchemaIds: Array<Scalars['ID']> | Scalars['ID'];
  datasetIds?: Maybe<Array<Scalars['ID']> | Scalars['ID']>;
  datasetFieldIds: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type LinkDatasetMutation = (
  { __typename?: 'Mutation' }
  & { linkDatasetToPropertyValue?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & PropertyFragmentFragment
    ) }
  )> }
);

export type UnlinkDatasetMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
}>;


export type UnlinkDatasetMutation = (
  { __typename?: 'Mutation' }
  & { unlinkPropertyValue?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type CreateInfoboxMutationVariables = Exact<{
  layerId: Scalars['ID'];
}>;


export type CreateInfoboxMutation = (
  { __typename?: 'Mutation' }
  & { createInfobox?: Maybe<(
    { __typename?: 'CreateInfoboxPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & { infobox?: Maybe<(
        { __typename?: 'Infobox' }
        & InfoboxFragmentFragment
      )> }
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & { merged?: Maybe<(
        { __typename?: 'MergedLayer' }
        & { infobox?: Maybe<(
          { __typename?: 'MergedInfobox' }
          & MergedInfoboxFragmentFragment
        )> }
      )>, infobox?: Maybe<(
        { __typename?: 'Infobox' }
        & InfoboxFragmentFragment
      )> }
    ) }
  )> }
);

export type RemoveInfoboxMutationVariables = Exact<{
  layerId: Scalars['ID'];
}>;


export type RemoveInfoboxMutation = (
  { __typename?: 'Mutation' }
  & { removeInfobox?: Maybe<(
    { __typename?: 'RemoveInfoboxPayload' }
    & { layer: (
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & { infobox?: Maybe<(
        { __typename?: 'Infobox' }
        & InfoboxFragmentFragment
      )> }
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & { merged?: Maybe<(
        { __typename?: 'MergedLayer' }
        & { infobox?: Maybe<(
          { __typename?: 'MergedInfobox' }
          & MergedInfoboxFragmentFragment
        )> }
      )>, infobox?: Maybe<(
        { __typename?: 'Infobox' }
        & InfoboxFragmentFragment
      )> }
    ) }
  )> }
);

export type UploadFileToPropertyMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
  file: Scalars['Upload'];
}>;


export type UploadFileToPropertyMutation = (
  { __typename?: 'Mutation' }
  & { uploadFileToProperty?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type RemovePropertyFieldMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId?: Maybe<Scalars['PropertySchemaFieldID']>;
  itemId?: Maybe<Scalars['ID']>;
  fieldId: Scalars['PropertySchemaFieldID'];
}>;


export type RemovePropertyFieldMutation = (
  { __typename?: 'Mutation' }
  & { removePropertyField?: Maybe<(
    { __typename?: 'PropertyFieldPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type AddPropertyItemMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  index?: Maybe<Scalars['Int']>;
  nameFieldValue?: Maybe<Scalars['Any']>;
  nameFieldType?: Maybe<ValueType>;
}>;


export type AddPropertyItemMutation = (
  { __typename?: 'Mutation' }
  & { addPropertyItem?: Maybe<(
    { __typename?: 'PropertyItemPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type MovePropertyItemMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  itemId: Scalars['ID'];
  index: Scalars['Int'];
}>;


export type MovePropertyItemMutation = (
  { __typename?: 'Mutation' }
  & { movePropertyItem?: Maybe<(
    { __typename?: 'PropertyItemPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type RemovePropertyItemMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  itemId: Scalars['ID'];
}>;


export type RemovePropertyItemMutation = (
  { __typename?: 'Mutation' }
  & { removePropertyItem?: Maybe<(
    { __typename?: 'PropertyItemPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type UpdatePropertyItemsMutationVariables = Exact<{
  propertyId: Scalars['ID'];
  schemaItemId: Scalars['PropertySchemaFieldID'];
  operations: Array<UpdatePropertyItemOperationInput> | UpdatePropertyItemOperationInput;
}>;


export type UpdatePropertyItemsMutation = (
  { __typename?: 'Mutation' }
  & { updatePropertyItems?: Maybe<(
    { __typename?: 'PropertyItemPayload' }
    & { property: (
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & { layer?: Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & Layer1Fragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & Layer1Fragment_LayerItem_Fragment
      )> }
      & PropertyFragmentFragment
    ) }
  )> }
);

export type GetLayerPropertyQueryVariables = Exact<{
  layerId: Scalars['ID'];
}>;


export type GetLayerPropertyQuery = (
  { __typename?: 'Query' }
  & { layer?: Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & Layer1Fragment_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & Layer1Fragment_LayerItem_Fragment
  )> }
);

export type GetScenePropertyQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetScenePropertyQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { property?: Maybe<(
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & PropertyFragmentFragment
    )>, widgets: Array<(
      { __typename?: 'SceneWidget' }
      & Pick<SceneWidget, 'id' | 'pluginId' | 'extensionId' | 'enabled' | 'propertyId'>
      & { property?: Maybe<(
        { __typename?: 'Property' }
        & Pick<Property, 'id'>
        & PropertyFragmentFragment
      )> }
    )> }
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type GetLinkableDatasetsQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetLinkableDatasetsQuery = (
  { __typename?: 'Query' }
  & { datasetSchemas: (
    { __typename?: 'DatasetSchemaConnection' }
    & { nodes: Array<Maybe<(
      { __typename?: 'DatasetSchema' }
      & Pick<DatasetSchema, 'id' | 'source' | 'name'>
      & { fields: Array<(
        { __typename?: 'DatasetSchemaField' }
        & Pick<DatasetSchemaField, 'id' | 'name' | 'type'>
      )>, datasets: (
        { __typename?: 'DatasetConnection' }
        & Pick<DatasetConnection, 'totalCount'>
        & { nodes: Array<Maybe<(
          { __typename?: 'Dataset' }
          & Pick<Dataset, 'id' | 'name'>
          & { fields: Array<(
            { __typename?: 'DatasetField' }
            & Pick<DatasetField, 'fieldId' | 'type'>
          )> }
        )>> }
      ) }
    )>> }
  ) }
);

export type AddWidgetMutationVariables = Exact<{
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
}>;


export type AddWidgetMutation = (
  { __typename?: 'Mutation' }
  & { addWidget?: Maybe<(
    { __typename?: 'AddWidgetPayload' }
    & { scene: (
      { __typename?: 'Scene' }
      & Pick<Scene, 'id'>
      & { widgets: Array<(
        { __typename?: 'SceneWidget' }
        & Pick<SceneWidget, 'id' | 'enabled' | 'pluginId' | 'extensionId' | 'propertyId'>
        & { property?: Maybe<(
          { __typename?: 'Property' }
          & Pick<Property, 'id'>
          & PropertyFragmentFragment
        )> }
      )> }
    ) }
  )> }
);

export type RemoveWidgetMutationVariables = Exact<{
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
}>;


export type RemoveWidgetMutation = (
  { __typename?: 'Mutation' }
  & { removeWidget?: Maybe<(
    { __typename?: 'RemoveWidgetPayload' }
    & { scene: (
      { __typename?: 'Scene' }
      & Pick<Scene, 'id'>
      & { widgets: Array<(
        { __typename?: 'SceneWidget' }
        & Pick<SceneWidget, 'id' | 'enabled' | 'pluginId' | 'extensionId' | 'propertyId'>
      )> }
    ) }
  )> }
);

export type UpdateWidgetMutationVariables = Exact<{
  sceneId: Scalars['ID'];
  pluginId: Scalars['PluginID'];
  extensionId: Scalars['PluginExtensionID'];
  enabled?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateWidgetMutation = (
  { __typename?: 'Mutation' }
  & { updateWidget?: Maybe<(
    { __typename?: 'UpdateWidgetPayload' }
    & { scene: (
      { __typename?: 'Scene' }
      & Pick<Scene, 'id'>
      & { widgets: Array<(
        { __typename?: 'SceneWidget' }
        & Pick<SceneWidget, 'id' | 'enabled' | 'pluginId' | 'extensionId' | 'propertyId'>
      )> }
    ) }
  )> }
);

export type UpdateMeMutationVariables = Exact<{
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  lang?: Maybe<Scalars['Lang']>;
  password?: Maybe<Scalars['String']>;
  passwordConfirmation?: Maybe<Scalars['String']>;
}>;


export type UpdateMeMutation = (
  { __typename?: 'Mutation' }
  & { updateMe?: Maybe<(
    { __typename?: 'UpdateMePayload' }
    & { user: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'email' | 'lang'>
      & { myTeam: (
        { __typename?: 'Team' }
        & Pick<Team, 'id' | 'name'>
      ) }
    ) }
  )> }
);

export type ProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name' | 'email' | 'lang' | 'auths'>
    & { myTeam: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name'>
    ) }
  )> }
);

export type DatasetSchemasQueryVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type DatasetSchemasQuery = (
  { __typename?: 'Query' }
  & { scene?: Maybe<(
    { __typename?: 'Scene' }
    & Pick<Scene, 'id'>
    & { datasetSchemas: (
      { __typename?: 'DatasetSchemaConnection' }
      & Pick<DatasetSchemaConnection, 'totalCount'>
      & { nodes: Array<Maybe<(
        { __typename?: 'DatasetSchema' }
        & Pick<DatasetSchema, 'id' | 'source' | 'name'>
      )>>, pageInfo: (
        { __typename?: 'PageInfo' }
        & Pick<PageInfo, 'endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor'>
      ) }
    ) }
  )> }
);

export type SyncDatasetTestMutationVariables = Exact<{
  sceneId: Scalars['ID'];
  url: Scalars['String'];
}>;


export type SyncDatasetTestMutation = (
  { __typename?: 'Mutation' }
  & { syncDataset?: Maybe<(
    { __typename?: 'SyncDatasetPayload' }
    & Pick<SyncDatasetPayload, 'sceneId' | 'url'>
    & { datasetSchema: Array<(
      { __typename?: 'DatasetSchema' }
      & Pick<DatasetSchema, 'id' | 'source' | 'name'>
    )>, dataset: Array<(
      { __typename?: 'Dataset' }
      & Pick<Dataset, 'id' | 'source' | 'schemaId' | 'name'>
    )> }
  )> }
);

export type RemoveDatasetSchemaMutationVariables = Exact<{
  schemaId: Scalars['ID'];
}>;


export type RemoveDatasetSchemaMutation = (
  { __typename?: 'Mutation' }
  & { removeDatasetSchema?: Maybe<(
    { __typename?: 'RemoveDatasetSchemaPayload' }
    & Pick<RemoveDatasetSchemaPayload, 'schemaId'>
  )> }
);

export type ProjectQueryVariables = Exact<{
  teamId: Scalars['ID'];
}>;


export type ProjectQuery = (
  { __typename?: 'Query' }
  & { projects: (
    { __typename?: 'ProjectConnection' }
    & { nodes: Array<Maybe<(
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    )>> }
  ) }
);

export type UpdateProjectBasicAuthMutationVariables = Exact<{
  projectId: Scalars['ID'];
  isBasicAuthActive?: Maybe<Scalars['Boolean']>;
  basicAuthUsername?: Maybe<Scalars['String']>;
  basicAuthPassword?: Maybe<Scalars['String']>;
}>;


export type UpdateProjectBasicAuthMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword'>
    ) }
  )> }
);

export type UpdateProjectNameMutationVariables = Exact<{
  projectId: Scalars['ID'];
  name: Scalars['String'];
}>;


export type UpdateProjectNameMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

export type UpdateProjectDescriptionMutationVariables = Exact<{
  projectId: Scalars['ID'];
  description: Scalars['String'];
}>;


export type UpdateProjectDescriptionMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

export type UpdateProjectImageUrlMutationVariables = Exact<{
  projectId: Scalars['ID'];
  imageUrl?: Maybe<Scalars['URL']>;
}>;


export type UpdateProjectImageUrlMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

export type UpdateProjectPublicTitleMutationVariables = Exact<{
  projectId: Scalars['ID'];
  publicTitle: Scalars['String'];
}>;


export type UpdateProjectPublicTitleMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

export type UpdateProjectPublicDescriptionMutationVariables = Exact<{
  projectId: Scalars['ID'];
  publicDescription: Scalars['String'];
}>;


export type UpdateProjectPublicDescriptionMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

export type ArchiveProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
  archived: Scalars['Boolean'];
}>;


export type ArchiveProjectMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'description' | 'isArchived' | 'isBasicAuthActive' | 'basicAuthUsername' | 'basicAuthPassword' | 'publicTitle' | 'publicDescription' | 'imageUrl' | 'alias' | 'publishmentStatus'>
    ) }
  )> }
);

export type DeleteProjectMutationVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type DeleteProjectMutation = (
  { __typename?: 'Mutation' }
  & { deleteProject?: Maybe<(
    { __typename?: 'DeleteProjectPayload' }
    & Pick<DeleteProjectPayload, 'projectId'>
  )> }
);

export type UpdateProjectAliasMutationVariables = Exact<{
  projectId: Scalars['ID'];
  alias: Scalars['String'];
}>;


export type UpdateProjectAliasMutation = (
  { __typename?: 'Mutation' }
  & { updateProject?: Maybe<(
    { __typename?: 'ProjectPayload' }
    & { project: (
      { __typename?: 'Project' }
      & Pick<Project, 'id' | 'name' | 'alias'>
    ) }
  )> }
);

export type SceneQueryVariables = Exact<{
  projectId: Scalars['ID'];
}>;


export type SceneQuery = (
  { __typename?: 'Query' }
  & { scene?: Maybe<(
    { __typename?: 'Scene' }
    & Pick<Scene, 'id' | 'projectId' | 'teamId'>
  )> }
);

export type AssetsQueryVariables = Exact<{
  teamId: Scalars['ID'];
}>;


export type AssetsQuery = (
  { __typename?: 'Query' }
  & { assets: (
    { __typename?: 'AssetConnection' }
    & Pick<AssetConnection, 'totalCount'>
    & { edges: Array<(
      { __typename?: 'AssetEdge' }
      & Pick<AssetEdge, 'cursor'>
      & { node?: Maybe<(
        { __typename?: 'Asset' }
        & Pick<Asset, 'id' | 'teamId' | 'name' | 'size' | 'url' | 'contentType'>
      )> }
    )>, nodes: Array<Maybe<(
      { __typename?: 'Asset' }
      & Pick<Asset, 'id' | 'teamId' | 'name' | 'size' | 'url' | 'contentType'>
    )>>, pageInfo: (
      { __typename?: 'PageInfo' }
      & Pick<PageInfo, 'endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor'>
    ) }
  ) }
);

export type CreateAssetMutationVariables = Exact<{
  teamId: Scalars['ID'];
  file: Scalars['Upload'];
}>;


export type CreateAssetMutation = (
  { __typename?: 'Mutation' }
  & { createAsset?: Maybe<(
    { __typename?: 'CreateAssetPayload' }
    & { asset: (
      { __typename?: 'Asset' }
      & Pick<Asset, 'id' | 'teamId' | 'name' | 'size' | 'url' | 'contentType'>
    ) }
  )> }
);

export type RemoveAssetMutationVariables = Exact<{
  assetId: Scalars['ID'];
}>;


export type RemoveAssetMutation = (
  { __typename?: 'Mutation' }
  & { removeAsset?: Maybe<(
    { __typename?: 'RemoveAssetPayload' }
    & Pick<RemoveAssetPayload, 'assetId'>
  )> }
);

export type UpdateTeamMutationVariables = Exact<{
  teamId: Scalars['ID'];
  name: Scalars['String'];
}>;


export type UpdateTeamMutation = (
  { __typename?: 'Mutation' }
  & { updateTeam?: Maybe<(
    { __typename?: 'UpdateTeamPayload' }
    & { team: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name' | 'personal'>
      & { members: Array<(
        { __typename?: 'TeamMember' }
        & Pick<TeamMember, 'userId' | 'role'>
        & { user?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'id' | 'name' | 'email'>
        )> }
      )> }
    ) }
  )> }
);

export type DeleteTeamMutationVariables = Exact<{
  teamId: Scalars['ID'];
}>;


export type DeleteTeamMutation = (
  { __typename?: 'Mutation' }
  & { deleteTeam?: Maybe<(
    { __typename?: 'DeleteTeamPayload' }
    & Pick<DeleteTeamPayload, 'teamId'>
  )> }
);

export type SearchUserQueryVariables = Exact<{
  nameOrEmail: Scalars['String'];
}>;


export type SearchUserQuery = (
  { __typename?: 'Query' }
  & { searchUser?: Maybe<(
    { __typename?: 'SearchedUser' }
    & Pick<SearchedUser, 'userId' | 'userName' | 'userEmail'>
  )> }
);

export type AddMemberToTeamMutationVariables = Exact<{
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type AddMemberToTeamMutation = (
  { __typename?: 'Mutation' }
  & { addMemberToTeam?: Maybe<(
    { __typename?: 'AddMemberToTeamPayload' }
    & { team: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name' | 'personal'>
      & { members: Array<(
        { __typename?: 'TeamMember' }
        & Pick<TeamMember, 'userId' | 'role'>
        & { user?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'id' | 'name' | 'email'>
        )> }
      )> }
    ) }
  )> }
);

export type UpdateMemberOfTeamMutationVariables = Exact<{
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type UpdateMemberOfTeamMutation = (
  { __typename?: 'Mutation' }
  & { updateMemberOfTeam?: Maybe<(
    { __typename?: 'UpdateMemberOfTeamPayload' }
    & { team: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name' | 'personal'>
      & { members: Array<(
        { __typename?: 'TeamMember' }
        & Pick<TeamMember, 'userId' | 'role'>
        & { user?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'id' | 'name' | 'email'>
        )> }
      )> }
    ) }
  )> }
);

export type RemoveMemberFromTeamMutationVariables = Exact<{
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
}>;


export type RemoveMemberFromTeamMutation = (
  { __typename?: 'Mutation' }
  & { removeMemberFromTeam?: Maybe<(
    { __typename?: 'RemoveMemberFromTeamPayload' }
    & { team: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name' | 'personal'>
      & { members: Array<(
        { __typename?: 'TeamMember' }
        & Pick<TeamMember, 'userId' | 'role'>
        & { user?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'id' | 'name' | 'email'>
        )> }
      )> }
    ) }
  )> }
);

export type GetSceneQueryVariables = Exact<{
  sceneId: Scalars['ID'];
}>;


export type GetSceneQuery = (
  { __typename?: 'Query' }
  & { node?: Maybe<(
    { __typename?: 'Asset' }
    & Pick<Asset, 'id'>
  ) | (
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id'>
  ) | (
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id'>
  ) | (
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id'>
  ) | (
    { __typename?: 'Project' }
    & Pick<Project, 'id'>
  ) | (
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
  ) | (
    { __typename?: 'Scene' }
    & Pick<Scene, 'rootLayerId' | 'id'>
  ) | (
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
  ) | (
    { __typename?: 'User' }
    & Pick<User, 'id'>
  )> }
);

export type InfoboxFragmentFragment = (
  { __typename?: 'Infobox' }
  & Pick<Infobox, 'propertyId'>
  & { property?: Maybe<(
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
    & PropertyFragmentFragment
  )>, fields: Array<(
    { __typename?: 'InfoboxField' }
    & Pick<InfoboxField, 'id' | 'pluginId' | 'extensionId' | 'propertyId'>
    & { property?: Maybe<(
      { __typename?: 'Property' }
      & Pick<Property, 'id'>
      & PropertyFragmentFragment
    )> }
  )> }
);

export type MergedInfoboxFragmentFragment = (
  { __typename?: 'MergedInfobox' }
  & { property?: Maybe<(
    { __typename?: 'MergedProperty' }
    & MergedPropertyFragmentFragment
  )>, fields: Array<(
    { __typename?: 'MergedInfoboxField' }
    & Pick<MergedInfoboxField, 'originalId' | 'pluginId' | 'extensionId'>
    & { property?: Maybe<(
      { __typename?: 'MergedProperty' }
      & MergedPropertyFragmentFragment
    )> }
  )> }
);

type LayerFragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'linkedDatasetSchemaId' | 'id' | 'name' | 'isVisible' | 'pluginId' | 'extensionId'>
  & { property?: Maybe<(
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
    & PropertyFragmentFragment
  )>, infobox?: Maybe<(
    { __typename?: 'Infobox' }
    & InfoboxFragmentFragment
  )> }
);

type LayerFragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'linkedDatasetId' | 'id' | 'name' | 'isVisible' | 'pluginId' | 'extensionId'>
  & { merged?: Maybe<(
    { __typename?: 'MergedLayer' }
    & Pick<MergedLayer, 'parentId'>
    & { property?: Maybe<(
      { __typename?: 'MergedProperty' }
      & MergedPropertyFragmentFragment
    )>, infobox?: Maybe<(
      { __typename?: 'MergedInfobox' }
      & MergedInfoboxFragmentFragment
    )> }
  )>, property?: Maybe<(
    { __typename?: 'Property' }
    & Pick<Property, 'id'>
    & PropertyFragmentFragment
  )>, infobox?: Maybe<(
    { __typename?: 'Infobox' }
    & InfoboxFragmentFragment
  )> }
);

export type LayerFragmentFragment = LayerFragment_LayerGroup_Fragment | LayerFragment_LayerItem_Fragment;

type Layer0Fragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
  )>> }
  & LayerFragment_LayerGroup_Fragment
);

type Layer0Fragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerFragment_LayerItem_Fragment
);

export type Layer0FragmentFragment = Layer0Fragment_LayerGroup_Fragment | Layer0Fragment_LayerItem_Fragment;

type Layer1Fragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & LayerFragment_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerFragment_LayerItem_Fragment
  )>> }
  & LayerFragment_LayerGroup_Fragment
);

type Layer1Fragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerFragment_LayerItem_Fragment
);

export type Layer1FragmentFragment = Layer1Fragment_LayerGroup_Fragment | Layer1Fragment_LayerItem_Fragment;

type Layer2Fragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & { layers: Array<Maybe<(
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & LayerFragment_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    )>> }
    & LayerFragment_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerFragment_LayerItem_Fragment
  )>> }
  & LayerFragment_LayerGroup_Fragment
);

type Layer2Fragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerFragment_LayerItem_Fragment
);

export type Layer2FragmentFragment = Layer2Fragment_LayerGroup_Fragment | Layer2Fragment_LayerItem_Fragment;

type Layer3Fragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & { layers: Array<Maybe<(
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & { layers: Array<Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & LayerFragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & LayerFragment_LayerItem_Fragment
      )>> }
      & LayerFragment_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    )>> }
    & LayerFragment_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerFragment_LayerItem_Fragment
  )>> }
  & LayerFragment_LayerGroup_Fragment
);

type Layer3Fragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerFragment_LayerItem_Fragment
);

export type Layer3FragmentFragment = Layer3Fragment_LayerGroup_Fragment | Layer3Fragment_LayerItem_Fragment;

type Layer4Fragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & { layers: Array<Maybe<(
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & { layers: Array<Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & { layers: Array<Maybe<(
          { __typename?: 'LayerGroup' }
          & Pick<LayerGroup, 'id'>
          & LayerFragment_LayerGroup_Fragment
        ) | (
          { __typename?: 'LayerItem' }
          & Pick<LayerItem, 'id'>
          & LayerFragment_LayerItem_Fragment
        )>> }
        & LayerFragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & LayerFragment_LayerItem_Fragment
      )>> }
      & LayerFragment_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    )>> }
    & LayerFragment_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerFragment_LayerItem_Fragment
  )>> }
  & LayerFragment_LayerGroup_Fragment
);

type Layer4Fragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerFragment_LayerItem_Fragment
);

export type Layer4FragmentFragment = Layer4Fragment_LayerGroup_Fragment | Layer4Fragment_LayerItem_Fragment;

type Layer5Fragment_LayerGroup_Fragment = (
  { __typename?: 'LayerGroup' }
  & Pick<LayerGroup, 'id'>
  & { layers: Array<Maybe<(
    { __typename?: 'LayerGroup' }
    & Pick<LayerGroup, 'id'>
    & { layers: Array<Maybe<(
      { __typename?: 'LayerGroup' }
      & Pick<LayerGroup, 'id'>
      & { layers: Array<Maybe<(
        { __typename?: 'LayerGroup' }
        & Pick<LayerGroup, 'id'>
        & { layers: Array<Maybe<(
          { __typename?: 'LayerGroup' }
          & Pick<LayerGroup, 'id'>
          & { layers: Array<Maybe<(
            { __typename?: 'LayerGroup' }
            & Pick<LayerGroup, 'id'>
            & LayerFragment_LayerGroup_Fragment
          ) | (
            { __typename?: 'LayerItem' }
            & Pick<LayerItem, 'id'>
            & LayerFragment_LayerItem_Fragment
          )>> }
          & LayerFragment_LayerGroup_Fragment
        ) | (
          { __typename?: 'LayerItem' }
          & Pick<LayerItem, 'id'>
          & LayerFragment_LayerItem_Fragment
        )>> }
        & LayerFragment_LayerGroup_Fragment
      ) | (
        { __typename?: 'LayerItem' }
        & Pick<LayerItem, 'id'>
        & LayerFragment_LayerItem_Fragment
      )>> }
      & LayerFragment_LayerGroup_Fragment
    ) | (
      { __typename?: 'LayerItem' }
      & Pick<LayerItem, 'id'>
      & LayerFragment_LayerItem_Fragment
    )>> }
    & LayerFragment_LayerGroup_Fragment
  ) | (
    { __typename?: 'LayerItem' }
    & Pick<LayerItem, 'id'>
    & LayerFragment_LayerItem_Fragment
  )>> }
  & LayerFragment_LayerGroup_Fragment
);

type Layer5Fragment_LayerItem_Fragment = (
  { __typename?: 'LayerItem' }
  & Pick<LayerItem, 'id'>
  & LayerFragment_LayerItem_Fragment
);

export type Layer5FragmentFragment = Layer5Fragment_LayerGroup_Fragment | Layer5Fragment_LayerItem_Fragment;

export type PropertySchemaItemFragmentFragment = (
  { __typename?: 'PropertySchemaGroup' }
  & Pick<PropertySchemaGroup, 'schemaGroupId' | 'title' | 'translatedTitle' | 'isList' | 'name'>
  & { isAvailableIf?: Maybe<(
    { __typename?: 'PropertyCondition' }
    & Pick<PropertyCondition, 'fieldId' | 'type' | 'value'>
  )>, fields: Array<(
    { __typename?: 'PropertySchemaField' }
    & Pick<PropertySchemaField, 'fieldId' | 'name' | 'description' | 'translatedName' | 'translatedDescription' | 'prefix' | 'suffix' | 'type' | 'defaultValue' | 'ui' | 'min' | 'max'>
    & { choices?: Maybe<Array<(
      { __typename?: 'PropertySchemaFieldChoice' }
      & Pick<PropertySchemaFieldChoice, 'key' | 'label' | 'translatedLabel'>
    )>>, isAvailableIf?: Maybe<(
      { __typename?: 'PropertyCondition' }
      & Pick<PropertyCondition, 'fieldId' | 'type' | 'value'>
    )> }
  )> }
);

type PropertyItemFragment_PropertyGroup_Fragment = (
  { __typename?: 'PropertyGroup' }
  & Pick<PropertyGroup, 'id' | 'schemaGroupId'>
  & { fields: Array<(
    { __typename?: 'PropertyField' }
    & Pick<PropertyField, 'id' | 'fieldId' | 'type' | 'value'>
    & { links?: Maybe<Array<(
      { __typename?: 'PropertyFieldLink' }
      & PropertyFieldLinkFragment
    )>> }
  )> }
);

type PropertyItemFragment_PropertyGroupList_Fragment = (
  { __typename?: 'PropertyGroupList' }
  & Pick<PropertyGroupList, 'id' | 'schemaGroupId'>
  & { groups: Array<(
    { __typename?: 'PropertyGroup' }
    & Pick<PropertyGroup, 'id' | 'schemaGroupId'>
    & { fields: Array<(
      { __typename?: 'PropertyField' }
      & Pick<PropertyField, 'id' | 'fieldId' | 'type' | 'value'>
      & { links?: Maybe<Array<(
        { __typename?: 'PropertyFieldLink' }
        & PropertyFieldLinkFragment
      )>> }
    )> }
  )> }
);

export type PropertyItemFragmentFragment = PropertyItemFragment_PropertyGroup_Fragment | PropertyItemFragment_PropertyGroupList_Fragment;

export type PropertyFragmentWithoutSchemaFragment = (
  { __typename?: 'Property' }
  & Pick<Property, 'id'>
  & { items: Array<(
    { __typename?: 'PropertyGroup' }
    & PropertyItemFragment_PropertyGroup_Fragment
  ) | (
    { __typename?: 'PropertyGroupList' }
    & PropertyItemFragment_PropertyGroupList_Fragment
  )> }
);

export type PropertyFragmentFragment = (
  { __typename?: 'Property' }
  & Pick<Property, 'id'>
  & { schema?: Maybe<(
    { __typename?: 'PropertySchema' }
    & Pick<PropertySchema, 'id'>
    & { groups: Array<(
      { __typename?: 'PropertySchemaGroup' }
      & PropertySchemaItemFragmentFragment
    )> }
  )> }
  & PropertyFragmentWithoutSchemaFragment
);

export type MergedPropertyGroupCommonFragmentFragment = (
  { __typename?: 'MergedPropertyGroup' }
  & Pick<MergedPropertyGroup, 'schemaGroupId'>
  & { fields: Array<(
    { __typename?: 'MergedPropertyField' }
    & Pick<MergedPropertyField, 'fieldId' | 'type' | 'actualValue' | 'overridden'>
    & { links?: Maybe<Array<(
      { __typename?: 'PropertyFieldLink' }
      & PropertyFieldLinkFragment
    )>> }
  )> }
);

export type MergedPropertyGroupFragmentFragment = (
  { __typename?: 'MergedPropertyGroup' }
  & { groups: Array<(
    { __typename?: 'MergedPropertyGroup' }
    & MergedPropertyGroupCommonFragmentFragment
  )> }
  & MergedPropertyGroupCommonFragmentFragment
);

export type MergedPropertyFragmentWithoutSchemaFragment = (
  { __typename?: 'MergedProperty' }
  & Pick<MergedProperty, 'originalId' | 'parentId' | 'linkedDatasetId'>
  & { groups: Array<(
    { __typename?: 'MergedPropertyGroup' }
    & MergedPropertyGroupFragmentFragment
  )> }
);

export type MergedPropertyFragmentFragment = (
  { __typename?: 'MergedProperty' }
  & { schema?: Maybe<(
    { __typename?: 'PropertySchema' }
    & Pick<PropertySchema, 'id'>
  )> }
  & MergedPropertyFragmentWithoutSchemaFragment
);

export type PropertyFieldLinkFragment = (
  { __typename?: 'PropertyFieldLink' }
  & Pick<PropertyFieldLink, 'datasetId' | 'datasetSchemaId' | 'datasetSchemaFieldId'>
  & { datasetSchema?: Maybe<(
    { __typename?: 'DatasetSchema' }
    & Pick<DatasetSchema, 'id' | 'name'>
  )>, dataset?: Maybe<(
    { __typename?: 'Dataset' }
    & Pick<Dataset, 'id' | 'name'>
  )>, datasetSchemaField?: Maybe<(
    { __typename?: 'DatasetSchemaField' }
    & Pick<DatasetSchemaField, 'id' | 'name'>
  )> }
);

export type DeleteMeMutationVariables = Exact<{
  userId: Scalars['ID'];
}>;


export type DeleteMeMutation = (
  { __typename?: 'Mutation' }
  & { deleteMe?: Maybe<(
    { __typename?: 'DeleteMePayload' }
    & Pick<DeleteMePayload, 'userId'>
  )> }
);

export type CreateTeamMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateTeamMutation = (
  { __typename?: 'Mutation' }
  & { createTeam?: Maybe<(
    { __typename?: 'CreateTeamPayload' }
    & { team: (
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'name'>
    ) }
  )> }
);

export type TeamFragment = (
  { __typename?: 'Team' }
  & Pick<Team, 'id' | 'name' | 'personal'>
  & { members: Array<(
    { __typename?: 'TeamMember' }
    & Pick<TeamMember, 'userId' | 'role'>
    & { user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'email'>
    )> }
  )> }
);

export type TeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamsQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name'>
    & { myTeam: (
      { __typename?: 'Team' }
      & Pick<Team, 'id'>
      & TeamFragment
    ), teams: Array<(
      { __typename?: 'Team' }
      & Pick<Team, 'id'>
      & TeamFragment
    )> }
  )> }
);

export type LanguageQueryVariables = Exact<{ [key: string]: never; }>;


export type LanguageQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'lang'>
  )> }
);

export const PropertyFieldLinkFragmentDoc = gql`
    fragment PropertyFieldLink on PropertyFieldLink {
  datasetId
  datasetSchemaId
  datasetSchemaFieldId
  datasetSchema {
    id
    name
  }
  dataset {
    id
    name
  }
  datasetSchemaField {
    id
    name
  }
}
    `;
export const PropertyItemFragmentFragmentDoc = gql`
    fragment PropertyItemFragment on PropertyItem {
  ... on PropertyGroupList {
    id
    schemaGroupId
    groups {
      id
      schemaGroupId
      fields {
        id
        fieldId
        type
        value
        links {
          ...PropertyFieldLink
        }
      }
    }
  }
  ... on PropertyGroup {
    id
    schemaGroupId
    fields {
      id
      fieldId
      type
      value
      links {
        ...PropertyFieldLink
      }
    }
  }
}
    ${PropertyFieldLinkFragmentDoc}`;
export const PropertyFragmentWithoutSchemaFragmentDoc = gql`
    fragment PropertyFragmentWithoutSchema on Property {
  id
  items {
    ...PropertyItemFragment
  }
}
    ${PropertyItemFragmentFragmentDoc}`;
export const MergedPropertyGroupCommonFragmentFragmentDoc = gql`
    fragment MergedPropertyGroupCommonFragment on MergedPropertyGroup {
  schemaGroupId
  fields {
    fieldId
    type
    actualValue
    overridden
    links {
      ...PropertyFieldLink
    }
  }
}
    ${PropertyFieldLinkFragmentDoc}`;
export const MergedPropertyGroupFragmentFragmentDoc = gql`
    fragment MergedPropertyGroupFragment on MergedPropertyGroup {
  ...MergedPropertyGroupCommonFragment
  groups {
    ...MergedPropertyGroupCommonFragment
  }
}
    ${MergedPropertyGroupCommonFragmentFragmentDoc}`;
export const MergedPropertyFragmentWithoutSchemaFragmentDoc = gql`
    fragment MergedPropertyFragmentWithoutSchema on MergedProperty {
  originalId
  parentId
  linkedDatasetId
  groups {
    ...MergedPropertyGroupFragment
  }
}
    ${MergedPropertyGroupFragmentFragmentDoc}`;
export const EarthLayerItemFragmentDoc = gql`
    fragment EarthLayerItem on LayerItem {
  id
  linkedDatasetId
  merged {
    parentId
    property {
      ...MergedPropertyFragmentWithoutSchema
    }
    infobox {
      property {
        ...MergedPropertyFragmentWithoutSchema
      }
      fields {
        originalId
        pluginId
        extensionId
        property {
          ...MergedPropertyFragmentWithoutSchema
        }
      }
    }
  }
}
    ${MergedPropertyFragmentWithoutSchemaFragmentDoc}`;
export const EarthLayerFragmentDoc = gql`
    fragment EarthLayer on Layer {
  id
  name
  isVisible
  pluginId
  extensionId
  property {
    id
    ...PropertyFragmentWithoutSchema
  }
  infobox {
    propertyId
    property {
      id
      ...PropertyFragmentWithoutSchema
    }
    fields {
      id
      pluginId
      extensionId
      propertyId
      property {
        id
        ...PropertyFragmentWithoutSchema
      }
    }
  }
  ... on LayerGroup {
    linkedDatasetSchemaId
    layers {
      id
    }
  }
  ...EarthLayerItem
}
    ${PropertyFragmentWithoutSchemaFragmentDoc}
${EarthLayerItemFragmentDoc}`;
export const EarthLayer1FragmentDoc = gql`
    fragment EarthLayer1 on Layer {
  id
  ...EarthLayer
  ... on LayerGroup {
    layers {
      id
      ...EarthLayer
    }
  }
}
    ${EarthLayerFragmentDoc}`;
export const EarthLayer2FragmentDoc = gql`
    fragment EarthLayer2 on Layer {
  id
  ...EarthLayer
  ... on LayerGroup {
    layers {
      id
      ...EarthLayer1
    }
  }
}
    ${EarthLayerFragmentDoc}
${EarthLayer1FragmentDoc}`;
export const EarthLayer3FragmentDoc = gql`
    fragment EarthLayer3 on Layer {
  id
  ...EarthLayer
  ... on LayerGroup {
    layers {
      id
      ...EarthLayer2
    }
  }
}
    ${EarthLayerFragmentDoc}
${EarthLayer2FragmentDoc}`;
export const EarthLayer4FragmentDoc = gql`
    fragment EarthLayer4 on Layer {
  id
  ...EarthLayer
  ... on LayerGroup {
    layers {
      id
      ...EarthLayer3
    }
  }
}
    ${EarthLayerFragmentDoc}
${EarthLayer3FragmentDoc}`;
export const EarthLayer5FragmentDoc = gql`
    fragment EarthLayer5 on Layer {
  id
  ...EarthLayer
  ... on LayerGroup {
    layers {
      id
      ...EarthLayer4
    }
  }
}
    ${EarthLayerFragmentDoc}
${EarthLayer4FragmentDoc}`;
export const LayerSystemLayerFragmentDoc = gql`
    fragment LayerSystemLayer on Layer {
  id
  name
  isVisible
  pluginId
  extensionId
  ... on LayerGroup {
    linkedDatasetSchemaId
    layers {
      id
    }
  }
  ... on LayerItem {
    linkedDatasetId
  }
}
    `;
export const LayerSystemLayer1FragmentDoc = gql`
    fragment LayerSystemLayer1 on Layer {
  id
  ...LayerSystemLayer
  ... on LayerGroup {
    layers {
      id
      ...LayerSystemLayer
    }
  }
}
    ${LayerSystemLayerFragmentDoc}`;
export const LayerSystemLayer2FragmentDoc = gql`
    fragment LayerSystemLayer2 on Layer {
  id
  ...LayerSystemLayer
  ... on LayerGroup {
    layers {
      id
      ...LayerSystemLayer1
    }
  }
}
    ${LayerSystemLayerFragmentDoc}
${LayerSystemLayer1FragmentDoc}`;
export const LayerSystemLayer3FragmentDoc = gql`
    fragment LayerSystemLayer3 on Layer {
  id
  ...LayerSystemLayer
  ... on LayerGroup {
    layers {
      id
      ...LayerSystemLayer2
    }
  }
}
    ${LayerSystemLayerFragmentDoc}
${LayerSystemLayer2FragmentDoc}`;
export const LayerSystemLayer4FragmentDoc = gql`
    fragment LayerSystemLayer4 on Layer {
  id
  ...LayerSystemLayer
  ... on LayerGroup {
    layers {
      id
      ...LayerSystemLayer3
    }
  }
}
    ${LayerSystemLayerFragmentDoc}
${LayerSystemLayer3FragmentDoc}`;
export const LayerSystemLayer5FragmentDoc = gql`
    fragment LayerSystemLayer5 on Layer {
  id
  ...LayerSystemLayer
  ... on LayerGroup {
    layers {
      id
      ...LayerSystemLayer4
    }
  }
}
    ${LayerSystemLayerFragmentDoc}
${LayerSystemLayer4FragmentDoc}`;
export const PropertySchemaItemFragmentFragmentDoc = gql`
    fragment PropertySchemaItemFragment on PropertySchemaGroup {
  schemaGroupId
  title
  translatedTitle
  isList
  name
  isAvailableIf {
    fieldId
    type
    value
  }
  fields {
    fieldId
    name
    description
    translatedName
    translatedDescription
    prefix
    suffix
    type
    defaultValue
    ui
    min
    max
    choices {
      key
      label
      translatedLabel
    }
    isAvailableIf {
      fieldId
      type
      value
    }
  }
}
    `;
export const PropertyFragmentFragmentDoc = gql`
    fragment PropertyFragment on Property {
  id
  ...PropertyFragmentWithoutSchema
  schema {
    id
    groups {
      ...PropertySchemaItemFragment
    }
  }
}
    ${PropertyFragmentWithoutSchemaFragmentDoc}
${PropertySchemaItemFragmentFragmentDoc}`;
export const InfoboxFragmentFragmentDoc = gql`
    fragment InfoboxFragment on Infobox {
  propertyId
  property {
    id
    ...PropertyFragment
  }
  fields {
    id
    pluginId
    extensionId
    propertyId
    property {
      id
      ...PropertyFragment
    }
  }
}
    ${PropertyFragmentFragmentDoc}`;
export const MergedPropertyFragmentFragmentDoc = gql`
    fragment MergedPropertyFragment on MergedProperty {
  ...MergedPropertyFragmentWithoutSchema
  schema {
    id
  }
}
    ${MergedPropertyFragmentWithoutSchemaFragmentDoc}`;
export const MergedInfoboxFragmentFragmentDoc = gql`
    fragment MergedInfoboxFragment on MergedInfobox {
  property {
    ...MergedPropertyFragment
  }
  fields {
    originalId
    pluginId
    extensionId
    property {
      ...MergedPropertyFragment
    }
  }
}
    ${MergedPropertyFragmentFragmentDoc}`;
export const LayerFragmentFragmentDoc = gql`
    fragment LayerFragment on Layer {
  id
  name
  isVisible
  pluginId
  extensionId
  property {
    id
    ...PropertyFragment
  }
  infobox {
    ...InfoboxFragment
  }
  ... on LayerGroup {
    linkedDatasetSchemaId
  }
  ... on LayerItem {
    linkedDatasetId
    merged {
      parentId
      property {
        ...MergedPropertyFragment
      }
      infobox {
        ...MergedInfoboxFragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${InfoboxFragmentFragmentDoc}
${MergedPropertyFragmentFragmentDoc}
${MergedInfoboxFragmentFragmentDoc}`;
export const Layer0FragmentFragmentDoc = gql`
    fragment Layer0Fragment on Layer {
  id
  ...LayerFragment
  ... on LayerGroup {
    layers {
      id
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export const Layer1FragmentFragmentDoc = gql`
    fragment Layer1Fragment on Layer {
  id
  ...LayerFragment
  ... on LayerGroup {
    layers {
      id
      ...LayerFragment
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export const Layer2FragmentFragmentDoc = gql`
    fragment Layer2Fragment on Layer {
  id
  ...LayerFragment
  ... on LayerGroup {
    layers {
      id
      ...LayerFragment
      ... on LayerGroup {
        layers {
          id
          ...LayerFragment
        }
      }
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export const Layer3FragmentFragmentDoc = gql`
    fragment Layer3Fragment on Layer {
  id
  ...LayerFragment
  ... on LayerGroup {
    layers {
      id
      ...LayerFragment
      ... on LayerGroup {
        layers {
          id
          ...LayerFragment
          ... on LayerGroup {
            layers {
              id
              ...LayerFragment
            }
          }
        }
      }
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export const Layer4FragmentFragmentDoc = gql`
    fragment Layer4Fragment on Layer {
  id
  ...LayerFragment
  ... on LayerGroup {
    layers {
      id
      ...LayerFragment
      ... on LayerGroup {
        layers {
          id
          ...LayerFragment
          ... on LayerGroup {
            layers {
              id
              ...LayerFragment
              ... on LayerGroup {
                layers {
                  id
                  ...LayerFragment
                }
              }
            }
          }
        }
      }
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export const Layer5FragmentFragmentDoc = gql`
    fragment Layer5Fragment on Layer {
  id
  ...LayerFragment
  ... on LayerGroup {
    layers {
      id
      ...LayerFragment
      ... on LayerGroup {
        layers {
          id
          ...LayerFragment
          ... on LayerGroup {
            layers {
              id
              ...LayerFragment
              ... on LayerGroup {
                layers {
                  id
                  ...LayerFragment
                  ... on LayerGroup {
                    layers {
                      id
                      ...LayerFragment
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export const TeamFragmentDoc = gql`
    fragment Team on Team {
  id
  name
  members {
    user {
      id
      name
      email
    }
    userId
    role
  }
  personal
}
    `;
export const MeDocument = gql`
    query Me {
  me {
    id
    name
    email
    myTeam {
      id
      name
      projects(first: 100) {
        nodes {
          id
          publishmentStatus
          isArchived
          name
          imageUrl
          description
          visualizer
          scene {
            id
          }
        }
      }
    }
    teams {
      id
      name
      members {
        user {
          id
          name
        }
      }
      projects(first: 100) {
        nodes {
          id
          publishmentStatus
          isArchived
          name
          imageUrl
          description
          visualizer
          scene {
            id
          }
        }
      }
    }
    auths
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const CreateProjectDocument = gql`
    mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL) {
  createProject(
    input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl}
  ) {
    project {
      id
      name
      description
      imageUrl
    }
  }
}
    `;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      visualizer: // value for 'visualizer'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      imageUrl: // value for 'imageUrl'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, baseOptions);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const CreateSceneDocument = gql`
    mutation CreateScene($projectId: ID!) {
  createScene(input: {projectId: $projectId}) {
    scene {
      id
    }
  }
}
    `;
export type CreateSceneMutationFn = Apollo.MutationFunction<CreateSceneMutation, CreateSceneMutationVariables>;

/**
 * __useCreateSceneMutation__
 *
 * To run a mutation, you first call `useCreateSceneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneMutation, { data, loading, error }] = useCreateSceneMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useCreateSceneMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneMutation, CreateSceneMutationVariables>) {
        return Apollo.useMutation<CreateSceneMutation, CreateSceneMutationVariables>(CreateSceneDocument, baseOptions);
      }
export type CreateSceneMutationHookResult = ReturnType<typeof useCreateSceneMutation>;
export type CreateSceneMutationResult = Apollo.MutationResult<CreateSceneMutation>;
export type CreateSceneMutationOptions = Apollo.BaseMutationOptions<CreateSceneMutation, CreateSceneMutationVariables>;
export const GetLayersDocument = gql`
    query GetLayers($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      rootLayer {
        id
        ...EarthLayer5
      }
    }
  }
}
    ${EarthLayer5FragmentDoc}`;

/**
 * __useGetLayersQuery__
 *
 * To run a query within a React component, call `useGetLayersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLayersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLayersQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetLayersQuery(baseOptions: Apollo.QueryHookOptions<GetLayersQuery, GetLayersQueryVariables>) {
        return Apollo.useQuery<GetLayersQuery, GetLayersQueryVariables>(GetLayersDocument, baseOptions);
      }
export function useGetLayersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLayersQuery, GetLayersQueryVariables>) {
          return Apollo.useLazyQuery<GetLayersQuery, GetLayersQueryVariables>(GetLayersDocument, baseOptions);
        }
export type GetLayersQueryHookResult = ReturnType<typeof useGetLayersQuery>;
export type GetLayersLazyQueryHookResult = ReturnType<typeof useGetLayersLazyQuery>;
export type GetLayersQueryResult = Apollo.QueryResult<GetLayersQuery, GetLayersQueryVariables>;
export const GetEarthWidgetsDocument = gql`
    query GetEarthWidgets($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      project {
        id
        publicTitle
      }
      property {
        id
        ...PropertyFragment
      }
      widgets {
        id
        enabled
        pluginId
        extensionId
        plugin {
          id
          scenePlugin(sceneId: $sceneId) {
            property {
              id
              ...PropertyFragment
            }
          }
        }
        property {
          id
          ...PropertyFragment
        }
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}`;

/**
 * __useGetEarthWidgetsQuery__
 *
 * To run a query within a React component, call `useGetEarthWidgetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEarthWidgetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEarthWidgetsQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetEarthWidgetsQuery(baseOptions: Apollo.QueryHookOptions<GetEarthWidgetsQuery, GetEarthWidgetsQueryVariables>) {
        return Apollo.useQuery<GetEarthWidgetsQuery, GetEarthWidgetsQueryVariables>(GetEarthWidgetsDocument, baseOptions);
      }
export function useGetEarthWidgetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEarthWidgetsQuery, GetEarthWidgetsQueryVariables>) {
          return Apollo.useLazyQuery<GetEarthWidgetsQuery, GetEarthWidgetsQueryVariables>(GetEarthWidgetsDocument, baseOptions);
        }
export type GetEarthWidgetsQueryHookResult = ReturnType<typeof useGetEarthWidgetsQuery>;
export type GetEarthWidgetsLazyQueryHookResult = ReturnType<typeof useGetEarthWidgetsLazyQuery>;
export type GetEarthWidgetsQueryResult = Apollo.QueryResult<GetEarthWidgetsQuery, GetEarthWidgetsQueryVariables>;
export const MoveInfoboxFieldDocument = gql`
    mutation moveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $index: Int!) {
  moveInfoboxField(
    input: {layerId: $layerId, infoboxFieldId: $infoboxFieldId, index: $index}
  ) {
    layer {
      id
      ...EarthLayer
    }
  }
}
    ${EarthLayerFragmentDoc}`;
export type MoveInfoboxFieldMutationFn = Apollo.MutationFunction<MoveInfoboxFieldMutation, MoveInfoboxFieldMutationVariables>;

/**
 * __useMoveInfoboxFieldMutation__
 *
 * To run a mutation, you first call `useMoveInfoboxFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveInfoboxFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveInfoboxFieldMutation, { data, loading, error }] = useMoveInfoboxFieldMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *      infoboxFieldId: // value for 'infoboxFieldId'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useMoveInfoboxFieldMutation(baseOptions?: Apollo.MutationHookOptions<MoveInfoboxFieldMutation, MoveInfoboxFieldMutationVariables>) {
        return Apollo.useMutation<MoveInfoboxFieldMutation, MoveInfoboxFieldMutationVariables>(MoveInfoboxFieldDocument, baseOptions);
      }
export type MoveInfoboxFieldMutationHookResult = ReturnType<typeof useMoveInfoboxFieldMutation>;
export type MoveInfoboxFieldMutationResult = Apollo.MutationResult<MoveInfoboxFieldMutation>;
export type MoveInfoboxFieldMutationOptions = Apollo.BaseMutationOptions<MoveInfoboxFieldMutation, MoveInfoboxFieldMutationVariables>;
export const RemoveInfoboxFieldDocument = gql`
    mutation removeInfoboxField($layerId: ID!, $infoboxFieldId: ID!) {
  removeInfoboxField(input: {layerId: $layerId, infoboxFieldId: $infoboxFieldId}) {
    layer {
      id
      ...LayerFragment
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export type RemoveInfoboxFieldMutationFn = Apollo.MutationFunction<RemoveInfoboxFieldMutation, RemoveInfoboxFieldMutationVariables>;

/**
 * __useRemoveInfoboxFieldMutation__
 *
 * To run a mutation, you first call `useRemoveInfoboxFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveInfoboxFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeInfoboxFieldMutation, { data, loading, error }] = useRemoveInfoboxFieldMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *      infoboxFieldId: // value for 'infoboxFieldId'
 *   },
 * });
 */
export function useRemoveInfoboxFieldMutation(baseOptions?: Apollo.MutationHookOptions<RemoveInfoboxFieldMutation, RemoveInfoboxFieldMutationVariables>) {
        return Apollo.useMutation<RemoveInfoboxFieldMutation, RemoveInfoboxFieldMutationVariables>(RemoveInfoboxFieldDocument, baseOptions);
      }
export type RemoveInfoboxFieldMutationHookResult = ReturnType<typeof useRemoveInfoboxFieldMutation>;
export type RemoveInfoboxFieldMutationResult = Apollo.MutationResult<RemoveInfoboxFieldMutation>;
export type RemoveInfoboxFieldMutationOptions = Apollo.BaseMutationOptions<RemoveInfoboxFieldMutation, RemoveInfoboxFieldMutationVariables>;
export const GetBlocksDocument = gql`
    query getBlocks($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      plugins {
        plugin {
          id
          extensions {
            extensionId
            type
            name
            description
            icon
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetBlocksQuery__
 *
 * To run a query within a React component, call `useGetBlocksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlocksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlocksQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetBlocksQuery(baseOptions: Apollo.QueryHookOptions<GetBlocksQuery, GetBlocksQueryVariables>) {
        return Apollo.useQuery<GetBlocksQuery, GetBlocksQueryVariables>(GetBlocksDocument, baseOptions);
      }
export function useGetBlocksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlocksQuery, GetBlocksQueryVariables>) {
          return Apollo.useLazyQuery<GetBlocksQuery, GetBlocksQueryVariables>(GetBlocksDocument, baseOptions);
        }
export type GetBlocksQueryHookResult = ReturnType<typeof useGetBlocksQuery>;
export type GetBlocksLazyQueryHookResult = ReturnType<typeof useGetBlocksLazyQuery>;
export type GetBlocksQueryResult = Apollo.QueryResult<GetBlocksQuery, GetBlocksQueryVariables>;
export const AddInfoboxFieldDocument = gql`
    mutation addInfoboxField($layerId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!, $index: Int) {
  addInfoboxField(
    input: {layerId: $layerId, pluginId: $pluginId, extensionId: $extensionId, index: $index}
  ) {
    layer {
      id
      ...LayerFragment
    }
  }
}
    ${LayerFragmentFragmentDoc}`;
export type AddInfoboxFieldMutationFn = Apollo.MutationFunction<AddInfoboxFieldMutation, AddInfoboxFieldMutationVariables>;

/**
 * __useAddInfoboxFieldMutation__
 *
 * To run a mutation, you first call `useAddInfoboxFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddInfoboxFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addInfoboxFieldMutation, { data, loading, error }] = useAddInfoboxFieldMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *      pluginId: // value for 'pluginId'
 *      extensionId: // value for 'extensionId'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useAddInfoboxFieldMutation(baseOptions?: Apollo.MutationHookOptions<AddInfoboxFieldMutation, AddInfoboxFieldMutationVariables>) {
        return Apollo.useMutation<AddInfoboxFieldMutation, AddInfoboxFieldMutationVariables>(AddInfoboxFieldDocument, baseOptions);
      }
export type AddInfoboxFieldMutationHookResult = ReturnType<typeof useAddInfoboxFieldMutation>;
export type AddInfoboxFieldMutationResult = Apollo.MutationResult<AddInfoboxFieldMutation>;
export type AddInfoboxFieldMutationOptions = Apollo.BaseMutationOptions<AddInfoboxFieldMutation, AddInfoboxFieldMutationVariables>;
export const GetAllDataSetsDocument = gql`
    query GetAllDataSets($sceneId: ID!) {
  datasetSchemas(sceneId: $sceneId, first: 100) {
    nodes {
      id
      source
      name
      sceneId
      fields {
        id
        name
        type
      }
      datasets {
        totalCount
      }
    }
  }
}
    `;

/**
 * __useGetAllDataSetsQuery__
 *
 * To run a query within a React component, call `useGetAllDataSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllDataSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllDataSetsQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetAllDataSetsQuery(baseOptions: Apollo.QueryHookOptions<GetAllDataSetsQuery, GetAllDataSetsQueryVariables>) {
        return Apollo.useQuery<GetAllDataSetsQuery, GetAllDataSetsQueryVariables>(GetAllDataSetsDocument, baseOptions);
      }
export function useGetAllDataSetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllDataSetsQuery, GetAllDataSetsQueryVariables>) {
          return Apollo.useLazyQuery<GetAllDataSetsQuery, GetAllDataSetsQueryVariables>(GetAllDataSetsDocument, baseOptions);
        }
export type GetAllDataSetsQueryHookResult = ReturnType<typeof useGetAllDataSetsQuery>;
export type GetAllDataSetsLazyQueryHookResult = ReturnType<typeof useGetAllDataSetsLazyQuery>;
export type GetAllDataSetsQueryResult = Apollo.QueryResult<GetAllDataSetsQuery, GetAllDataSetsQueryVariables>;
export const SyncDatasetDocument = gql`
    mutation SyncDataset($sceneId: ID!, $url: String!) {
  syncDataset(input: {sceneId: $sceneId, url: $url}) {
    sceneId
    url
    datasetSchema {
      id
      name
    }
  }
}
    `;
export type SyncDatasetMutationFn = Apollo.MutationFunction<SyncDatasetMutation, SyncDatasetMutationVariables>;

/**
 * __useSyncDatasetMutation__
 *
 * To run a mutation, you first call `useSyncDatasetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSyncDatasetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [syncDatasetMutation, { data, loading, error }] = useSyncDatasetMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *      url: // value for 'url'
 *   },
 * });
 */
export function useSyncDatasetMutation(baseOptions?: Apollo.MutationHookOptions<SyncDatasetMutation, SyncDatasetMutationVariables>) {
        return Apollo.useMutation<SyncDatasetMutation, SyncDatasetMutationVariables>(SyncDatasetDocument, baseOptions);
      }
export type SyncDatasetMutationHookResult = ReturnType<typeof useSyncDatasetMutation>;
export type SyncDatasetMutationResult = Apollo.MutationResult<SyncDatasetMutation>;
export type SyncDatasetMutationOptions = Apollo.BaseMutationOptions<SyncDatasetMutation, SyncDatasetMutationVariables>;
export const ImportGoogleSheetDatasetDocument = gql`
    mutation importGoogleSheetDataset($accessToken: String!, $fileId: String!, $sheetName: String!, $sceneId: ID!, $datasetSchemaId: ID) {
  importDatasetFromGoogleSheet(
    input: {accessToken: $accessToken, fileId: $fileId, sheetName: $sheetName, sceneId: $sceneId, datasetSchemaId: $datasetSchemaId}
  ) {
    datasetSchema {
      id
      name
    }
  }
}
    `;
export type ImportGoogleSheetDatasetMutationFn = Apollo.MutationFunction<ImportGoogleSheetDatasetMutation, ImportGoogleSheetDatasetMutationVariables>;

/**
 * __useImportGoogleSheetDatasetMutation__
 *
 * To run a mutation, you first call `useImportGoogleSheetDatasetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportGoogleSheetDatasetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importGoogleSheetDatasetMutation, { data, loading, error }] = useImportGoogleSheetDatasetMutation({
 *   variables: {
 *      accessToken: // value for 'accessToken'
 *      fileId: // value for 'fileId'
 *      sheetName: // value for 'sheetName'
 *      sceneId: // value for 'sceneId'
 *      datasetSchemaId: // value for 'datasetSchemaId'
 *   },
 * });
 */
export function useImportGoogleSheetDatasetMutation(baseOptions?: Apollo.MutationHookOptions<ImportGoogleSheetDatasetMutation, ImportGoogleSheetDatasetMutationVariables>) {
        return Apollo.useMutation<ImportGoogleSheetDatasetMutation, ImportGoogleSheetDatasetMutationVariables>(ImportGoogleSheetDatasetDocument, baseOptions);
      }
export type ImportGoogleSheetDatasetMutationHookResult = ReturnType<typeof useImportGoogleSheetDatasetMutation>;
export type ImportGoogleSheetDatasetMutationResult = Apollo.MutationResult<ImportGoogleSheetDatasetMutation>;
export type ImportGoogleSheetDatasetMutationOptions = Apollo.BaseMutationOptions<ImportGoogleSheetDatasetMutation, ImportGoogleSheetDatasetMutationVariables>;
export const ImportDatasetDocument = gql`
    mutation importDataset($file: Upload!, $sceneId: ID!, $datasetSchemaId: ID) {
  importDataset(
    input: {file: $file, sceneId: $sceneId, datasetSchemaId: $datasetSchemaId}
  ) {
    datasetSchema {
      id
      name
    }
  }
}
    `;
export type ImportDatasetMutationFn = Apollo.MutationFunction<ImportDatasetMutation, ImportDatasetMutationVariables>;

/**
 * __useImportDatasetMutation__
 *
 * To run a mutation, you first call `useImportDatasetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportDatasetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importDatasetMutation, { data, loading, error }] = useImportDatasetMutation({
 *   variables: {
 *      file: // value for 'file'
 *      sceneId: // value for 'sceneId'
 *      datasetSchemaId: // value for 'datasetSchemaId'
 *   },
 * });
 */
export function useImportDatasetMutation(baseOptions?: Apollo.MutationHookOptions<ImportDatasetMutation, ImportDatasetMutationVariables>) {
        return Apollo.useMutation<ImportDatasetMutation, ImportDatasetMutationVariables>(ImportDatasetDocument, baseOptions);
      }
export type ImportDatasetMutationHookResult = ReturnType<typeof useImportDatasetMutation>;
export type ImportDatasetMutationResult = Apollo.MutationResult<ImportDatasetMutation>;
export type ImportDatasetMutationOptions = Apollo.BaseMutationOptions<ImportDatasetMutation, ImportDatasetMutationVariables>;
export const RemoveDatasetDocument = gql`
    mutation RemoveDataset($schemaId: ID!, $force: Boolean) {
  removeDatasetSchema(input: {schemaId: $schemaId, force: $force}) {
    schemaId
  }
}
    `;
export type RemoveDatasetMutationFn = Apollo.MutationFunction<RemoveDatasetMutation, RemoveDatasetMutationVariables>;

/**
 * __useRemoveDatasetMutation__
 *
 * To run a mutation, you first call `useRemoveDatasetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveDatasetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeDatasetMutation, { data, loading, error }] = useRemoveDatasetMutation({
 *   variables: {
 *      schemaId: // value for 'schemaId'
 *      force: // value for 'force'
 *   },
 * });
 */
export function useRemoveDatasetMutation(baseOptions?: Apollo.MutationHookOptions<RemoveDatasetMutation, RemoveDatasetMutationVariables>) {
        return Apollo.useMutation<RemoveDatasetMutation, RemoveDatasetMutationVariables>(RemoveDatasetDocument, baseOptions);
      }
export type RemoveDatasetMutationHookResult = ReturnType<typeof useRemoveDatasetMutation>;
export type RemoveDatasetMutationResult = Apollo.MutationResult<RemoveDatasetMutation>;
export type RemoveDatasetMutationOptions = Apollo.BaseMutationOptions<RemoveDatasetMutation, RemoveDatasetMutationVariables>;
export const AddLayerGroupFromDatasetSchemaDocument = gql`
    mutation addLayerGroupFromDatasetSchema($parentLayerId: ID!, $pluginId: PluginID, $extensionId: PluginExtensionID, $datasetSchemaId: ID, $index: Int) {
  addLayerGroup(
    input: {parentLayerId: $parentLayerId, pluginId: $pluginId, extensionId: $extensionId, linkedDatasetSchemaID: $datasetSchemaId, index: $index}
  ) {
    layer {
      id
      ...Layer1Fragment
    }
    parentLayer {
      id
      ...Layer0Fragment
    }
  }
}
    ${Layer1FragmentFragmentDoc}
${Layer0FragmentFragmentDoc}`;
export type AddLayerGroupFromDatasetSchemaMutationFn = Apollo.MutationFunction<AddLayerGroupFromDatasetSchemaMutation, AddLayerGroupFromDatasetSchemaMutationVariables>;

/**
 * __useAddLayerGroupFromDatasetSchemaMutation__
 *
 * To run a mutation, you first call `useAddLayerGroupFromDatasetSchemaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddLayerGroupFromDatasetSchemaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addLayerGroupFromDatasetSchemaMutation, { data, loading, error }] = useAddLayerGroupFromDatasetSchemaMutation({
 *   variables: {
 *      parentLayerId: // value for 'parentLayerId'
 *      pluginId: // value for 'pluginId'
 *      extensionId: // value for 'extensionId'
 *      datasetSchemaId: // value for 'datasetSchemaId'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useAddLayerGroupFromDatasetSchemaMutation(baseOptions?: Apollo.MutationHookOptions<AddLayerGroupFromDatasetSchemaMutation, AddLayerGroupFromDatasetSchemaMutationVariables>) {
        return Apollo.useMutation<AddLayerGroupFromDatasetSchemaMutation, AddLayerGroupFromDatasetSchemaMutationVariables>(AddLayerGroupFromDatasetSchemaDocument, baseOptions);
      }
export type AddLayerGroupFromDatasetSchemaMutationHookResult = ReturnType<typeof useAddLayerGroupFromDatasetSchemaMutation>;
export type AddLayerGroupFromDatasetSchemaMutationResult = Apollo.MutationResult<AddLayerGroupFromDatasetSchemaMutation>;
export type AddLayerGroupFromDatasetSchemaMutationOptions = Apollo.BaseMutationOptions<AddLayerGroupFromDatasetSchemaMutation, AddLayerGroupFromDatasetSchemaMutationVariables>;
export const GetProjectDocument = gql`
    query GetProject($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      teamId
      projectId
      project {
        id
        alias
        publishmentStatus
        name
      }
    }
  }
}
    `;

/**
 * __useGetProjectQuery__
 *
 * To run a query within a React component, call `useGetProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetProjectQuery(baseOptions: Apollo.QueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
        return Apollo.useQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, baseOptions);
      }
export function useGetProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          return Apollo.useLazyQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, baseOptions);
        }
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>;
export type GetProjectLazyQueryHookResult = ReturnType<typeof useGetProjectLazyQuery>;
export type GetProjectQueryResult = Apollo.QueryResult<GetProjectQuery, GetProjectQueryVariables>;
export const GetTeamProjectsDocument = gql`
    query GetTeamProjects($teamId: ID!, $includeArchived: Boolean, $first: Int, $last: Int) {
  projects(
    teamId: $teamId
    includeArchived: $includeArchived
    first: $first
    last: $last
  ) {
    nodes {
      id
      name
    }
  }
}
    `;

/**
 * __useGetTeamProjectsQuery__
 *
 * To run a query within a React component, call `useGetTeamProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTeamProjectsQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      includeArchived: // value for 'includeArchived'
 *      first: // value for 'first'
 *      last: // value for 'last'
 *   },
 * });
 */
export function useGetTeamProjectsQuery(baseOptions: Apollo.QueryHookOptions<GetTeamProjectsQuery, GetTeamProjectsQueryVariables>) {
        return Apollo.useQuery<GetTeamProjectsQuery, GetTeamProjectsQueryVariables>(GetTeamProjectsDocument, baseOptions);
      }
export function useGetTeamProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTeamProjectsQuery, GetTeamProjectsQueryVariables>) {
          return Apollo.useLazyQuery<GetTeamProjectsQuery, GetTeamProjectsQueryVariables>(GetTeamProjectsDocument, baseOptions);
        }
export type GetTeamProjectsQueryHookResult = ReturnType<typeof useGetTeamProjectsQuery>;
export type GetTeamProjectsLazyQueryHookResult = ReturnType<typeof useGetTeamProjectsLazyQuery>;
export type GetTeamProjectsQueryResult = Apollo.QueryResult<GetTeamProjectsQuery, GetTeamProjectsQueryVariables>;
export const CheckProjectAliasDocument = gql`
    query CheckProjectAlias($alias: String!) {
  checkProjectAlias(alias: $alias) {
    alias
    available
  }
}
    `;

/**
 * __useCheckProjectAliasQuery__
 *
 * To run a query within a React component, call `useCheckProjectAliasQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckProjectAliasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckProjectAliasQuery({
 *   variables: {
 *      alias: // value for 'alias'
 *   },
 * });
 */
export function useCheckProjectAliasQuery(baseOptions: Apollo.QueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>) {
        return Apollo.useQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, baseOptions);
      }
export function useCheckProjectAliasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>) {
          return Apollo.useLazyQuery<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>(CheckProjectAliasDocument, baseOptions);
        }
export type CheckProjectAliasQueryHookResult = ReturnType<typeof useCheckProjectAliasQuery>;
export type CheckProjectAliasLazyQueryHookResult = ReturnType<typeof useCheckProjectAliasLazyQuery>;
export type CheckProjectAliasQueryResult = Apollo.QueryResult<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>;
export const PublishProjectDocument = gql`
    mutation PublishProject($projectId: ID!, $alias: String, $status: PublishmentStatus!) {
  publishProject(input: {projectId: $projectId, alias: $alias, status: $status}) {
    project {
      id
      alias
      publishmentStatus
    }
  }
}
    `;
export type PublishProjectMutationFn = Apollo.MutationFunction<PublishProjectMutation, PublishProjectMutationVariables>;

/**
 * __usePublishProjectMutation__
 *
 * To run a mutation, you first call `usePublishProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishProjectMutation, { data, loading, error }] = usePublishProjectMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      alias: // value for 'alias'
 *      status: // value for 'status'
 *   },
 * });
 */
export function usePublishProjectMutation(baseOptions?: Apollo.MutationHookOptions<PublishProjectMutation, PublishProjectMutationVariables>) {
        return Apollo.useMutation<PublishProjectMutation, PublishProjectMutationVariables>(PublishProjectDocument, baseOptions);
      }
export type PublishProjectMutationHookResult = ReturnType<typeof usePublishProjectMutation>;
export type PublishProjectMutationResult = Apollo.MutationResult<PublishProjectMutation>;
export type PublishProjectMutationOptions = Apollo.BaseMutationOptions<PublishProjectMutation, PublishProjectMutationVariables>;
export const GetLayersFromLayerIdDocument = gql`
    query GetLayersFromLayerId($layerId: ID!) {
  layer(id: $layerId) {
    id
    ...LayerSystemLayer5
  }
}
    ${LayerSystemLayer5FragmentDoc}`;

/**
 * __useGetLayersFromLayerIdQuery__
 *
 * To run a query within a React component, call `useGetLayersFromLayerIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLayersFromLayerIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLayersFromLayerIdQuery({
 *   variables: {
 *      layerId: // value for 'layerId'
 *   },
 * });
 */
export function useGetLayersFromLayerIdQuery(baseOptions: Apollo.QueryHookOptions<GetLayersFromLayerIdQuery, GetLayersFromLayerIdQueryVariables>) {
        return Apollo.useQuery<GetLayersFromLayerIdQuery, GetLayersFromLayerIdQueryVariables>(GetLayersFromLayerIdDocument, baseOptions);
      }
export function useGetLayersFromLayerIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLayersFromLayerIdQuery, GetLayersFromLayerIdQueryVariables>) {
          return Apollo.useLazyQuery<GetLayersFromLayerIdQuery, GetLayersFromLayerIdQueryVariables>(GetLayersFromLayerIdDocument, baseOptions);
        }
export type GetLayersFromLayerIdQueryHookResult = ReturnType<typeof useGetLayersFromLayerIdQuery>;
export type GetLayersFromLayerIdLazyQueryHookResult = ReturnType<typeof useGetLayersFromLayerIdLazyQuery>;
export type GetLayersFromLayerIdQueryResult = Apollo.QueryResult<GetLayersFromLayerIdQuery, GetLayersFromLayerIdQueryVariables>;
export const MoveLayerDocument = gql`
    mutation moveLayer($layerId: ID!, $destLayerId: ID, $index: Int) {
  moveLayer(input: {layerId: $layerId, destLayerId: $destLayerId, index: $index}) {
    fromParentLayer {
      id
      ...LayerSystemLayer
    }
    toParentLayer {
      id
      ...LayerSystemLayer
    }
  }
}
    ${LayerSystemLayerFragmentDoc}`;
export type MoveLayerMutationFn = Apollo.MutationFunction<MoveLayerMutation, MoveLayerMutationVariables>;

/**
 * __useMoveLayerMutation__
 *
 * To run a mutation, you first call `useMoveLayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveLayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveLayerMutation, { data, loading, error }] = useMoveLayerMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *      destLayerId: // value for 'destLayerId'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useMoveLayerMutation(baseOptions?: Apollo.MutationHookOptions<MoveLayerMutation, MoveLayerMutationVariables>) {
        return Apollo.useMutation<MoveLayerMutation, MoveLayerMutationVariables>(MoveLayerDocument, baseOptions);
      }
export type MoveLayerMutationHookResult = ReturnType<typeof useMoveLayerMutation>;
export type MoveLayerMutationResult = Apollo.MutationResult<MoveLayerMutation>;
export type MoveLayerMutationOptions = Apollo.BaseMutationOptions<MoveLayerMutation, MoveLayerMutationVariables>;
export const UpdateLayerDocument = gql`
    mutation UpdateLayer($layerId: ID!, $name: String, $visible: Boolean) {
  updateLayer(input: {layerId: $layerId, name: $name, visible: $visible}) {
    layer {
      id
      ...LayerSystemLayer
    }
  }
}
    ${LayerSystemLayerFragmentDoc}`;
export type UpdateLayerMutationFn = Apollo.MutationFunction<UpdateLayerMutation, UpdateLayerMutationVariables>;

/**
 * __useUpdateLayerMutation__
 *
 * To run a mutation, you first call `useUpdateLayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLayerMutation, { data, loading, error }] = useUpdateLayerMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *      name: // value for 'name'
 *      visible: // value for 'visible'
 *   },
 * });
 */
export function useUpdateLayerMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLayerMutation, UpdateLayerMutationVariables>) {
        return Apollo.useMutation<UpdateLayerMutation, UpdateLayerMutationVariables>(UpdateLayerDocument, baseOptions);
      }
export type UpdateLayerMutationHookResult = ReturnType<typeof useUpdateLayerMutation>;
export type UpdateLayerMutationResult = Apollo.MutationResult<UpdateLayerMutation>;
export type UpdateLayerMutationOptions = Apollo.BaseMutationOptions<UpdateLayerMutation, UpdateLayerMutationVariables>;
export const RemoveLayerDocument = gql`
    mutation RemoveLayer($layerId: ID!) {
  removeLayer(input: {layerId: $layerId}) {
    layerId
    parentLayer {
      id
      ...LayerSystemLayer
    }
  }
}
    ${LayerSystemLayerFragmentDoc}`;
export type RemoveLayerMutationFn = Apollo.MutationFunction<RemoveLayerMutation, RemoveLayerMutationVariables>;

/**
 * __useRemoveLayerMutation__
 *
 * To run a mutation, you first call `useRemoveLayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveLayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeLayerMutation, { data, loading, error }] = useRemoveLayerMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *   },
 * });
 */
export function useRemoveLayerMutation(baseOptions?: Apollo.MutationHookOptions<RemoveLayerMutation, RemoveLayerMutationVariables>) {
        return Apollo.useMutation<RemoveLayerMutation, RemoveLayerMutationVariables>(RemoveLayerDocument, baseOptions);
      }
export type RemoveLayerMutationHookResult = ReturnType<typeof useRemoveLayerMutation>;
export type RemoveLayerMutationResult = Apollo.MutationResult<RemoveLayerMutation>;
export type RemoveLayerMutationOptions = Apollo.BaseMutationOptions<RemoveLayerMutation, RemoveLayerMutationVariables>;
export const ImportLayerDocument = gql`
    mutation ImportLayer($layerId: ID!, $file: Upload!, $format: LayerEncodingFormat!) {
  importLayer(input: {layerId: $layerId, file: $file, format: $format}) {
    layers {
      id
      ...LayerSystemLayer5
    }
    parentLayer {
      id
      ...LayerSystemLayer
    }
  }
}
    ${LayerSystemLayer5FragmentDoc}
${LayerSystemLayerFragmentDoc}`;
export type ImportLayerMutationFn = Apollo.MutationFunction<ImportLayerMutation, ImportLayerMutationVariables>;

/**
 * __useImportLayerMutation__
 *
 * To run a mutation, you first call `useImportLayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportLayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importLayerMutation, { data, loading, error }] = useImportLayerMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *      file: // value for 'file'
 *      format: // value for 'format'
 *   },
 * });
 */
export function useImportLayerMutation(baseOptions?: Apollo.MutationHookOptions<ImportLayerMutation, ImportLayerMutationVariables>) {
        return Apollo.useMutation<ImportLayerMutation, ImportLayerMutationVariables>(ImportLayerDocument, baseOptions);
      }
export type ImportLayerMutationHookResult = ReturnType<typeof useImportLayerMutation>;
export type ImportLayerMutationResult = Apollo.MutationResult<ImportLayerMutation>;
export type ImportLayerMutationOptions = Apollo.BaseMutationOptions<ImportLayerMutation, ImportLayerMutationVariables>;
export const AddLayerGroupDocument = gql`
    mutation AddLayerGroup($parentLayerId: ID!, $index: Int, $name: String) {
  addLayerGroup(
    input: {parentLayerId: $parentLayerId, index: $index, name: $name}
  ) {
    layer {
      id
      ...LayerSystemLayer5
    }
    parentLayer {
      id
      ...LayerSystemLayer
    }
  }
}
    ${LayerSystemLayer5FragmentDoc}
${LayerSystemLayerFragmentDoc}`;
export type AddLayerGroupMutationFn = Apollo.MutationFunction<AddLayerGroupMutation, AddLayerGroupMutationVariables>;

/**
 * __useAddLayerGroupMutation__
 *
 * To run a mutation, you first call `useAddLayerGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddLayerGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addLayerGroupMutation, { data, loading, error }] = useAddLayerGroupMutation({
 *   variables: {
 *      parentLayerId: // value for 'parentLayerId'
 *      index: // value for 'index'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useAddLayerGroupMutation(baseOptions?: Apollo.MutationHookOptions<AddLayerGroupMutation, AddLayerGroupMutationVariables>) {
        return Apollo.useMutation<AddLayerGroupMutation, AddLayerGroupMutationVariables>(AddLayerGroupDocument, baseOptions);
      }
export type AddLayerGroupMutationHookResult = ReturnType<typeof useAddLayerGroupMutation>;
export type AddLayerGroupMutationResult = Apollo.MutationResult<AddLayerGroupMutation>;
export type AddLayerGroupMutationOptions = Apollo.BaseMutationOptions<AddLayerGroupMutation, AddLayerGroupMutationVariables>;
export const GetWidgetsDocument = gql`
    query GetWidgets($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      plugins {
        plugin {
          id
          extensions {
            extensionId
            description
            name
            translatedDescription
            translatedName
            icon
            type
          }
        }
      }
      widgets {
        id
        enabled
        pluginId
        extensionId
        propertyId
      }
    }
  }
}
    `;

/**
 * __useGetWidgetsQuery__
 *
 * To run a query within a React component, call `useGetWidgetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWidgetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWidgetsQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetWidgetsQuery(baseOptions: Apollo.QueryHookOptions<GetWidgetsQuery, GetWidgetsQueryVariables>) {
        return Apollo.useQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, baseOptions);
      }
export function useGetWidgetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWidgetsQuery, GetWidgetsQueryVariables>) {
          return Apollo.useLazyQuery<GetWidgetsQuery, GetWidgetsQueryVariables>(GetWidgetsDocument, baseOptions);
        }
export type GetWidgetsQueryHookResult = ReturnType<typeof useGetWidgetsQuery>;
export type GetWidgetsLazyQueryHookResult = ReturnType<typeof useGetWidgetsLazyQuery>;
export type GetWidgetsQueryResult = Apollo.QueryResult<GetWidgetsQuery, GetWidgetsQueryVariables>;
export const GetPrimitivesDocument = gql`
    query GetPrimitives($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      plugins {
        plugin {
          id
          extensions {
            extensionId
            translatedDescription
            translatedName
            icon
            type
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetPrimitivesQuery__
 *
 * To run a query within a React component, call `useGetPrimitivesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPrimitivesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPrimitivesQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetPrimitivesQuery(baseOptions: Apollo.QueryHookOptions<GetPrimitivesQuery, GetPrimitivesQueryVariables>) {
        return Apollo.useQuery<GetPrimitivesQuery, GetPrimitivesQueryVariables>(GetPrimitivesDocument, baseOptions);
      }
export function useGetPrimitivesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPrimitivesQuery, GetPrimitivesQueryVariables>) {
          return Apollo.useLazyQuery<GetPrimitivesQuery, GetPrimitivesQueryVariables>(GetPrimitivesDocument, baseOptions);
        }
export type GetPrimitivesQueryHookResult = ReturnType<typeof useGetPrimitivesQuery>;
export type GetPrimitivesLazyQueryHookResult = ReturnType<typeof useGetPrimitivesLazyQuery>;
export type GetPrimitivesQueryResult = Apollo.QueryResult<GetPrimitivesQuery, GetPrimitivesQueryVariables>;
export const AddLayerItemFromPrimitiveDocument = gql`
    mutation addLayerItemFromPrimitive($parentLayerId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!, $name: String, $lat: Float, $lng: Float, $index: Int) {
  addLayerItem(
    input: {parentLayerId: $parentLayerId, pluginId: $pluginId, extensionId: $extensionId, name: $name, lat: $lat, lng: $lng, index: $index}
  ) {
    parentLayer {
      id
      ...Layer3Fragment
    }
    layer {
      id
      ...LayerFragment
    }
  }
}
    ${Layer3FragmentFragmentDoc}
${LayerFragmentFragmentDoc}`;
export type AddLayerItemFromPrimitiveMutationFn = Apollo.MutationFunction<AddLayerItemFromPrimitiveMutation, AddLayerItemFromPrimitiveMutationVariables>;

/**
 * __useAddLayerItemFromPrimitiveMutation__
 *
 * To run a mutation, you first call `useAddLayerItemFromPrimitiveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddLayerItemFromPrimitiveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addLayerItemFromPrimitiveMutation, { data, loading, error }] = useAddLayerItemFromPrimitiveMutation({
 *   variables: {
 *      parentLayerId: // value for 'parentLayerId'
 *      pluginId: // value for 'pluginId'
 *      extensionId: // value for 'extensionId'
 *      name: // value for 'name'
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useAddLayerItemFromPrimitiveMutation(baseOptions?: Apollo.MutationHookOptions<AddLayerItemFromPrimitiveMutation, AddLayerItemFromPrimitiveMutationVariables>) {
        return Apollo.useMutation<AddLayerItemFromPrimitiveMutation, AddLayerItemFromPrimitiveMutationVariables>(AddLayerItemFromPrimitiveDocument, baseOptions);
      }
export type AddLayerItemFromPrimitiveMutationHookResult = ReturnType<typeof useAddLayerItemFromPrimitiveMutation>;
export type AddLayerItemFromPrimitiveMutationResult = Apollo.MutationResult<AddLayerItemFromPrimitiveMutation>;
export type AddLayerItemFromPrimitiveMutationOptions = Apollo.BaseMutationOptions<AddLayerItemFromPrimitiveMutation, AddLayerItemFromPrimitiveMutationVariables>;
export const ChangePropertyValueDocument = gql`
    mutation ChangePropertyValue($value: Any, $propertyId: ID!, $schemaItemId: PropertySchemaFieldID, $itemId: ID, $fieldId: PropertySchemaFieldID!, $type: ValueType!) {
  updatePropertyValue(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, fieldId: $fieldId, value: $value, type: $type}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type ChangePropertyValueMutationFn = Apollo.MutationFunction<ChangePropertyValueMutation, ChangePropertyValueMutationVariables>;

/**
 * __useChangePropertyValueMutation__
 *
 * To run a mutation, you first call `useChangePropertyValueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePropertyValueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePropertyValueMutation, { data, loading, error }] = useChangePropertyValueMutation({
 *   variables: {
 *      value: // value for 'value'
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      fieldId: // value for 'fieldId'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useChangePropertyValueMutation(baseOptions?: Apollo.MutationHookOptions<ChangePropertyValueMutation, ChangePropertyValueMutationVariables>) {
        return Apollo.useMutation<ChangePropertyValueMutation, ChangePropertyValueMutationVariables>(ChangePropertyValueDocument, baseOptions);
      }
export type ChangePropertyValueMutationHookResult = ReturnType<typeof useChangePropertyValueMutation>;
export type ChangePropertyValueMutationResult = Apollo.MutationResult<ChangePropertyValueMutation>;
export type ChangePropertyValueMutationOptions = Apollo.BaseMutationOptions<ChangePropertyValueMutation, ChangePropertyValueMutationVariables>;
export const ChangePropertyValueLatLngDocument = gql`
    mutation ChangePropertyValueLatLng($propertyId: ID!, $schemaItemId: PropertySchemaFieldID, $itemId: ID, $fieldId: PropertySchemaFieldID!, $lat: Float!, $lng: Float!) {
  updatePropertyValueLatLng(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, fieldId: $fieldId, lat: $lat, lng: $lng}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type ChangePropertyValueLatLngMutationFn = Apollo.MutationFunction<ChangePropertyValueLatLngMutation, ChangePropertyValueLatLngMutationVariables>;

/**
 * __useChangePropertyValueLatLngMutation__
 *
 * To run a mutation, you first call `useChangePropertyValueLatLngMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePropertyValueLatLngMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePropertyValueLatLngMutation, { data, loading, error }] = useChangePropertyValueLatLngMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      fieldId: // value for 'fieldId'
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *   },
 * });
 */
export function useChangePropertyValueLatLngMutation(baseOptions?: Apollo.MutationHookOptions<ChangePropertyValueLatLngMutation, ChangePropertyValueLatLngMutationVariables>) {
        return Apollo.useMutation<ChangePropertyValueLatLngMutation, ChangePropertyValueLatLngMutationVariables>(ChangePropertyValueLatLngDocument, baseOptions);
      }
export type ChangePropertyValueLatLngMutationHookResult = ReturnType<typeof useChangePropertyValueLatLngMutation>;
export type ChangePropertyValueLatLngMutationResult = Apollo.MutationResult<ChangePropertyValueLatLngMutation>;
export type ChangePropertyValueLatLngMutationOptions = Apollo.BaseMutationOptions<ChangePropertyValueLatLngMutation, ChangePropertyValueLatLngMutationVariables>;
export const ChangePropertyValueLatLngHeightDocument = gql`
    mutation ChangePropertyValueLatLngHeight($propertyId: ID!, $schemaItemId: PropertySchemaFieldID, $itemId: ID, $fieldId: PropertySchemaFieldID!, $lat: Float!, $lng: Float!, $height: Float!) {
  updatePropertyValueLatLngHeight(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, fieldId: $fieldId, lat: $lat, lng: $lng, height: $height}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type ChangePropertyValueLatLngHeightMutationFn = Apollo.MutationFunction<ChangePropertyValueLatLngHeightMutation, ChangePropertyValueLatLngHeightMutationVariables>;

/**
 * __useChangePropertyValueLatLngHeightMutation__
 *
 * To run a mutation, you first call `useChangePropertyValueLatLngHeightMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePropertyValueLatLngHeightMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePropertyValueLatLngHeightMutation, { data, loading, error }] = useChangePropertyValueLatLngHeightMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      fieldId: // value for 'fieldId'
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      height: // value for 'height'
 *   },
 * });
 */
export function useChangePropertyValueLatLngHeightMutation(baseOptions?: Apollo.MutationHookOptions<ChangePropertyValueLatLngHeightMutation, ChangePropertyValueLatLngHeightMutationVariables>) {
        return Apollo.useMutation<ChangePropertyValueLatLngHeightMutation, ChangePropertyValueLatLngHeightMutationVariables>(ChangePropertyValueLatLngHeightDocument, baseOptions);
      }
export type ChangePropertyValueLatLngHeightMutationHookResult = ReturnType<typeof useChangePropertyValueLatLngHeightMutation>;
export type ChangePropertyValueLatLngHeightMutationResult = Apollo.MutationResult<ChangePropertyValueLatLngHeightMutation>;
export type ChangePropertyValueLatLngHeightMutationOptions = Apollo.BaseMutationOptions<ChangePropertyValueLatLngHeightMutation, ChangePropertyValueLatLngHeightMutationVariables>;
export const LinkDatasetDocument = gql`
    mutation LinkDataset($propertyId: ID!, $itemId: ID, $schemaItemId: PropertySchemaFieldID, $fieldId: PropertySchemaFieldID!, $datasetSchemaIds: [ID!]!, $datasetIds: [ID!], $datasetFieldIds: [ID!]!) {
  linkDatasetToPropertyValue(
    input: {propertyId: $propertyId, itemId: $itemId, schemaItemId: $schemaItemId, fieldId: $fieldId, datasetSchemaIds: $datasetSchemaIds, datasetIds: $datasetIds, datasetSchemaFieldIds: $datasetFieldIds}
  ) {
    property {
      id
      ...PropertyFragment
    }
  }
}
    ${PropertyFragmentFragmentDoc}`;
export type LinkDatasetMutationFn = Apollo.MutationFunction<LinkDatasetMutation, LinkDatasetMutationVariables>;

/**
 * __useLinkDatasetMutation__
 *
 * To run a mutation, you first call `useLinkDatasetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLinkDatasetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [linkDatasetMutation, { data, loading, error }] = useLinkDatasetMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      itemId: // value for 'itemId'
 *      schemaItemId: // value for 'schemaItemId'
 *      fieldId: // value for 'fieldId'
 *      datasetSchemaIds: // value for 'datasetSchemaIds'
 *      datasetIds: // value for 'datasetIds'
 *      datasetFieldIds: // value for 'datasetFieldIds'
 *   },
 * });
 */
export function useLinkDatasetMutation(baseOptions?: Apollo.MutationHookOptions<LinkDatasetMutation, LinkDatasetMutationVariables>) {
        return Apollo.useMutation<LinkDatasetMutation, LinkDatasetMutationVariables>(LinkDatasetDocument, baseOptions);
      }
export type LinkDatasetMutationHookResult = ReturnType<typeof useLinkDatasetMutation>;
export type LinkDatasetMutationResult = Apollo.MutationResult<LinkDatasetMutation>;
export type LinkDatasetMutationOptions = Apollo.BaseMutationOptions<LinkDatasetMutation, LinkDatasetMutationVariables>;
export const UnlinkDatasetDocument = gql`
    mutation UnlinkDataset($propertyId: ID!, $schemaItemId: PropertySchemaFieldID, $itemId: ID, $fieldId: PropertySchemaFieldID!) {
  unlinkPropertyValue(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, fieldId: $fieldId}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type UnlinkDatasetMutationFn = Apollo.MutationFunction<UnlinkDatasetMutation, UnlinkDatasetMutationVariables>;

/**
 * __useUnlinkDatasetMutation__
 *
 * To run a mutation, you first call `useUnlinkDatasetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnlinkDatasetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unlinkDatasetMutation, { data, loading, error }] = useUnlinkDatasetMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      fieldId: // value for 'fieldId'
 *   },
 * });
 */
export function useUnlinkDatasetMutation(baseOptions?: Apollo.MutationHookOptions<UnlinkDatasetMutation, UnlinkDatasetMutationVariables>) {
        return Apollo.useMutation<UnlinkDatasetMutation, UnlinkDatasetMutationVariables>(UnlinkDatasetDocument, baseOptions);
      }
export type UnlinkDatasetMutationHookResult = ReturnType<typeof useUnlinkDatasetMutation>;
export type UnlinkDatasetMutationResult = Apollo.MutationResult<UnlinkDatasetMutation>;
export type UnlinkDatasetMutationOptions = Apollo.BaseMutationOptions<UnlinkDatasetMutation, UnlinkDatasetMutationVariables>;
export const CreateInfoboxDocument = gql`
    mutation createInfobox($layerId: ID!) {
  createInfobox(input: {layerId: $layerId}) {
    layer {
      id
      infobox {
        ...InfoboxFragment
      }
      ... on LayerItem {
        merged {
          infobox {
            ...MergedInfoboxFragment
          }
        }
      }
    }
  }
}
    ${InfoboxFragmentFragmentDoc}
${MergedInfoboxFragmentFragmentDoc}`;
export type CreateInfoboxMutationFn = Apollo.MutationFunction<CreateInfoboxMutation, CreateInfoboxMutationVariables>;

/**
 * __useCreateInfoboxMutation__
 *
 * To run a mutation, you first call `useCreateInfoboxMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInfoboxMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInfoboxMutation, { data, loading, error }] = useCreateInfoboxMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *   },
 * });
 */
export function useCreateInfoboxMutation(baseOptions?: Apollo.MutationHookOptions<CreateInfoboxMutation, CreateInfoboxMutationVariables>) {
        return Apollo.useMutation<CreateInfoboxMutation, CreateInfoboxMutationVariables>(CreateInfoboxDocument, baseOptions);
      }
export type CreateInfoboxMutationHookResult = ReturnType<typeof useCreateInfoboxMutation>;
export type CreateInfoboxMutationResult = Apollo.MutationResult<CreateInfoboxMutation>;
export type CreateInfoboxMutationOptions = Apollo.BaseMutationOptions<CreateInfoboxMutation, CreateInfoboxMutationVariables>;
export const RemoveInfoboxDocument = gql`
    mutation removeInfobox($layerId: ID!) {
  removeInfobox(input: {layerId: $layerId}) {
    layer {
      id
      infobox {
        ...InfoboxFragment
      }
      ... on LayerItem {
        merged {
          infobox {
            ...MergedInfoboxFragment
          }
        }
      }
    }
  }
}
    ${InfoboxFragmentFragmentDoc}
${MergedInfoboxFragmentFragmentDoc}`;
export type RemoveInfoboxMutationFn = Apollo.MutationFunction<RemoveInfoboxMutation, RemoveInfoboxMutationVariables>;

/**
 * __useRemoveInfoboxMutation__
 *
 * To run a mutation, you first call `useRemoveInfoboxMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveInfoboxMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeInfoboxMutation, { data, loading, error }] = useRemoveInfoboxMutation({
 *   variables: {
 *      layerId: // value for 'layerId'
 *   },
 * });
 */
export function useRemoveInfoboxMutation(baseOptions?: Apollo.MutationHookOptions<RemoveInfoboxMutation, RemoveInfoboxMutationVariables>) {
        return Apollo.useMutation<RemoveInfoboxMutation, RemoveInfoboxMutationVariables>(RemoveInfoboxDocument, baseOptions);
      }
export type RemoveInfoboxMutationHookResult = ReturnType<typeof useRemoveInfoboxMutation>;
export type RemoveInfoboxMutationResult = Apollo.MutationResult<RemoveInfoboxMutation>;
export type RemoveInfoboxMutationOptions = Apollo.BaseMutationOptions<RemoveInfoboxMutation, RemoveInfoboxMutationVariables>;
export const UploadFileToPropertyDocument = gql`
    mutation UploadFileToProperty($propertyId: ID!, $schemaItemId: PropertySchemaFieldID, $itemId: ID, $fieldId: PropertySchemaFieldID!, $file: Upload!) {
  uploadFileToProperty(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, fieldId: $fieldId, file: $file}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type UploadFileToPropertyMutationFn = Apollo.MutationFunction<UploadFileToPropertyMutation, UploadFileToPropertyMutationVariables>;

/**
 * __useUploadFileToPropertyMutation__
 *
 * To run a mutation, you first call `useUploadFileToPropertyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileToPropertyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileToPropertyMutation, { data, loading, error }] = useUploadFileToPropertyMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      fieldId: // value for 'fieldId'
 *      file: // value for 'file'
 *   },
 * });
 */
export function useUploadFileToPropertyMutation(baseOptions?: Apollo.MutationHookOptions<UploadFileToPropertyMutation, UploadFileToPropertyMutationVariables>) {
        return Apollo.useMutation<UploadFileToPropertyMutation, UploadFileToPropertyMutationVariables>(UploadFileToPropertyDocument, baseOptions);
      }
export type UploadFileToPropertyMutationHookResult = ReturnType<typeof useUploadFileToPropertyMutation>;
export type UploadFileToPropertyMutationResult = Apollo.MutationResult<UploadFileToPropertyMutation>;
export type UploadFileToPropertyMutationOptions = Apollo.BaseMutationOptions<UploadFileToPropertyMutation, UploadFileToPropertyMutationVariables>;
export const RemovePropertyFieldDocument = gql`
    mutation RemovePropertyField($propertyId: ID!, $schemaItemId: PropertySchemaFieldID, $itemId: ID, $fieldId: PropertySchemaFieldID!) {
  removePropertyField(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, fieldId: $fieldId}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type RemovePropertyFieldMutationFn = Apollo.MutationFunction<RemovePropertyFieldMutation, RemovePropertyFieldMutationVariables>;

/**
 * __useRemovePropertyFieldMutation__
 *
 * To run a mutation, you first call `useRemovePropertyFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePropertyFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePropertyFieldMutation, { data, loading, error }] = useRemovePropertyFieldMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      fieldId: // value for 'fieldId'
 *   },
 * });
 */
export function useRemovePropertyFieldMutation(baseOptions?: Apollo.MutationHookOptions<RemovePropertyFieldMutation, RemovePropertyFieldMutationVariables>) {
        return Apollo.useMutation<RemovePropertyFieldMutation, RemovePropertyFieldMutationVariables>(RemovePropertyFieldDocument, baseOptions);
      }
export type RemovePropertyFieldMutationHookResult = ReturnType<typeof useRemovePropertyFieldMutation>;
export type RemovePropertyFieldMutationResult = Apollo.MutationResult<RemovePropertyFieldMutation>;
export type RemovePropertyFieldMutationOptions = Apollo.BaseMutationOptions<RemovePropertyFieldMutation, RemovePropertyFieldMutationVariables>;
export const AddPropertyItemDocument = gql`
    mutation addPropertyItem($propertyId: ID!, $schemaItemId: PropertySchemaFieldID!, $index: Int, $nameFieldValue: Any, $nameFieldType: ValueType) {
  addPropertyItem(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, index: $index, nameFieldValue: $nameFieldValue, nameFieldType: $nameFieldType}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type AddPropertyItemMutationFn = Apollo.MutationFunction<AddPropertyItemMutation, AddPropertyItemMutationVariables>;

/**
 * __useAddPropertyItemMutation__
 *
 * To run a mutation, you first call `useAddPropertyItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPropertyItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPropertyItemMutation, { data, loading, error }] = useAddPropertyItemMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      index: // value for 'index'
 *      nameFieldValue: // value for 'nameFieldValue'
 *      nameFieldType: // value for 'nameFieldType'
 *   },
 * });
 */
export function useAddPropertyItemMutation(baseOptions?: Apollo.MutationHookOptions<AddPropertyItemMutation, AddPropertyItemMutationVariables>) {
        return Apollo.useMutation<AddPropertyItemMutation, AddPropertyItemMutationVariables>(AddPropertyItemDocument, baseOptions);
      }
export type AddPropertyItemMutationHookResult = ReturnType<typeof useAddPropertyItemMutation>;
export type AddPropertyItemMutationResult = Apollo.MutationResult<AddPropertyItemMutation>;
export type AddPropertyItemMutationOptions = Apollo.BaseMutationOptions<AddPropertyItemMutation, AddPropertyItemMutationVariables>;
export const MovePropertyItemDocument = gql`
    mutation movePropertyItem($propertyId: ID!, $schemaItemId: PropertySchemaFieldID!, $itemId: ID!, $index: Int!) {
  movePropertyItem(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId, index: $index}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type MovePropertyItemMutationFn = Apollo.MutationFunction<MovePropertyItemMutation, MovePropertyItemMutationVariables>;

/**
 * __useMovePropertyItemMutation__
 *
 * To run a mutation, you first call `useMovePropertyItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMovePropertyItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [movePropertyItemMutation, { data, loading, error }] = useMovePropertyItemMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *      index: // value for 'index'
 *   },
 * });
 */
export function useMovePropertyItemMutation(baseOptions?: Apollo.MutationHookOptions<MovePropertyItemMutation, MovePropertyItemMutationVariables>) {
        return Apollo.useMutation<MovePropertyItemMutation, MovePropertyItemMutationVariables>(MovePropertyItemDocument, baseOptions);
      }
export type MovePropertyItemMutationHookResult = ReturnType<typeof useMovePropertyItemMutation>;
export type MovePropertyItemMutationResult = Apollo.MutationResult<MovePropertyItemMutation>;
export type MovePropertyItemMutationOptions = Apollo.BaseMutationOptions<MovePropertyItemMutation, MovePropertyItemMutationVariables>;
export const RemovePropertyItemDocument = gql`
    mutation removePropertyItem($propertyId: ID!, $schemaItemId: PropertySchemaFieldID!, $itemId: ID!) {
  removePropertyItem(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, itemId: $itemId}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type RemovePropertyItemMutationFn = Apollo.MutationFunction<RemovePropertyItemMutation, RemovePropertyItemMutationVariables>;

/**
 * __useRemovePropertyItemMutation__
 *
 * To run a mutation, you first call `useRemovePropertyItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePropertyItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePropertyItemMutation, { data, loading, error }] = useRemovePropertyItemMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useRemovePropertyItemMutation(baseOptions?: Apollo.MutationHookOptions<RemovePropertyItemMutation, RemovePropertyItemMutationVariables>) {
        return Apollo.useMutation<RemovePropertyItemMutation, RemovePropertyItemMutationVariables>(RemovePropertyItemDocument, baseOptions);
      }
export type RemovePropertyItemMutationHookResult = ReturnType<typeof useRemovePropertyItemMutation>;
export type RemovePropertyItemMutationResult = Apollo.MutationResult<RemovePropertyItemMutation>;
export type RemovePropertyItemMutationOptions = Apollo.BaseMutationOptions<RemovePropertyItemMutation, RemovePropertyItemMutationVariables>;
export const UpdatePropertyItemsDocument = gql`
    mutation updatePropertyItems($propertyId: ID!, $schemaItemId: PropertySchemaFieldID!, $operations: [UpdatePropertyItemOperationInput!]!) {
  updatePropertyItems(
    input: {propertyId: $propertyId, schemaItemId: $schemaItemId, operations: $operations}
  ) {
    property {
      id
      ...PropertyFragment
      layer {
        id
        ...Layer1Fragment
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}
${Layer1FragmentFragmentDoc}`;
export type UpdatePropertyItemsMutationFn = Apollo.MutationFunction<UpdatePropertyItemsMutation, UpdatePropertyItemsMutationVariables>;

/**
 * __useUpdatePropertyItemsMutation__
 *
 * To run a mutation, you first call `useUpdatePropertyItemsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePropertyItemsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePropertyItemsMutation, { data, loading, error }] = useUpdatePropertyItemsMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *      schemaItemId: // value for 'schemaItemId'
 *      operations: // value for 'operations'
 *   },
 * });
 */
export function useUpdatePropertyItemsMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePropertyItemsMutation, UpdatePropertyItemsMutationVariables>) {
        return Apollo.useMutation<UpdatePropertyItemsMutation, UpdatePropertyItemsMutationVariables>(UpdatePropertyItemsDocument, baseOptions);
      }
export type UpdatePropertyItemsMutationHookResult = ReturnType<typeof useUpdatePropertyItemsMutation>;
export type UpdatePropertyItemsMutationResult = Apollo.MutationResult<UpdatePropertyItemsMutation>;
export type UpdatePropertyItemsMutationOptions = Apollo.BaseMutationOptions<UpdatePropertyItemsMutation, UpdatePropertyItemsMutationVariables>;
export const GetLayerPropertyDocument = gql`
    query GetLayerProperty($layerId: ID!) {
  layer(id: $layerId) {
    id
    ...Layer1Fragment
  }
}
    ${Layer1FragmentFragmentDoc}`;

/**
 * __useGetLayerPropertyQuery__
 *
 * To run a query within a React component, call `useGetLayerPropertyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLayerPropertyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLayerPropertyQuery({
 *   variables: {
 *      layerId: // value for 'layerId'
 *   },
 * });
 */
export function useGetLayerPropertyQuery(baseOptions: Apollo.QueryHookOptions<GetLayerPropertyQuery, GetLayerPropertyQueryVariables>) {
        return Apollo.useQuery<GetLayerPropertyQuery, GetLayerPropertyQueryVariables>(GetLayerPropertyDocument, baseOptions);
      }
export function useGetLayerPropertyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLayerPropertyQuery, GetLayerPropertyQueryVariables>) {
          return Apollo.useLazyQuery<GetLayerPropertyQuery, GetLayerPropertyQueryVariables>(GetLayerPropertyDocument, baseOptions);
        }
export type GetLayerPropertyQueryHookResult = ReturnType<typeof useGetLayerPropertyQuery>;
export type GetLayerPropertyLazyQueryHookResult = ReturnType<typeof useGetLayerPropertyLazyQuery>;
export type GetLayerPropertyQueryResult = Apollo.QueryResult<GetLayerPropertyQuery, GetLayerPropertyQueryVariables>;
export const GetScenePropertyDocument = gql`
    query GetSceneProperty($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      property {
        id
        ...PropertyFragment
      }
      widgets {
        id
        pluginId
        extensionId
        enabled
        propertyId
        property {
          id
          ...PropertyFragment
        }
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}`;

/**
 * __useGetScenePropertyQuery__
 *
 * To run a query within a React component, call `useGetScenePropertyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScenePropertyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScenePropertyQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetScenePropertyQuery(baseOptions: Apollo.QueryHookOptions<GetScenePropertyQuery, GetScenePropertyQueryVariables>) {
        return Apollo.useQuery<GetScenePropertyQuery, GetScenePropertyQueryVariables>(GetScenePropertyDocument, baseOptions);
      }
export function useGetScenePropertyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScenePropertyQuery, GetScenePropertyQueryVariables>) {
          return Apollo.useLazyQuery<GetScenePropertyQuery, GetScenePropertyQueryVariables>(GetScenePropertyDocument, baseOptions);
        }
export type GetScenePropertyQueryHookResult = ReturnType<typeof useGetScenePropertyQuery>;
export type GetScenePropertyLazyQueryHookResult = ReturnType<typeof useGetScenePropertyLazyQuery>;
export type GetScenePropertyQueryResult = Apollo.QueryResult<GetScenePropertyQuery, GetScenePropertyQueryVariables>;
export const GetLinkableDatasetsDocument = gql`
    query GetLinkableDatasets($sceneId: ID!) {
  datasetSchemas(sceneId: $sceneId, first: 100) {
    nodes {
      id
      source
      name
      fields {
        id
        name
        type
      }
      datasets(first: 100) {
        totalCount
        nodes {
          id
          name
          fields {
            fieldId
            type
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetLinkableDatasetsQuery__
 *
 * To run a query within a React component, call `useGetLinkableDatasetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLinkableDatasetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLinkableDatasetsQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetLinkableDatasetsQuery(baseOptions: Apollo.QueryHookOptions<GetLinkableDatasetsQuery, GetLinkableDatasetsQueryVariables>) {
        return Apollo.useQuery<GetLinkableDatasetsQuery, GetLinkableDatasetsQueryVariables>(GetLinkableDatasetsDocument, baseOptions);
      }
export function useGetLinkableDatasetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLinkableDatasetsQuery, GetLinkableDatasetsQueryVariables>) {
          return Apollo.useLazyQuery<GetLinkableDatasetsQuery, GetLinkableDatasetsQueryVariables>(GetLinkableDatasetsDocument, baseOptions);
        }
export type GetLinkableDatasetsQueryHookResult = ReturnType<typeof useGetLinkableDatasetsQuery>;
export type GetLinkableDatasetsLazyQueryHookResult = ReturnType<typeof useGetLinkableDatasetsLazyQuery>;
export type GetLinkableDatasetsQueryResult = Apollo.QueryResult<GetLinkableDatasetsQuery, GetLinkableDatasetsQueryVariables>;
export const AddWidgetDocument = gql`
    mutation addWidget($sceneId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!) {
  addWidget(
    input: {sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId}
  ) {
    scene {
      id
      widgets {
        id
        enabled
        pluginId
        extensionId
        propertyId
        property {
          id
          ...PropertyFragment
        }
      }
    }
  }
}
    ${PropertyFragmentFragmentDoc}`;
export type AddWidgetMutationFn = Apollo.MutationFunction<AddWidgetMutation, AddWidgetMutationVariables>;

/**
 * __useAddWidgetMutation__
 *
 * To run a mutation, you first call `useAddWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addWidgetMutation, { data, loading, error }] = useAddWidgetMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *      pluginId: // value for 'pluginId'
 *      extensionId: // value for 'extensionId'
 *   },
 * });
 */
export function useAddWidgetMutation(baseOptions?: Apollo.MutationHookOptions<AddWidgetMutation, AddWidgetMutationVariables>) {
        return Apollo.useMutation<AddWidgetMutation, AddWidgetMutationVariables>(AddWidgetDocument, baseOptions);
      }
export type AddWidgetMutationHookResult = ReturnType<typeof useAddWidgetMutation>;
export type AddWidgetMutationResult = Apollo.MutationResult<AddWidgetMutation>;
export type AddWidgetMutationOptions = Apollo.BaseMutationOptions<AddWidgetMutation, AddWidgetMutationVariables>;
export const RemoveWidgetDocument = gql`
    mutation removeWidget($sceneId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!) {
  removeWidget(
    input: {sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId}
  ) {
    scene {
      id
      widgets {
        id
        enabled
        pluginId
        extensionId
        propertyId
      }
    }
  }
}
    `;
export type RemoveWidgetMutationFn = Apollo.MutationFunction<RemoveWidgetMutation, RemoveWidgetMutationVariables>;

/**
 * __useRemoveWidgetMutation__
 *
 * To run a mutation, you first call `useRemoveWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeWidgetMutation, { data, loading, error }] = useRemoveWidgetMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *      pluginId: // value for 'pluginId'
 *      extensionId: // value for 'extensionId'
 *   },
 * });
 */
export function useRemoveWidgetMutation(baseOptions?: Apollo.MutationHookOptions<RemoveWidgetMutation, RemoveWidgetMutationVariables>) {
        return Apollo.useMutation<RemoveWidgetMutation, RemoveWidgetMutationVariables>(RemoveWidgetDocument, baseOptions);
      }
export type RemoveWidgetMutationHookResult = ReturnType<typeof useRemoveWidgetMutation>;
export type RemoveWidgetMutationResult = Apollo.MutationResult<RemoveWidgetMutation>;
export type RemoveWidgetMutationOptions = Apollo.BaseMutationOptions<RemoveWidgetMutation, RemoveWidgetMutationVariables>;
export const UpdateWidgetDocument = gql`
    mutation updateWidget($sceneId: ID!, $pluginId: PluginID!, $extensionId: PluginExtensionID!, $enabled: Boolean) {
  updateWidget(
    input: {sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId, enabled: $enabled}
  ) {
    scene {
      id
      widgets {
        id
        enabled
        pluginId
        extensionId
        propertyId
      }
    }
  }
}
    `;
export type UpdateWidgetMutationFn = Apollo.MutationFunction<UpdateWidgetMutation, UpdateWidgetMutationVariables>;

/**
 * __useUpdateWidgetMutation__
 *
 * To run a mutation, you first call `useUpdateWidgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWidgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWidgetMutation, { data, loading, error }] = useUpdateWidgetMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *      pluginId: // value for 'pluginId'
 *      extensionId: // value for 'extensionId'
 *      enabled: // value for 'enabled'
 *   },
 * });
 */
export function useUpdateWidgetMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWidgetMutation, UpdateWidgetMutationVariables>) {
        return Apollo.useMutation<UpdateWidgetMutation, UpdateWidgetMutationVariables>(UpdateWidgetDocument, baseOptions);
      }
export type UpdateWidgetMutationHookResult = ReturnType<typeof useUpdateWidgetMutation>;
export type UpdateWidgetMutationResult = Apollo.MutationResult<UpdateWidgetMutation>;
export type UpdateWidgetMutationOptions = Apollo.BaseMutationOptions<UpdateWidgetMutation, UpdateWidgetMutationVariables>;
export const UpdateMeDocument = gql`
    mutation updateMe($name: String, $email: String, $lang: Lang, $password: String, $passwordConfirmation: String) {
  updateMe(
    input: {name: $name, email: $email, lang: $lang, password: $password, passwordConfirmation: $passwordConfirmation}
  ) {
    user {
      id
      name
      email
      lang
      myTeam {
        id
        name
      }
    }
  }
}
    `;
export type UpdateMeMutationFn = Apollo.MutationFunction<UpdateMeMutation, UpdateMeMutationVariables>;

/**
 * __useUpdateMeMutation__
 *
 * To run a mutation, you first call `useUpdateMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMeMutation, { data, loading, error }] = useUpdateMeMutation({
 *   variables: {
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      lang: // value for 'lang'
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *   },
 * });
 */
export function useUpdateMeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMeMutation, UpdateMeMutationVariables>) {
        return Apollo.useMutation<UpdateMeMutation, UpdateMeMutationVariables>(UpdateMeDocument, baseOptions);
      }
export type UpdateMeMutationHookResult = ReturnType<typeof useUpdateMeMutation>;
export type UpdateMeMutationResult = Apollo.MutationResult<UpdateMeMutation>;
export type UpdateMeMutationOptions = Apollo.BaseMutationOptions<UpdateMeMutation, UpdateMeMutationVariables>;
export const ProfileDocument = gql`
    query Profile {
  me {
    id
    name
    email
    lang
    myTeam {
      id
      name
    }
    auths
  }
}
    `;

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileQuery(baseOptions?: Apollo.QueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
        return Apollo.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, baseOptions);
      }
export function useProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
          return Apollo.useLazyQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, baseOptions);
        }
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileQueryResult = Apollo.QueryResult<ProfileQuery, ProfileQueryVariables>;
export const DatasetSchemasDocument = gql`
    query datasetSchemas($projectId: ID!) {
  scene(projectId: $projectId) {
    id
    datasetSchemas(first: 100) {
      nodes {
        id
        source
        name
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
}
    `;

/**
 * __useDatasetSchemasQuery__
 *
 * To run a query within a React component, call `useDatasetSchemasQuery` and pass it any options that fit your needs.
 * When your component renders, `useDatasetSchemasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDatasetSchemasQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useDatasetSchemasQuery(baseOptions: Apollo.QueryHookOptions<DatasetSchemasQuery, DatasetSchemasQueryVariables>) {
        return Apollo.useQuery<DatasetSchemasQuery, DatasetSchemasQueryVariables>(DatasetSchemasDocument, baseOptions);
      }
export function useDatasetSchemasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatasetSchemasQuery, DatasetSchemasQueryVariables>) {
          return Apollo.useLazyQuery<DatasetSchemasQuery, DatasetSchemasQueryVariables>(DatasetSchemasDocument, baseOptions);
        }
export type DatasetSchemasQueryHookResult = ReturnType<typeof useDatasetSchemasQuery>;
export type DatasetSchemasLazyQueryHookResult = ReturnType<typeof useDatasetSchemasLazyQuery>;
export type DatasetSchemasQueryResult = Apollo.QueryResult<DatasetSchemasQuery, DatasetSchemasQueryVariables>;
export const SyncDatasetTestDocument = gql`
    mutation syncDatasetTest($sceneId: ID!, $url: String!) {
  syncDataset(input: {sceneId: $sceneId, url: $url}) {
    sceneId
    url
    datasetSchema {
      id
      source
      name
    }
    dataset {
      id
      source
      schemaId
      name
    }
  }
}
    `;
export type SyncDatasetTestMutationFn = Apollo.MutationFunction<SyncDatasetTestMutation, SyncDatasetTestMutationVariables>;

/**
 * __useSyncDatasetTestMutation__
 *
 * To run a mutation, you first call `useSyncDatasetTestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSyncDatasetTestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [syncDatasetTestMutation, { data, loading, error }] = useSyncDatasetTestMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *      url: // value for 'url'
 *   },
 * });
 */
export function useSyncDatasetTestMutation(baseOptions?: Apollo.MutationHookOptions<SyncDatasetTestMutation, SyncDatasetTestMutationVariables>) {
        return Apollo.useMutation<SyncDatasetTestMutation, SyncDatasetTestMutationVariables>(SyncDatasetTestDocument, baseOptions);
      }
export type SyncDatasetTestMutationHookResult = ReturnType<typeof useSyncDatasetTestMutation>;
export type SyncDatasetTestMutationResult = Apollo.MutationResult<SyncDatasetTestMutation>;
export type SyncDatasetTestMutationOptions = Apollo.BaseMutationOptions<SyncDatasetTestMutation, SyncDatasetTestMutationVariables>;
export const RemoveDatasetSchemaDocument = gql`
    mutation removeDatasetSchema($schemaId: ID!) {
  removeDatasetSchema(input: {schemaId: $schemaId}) {
    schemaId
  }
}
    `;
export type RemoveDatasetSchemaMutationFn = Apollo.MutationFunction<RemoveDatasetSchemaMutation, RemoveDatasetSchemaMutationVariables>;

/**
 * __useRemoveDatasetSchemaMutation__
 *
 * To run a mutation, you first call `useRemoveDatasetSchemaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveDatasetSchemaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeDatasetSchemaMutation, { data, loading, error }] = useRemoveDatasetSchemaMutation({
 *   variables: {
 *      schemaId: // value for 'schemaId'
 *   },
 * });
 */
export function useRemoveDatasetSchemaMutation(baseOptions?: Apollo.MutationHookOptions<RemoveDatasetSchemaMutation, RemoveDatasetSchemaMutationVariables>) {
        return Apollo.useMutation<RemoveDatasetSchemaMutation, RemoveDatasetSchemaMutationVariables>(RemoveDatasetSchemaDocument, baseOptions);
      }
export type RemoveDatasetSchemaMutationHookResult = ReturnType<typeof useRemoveDatasetSchemaMutation>;
export type RemoveDatasetSchemaMutationResult = Apollo.MutationResult<RemoveDatasetSchemaMutation>;
export type RemoveDatasetSchemaMutationOptions = Apollo.BaseMutationOptions<RemoveDatasetSchemaMutation, RemoveDatasetSchemaMutationVariables>;
export const ProjectDocument = gql`
    query Project($teamId: ID!) {
  projects(teamId: $teamId, first: 0, last: 100) {
    nodes {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;

/**
 * __useProjectQuery__
 *
 * To run a query within a React component, call `useProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useProjectQuery(baseOptions: Apollo.QueryHookOptions<ProjectQuery, ProjectQueryVariables>) {
        return Apollo.useQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, baseOptions);
      }
export function useProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectQuery, ProjectQueryVariables>) {
          return Apollo.useLazyQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, baseOptions);
        }
export type ProjectQueryHookResult = ReturnType<typeof useProjectQuery>;
export type ProjectLazyQueryHookResult = ReturnType<typeof useProjectLazyQuery>;
export type ProjectQueryResult = Apollo.QueryResult<ProjectQuery, ProjectQueryVariables>;
export const UpdateProjectBasicAuthDocument = gql`
    mutation updateProjectBasicAuth($projectId: ID!, $isBasicAuthActive: Boolean, $basicAuthUsername: String, $basicAuthPassword: String) {
  updateProject(
    input: {projectId: $projectId, isBasicAuthActive: $isBasicAuthActive, basicAuthUsername: $basicAuthUsername, basicAuthPassword: $basicAuthPassword}
  ) {
    project {
      id
      name
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
    }
  }
}
    `;
export type UpdateProjectBasicAuthMutationFn = Apollo.MutationFunction<UpdateProjectBasicAuthMutation, UpdateProjectBasicAuthMutationVariables>;

/**
 * __useUpdateProjectBasicAuthMutation__
 *
 * To run a mutation, you first call `useUpdateProjectBasicAuthMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectBasicAuthMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectBasicAuthMutation, { data, loading, error }] = useUpdateProjectBasicAuthMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      isBasicAuthActive: // value for 'isBasicAuthActive'
 *      basicAuthUsername: // value for 'basicAuthUsername'
 *      basicAuthPassword: // value for 'basicAuthPassword'
 *   },
 * });
 */
export function useUpdateProjectBasicAuthMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectBasicAuthMutation, UpdateProjectBasicAuthMutationVariables>) {
        return Apollo.useMutation<UpdateProjectBasicAuthMutation, UpdateProjectBasicAuthMutationVariables>(UpdateProjectBasicAuthDocument, baseOptions);
      }
export type UpdateProjectBasicAuthMutationHookResult = ReturnType<typeof useUpdateProjectBasicAuthMutation>;
export type UpdateProjectBasicAuthMutationResult = Apollo.MutationResult<UpdateProjectBasicAuthMutation>;
export type UpdateProjectBasicAuthMutationOptions = Apollo.BaseMutationOptions<UpdateProjectBasicAuthMutation, UpdateProjectBasicAuthMutationVariables>;
export const UpdateProjectNameDocument = gql`
    mutation updateProjectName($projectId: ID!, $name: String!) {
  updateProject(input: {projectId: $projectId, name: $name}) {
    project {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;
export type UpdateProjectNameMutationFn = Apollo.MutationFunction<UpdateProjectNameMutation, UpdateProjectNameMutationVariables>;

/**
 * __useUpdateProjectNameMutation__
 *
 * To run a mutation, you first call `useUpdateProjectNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectNameMutation, { data, loading, error }] = useUpdateProjectNameMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateProjectNameMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectNameMutation, UpdateProjectNameMutationVariables>) {
        return Apollo.useMutation<UpdateProjectNameMutation, UpdateProjectNameMutationVariables>(UpdateProjectNameDocument, baseOptions);
      }
export type UpdateProjectNameMutationHookResult = ReturnType<typeof useUpdateProjectNameMutation>;
export type UpdateProjectNameMutationResult = Apollo.MutationResult<UpdateProjectNameMutation>;
export type UpdateProjectNameMutationOptions = Apollo.BaseMutationOptions<UpdateProjectNameMutation, UpdateProjectNameMutationVariables>;
export const UpdateProjectDescriptionDocument = gql`
    mutation updateProjectDescription($projectId: ID!, $description: String!) {
  updateProject(input: {projectId: $projectId, description: $description}) {
    project {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;
export type UpdateProjectDescriptionMutationFn = Apollo.MutationFunction<UpdateProjectDescriptionMutation, UpdateProjectDescriptionMutationVariables>;

/**
 * __useUpdateProjectDescriptionMutation__
 *
 * To run a mutation, you first call `useUpdateProjectDescriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectDescriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectDescriptionMutation, { data, loading, error }] = useUpdateProjectDescriptionMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useUpdateProjectDescriptionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectDescriptionMutation, UpdateProjectDescriptionMutationVariables>) {
        return Apollo.useMutation<UpdateProjectDescriptionMutation, UpdateProjectDescriptionMutationVariables>(UpdateProjectDescriptionDocument, baseOptions);
      }
export type UpdateProjectDescriptionMutationHookResult = ReturnType<typeof useUpdateProjectDescriptionMutation>;
export type UpdateProjectDescriptionMutationResult = Apollo.MutationResult<UpdateProjectDescriptionMutation>;
export type UpdateProjectDescriptionMutationOptions = Apollo.BaseMutationOptions<UpdateProjectDescriptionMutation, UpdateProjectDescriptionMutationVariables>;
export const UpdateProjectImageUrlDocument = gql`
    mutation updateProjectImageUrl($projectId: ID!, $imageUrl: URL) {
  updateProject(input: {projectId: $projectId, imageUrl: $imageUrl}) {
    project {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;
export type UpdateProjectImageUrlMutationFn = Apollo.MutationFunction<UpdateProjectImageUrlMutation, UpdateProjectImageUrlMutationVariables>;

/**
 * __useUpdateProjectImageUrlMutation__
 *
 * To run a mutation, you first call `useUpdateProjectImageUrlMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectImageUrlMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectImageUrlMutation, { data, loading, error }] = useUpdateProjectImageUrlMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      imageUrl: // value for 'imageUrl'
 *   },
 * });
 */
export function useUpdateProjectImageUrlMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectImageUrlMutation, UpdateProjectImageUrlMutationVariables>) {
        return Apollo.useMutation<UpdateProjectImageUrlMutation, UpdateProjectImageUrlMutationVariables>(UpdateProjectImageUrlDocument, baseOptions);
      }
export type UpdateProjectImageUrlMutationHookResult = ReturnType<typeof useUpdateProjectImageUrlMutation>;
export type UpdateProjectImageUrlMutationResult = Apollo.MutationResult<UpdateProjectImageUrlMutation>;
export type UpdateProjectImageUrlMutationOptions = Apollo.BaseMutationOptions<UpdateProjectImageUrlMutation, UpdateProjectImageUrlMutationVariables>;
export const UpdateProjectPublicTitleDocument = gql`
    mutation updateProjectPublicTitle($projectId: ID!, $publicTitle: String!) {
  updateProject(input: {projectId: $projectId, publicTitle: $publicTitle}) {
    project {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;
export type UpdateProjectPublicTitleMutationFn = Apollo.MutationFunction<UpdateProjectPublicTitleMutation, UpdateProjectPublicTitleMutationVariables>;

/**
 * __useUpdateProjectPublicTitleMutation__
 *
 * To run a mutation, you first call `useUpdateProjectPublicTitleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectPublicTitleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectPublicTitleMutation, { data, loading, error }] = useUpdateProjectPublicTitleMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      publicTitle: // value for 'publicTitle'
 *   },
 * });
 */
export function useUpdateProjectPublicTitleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectPublicTitleMutation, UpdateProjectPublicTitleMutationVariables>) {
        return Apollo.useMutation<UpdateProjectPublicTitleMutation, UpdateProjectPublicTitleMutationVariables>(UpdateProjectPublicTitleDocument, baseOptions);
      }
export type UpdateProjectPublicTitleMutationHookResult = ReturnType<typeof useUpdateProjectPublicTitleMutation>;
export type UpdateProjectPublicTitleMutationResult = Apollo.MutationResult<UpdateProjectPublicTitleMutation>;
export type UpdateProjectPublicTitleMutationOptions = Apollo.BaseMutationOptions<UpdateProjectPublicTitleMutation, UpdateProjectPublicTitleMutationVariables>;
export const UpdateProjectPublicDescriptionDocument = gql`
    mutation updateProjectPublicDescription($projectId: ID!, $publicDescription: String!) {
  updateProject(
    input: {projectId: $projectId, publicDescription: $publicDescription}
  ) {
    project {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;
export type UpdateProjectPublicDescriptionMutationFn = Apollo.MutationFunction<UpdateProjectPublicDescriptionMutation, UpdateProjectPublicDescriptionMutationVariables>;

/**
 * __useUpdateProjectPublicDescriptionMutation__
 *
 * To run a mutation, you first call `useUpdateProjectPublicDescriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectPublicDescriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectPublicDescriptionMutation, { data, loading, error }] = useUpdateProjectPublicDescriptionMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      publicDescription: // value for 'publicDescription'
 *   },
 * });
 */
export function useUpdateProjectPublicDescriptionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectPublicDescriptionMutation, UpdateProjectPublicDescriptionMutationVariables>) {
        return Apollo.useMutation<UpdateProjectPublicDescriptionMutation, UpdateProjectPublicDescriptionMutationVariables>(UpdateProjectPublicDescriptionDocument, baseOptions);
      }
export type UpdateProjectPublicDescriptionMutationHookResult = ReturnType<typeof useUpdateProjectPublicDescriptionMutation>;
export type UpdateProjectPublicDescriptionMutationResult = Apollo.MutationResult<UpdateProjectPublicDescriptionMutation>;
export type UpdateProjectPublicDescriptionMutationOptions = Apollo.BaseMutationOptions<UpdateProjectPublicDescriptionMutation, UpdateProjectPublicDescriptionMutationVariables>;
export const ArchiveProjectDocument = gql`
    mutation archiveProject($projectId: ID!, $archived: Boolean!) {
  updateProject(input: {projectId: $projectId, archived: $archived}) {
    project {
      id
      name
      description
      isArchived
      isBasicAuthActive
      basicAuthUsername
      basicAuthPassword
      publicTitle
      publicDescription
      imageUrl
      alias
      publishmentStatus
    }
  }
}
    `;
export type ArchiveProjectMutationFn = Apollo.MutationFunction<ArchiveProjectMutation, ArchiveProjectMutationVariables>;

/**
 * __useArchiveProjectMutation__
 *
 * To run a mutation, you first call `useArchiveProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveProjectMutation, { data, loading, error }] = useArchiveProjectMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      archived: // value for 'archived'
 *   },
 * });
 */
export function useArchiveProjectMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveProjectMutation, ArchiveProjectMutationVariables>) {
        return Apollo.useMutation<ArchiveProjectMutation, ArchiveProjectMutationVariables>(ArchiveProjectDocument, baseOptions);
      }
export type ArchiveProjectMutationHookResult = ReturnType<typeof useArchiveProjectMutation>;
export type ArchiveProjectMutationResult = Apollo.MutationResult<ArchiveProjectMutation>;
export type ArchiveProjectMutationOptions = Apollo.BaseMutationOptions<ArchiveProjectMutation, ArchiveProjectMutationVariables>;
export const DeleteProjectDocument = gql`
    mutation deleteProject($projectId: ID!) {
  deleteProject(input: {projectId: $projectId}) {
    projectId
  }
}
    `;
export type DeleteProjectMutationFn = Apollo.MutationFunction<DeleteProjectMutation, DeleteProjectMutationVariables>;

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useDeleteProjectMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProjectMutation, DeleteProjectMutationVariables>) {
        return Apollo.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, baseOptions);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = Apollo.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const UpdateProjectAliasDocument = gql`
    mutation updateProjectAlias($projectId: ID!, $alias: String!) {
  updateProject(input: {projectId: $projectId, alias: $alias}) {
    project {
      id
      name
      alias
    }
  }
}
    `;
export type UpdateProjectAliasMutationFn = Apollo.MutationFunction<UpdateProjectAliasMutation, UpdateProjectAliasMutationVariables>;

/**
 * __useUpdateProjectAliasMutation__
 *
 * To run a mutation, you first call `useUpdateProjectAliasMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectAliasMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectAliasMutation, { data, loading, error }] = useUpdateProjectAliasMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      alias: // value for 'alias'
 *   },
 * });
 */
export function useUpdateProjectAliasMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectAliasMutation, UpdateProjectAliasMutationVariables>) {
        return Apollo.useMutation<UpdateProjectAliasMutation, UpdateProjectAliasMutationVariables>(UpdateProjectAliasDocument, baseOptions);
      }
export type UpdateProjectAliasMutationHookResult = ReturnType<typeof useUpdateProjectAliasMutation>;
export type UpdateProjectAliasMutationResult = Apollo.MutationResult<UpdateProjectAliasMutation>;
export type UpdateProjectAliasMutationOptions = Apollo.BaseMutationOptions<UpdateProjectAliasMutation, UpdateProjectAliasMutationVariables>;
export const SceneDocument = gql`
    query Scene($projectId: ID!) {
  scene(projectId: $projectId) {
    id
    projectId
    teamId
  }
}
    `;

/**
 * __useSceneQuery__
 *
 * To run a query within a React component, call `useSceneQuery` and pass it any options that fit your needs.
 * When your component renders, `useSceneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSceneQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useSceneQuery(baseOptions: Apollo.QueryHookOptions<SceneQuery, SceneQueryVariables>) {
        return Apollo.useQuery<SceneQuery, SceneQueryVariables>(SceneDocument, baseOptions);
      }
export function useSceneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SceneQuery, SceneQueryVariables>) {
          return Apollo.useLazyQuery<SceneQuery, SceneQueryVariables>(SceneDocument, baseOptions);
        }
export type SceneQueryHookResult = ReturnType<typeof useSceneQuery>;
export type SceneLazyQueryHookResult = ReturnType<typeof useSceneLazyQuery>;
export type SceneQueryResult = Apollo.QueryResult<SceneQuery, SceneQueryVariables>;
export const AssetsDocument = gql`
    query Assets($teamId: ID!) {
  assets(teamId: $teamId, first: 0, last: 300) {
    edges {
      cursor
      node {
        id
        teamId
        name
        size
        url
        contentType
      }
    }
    nodes {
      id
      teamId
      name
      size
      url
      contentType
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
    totalCount
  }
}
    `;

/**
 * __useAssetsQuery__
 *
 * To run a query within a React component, call `useAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetsQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useAssetsQuery(baseOptions: Apollo.QueryHookOptions<AssetsQuery, AssetsQueryVariables>) {
        return Apollo.useQuery<AssetsQuery, AssetsQueryVariables>(AssetsDocument, baseOptions);
      }
export function useAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetsQuery, AssetsQueryVariables>) {
          return Apollo.useLazyQuery<AssetsQuery, AssetsQueryVariables>(AssetsDocument, baseOptions);
        }
export type AssetsQueryHookResult = ReturnType<typeof useAssetsQuery>;
export type AssetsLazyQueryHookResult = ReturnType<typeof useAssetsLazyQuery>;
export type AssetsQueryResult = Apollo.QueryResult<AssetsQuery, AssetsQueryVariables>;
export const CreateAssetDocument = gql`
    mutation CreateAsset($teamId: ID!, $file: Upload!) {
  createAsset(input: {teamId: $teamId, file: $file}) {
    asset {
      id
      teamId
      name
      size
      url
      contentType
    }
  }
}
    `;
export type CreateAssetMutationFn = Apollo.MutationFunction<CreateAssetMutation, CreateAssetMutationVariables>;

/**
 * __useCreateAssetMutation__
 *
 * To run a mutation, you first call `useCreateAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAssetMutation, { data, loading, error }] = useCreateAssetMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      file: // value for 'file'
 *   },
 * });
 */
export function useCreateAssetMutation(baseOptions?: Apollo.MutationHookOptions<CreateAssetMutation, CreateAssetMutationVariables>) {
        return Apollo.useMutation<CreateAssetMutation, CreateAssetMutationVariables>(CreateAssetDocument, baseOptions);
      }
export type CreateAssetMutationHookResult = ReturnType<typeof useCreateAssetMutation>;
export type CreateAssetMutationResult = Apollo.MutationResult<CreateAssetMutation>;
export type CreateAssetMutationOptions = Apollo.BaseMutationOptions<CreateAssetMutation, CreateAssetMutationVariables>;
export const RemoveAssetDocument = gql`
    mutation RemoveAsset($assetId: ID!) {
  removeAsset(input: {assetId: $assetId}) {
    assetId
  }
}
    `;
export type RemoveAssetMutationFn = Apollo.MutationFunction<RemoveAssetMutation, RemoveAssetMutationVariables>;

/**
 * __useRemoveAssetMutation__
 *
 * To run a mutation, you first call `useRemoveAssetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveAssetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeAssetMutation, { data, loading, error }] = useRemoveAssetMutation({
 *   variables: {
 *      assetId: // value for 'assetId'
 *   },
 * });
 */
export function useRemoveAssetMutation(baseOptions?: Apollo.MutationHookOptions<RemoveAssetMutation, RemoveAssetMutationVariables>) {
        return Apollo.useMutation<RemoveAssetMutation, RemoveAssetMutationVariables>(RemoveAssetDocument, baseOptions);
      }
export type RemoveAssetMutationHookResult = ReturnType<typeof useRemoveAssetMutation>;
export type RemoveAssetMutationResult = Apollo.MutationResult<RemoveAssetMutation>;
export type RemoveAssetMutationOptions = Apollo.BaseMutationOptions<RemoveAssetMutation, RemoveAssetMutationVariables>;
export const UpdateTeamDocument = gql`
    mutation updateTeam($teamId: ID!, $name: String!) {
  updateTeam(input: {teamId: $teamId, name: $name}) {
    team {
      id
      name
      members {
        user {
          id
          name
          email
        }
        userId
        role
      }
      personal
    }
  }
}
    `;
export type UpdateTeamMutationFn = Apollo.MutationFunction<UpdateTeamMutation, UpdateTeamMutationVariables>;

/**
 * __useUpdateTeamMutation__
 *
 * To run a mutation, you first call `useUpdateTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTeamMutation, { data, loading, error }] = useUpdateTeamMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateTeamMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTeamMutation, UpdateTeamMutationVariables>) {
        return Apollo.useMutation<UpdateTeamMutation, UpdateTeamMutationVariables>(UpdateTeamDocument, baseOptions);
      }
export type UpdateTeamMutationHookResult = ReturnType<typeof useUpdateTeamMutation>;
export type UpdateTeamMutationResult = Apollo.MutationResult<UpdateTeamMutation>;
export type UpdateTeamMutationOptions = Apollo.BaseMutationOptions<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const DeleteTeamDocument = gql`
    mutation deleteTeam($teamId: ID!) {
  deleteTeam(input: {teamId: $teamId}) {
    teamId
  }
}
    `;
export type DeleteTeamMutationFn = Apollo.MutationFunction<DeleteTeamMutation, DeleteTeamMutationVariables>;

/**
 * __useDeleteTeamMutation__
 *
 * To run a mutation, you first call `useDeleteTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTeamMutation, { data, loading, error }] = useDeleteTeamMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useDeleteTeamMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTeamMutation, DeleteTeamMutationVariables>) {
        return Apollo.useMutation<DeleteTeamMutation, DeleteTeamMutationVariables>(DeleteTeamDocument, baseOptions);
      }
export type DeleteTeamMutationHookResult = ReturnType<typeof useDeleteTeamMutation>;
export type DeleteTeamMutationResult = Apollo.MutationResult<DeleteTeamMutation>;
export type DeleteTeamMutationOptions = Apollo.BaseMutationOptions<DeleteTeamMutation, DeleteTeamMutationVariables>;
export const SearchUserDocument = gql`
    query searchUser($nameOrEmail: String!) {
  searchUser(nameOrEmail: $nameOrEmail) {
    userId
    userName
    userEmail
  }
}
    `;

/**
 * __useSearchUserQuery__
 *
 * To run a query within a React component, call `useSearchUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUserQuery({
 *   variables: {
 *      nameOrEmail: // value for 'nameOrEmail'
 *   },
 * });
 */
export function useSearchUserQuery(baseOptions: Apollo.QueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
        return Apollo.useQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, baseOptions);
      }
export function useSearchUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
          return Apollo.useLazyQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, baseOptions);
        }
export type SearchUserQueryHookResult = ReturnType<typeof useSearchUserQuery>;
export type SearchUserLazyQueryHookResult = ReturnType<typeof useSearchUserLazyQuery>;
export type SearchUserQueryResult = Apollo.QueryResult<SearchUserQuery, SearchUserQueryVariables>;
export const AddMemberToTeamDocument = gql`
    mutation addMemberToTeam($teamId: ID!, $userId: ID!, $role: Role!) {
  addMemberToTeam(input: {teamId: $teamId, userId: $userId, role: $role}) {
    team {
      id
      name
      members {
        user {
          id
          name
          email
        }
        userId
        role
      }
      personal
    }
  }
}
    `;
export type AddMemberToTeamMutationFn = Apollo.MutationFunction<AddMemberToTeamMutation, AddMemberToTeamMutationVariables>;

/**
 * __useAddMemberToTeamMutation__
 *
 * To run a mutation, you first call `useAddMemberToTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMemberToTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMemberToTeamMutation, { data, loading, error }] = useAddMemberToTeamMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddMemberToTeamMutation(baseOptions?: Apollo.MutationHookOptions<AddMemberToTeamMutation, AddMemberToTeamMutationVariables>) {
        return Apollo.useMutation<AddMemberToTeamMutation, AddMemberToTeamMutationVariables>(AddMemberToTeamDocument, baseOptions);
      }
export type AddMemberToTeamMutationHookResult = ReturnType<typeof useAddMemberToTeamMutation>;
export type AddMemberToTeamMutationResult = Apollo.MutationResult<AddMemberToTeamMutation>;
export type AddMemberToTeamMutationOptions = Apollo.BaseMutationOptions<AddMemberToTeamMutation, AddMemberToTeamMutationVariables>;
export const UpdateMemberOfTeamDocument = gql`
    mutation updateMemberOfTeam($teamId: ID!, $userId: ID!, $role: Role!) {
  updateMemberOfTeam(input: {teamId: $teamId, userId: $userId, role: $role}) {
    team {
      id
      name
      members {
        user {
          id
          name
          email
        }
        userId
        role
      }
      personal
    }
  }
}
    `;
export type UpdateMemberOfTeamMutationFn = Apollo.MutationFunction<UpdateMemberOfTeamMutation, UpdateMemberOfTeamMutationVariables>;

/**
 * __useUpdateMemberOfTeamMutation__
 *
 * To run a mutation, you first call `useUpdateMemberOfTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemberOfTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemberOfTeamMutation, { data, loading, error }] = useUpdateMemberOfTeamMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useUpdateMemberOfTeamMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMemberOfTeamMutation, UpdateMemberOfTeamMutationVariables>) {
        return Apollo.useMutation<UpdateMemberOfTeamMutation, UpdateMemberOfTeamMutationVariables>(UpdateMemberOfTeamDocument, baseOptions);
      }
export type UpdateMemberOfTeamMutationHookResult = ReturnType<typeof useUpdateMemberOfTeamMutation>;
export type UpdateMemberOfTeamMutationResult = Apollo.MutationResult<UpdateMemberOfTeamMutation>;
export type UpdateMemberOfTeamMutationOptions = Apollo.BaseMutationOptions<UpdateMemberOfTeamMutation, UpdateMemberOfTeamMutationVariables>;
export const RemoveMemberFromTeamDocument = gql`
    mutation removeMemberFromTeam($teamId: ID!, $userId: ID!) {
  removeMemberFromTeam(input: {teamId: $teamId, userId: $userId}) {
    team {
      id
      name
      members {
        user {
          id
          name
          email
        }
        userId
        role
      }
      personal
    }
  }
}
    `;
export type RemoveMemberFromTeamMutationFn = Apollo.MutationFunction<RemoveMemberFromTeamMutation, RemoveMemberFromTeamMutationVariables>;

/**
 * __useRemoveMemberFromTeamMutation__
 *
 * To run a mutation, you first call `useRemoveMemberFromTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberFromTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberFromTeamMutation, { data, loading, error }] = useRemoveMemberFromTeamMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveMemberFromTeamMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberFromTeamMutation, RemoveMemberFromTeamMutationVariables>) {
        return Apollo.useMutation<RemoveMemberFromTeamMutation, RemoveMemberFromTeamMutationVariables>(RemoveMemberFromTeamDocument, baseOptions);
      }
export type RemoveMemberFromTeamMutationHookResult = ReturnType<typeof useRemoveMemberFromTeamMutation>;
export type RemoveMemberFromTeamMutationResult = Apollo.MutationResult<RemoveMemberFromTeamMutation>;
export type RemoveMemberFromTeamMutationOptions = Apollo.BaseMutationOptions<RemoveMemberFromTeamMutation, RemoveMemberFromTeamMutationVariables>;
export const GetSceneDocument = gql`
    query getScene($sceneId: ID!) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      rootLayerId
    }
  }
}
    `;

/**
 * __useGetSceneQuery__
 *
 * To run a query within a React component, call `useGetSceneQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSceneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSceneQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useGetSceneQuery(baseOptions: Apollo.QueryHookOptions<GetSceneQuery, GetSceneQueryVariables>) {
        return Apollo.useQuery<GetSceneQuery, GetSceneQueryVariables>(GetSceneDocument, baseOptions);
      }
export function useGetSceneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSceneQuery, GetSceneQueryVariables>) {
          return Apollo.useLazyQuery<GetSceneQuery, GetSceneQueryVariables>(GetSceneDocument, baseOptions);
        }
export type GetSceneQueryHookResult = ReturnType<typeof useGetSceneQuery>;
export type GetSceneLazyQueryHookResult = ReturnType<typeof useGetSceneLazyQuery>;
export type GetSceneQueryResult = Apollo.QueryResult<GetSceneQuery, GetSceneQueryVariables>;
export const DeleteMeDocument = gql`
    mutation deleteMe($userId: ID!) {
  deleteMe(input: {userId: $userId}) {
    userId
  }
}
    `;
export type DeleteMeMutationFn = Apollo.MutationFunction<DeleteMeMutation, DeleteMeMutationVariables>;

/**
 * __useDeleteMeMutation__
 *
 * To run a mutation, you first call `useDeleteMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeMutation, { data, loading, error }] = useDeleteMeMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteMeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMeMutation, DeleteMeMutationVariables>) {
        return Apollo.useMutation<DeleteMeMutation, DeleteMeMutationVariables>(DeleteMeDocument, baseOptions);
      }
export type DeleteMeMutationHookResult = ReturnType<typeof useDeleteMeMutation>;
export type DeleteMeMutationResult = Apollo.MutationResult<DeleteMeMutation>;
export type DeleteMeMutationOptions = Apollo.BaseMutationOptions<DeleteMeMutation, DeleteMeMutationVariables>;
export const CreateTeamDocument = gql`
    mutation createTeam($name: String!) {
  createTeam(input: {name: $name}) {
    team {
      id
      name
    }
  }
}
    `;
export type CreateTeamMutationFn = Apollo.MutationFunction<CreateTeamMutation, CreateTeamMutationVariables>;

/**
 * __useCreateTeamMutation__
 *
 * To run a mutation, you first call `useCreateTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTeamMutation, { data, loading, error }] = useCreateTeamMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateTeamMutation(baseOptions?: Apollo.MutationHookOptions<CreateTeamMutation, CreateTeamMutationVariables>) {
        return Apollo.useMutation<CreateTeamMutation, CreateTeamMutationVariables>(CreateTeamDocument, baseOptions);
      }
export type CreateTeamMutationHookResult = ReturnType<typeof useCreateTeamMutation>;
export type CreateTeamMutationResult = Apollo.MutationResult<CreateTeamMutation>;
export type CreateTeamMutationOptions = Apollo.BaseMutationOptions<CreateTeamMutation, CreateTeamMutationVariables>;
export const TeamsDocument = gql`
    query teams {
  me {
    id
    name
    myTeam {
      id
      ...Team
    }
    teams {
      id
      ...Team
    }
  }
}
    ${TeamFragmentDoc}`;

/**
 * __useTeamsQuery__
 *
 * To run a query within a React component, call `useTeamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTeamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTeamsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTeamsQuery(baseOptions?: Apollo.QueryHookOptions<TeamsQuery, TeamsQueryVariables>) {
        return Apollo.useQuery<TeamsQuery, TeamsQueryVariables>(TeamsDocument, baseOptions);
      }
export function useTeamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TeamsQuery, TeamsQueryVariables>) {
          return Apollo.useLazyQuery<TeamsQuery, TeamsQueryVariables>(TeamsDocument, baseOptions);
        }
export type TeamsQueryHookResult = ReturnType<typeof useTeamsQuery>;
export type TeamsLazyQueryHookResult = ReturnType<typeof useTeamsLazyQuery>;
export type TeamsQueryResult = Apollo.QueryResult<TeamsQuery, TeamsQueryVariables>;
export const LanguageDocument = gql`
    query Language {
  me {
    id
    lang
  }
}
    `;

/**
 * __useLanguageQuery__
 *
 * To run a query within a React component, call `useLanguageQuery` and pass it any options that fit your needs.
 * When your component renders, `useLanguageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLanguageQuery({
 *   variables: {
 *   },
 * });
 */
export function useLanguageQuery(baseOptions?: Apollo.QueryHookOptions<LanguageQuery, LanguageQueryVariables>) {
        return Apollo.useQuery<LanguageQuery, LanguageQueryVariables>(LanguageDocument, baseOptions);
      }
export function useLanguageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LanguageQuery, LanguageQueryVariables>) {
          return Apollo.useLazyQuery<LanguageQuery, LanguageQueryVariables>(LanguageDocument, baseOptions);
        }
export type LanguageQueryHookResult = ReturnType<typeof useLanguageQuery>;
export type LanguageLazyQueryHookResult = ReturnType<typeof useLanguageLazyQuery>;
export type LanguageQueryResult = Apollo.QueryResult<LanguageQuery, LanguageQueryVariables>;