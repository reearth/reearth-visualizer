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
  Array: { input: any; output: any; }
  Cursor: { input: string; output: string; }
  DateTime: { input: Date; output: Date; }
  FileSize: { input: number; output: number; }
  JSON: { input: any; output: any; }
  Lang: { input: string; output: string; }
  TranslatedString: { input: { [lang in string]?: string } | null; output: { [lang in string]?: string } | null; }
  URL: { input: string; output: string; }
  Upload: { input: any; output: any; }
};

export type AddGeoJsonFeatureInput = {
  geometry: Scalars['JSON']['input'];
  layerId: Scalars['ID']['input'];
  properties?: InputMaybe<Scalars['JSON']['input']>;
  type: Scalars['String']['input'];
};

export type AddMemberToWorkspaceInput = {
  role: Role;
  userId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type AddMemberToWorkspacePayload = {
  __typename?: 'AddMemberToWorkspacePayload';
  workspace: Workspace;
};

export type AddNlsInfoboxBlockInput = {
  extensionId: Scalars['ID']['input'];
  index?: InputMaybe<Scalars['Int']['input']>;
  layerId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
};

export type AddNlsInfoboxBlockPayload = {
  __typename?: 'AddNLSInfoboxBlockPayload';
  infoboxBlock: InfoboxBlock;
  layer: NlsLayer;
};

export type AddNlsLayerSimpleInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  layerType: Scalars['String']['input'];
  sceneId: Scalars['ID']['input'];
  schema?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
  visible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AddNlsLayerSimplePayload = {
  __typename?: 'AddNLSLayerSimplePayload';
  layers: NlsLayerSimple;
};

export type AddPropertyItemInput = {
  index?: InputMaybe<Scalars['Int']['input']>;
  nameFieldType?: InputMaybe<ValueType>;
  nameFieldValue?: InputMaybe<Scalars['Any']['input']>;
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
};

export type AddStyleInput = {
  name: Scalars['String']['input'];
  sceneId: Scalars['ID']['input'];
  value: Scalars['JSON']['input'];
};

export type AddStylePayload = {
  __typename?: 'AddStylePayload';
  style: Style;
};

export type AddWidgetInput = {
  extensionId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
};

export type AddWidgetPayload = {
  __typename?: 'AddWidgetPayload';
  scene: Scene;
  sceneWidget: SceneWidget;
};

export type Asset = Node & {
  __typename?: 'Asset';
  contentType: Scalars['String']['output'];
  coreSupport: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projectId?: Maybe<Scalars['ID']['output']>;
  size: Scalars['FileSize']['output'];
  url: Scalars['String']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type AssetConnection = {
  __typename?: 'AssetConnection';
  edges: Array<AssetEdge>;
  nodes: Array<Maybe<Asset>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AssetEdge = {
  __typename?: 'AssetEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Asset>;
};

export type AssetSort = {
  direction: SortDirection;
  field: AssetSortField;
};

export enum AssetSortField {
  Date = 'DATE',
  Name = 'NAME',
  Size = 'SIZE'
}

export type Camera = {
  __typename?: 'Camera';
  altitude: Scalars['Float']['output'];
  fov: Scalars['Float']['output'];
  heading: Scalars['Float']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  pitch: Scalars['Float']['output'];
  roll: Scalars['Float']['output'];
};

export type ChangeCustomPropertyTitleInput = {
  layerId: Scalars['ID']['input'];
  newTitle: Scalars['String']['input'];
  oldTitle: Scalars['String']['input'];
  schema?: InputMaybe<Scalars['JSON']['input']>;
};

export type CreateAssetInput = {
  coreSupport: Scalars['Boolean']['input'];
  file: Scalars['Upload']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type CreateAssetPayload = {
  __typename?: 'CreateAssetPayload';
  asset: Asset;
};

export type CreateNlsInfoboxInput = {
  layerId: Scalars['ID']['input'];
};

export type CreateNlsInfoboxPayload = {
  __typename?: 'CreateNLSInfoboxPayload';
  layer: NlsLayer;
};

export type CreateNlsPhotoOverlayInput = {
  layerId: Scalars['ID']['input'];
};

export type CreateNlsPhotoOverlayPayload = {
  __typename?: 'CreateNLSPhotoOverlayPayload';
  layer: NlsLayer;
};

export type CreateProjectInput = {
  coreSupport?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  license?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  projectAlias?: InputMaybe<Scalars['String']['input']>;
  readme?: InputMaybe<Scalars['String']['input']>;
  topics?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
  visualizer: Visualizer;
  workspaceId: Scalars['ID']['input'];
};

export type CreateSceneInput = {
  projectId: Scalars['ID']['input'];
};

export type CreateScenePayload = {
  __typename?: 'CreateScenePayload';
  scene: Scene;
};

export type CreateStoryBlockInput = {
  extensionId: Scalars['ID']['input'];
  index?: InputMaybe<Scalars['Int']['input']>;
  pageId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type CreateStoryBlockPayload = {
  __typename?: 'CreateStoryBlockPayload';
  block: StoryBlock;
  index: Scalars['Int']['output'];
  page: StoryPage;
  story: Story;
};

export type CreateStoryInput = {
  index?: InputMaybe<Scalars['Int']['input']>;
  sceneId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type CreateStoryPageInput = {
  index?: InputMaybe<Scalars['Int']['input']>;
  layers?: InputMaybe<Array<Scalars['ID']['input']>>;
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
  swipeable?: InputMaybe<Scalars['Boolean']['input']>;
  swipeableLayers?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWorkspaceInput = {
  name: Scalars['String']['input'];
};

export type CreateWorkspacePayload = {
  __typename?: 'CreateWorkspacePayload';
  workspace: Workspace;
};

export type DeleteGeoJsonFeatureInput = {
  featureId: Scalars['ID']['input'];
  layerId: Scalars['ID']['input'];
};

export type DeleteGeoJsonFeaturePayload = {
  __typename?: 'DeleteGeoJSONFeaturePayload';
  deletedFeatureId: Scalars['ID']['output'];
};

export type DeleteMeInput = {
  userId: Scalars['ID']['input'];
};

export type DeleteMePayload = {
  __typename?: 'DeleteMePayload';
  userId: Scalars['ID']['output'];
};

export type DeleteProjectInput = {
  projectId: Scalars['ID']['input'];
};

export type DeleteProjectPayload = {
  __typename?: 'DeleteProjectPayload';
  projectId: Scalars['ID']['output'];
};

export type DeleteStoryInput = {
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type DeleteStoryPageInput = {
  pageId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type DeleteStoryPagePayload = {
  __typename?: 'DeleteStoryPagePayload';
  pageId: Scalars['ID']['output'];
  story: Story;
};

export type DeleteStoryPayload = {
  __typename?: 'DeleteStoryPayload';
  storyId: Scalars['ID']['output'];
};

export type DeleteWorkspaceInput = {
  workspaceId: Scalars['ID']['input'];
};

export type DeleteWorkspacePayload = {
  __typename?: 'DeleteWorkspacePayload';
  workspaceId: Scalars['ID']['output'];
};

export type DuplicateNlsLayerInput = {
  layerId: Scalars['ID']['input'];
};

export type DuplicateNlsLayerPayload = {
  __typename?: 'DuplicateNLSLayerPayload';
  layer: NlsLayer;
};

export type DuplicateStoryPageInput = {
  pageId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type DuplicateStyleInput = {
  styleId: Scalars['ID']['input'];
};

export type DuplicateStylePayload = {
  __typename?: 'DuplicateStylePayload';
  style: Style;
};

export type ExportProjectInput = {
  projectId: Scalars['ID']['input'];
};

export type ExportProjectPayload = {
  __typename?: 'ExportProjectPayload';
  projectDataPath: Scalars['String']['output'];
};

export type Feature = {
  __typename?: 'Feature';
  geometry: Geometry;
  id: Scalars['ID']['output'];
  properties?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export type FeatureCollection = {
  __typename?: 'FeatureCollection';
  features: Array<Feature>;
  type: Scalars['String']['output'];
};

export type Geometry = GeometryCollection | LineString | MultiPolygon | Point | Polygon;

export type GeometryCollection = {
  __typename?: 'GeometryCollection';
  geometries: Array<Geometry>;
  type: Scalars['String']['output'];
};

export type InfoboxBlock = {
  __typename?: 'InfoboxBlock';
  extension?: Maybe<PluginExtension>;
  extensionId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  layerId: Scalars['ID']['output'];
  plugin?: Maybe<Plugin>;
  pluginId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
};

export type InstallPluginInput = {
  pluginId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
};

export type InstallPluginPayload = {
  __typename?: 'InstallPluginPayload';
  scene: Scene;
  scenePlugin: ScenePlugin;
};

export type LatLng = {
  __typename?: 'LatLng';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type LatLngHeight = {
  __typename?: 'LatLngHeight';
  height: Scalars['Float']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type LineString = {
  __typename?: 'LineString';
  lineStringCoordinates: Array<Array<Scalars['Float']['output']>>;
  type: Scalars['String']['output'];
};

export enum ListOperation {
  Add = 'ADD',
  Move = 'MOVE',
  Remove = 'REMOVE'
}

export type Me = {
  __typename?: 'Me';
  auths: Array<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lang: Scalars['Lang']['output'];
  myWorkspace?: Maybe<Workspace>;
  myWorkspaceId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  theme: Theme;
  workspaces: Array<Workspace>;
};

export type MergedProperty = {
  __typename?: 'MergedProperty';
  groups: Array<MergedPropertyGroup>;
  original?: Maybe<Property>;
  originalId?: Maybe<Scalars['ID']['output']>;
  parent?: Maybe<Property>;
  parentId?: Maybe<Scalars['ID']['output']>;
  schema?: Maybe<PropertySchema>;
  schemaId?: Maybe<Scalars['ID']['output']>;
};

export type MergedPropertyField = {
  __typename?: 'MergedPropertyField';
  field?: Maybe<PropertySchemaField>;
  fieldId: Scalars['ID']['output'];
  overridden: Scalars['Boolean']['output'];
  schema?: Maybe<PropertySchema>;
  schemaId: Scalars['ID']['output'];
  type: ValueType;
  value?: Maybe<Scalars['Any']['output']>;
};

export type MergedPropertyGroup = {
  __typename?: 'MergedPropertyGroup';
  fields: Array<MergedPropertyField>;
  groups: Array<MergedPropertyGroup>;
  original?: Maybe<PropertyGroup>;
  originalId?: Maybe<Scalars['ID']['output']>;
  originalProperty?: Maybe<Property>;
  originalPropertyId?: Maybe<Scalars['ID']['output']>;
  parent?: Maybe<PropertyGroup>;
  parentId?: Maybe<Scalars['ID']['output']>;
  parentProperty?: Maybe<Property>;
  parentPropertyId?: Maybe<Scalars['ID']['output']>;
  schema?: Maybe<PropertySchema>;
  schemaGroupId: Scalars['ID']['output'];
  schemaId?: Maybe<Scalars['ID']['output']>;
};

export type MoveNlsInfoboxBlockInput = {
  index: Scalars['Int']['input'];
  infoboxBlockId: Scalars['ID']['input'];
  layerId: Scalars['ID']['input'];
};

export type MoveNlsInfoboxBlockPayload = {
  __typename?: 'MoveNLSInfoboxBlockPayload';
  index: Scalars['Int']['output'];
  infoboxBlockId: Scalars['ID']['output'];
  layer: NlsLayer;
};

export type MovePropertyItemInput = {
  index: Scalars['Int']['input'];
  itemId: Scalars['ID']['input'];
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
};

export type MoveStoryBlockInput = {
  blockId: Scalars['ID']['input'];
  index: Scalars['Int']['input'];
  pageId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type MoveStoryBlockPayload = {
  __typename?: 'MoveStoryBlockPayload';
  blockId: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  page: StoryPage;
  story: Story;
};

export type MoveStoryInput = {
  index: Scalars['Int']['input'];
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type MoveStoryPageInput = {
  index: Scalars['Int']['input'];
  pageId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type MoveStoryPagePayload = {
  __typename?: 'MoveStoryPagePayload';
  index: Scalars['Int']['output'];
  page: StoryPage;
  story: Story;
};

export type MoveStoryPayload = {
  __typename?: 'MoveStoryPayload';
  index: Scalars['Int']['output'];
  stories: Array<Story>;
  storyId: Scalars['ID']['output'];
};

export type MultiPolygon = {
  __typename?: 'MultiPolygon';
  multiPolygonCoordinates: Array<Array<Array<Array<Scalars['Float']['output']>>>>;
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addGeoJSONFeature: Feature;
  addMemberToWorkspace?: Maybe<AddMemberToWorkspacePayload>;
  addNLSInfoboxBlock?: Maybe<AddNlsInfoboxBlockPayload>;
  addNLSLayerSimple: AddNlsLayerSimplePayload;
  addPageLayer: StoryPagePayload;
  addPropertyItem?: Maybe<PropertyItemPayload>;
  addStyle?: Maybe<AddStylePayload>;
  addWidget?: Maybe<AddWidgetPayload>;
  changeCustomPropertyTitle: UpdateNlsLayerPayload;
  createAsset?: Maybe<CreateAssetPayload>;
  createNLSInfobox?: Maybe<CreateNlsInfoboxPayload>;
  createNLSPhotoOverlay?: Maybe<CreateNlsPhotoOverlayPayload>;
  createProject?: Maybe<ProjectPayload>;
  createScene?: Maybe<CreateScenePayload>;
  createStory: StoryPayload;
  createStoryBlock: CreateStoryBlockPayload;
  createStoryPage: StoryPagePayload;
  createWorkspace?: Maybe<CreateWorkspacePayload>;
  deleteGeoJSONFeature: DeleteGeoJsonFeaturePayload;
  deleteMe?: Maybe<DeleteMePayload>;
  deleteProject?: Maybe<DeleteProjectPayload>;
  deleteStory: DeleteStoryPayload;
  deleteWorkspace?: Maybe<DeleteWorkspacePayload>;
  duplicateNLSLayer: DuplicateNlsLayerPayload;
  duplicateStoryPage: StoryPagePayload;
  duplicateStyle?: Maybe<DuplicateStylePayload>;
  exportProject?: Maybe<ExportProjectPayload>;
  installPlugin?: Maybe<InstallPluginPayload>;
  moveNLSInfoboxBlock?: Maybe<MoveNlsInfoboxBlockPayload>;
  movePropertyItem?: Maybe<PropertyItemPayload>;
  moveStory: MoveStoryPayload;
  moveStoryBlock: MoveStoryBlockPayload;
  moveStoryPage: MoveStoryPagePayload;
  publishProject?: Maybe<ProjectPayload>;
  publishStory: StoryPayload;
  removeAsset?: Maybe<RemoveAssetPayload>;
  removeCustomProperty: UpdateNlsLayerPayload;
  removeMemberFromWorkspace?: Maybe<RemoveMemberFromWorkspacePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  removeNLSInfobox?: Maybe<RemoveNlsInfoboxPayload>;
  removeNLSInfoboxBlock?: Maybe<RemoveNlsInfoboxBlockPayload>;
  removeNLSLayer: RemoveNlsLayerPayload;
  removeNLSPhotoOverlay?: Maybe<RemoveNlsPhotoOverlayPayload>;
  removePageLayer: StoryPagePayload;
  removePropertyField?: Maybe<PropertyFieldPayload>;
  removePropertyItem?: Maybe<PropertyItemPayload>;
  removeStoryBlock: RemoveStoryBlockPayload;
  removeStoryPage: DeleteStoryPagePayload;
  removeStyle?: Maybe<RemoveStylePayload>;
  removeWidget?: Maybe<RemoveWidgetPayload>;
  signup?: Maybe<SignupPayload>;
  uninstallPlugin?: Maybe<UninstallPluginPayload>;
  unlinkPropertyValue?: Maybe<PropertyFieldPayload>;
  updateAsset?: Maybe<UpdateAssetPayload>;
  updateCustomProperties: UpdateNlsLayerPayload;
  updateGeoJSONFeature: Feature;
  updateMe?: Maybe<UpdateMePayload>;
  updateMemberOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateNLSLayer: UpdateNlsLayerPayload;
  updateNLSLayers: UpdateNlsLayersPayload;
  updateProject?: Maybe<ProjectPayload>;
  updateProjectMetadata?: Maybe<ProjectMetadataPayload>;
  updatePropertyItems?: Maybe<PropertyItemPayload>;
  updatePropertyValue?: Maybe<PropertyFieldPayload>;
  updateStory: StoryPayload;
  updateStoryPage: StoryPagePayload;
  updateStyle?: Maybe<UpdateStylePayload>;
  updateWidget?: Maybe<UpdateWidgetPayload>;
  updateWidgetAlignSystem?: Maybe<UpdateWidgetAlignSystemPayload>;
  updateWorkspace?: Maybe<UpdateWorkspacePayload>;
  upgradePlugin?: Maybe<UpgradePluginPayload>;
  uploadFileToProperty?: Maybe<PropertyFieldPayload>;
  uploadPlugin?: Maybe<UploadPluginPayload>;
};


export type MutationAddGeoJsonFeatureArgs = {
  input: AddGeoJsonFeatureInput;
};


export type MutationAddMemberToWorkspaceArgs = {
  input: AddMemberToWorkspaceInput;
};


export type MutationAddNlsInfoboxBlockArgs = {
  input: AddNlsInfoboxBlockInput;
};


export type MutationAddNlsLayerSimpleArgs = {
  input: AddNlsLayerSimpleInput;
};


export type MutationAddPageLayerArgs = {
  input: PageLayerInput;
};


export type MutationAddPropertyItemArgs = {
  input: AddPropertyItemInput;
};


export type MutationAddStyleArgs = {
  input: AddStyleInput;
};


export type MutationAddWidgetArgs = {
  input: AddWidgetInput;
};


export type MutationChangeCustomPropertyTitleArgs = {
  input: ChangeCustomPropertyTitleInput;
};


export type MutationCreateAssetArgs = {
  input: CreateAssetInput;
};


export type MutationCreateNlsInfoboxArgs = {
  input: CreateNlsInfoboxInput;
};


export type MutationCreateNlsPhotoOverlayArgs = {
  input: CreateNlsPhotoOverlayInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateSceneArgs = {
  input: CreateSceneInput;
};


export type MutationCreateStoryArgs = {
  input: CreateStoryInput;
};


export type MutationCreateStoryBlockArgs = {
  input: CreateStoryBlockInput;
};


export type MutationCreateStoryPageArgs = {
  input: CreateStoryPageInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteGeoJsonFeatureArgs = {
  input: DeleteGeoJsonFeatureInput;
};


export type MutationDeleteMeArgs = {
  input: DeleteMeInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationDeleteStoryArgs = {
  input: DeleteStoryInput;
};


export type MutationDeleteWorkspaceArgs = {
  input: DeleteWorkspaceInput;
};


export type MutationDuplicateNlsLayerArgs = {
  input: DuplicateNlsLayerInput;
};


export type MutationDuplicateStoryPageArgs = {
  input: DuplicateStoryPageInput;
};


export type MutationDuplicateStyleArgs = {
  input: DuplicateStyleInput;
};


export type MutationExportProjectArgs = {
  input: ExportProjectInput;
};


export type MutationInstallPluginArgs = {
  input: InstallPluginInput;
};


export type MutationMoveNlsInfoboxBlockArgs = {
  input: MoveNlsInfoboxBlockInput;
};


export type MutationMovePropertyItemArgs = {
  input: MovePropertyItemInput;
};


export type MutationMoveStoryArgs = {
  input: MoveStoryInput;
};


export type MutationMoveStoryBlockArgs = {
  input: MoveStoryBlockInput;
};


export type MutationMoveStoryPageArgs = {
  input: MoveStoryPageInput;
};


export type MutationPublishProjectArgs = {
  input: PublishProjectInput;
};


export type MutationPublishStoryArgs = {
  input: PublishStoryInput;
};


export type MutationRemoveAssetArgs = {
  input: RemoveAssetInput;
};


export type MutationRemoveCustomPropertyArgs = {
  input: RemoveCustomPropertyInput;
};


export type MutationRemoveMemberFromWorkspaceArgs = {
  input: RemoveMemberFromWorkspaceInput;
};


export type MutationRemoveMyAuthArgs = {
  input: RemoveMyAuthInput;
};


export type MutationRemoveNlsInfoboxArgs = {
  input: RemoveNlsInfoboxInput;
};


export type MutationRemoveNlsInfoboxBlockArgs = {
  input: RemoveNlsInfoboxBlockInput;
};


export type MutationRemoveNlsLayerArgs = {
  input: RemoveNlsLayerInput;
};


export type MutationRemoveNlsPhotoOverlayArgs = {
  input: RemoveNlsPhotoOverlayInput;
};


export type MutationRemovePageLayerArgs = {
  input: PageLayerInput;
};


export type MutationRemovePropertyFieldArgs = {
  input: RemovePropertyFieldInput;
};


export type MutationRemovePropertyItemArgs = {
  input: RemovePropertyItemInput;
};


export type MutationRemoveStoryBlockArgs = {
  input: RemoveStoryBlockInput;
};


export type MutationRemoveStoryPageArgs = {
  input: DeleteStoryPageInput;
};


export type MutationRemoveStyleArgs = {
  input: RemoveStyleInput;
};


export type MutationRemoveWidgetArgs = {
  input: RemoveWidgetInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUninstallPluginArgs = {
  input: UninstallPluginInput;
};


export type MutationUnlinkPropertyValueArgs = {
  input: UnlinkPropertyValueInput;
};


export type MutationUpdateAssetArgs = {
  input: UpdateAssetInput;
};


export type MutationUpdateCustomPropertiesArgs = {
  input: UpdateCustomPropertySchemaInput;
};


export type MutationUpdateGeoJsonFeatureArgs = {
  input: UpdateGeoJsonFeatureInput;
};


export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};


export type MutationUpdateMemberOfWorkspaceArgs = {
  input: UpdateMemberOfWorkspaceInput;
};


export type MutationUpdateNlsLayerArgs = {
  input: UpdateNlsLayerInput;
};


export type MutationUpdateNlsLayersArgs = {
  input: UpdateNlsLayersInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateProjectMetadataArgs = {
  input: UpdateProjectMetadataInput;
};


export type MutationUpdatePropertyItemsArgs = {
  input: UpdatePropertyItemInput;
};


export type MutationUpdatePropertyValueArgs = {
  input: UpdatePropertyValueInput;
};


export type MutationUpdateStoryArgs = {
  input: UpdateStoryInput;
};


export type MutationUpdateStoryPageArgs = {
  input: UpdateStoryPageInput;
};


export type MutationUpdateStyleArgs = {
  input: UpdateStyleInput;
};


export type MutationUpdateWidgetArgs = {
  input: UpdateWidgetInput;
};


export type MutationUpdateWidgetAlignSystemArgs = {
  input: UpdateWidgetAlignSystemInput;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};


export type MutationUpgradePluginArgs = {
  input: UpgradePluginInput;
};


export type MutationUploadFileToPropertyArgs = {
  input: UploadFileToPropertyInput;
};


export type MutationUploadPluginArgs = {
  input: UploadPluginInput;
};

export type NlsInfobox = {
  __typename?: 'NLSInfobox';
  blocks: Array<InfoboxBlock>;
  id: Scalars['ID']['output'];
  layerId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
};

export type NlsLayer = {
  config?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  index?: Maybe<Scalars['Int']['output']>;
  infobox?: Maybe<NlsInfobox>;
  isSketch: Scalars['Boolean']['output'];
  layerType: Scalars['String']['output'];
  photoOverlay?: Maybe<NlsPhotoOverlay>;
  sceneId: Scalars['ID']['output'];
  sketch?: Maybe<SketchInfo>;
  title: Scalars['String']['output'];
  visible: Scalars['Boolean']['output'];
};

export type NlsLayerGroup = NlsLayer & {
  __typename?: 'NLSLayerGroup';
  children: Array<Maybe<NlsLayer>>;
  childrenIds: Array<Scalars['ID']['output']>;
  config?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  index?: Maybe<Scalars['Int']['output']>;
  infobox?: Maybe<NlsInfobox>;
  isSketch: Scalars['Boolean']['output'];
  layerType: Scalars['String']['output'];
  photoOverlay?: Maybe<NlsPhotoOverlay>;
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
  sketch?: Maybe<SketchInfo>;
  title: Scalars['String']['output'];
  visible: Scalars['Boolean']['output'];
};

export type NlsLayerSimple = NlsLayer & {
  __typename?: 'NLSLayerSimple';
  config?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  index?: Maybe<Scalars['Int']['output']>;
  infobox?: Maybe<NlsInfobox>;
  isSketch: Scalars['Boolean']['output'];
  layerType: Scalars['String']['output'];
  photoOverlay?: Maybe<NlsPhotoOverlay>;
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
  sketch?: Maybe<SketchInfo>;
  title: Scalars['String']['output'];
  visible: Scalars['Boolean']['output'];
};

export type NlsPhotoOverlay = {
  __typename?: 'NLSPhotoOverlay';
  id: Scalars['ID']['output'];
  layerId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export enum NodeType {
  Asset = 'ASSET',
  LayerGroup = 'LAYER_GROUP',
  LayerItem = 'LAYER_ITEM',
  Plugin = 'PLUGIN',
  Project = 'PROJECT',
  Property = 'PROPERTY',
  PropertySchema = 'PROPERTY_SCHEMA',
  Scene = 'SCENE',
  User = 'USER',
  Workspace = 'WORKSPACE'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};

export type PageLayerInput = {
  layerId: Scalars['ID']['input'];
  pageId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
  swipeable?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Pagination = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type Plugin = {
  __typename?: 'Plugin';
  allTranslatedDescription?: Maybe<Scalars['TranslatedString']['output']>;
  allTranslatedName?: Maybe<Scalars['TranslatedString']['output']>;
  author: Scalars['String']['output'];
  description: Scalars['String']['output'];
  extensions: Array<PluginExtension>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  propertySchema?: Maybe<PropertySchema>;
  propertySchemaId?: Maybe<Scalars['ID']['output']>;
  repositoryUrl: Scalars['String']['output'];
  scene?: Maybe<Scene>;
  sceneId?: Maybe<Scalars['ID']['output']>;
  scenePlugin?: Maybe<ScenePlugin>;
  translatedDescription: Scalars['String']['output'];
  translatedName: Scalars['String']['output'];
  version: Scalars['String']['output'];
};


export type PluginScenePluginArgs = {
  sceneId?: InputMaybe<Scalars['ID']['input']>;
};


export type PluginTranslatedDescriptionArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};


export type PluginTranslatedNameArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};

export type PluginExtension = {
  __typename?: 'PluginExtension';
  allTranslatedDescription?: Maybe<Scalars['TranslatedString']['output']>;
  allTranslatedName?: Maybe<Scalars['TranslatedString']['output']>;
  description: Scalars['String']['output'];
  extensionId: Scalars['ID']['output'];
  icon: Scalars['String']['output'];
  name: Scalars['String']['output'];
  plugin?: Maybe<Plugin>;
  pluginId: Scalars['ID']['output'];
  propertySchema?: Maybe<PropertySchema>;
  propertySchemaId: Scalars['ID']['output'];
  sceneWidget?: Maybe<SceneWidget>;
  singleOnly?: Maybe<Scalars['Boolean']['output']>;
  translatedDescription: Scalars['String']['output'];
  translatedName: Scalars['String']['output'];
  type: PluginExtensionType;
  visualizer?: Maybe<Visualizer>;
  widgetLayout?: Maybe<WidgetLayout>;
};


export type PluginExtensionSceneWidgetArgs = {
  sceneId: Scalars['ID']['input'];
};


export type PluginExtensionTranslatedDescriptionArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};


export type PluginExtensionTranslatedNameArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};

export enum PluginExtensionType {
  Block = 'BLOCK',
  Infobox = 'INFOBOX',
  InfoboxBlock = 'InfoboxBlock',
  Photooverlay = 'PHOTOOVERLAY',
  Primitive = 'PRIMITIVE',
  Story = 'Story',
  StoryBlock = 'StoryBlock',
  StoryPage = 'StoryPage',
  Visualizer = 'VISUALIZER',
  Widget = 'WIDGET'
}

export type Point = {
  __typename?: 'Point';
  pointCoordinates: Array<Scalars['Float']['output']>;
  type: Scalars['String']['output'];
};

export type Policy = {
  __typename?: 'Policy';
  assetStorageSize?: Maybe<Scalars['FileSize']['output']>;
  blocksCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  layerCount?: Maybe<Scalars['Int']['output']>;
  memberCount?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  nlsLayersCount?: Maybe<Scalars['Int']['output']>;
  pageCount?: Maybe<Scalars['Int']['output']>;
  projectCount?: Maybe<Scalars['Int']['output']>;
  publishedProjectCount?: Maybe<Scalars['Int']['output']>;
};

export type Polygon = {
  __typename?: 'Polygon';
  polygonCoordinates: Array<Array<Array<Scalars['Float']['output']>>>;
  type: Scalars['String']['output'];
};

export enum Position {
  Left = 'LEFT',
  Right = 'RIGHT'
}

export type Project = Node & {
  __typename?: 'Project';
  alias: Scalars['String']['output'];
  basicAuthPassword: Scalars['String']['output'];
  basicAuthUsername: Scalars['String']['output'];
  coreSupport: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  enableGa: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['URL']['output']>;
  isArchived: Scalars['Boolean']['output'];
  isBasicAuthActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  metadata?: Maybe<ProjectMetadata>;
  name: Scalars['String']['output'];
  projectAlias: Scalars['String']['output'];
  publicDescription: Scalars['String']['output'];
  publicImage: Scalars['String']['output'];
  publicNoIndex: Scalars['Boolean']['output'];
  publicTitle: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  publishmentStatus: PublishmentStatus;
  scene?: Maybe<Scene>;
  starred: Scalars['Boolean']['output'];
  trackingId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: Scalars['String']['output'];
  visualizer: Visualizer;
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type ProjectAliasAvailability = {
  __typename?: 'ProjectAliasAvailability';
  alias: Scalars['String']['output'];
  available: Scalars['Boolean']['output'];
};

export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  edges: Array<ProjectEdge>;
  nodes: Array<Maybe<Project>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  cursor: Scalars['Cursor']['output'];
  node?: Maybe<Project>;
};

export enum ProjectImportStatus {
  Failed = 'FAILED',
  None = 'NONE',
  Processing = 'PROCESSING',
  Success = 'SUCCESS'
}

export type ProjectMetadata = {
  __typename?: 'ProjectMetadata';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  importStatus?: Maybe<ProjectImportStatus>;
  license?: Maybe<Scalars['String']['output']>;
  project: Scalars['ID']['output'];
  readme?: Maybe<Scalars['String']['output']>;
  topics?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workspace: Scalars['ID']['output'];
};

export type ProjectMetadataPayload = {
  __typename?: 'ProjectMetadataPayload';
  metadata: ProjectMetadata;
};

export type ProjectPayload = {
  __typename?: 'ProjectPayload';
  project: Project;
};

export type ProjectSort = {
  direction: SortDirection;
  field: ProjectSortField;
};

export enum ProjectSortField {
  Createdat = 'CREATEDAT',
  Name = 'NAME',
  Updatedat = 'UPDATEDAT'
}

export type Property = Node & {
  __typename?: 'Property';
  id: Scalars['ID']['output'];
  items: Array<PropertyItem>;
  merged?: Maybe<MergedProperty>;
  schema?: Maybe<PropertySchema>;
  schemaId: Scalars['ID']['output'];
};

export type PropertyCondition = {
  __typename?: 'PropertyCondition';
  fieldId: Scalars['ID']['output'];
  type: ValueType;
  value?: Maybe<Scalars['Any']['output']>;
};

export type PropertyField = {
  __typename?: 'PropertyField';
  field?: Maybe<PropertySchemaField>;
  fieldId: Scalars['ID']['output'];
  id: Scalars['String']['output'];
  parent?: Maybe<Property>;
  parentId: Scalars['ID']['output'];
  schema?: Maybe<PropertySchema>;
  schemaId: Scalars['ID']['output'];
  type: ValueType;
  value?: Maybe<Scalars['Any']['output']>;
};

export type PropertyFieldPayload = {
  __typename?: 'PropertyFieldPayload';
  property: Property;
  propertyField?: Maybe<PropertyField>;
};

export type PropertyGroup = {
  __typename?: 'PropertyGroup';
  fields: Array<PropertyField>;
  id: Scalars['ID']['output'];
  schema?: Maybe<PropertySchema>;
  schemaGroup?: Maybe<PropertySchemaGroup>;
  schemaGroupId: Scalars['ID']['output'];
  schemaId: Scalars['ID']['output'];
};

export type PropertyGroupList = {
  __typename?: 'PropertyGroupList';
  groups: Array<PropertyGroup>;
  id: Scalars['ID']['output'];
  schema?: Maybe<PropertySchema>;
  schemaGroup?: Maybe<PropertySchemaGroup>;
  schemaGroupId: Scalars['ID']['output'];
  schemaId: Scalars['ID']['output'];
};

export type PropertyItem = PropertyGroup | PropertyGroupList;

export type PropertyItemPayload = {
  __typename?: 'PropertyItemPayload';
  property: Property;
  propertyItem?: Maybe<PropertyItem>;
};

export type PropertyLinkableFields = {
  __typename?: 'PropertyLinkableFields';
  latlng?: Maybe<Scalars['ID']['output']>;
  latlngField?: Maybe<PropertySchemaField>;
  schema?: Maybe<PropertySchema>;
  schemaId: Scalars['ID']['output'];
  url?: Maybe<Scalars['ID']['output']>;
  urlField?: Maybe<PropertySchemaField>;
};

export type PropertySchema = {
  __typename?: 'PropertySchema';
  groups: Array<PropertySchemaGroup>;
  id: Scalars['ID']['output'];
  linkableFields: PropertyLinkableFields;
};

export type PropertySchemaField = {
  __typename?: 'PropertySchemaField';
  allTranslatedDescription?: Maybe<Scalars['TranslatedString']['output']>;
  allTranslatedPlaceholder?: Maybe<Scalars['TranslatedString']['output']>;
  allTranslatedTitle?: Maybe<Scalars['TranslatedString']['output']>;
  choices?: Maybe<Array<PropertySchemaFieldChoice>>;
  defaultValue?: Maybe<Scalars['Any']['output']>;
  description: Scalars['String']['output'];
  fieldId: Scalars['ID']['output'];
  isAvailableIf?: Maybe<PropertyCondition>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
  placeholder: Scalars['String']['output'];
  prefix?: Maybe<Scalars['String']['output']>;
  suffix?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  translatedDescription: Scalars['String']['output'];
  translatedPlaceholder: Scalars['String']['output'];
  translatedTitle: Scalars['String']['output'];
  type: ValueType;
  ui?: Maybe<PropertySchemaFieldUi>;
};


export type PropertySchemaFieldTranslatedDescriptionArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};


export type PropertySchemaFieldTranslatedPlaceholderArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};


export type PropertySchemaFieldTranslatedTitleArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};

export type PropertySchemaFieldChoice = {
  __typename?: 'PropertySchemaFieldChoice';
  allTranslatedTitle?: Maybe<Scalars['TranslatedString']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  title: Scalars['String']['output'];
  translatedTitle: Scalars['String']['output'];
};


export type PropertySchemaFieldChoiceTranslatedTitleArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};

export enum PropertySchemaFieldUi {
  CameraPose = 'CAMERA_POSE',
  Color = 'COLOR',
  Datetime = 'DATETIME',
  File = 'FILE',
  Image = 'IMAGE',
  Layer = 'LAYER',
  Margin = 'MARGIN',
  Multiline = 'MULTILINE',
  Padding = 'PADDING',
  PropertySelector = 'PROPERTY_SELECTOR',
  Range = 'RANGE',
  Selection = 'SELECTION',
  Slider = 'SLIDER',
  Video = 'VIDEO',
  Zoomlevel = 'ZOOMLEVEL'
}

export type PropertySchemaGroup = {
  __typename?: 'PropertySchemaGroup';
  allTranslatedTitle?: Maybe<Scalars['TranslatedString']['output']>;
  collection?: Maybe<Scalars['String']['output']>;
  fields: Array<PropertySchemaField>;
  isAvailableIf?: Maybe<PropertyCondition>;
  isList: Scalars['Boolean']['output'];
  representativeField?: Maybe<PropertySchemaField>;
  representativeFieldId?: Maybe<Scalars['ID']['output']>;
  schema?: Maybe<PropertySchema>;
  schemaGroupId: Scalars['ID']['output'];
  schemaId: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  translatedTitle: Scalars['String']['output'];
};


export type PropertySchemaGroupTranslatedTitleArgs = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
};

export type PublishProjectInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  status: PublishmentStatus;
};

export type PublishStoryInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  status: PublishmentStatus;
  storyId: Scalars['ID']['input'];
};

export enum PublishmentStatus {
  Limited = 'LIMITED',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type Query = {
  __typename?: 'Query';
  assets: AssetConnection;
  checkProjectAlias: ProjectAliasAvailability;
  checkSceneAlias: SceneAliasAvailability;
  checkStoryAlias: StoryAliasAvailability;
  deletedProjects: ProjectConnection;
  me?: Maybe<Me>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  plugin?: Maybe<Plugin>;
  plugins: Array<Plugin>;
  projects: ProjectConnection;
  propertySchema?: Maybe<PropertySchema>;
  propertySchemas: Array<PropertySchema>;
  scene?: Maybe<Scene>;
  searchUser?: Maybe<User>;
  starredProjects: ProjectConnection;
};


export type QueryAssetsArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<Pagination>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  sort?: InputMaybe<AssetSort>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryCheckProjectAliasArgs = {
  alias: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryCheckSceneAliasArgs = {
  alias: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryCheckStoryAliasArgs = {
  alias: Scalars['String']['input'];
  storyId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryDeletedProjectsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
  type: NodeType;
};


export type QueryNodesArgs = {
  id: Array<Scalars['ID']['input']>;
  type: NodeType;
};


export type QueryPluginArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPluginsArgs = {
  id: Array<Scalars['ID']['input']>;
};


export type QueryProjectsArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<Pagination>;
  sort?: InputMaybe<ProjectSort>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryPropertySchemaArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPropertySchemasArgs = {
  id: Array<Scalars['ID']['input']>;
};


export type QuerySceneArgs = {
  projectId: Scalars['ID']['input'];
};


export type QuerySearchUserArgs = {
  nameOrEmail: Scalars['String']['input'];
};


export type QueryStarredProjectsArgs = {
  workspaceId: Scalars['ID']['input'];
};

export type Rect = {
  __typename?: 'Rect';
  east: Scalars['Float']['output'];
  north: Scalars['Float']['output'];
  south: Scalars['Float']['output'];
  west: Scalars['Float']['output'];
};

export type RemoveAssetInput = {
  assetId: Scalars['ID']['input'];
};

export type RemoveAssetPayload = {
  __typename?: 'RemoveAssetPayload';
  assetId: Scalars['ID']['output'];
};

export type RemoveCustomPropertyInput = {
  layerId: Scalars['ID']['input'];
  removedTitle: Scalars['String']['input'];
  schema?: InputMaybe<Scalars['JSON']['input']>;
};

export type RemoveMemberFromWorkspaceInput = {
  userId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type RemoveMemberFromWorkspacePayload = {
  __typename?: 'RemoveMemberFromWorkspacePayload';
  workspace: Workspace;
};

export type RemoveMyAuthInput = {
  auth: Scalars['String']['input'];
};

export type RemoveNlsInfoboxBlockInput = {
  infoboxBlockId: Scalars['ID']['input'];
  layerId: Scalars['ID']['input'];
};

export type RemoveNlsInfoboxBlockPayload = {
  __typename?: 'RemoveNLSInfoboxBlockPayload';
  infoboxBlockId: Scalars['ID']['output'];
  layer: NlsLayer;
};

export type RemoveNlsInfoboxInput = {
  layerId: Scalars['ID']['input'];
};

export type RemoveNlsInfoboxPayload = {
  __typename?: 'RemoveNLSInfoboxPayload';
  layer: NlsLayer;
};

export type RemoveNlsLayerInput = {
  layerId: Scalars['ID']['input'];
};

export type RemoveNlsLayerPayload = {
  __typename?: 'RemoveNLSLayerPayload';
  layerId: Scalars['ID']['output'];
};

export type RemoveNlsPhotoOverlayInput = {
  layerId: Scalars['ID']['input'];
};

export type RemoveNlsPhotoOverlayPayload = {
  __typename?: 'RemoveNLSPhotoOverlayPayload';
  layer: NlsLayer;
};

export type RemovePropertyFieldInput = {
  fieldId: Scalars['ID']['input'];
  itemId?: InputMaybe<Scalars['ID']['input']>;
  propertyId: Scalars['ID']['input'];
  schemaGroupId?: InputMaybe<Scalars['ID']['input']>;
};

export type RemovePropertyItemInput = {
  itemId: Scalars['ID']['input'];
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
};

export type RemoveStoryBlockInput = {
  blockId: Scalars['ID']['input'];
  pageId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
};

export type RemoveStoryBlockPayload = {
  __typename?: 'RemoveStoryBlockPayload';
  blockId: Scalars['ID']['output'];
  page: StoryPage;
  story: Story;
};

export type RemoveStyleInput = {
  styleId: Scalars['ID']['input'];
};

export type RemoveStylePayload = {
  __typename?: 'RemoveStylePayload';
  styleId: Scalars['ID']['output'];
};

export type RemoveWidgetInput = {
  sceneId: Scalars['ID']['input'];
  widgetId: Scalars['ID']['input'];
};

export type RemoveWidgetPayload = {
  __typename?: 'RemoveWidgetPayload';
  scene: Scene;
  widgetId: Scalars['ID']['output'];
};

export enum Role {
  Maintainer = 'MAINTAINER',
  Owner = 'OWNER',
  Reader = 'READER',
  Writer = 'WRITER'
}

export type Scene = Node & {
  __typename?: 'Scene';
  alias: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  newLayers: Array<NlsLayer>;
  plugins: Array<ScenePlugin>;
  project?: Maybe<Project>;
  projectId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  stories: Array<Story>;
  styles: Array<Style>;
  updatedAt: Scalars['DateTime']['output'];
  widgetAlignSystem?: Maybe<WidgetAlignSystem>;
  widgets: Array<SceneWidget>;
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type SceneAliasAvailability = {
  __typename?: 'SceneAliasAvailability';
  alias: Scalars['String']['output'];
  available: Scalars['Boolean']['output'];
};

export type ScenePlugin = {
  __typename?: 'ScenePlugin';
  plugin?: Maybe<Plugin>;
  pluginId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId?: Maybe<Scalars['ID']['output']>;
};

export type SceneWidget = {
  __typename?: 'SceneWidget';
  enabled: Scalars['Boolean']['output'];
  extended: Scalars['Boolean']['output'];
  extension?: Maybe<PluginExtension>;
  extensionId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  plugin?: Maybe<Plugin>;
  pluginId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
};

export type SignupInput = {
  lang?: InputMaybe<Scalars['Lang']['input']>;
  secret?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Theme>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
};

export type SignupPayload = {
  __typename?: 'SignupPayload';
  user: User;
  workspace: Workspace;
};

export type SketchInfo = {
  __typename?: 'SketchInfo';
  customPropertySchema?: Maybe<Scalars['JSON']['output']>;
  featureCollection?: Maybe<FeatureCollection>;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Spacing = {
  __typename?: 'Spacing';
  bottom: Scalars['Float']['output'];
  left: Scalars['Float']['output'];
  right: Scalars['Float']['output'];
  top: Scalars['Float']['output'];
};

export type Story = Node & {
  __typename?: 'Story';
  alias: Scalars['String']['output'];
  basicAuthPassword: Scalars['String']['output'];
  basicAuthUsername: Scalars['String']['output'];
  bgColor?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  enableGa: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isBasicAuthActive: Scalars['Boolean']['output'];
  pages: Array<StoryPage>;
  panelPosition: Position;
  projectId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  publicDescription: Scalars['String']['output'];
  publicImage: Scalars['String']['output'];
  publicNoIndex: Scalars['Boolean']['output'];
  publicTitle: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  publishmentStatus: PublishmentStatus;
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  trackingId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StoryAliasAvailability = {
  __typename?: 'StoryAliasAvailability';
  alias: Scalars['String']['output'];
  available: Scalars['Boolean']['output'];
};

export type StoryBlock = Node & {
  __typename?: 'StoryBlock';
  extension?: Maybe<PluginExtension>;
  extensionId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  plugin?: Maybe<Plugin>;
  pluginId: Scalars['ID']['output'];
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
};

export type StoryPage = Node & {
  __typename?: 'StoryPage';
  blocks: Array<StoryBlock>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  layersIds: Array<Scalars['ID']['output']>;
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
  swipeable: Scalars['Boolean']['output'];
  swipeableLayersIds?: Maybe<Array<Scalars['ID']['output']>>;
  title: Scalars['String']['output'];
};

export type StoryPagePayload = {
  __typename?: 'StoryPagePayload';
  page: StoryPage;
  story: Story;
};

export type StoryPayload = {
  __typename?: 'StoryPayload';
  story: Story;
};

export type Style = {
  __typename?: 'Style';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  scene?: Maybe<Scene>;
  sceneId: Scalars['ID']['output'];
  value: Scalars['JSON']['output'];
};

export enum TextAlign {
  Center = 'CENTER',
  Justify = 'JUSTIFY',
  JustifyAll = 'JUSTIFY_ALL',
  Left = 'LEFT',
  Right = 'RIGHT'
}

export enum Theme {
  Dark = 'DARK',
  Default = 'DEFAULT',
  Light = 'LIGHT'
}

export type Timeline = {
  __typename?: 'Timeline';
  currentTime?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
};

export type Typography = {
  __typename?: 'Typography';
  bold?: Maybe<Scalars['Boolean']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  fontFamily?: Maybe<Scalars['String']['output']>;
  fontSize?: Maybe<Scalars['Int']['output']>;
  fontWeight?: Maybe<Scalars['String']['output']>;
  italic?: Maybe<Scalars['Boolean']['output']>;
  textAlign?: Maybe<TextAlign>;
  underline?: Maybe<Scalars['Boolean']['output']>;
};

export type UninstallPluginInput = {
  pluginId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
};

export type UninstallPluginPayload = {
  __typename?: 'UninstallPluginPayload';
  pluginId: Scalars['ID']['output'];
  scene: Scene;
};

export type UnlinkPropertyValueInput = {
  fieldId: Scalars['ID']['input'];
  itemId?: InputMaybe<Scalars['ID']['input']>;
  propertyId: Scalars['ID']['input'];
  schemaGroupId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateAssetInput = {
  assetId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateAssetPayload = {
  __typename?: 'UpdateAssetPayload';
  assetId: Scalars['ID']['output'];
  projectId?: Maybe<Scalars['ID']['output']>;
};

export type UpdateCustomPropertySchemaInput = {
  layerId: Scalars['ID']['input'];
  schema?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateGeoJsonFeatureInput = {
  featureId: Scalars['ID']['input'];
  geometry?: InputMaybe<Scalars['JSON']['input']>;
  layerId: Scalars['ID']['input'];
  properties?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateMeInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['Lang']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  passwordConfirmation?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Theme>;
};

export type UpdateMePayload = {
  __typename?: 'UpdateMePayload';
  me: Me;
};

export type UpdateMemberOfWorkspaceInput = {
  role: Role;
  userId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type UpdateMemberOfWorkspacePayload = {
  __typename?: 'UpdateMemberOfWorkspacePayload';
  workspace: Workspace;
};

export type UpdateNlsLayerInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  layerId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  visible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateNlsLayerPayload = {
  __typename?: 'UpdateNLSLayerPayload';
  layer: NlsLayer;
};

export type UpdateNlsLayersInput = {
  layers: Array<UpdateNlsLayerInput>;
};

export type UpdateNlsLayersPayload = {
  __typename?: 'UpdateNLSLayersPayload';
  layers: Array<NlsLayer>;
};

export type UpdateProjectInput = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  basicAuthPassword?: InputMaybe<Scalars['String']['input']>;
  basicAuthUsername?: InputMaybe<Scalars['String']['input']>;
  deleteImageUrl?: InputMaybe<Scalars['Boolean']['input']>;
  deletePublicImage?: InputMaybe<Scalars['Boolean']['input']>;
  deleted?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  enableGa?: InputMaybe<Scalars['Boolean']['input']>;
  imageUrl?: InputMaybe<Scalars['URL']['input']>;
  isBasicAuthActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  projectAlias?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  publicDescription?: InputMaybe<Scalars['String']['input']>;
  publicImage?: InputMaybe<Scalars['String']['input']>;
  publicNoIndex?: InputMaybe<Scalars['Boolean']['input']>;
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  sceneId?: InputMaybe<Scalars['ID']['input']>;
  starred?: InputMaybe<Scalars['Boolean']['input']>;
  trackingId?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectMetadataInput = {
  license?: InputMaybe<Scalars['String']['input']>;
  project: Scalars['ID']['input'];
  readme?: InputMaybe<Scalars['String']['input']>;
  topics?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePropertyItemInput = {
  operations: Array<UpdatePropertyItemOperationInput>;
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
};

export type UpdatePropertyItemOperationInput = {
  index?: InputMaybe<Scalars['Int']['input']>;
  itemId?: InputMaybe<Scalars['ID']['input']>;
  nameFieldType?: InputMaybe<ValueType>;
  nameFieldValue?: InputMaybe<Scalars['Any']['input']>;
  operation: ListOperation;
};

export type UpdatePropertyValueInput = {
  fieldId: Scalars['ID']['input'];
  itemId?: InputMaybe<Scalars['ID']['input']>;
  propertyId: Scalars['ID']['input'];
  schemaGroupId?: InputMaybe<Scalars['ID']['input']>;
  type: ValueType;
  value?: InputMaybe<Scalars['Any']['input']>;
};

export type UpdateStoryInput = {
  basicAuthPassword?: InputMaybe<Scalars['String']['input']>;
  basicAuthUsername?: InputMaybe<Scalars['String']['input']>;
  bgColor?: InputMaybe<Scalars['String']['input']>;
  deletePublicImage?: InputMaybe<Scalars['Boolean']['input']>;
  enableGa?: InputMaybe<Scalars['Boolean']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  isBasicAuthActive?: InputMaybe<Scalars['Boolean']['input']>;
  panelPosition?: InputMaybe<Position>;
  publicDescription?: InputMaybe<Scalars['String']['input']>;
  publicImage?: InputMaybe<Scalars['String']['input']>;
  publicNoIndex?: InputMaybe<Scalars['Boolean']['input']>;
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  trackingId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoryPageInput = {
  index?: InputMaybe<Scalars['Int']['input']>;
  layers?: InputMaybe<Array<Scalars['ID']['input']>>;
  pageId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
  storyId: Scalars['ID']['input'];
  swipeable?: InputMaybe<Scalars['Boolean']['input']>;
  swipeableLayers?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStyleInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  styleId: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateStylePayload = {
  __typename?: 'UpdateStylePayload';
  style: Style;
};

export type UpdateWidgetAlignSystemInput = {
  align?: InputMaybe<WidgetAreaAlign>;
  background?: InputMaybe<Scalars['String']['input']>;
  centered?: InputMaybe<Scalars['Boolean']['input']>;
  gap?: InputMaybe<Scalars['Int']['input']>;
  location: WidgetLocationInput;
  padding?: InputMaybe<WidgetAreaPaddingInput>;
  sceneId: Scalars['ID']['input'];
};

export type UpdateWidgetAlignSystemPayload = {
  __typename?: 'UpdateWidgetAlignSystemPayload';
  scene: Scene;
};

export type UpdateWidgetInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  extended?: InputMaybe<Scalars['Boolean']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<WidgetLocationInput>;
  sceneId: Scalars['ID']['input'];
  widgetId: Scalars['ID']['input'];
};

export type UpdateWidgetPayload = {
  __typename?: 'UpdateWidgetPayload';
  scene: Scene;
  sceneWidget: SceneWidget;
};

export type UpdateWorkspaceInput = {
  name: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type UpdateWorkspacePayload = {
  __typename?: 'UpdateWorkspacePayload';
  workspace: Workspace;
};

export type UpgradePluginInput = {
  pluginId: Scalars['ID']['input'];
  sceneId: Scalars['ID']['input'];
  toPluginId: Scalars['ID']['input'];
};

export type UpgradePluginPayload = {
  __typename?: 'UpgradePluginPayload';
  scene: Scene;
  scenePlugin: ScenePlugin;
};

export type UploadFileToPropertyInput = {
  fieldId: Scalars['ID']['input'];
  file: Scalars['Upload']['input'];
  itemId?: InputMaybe<Scalars['ID']['input']>;
  propertyId: Scalars['ID']['input'];
  schemaGroupId?: InputMaybe<Scalars['ID']['input']>;
};

export type UploadPluginInput = {
  file?: InputMaybe<Scalars['Upload']['input']>;
  sceneId: Scalars['ID']['input'];
  url?: InputMaybe<Scalars['URL']['input']>;
};

export type UploadPluginPayload = {
  __typename?: 'UploadPluginPayload';
  plugin: Plugin;
  scene: Scene;
  scenePlugin: ScenePlugin;
};

export type User = Node & {
  __typename?: 'User';
  email: Scalars['String']['output'];
  host?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export enum ValueType {
  Array = 'ARRAY',
  Bool = 'BOOL',
  Camera = 'CAMERA',
  Coordinates = 'COORDINATES',
  Latlng = 'LATLNG',
  Latlngheight = 'LATLNGHEIGHT',
  Number = 'NUMBER',
  Polygon = 'POLYGON',
  Rect = 'RECT',
  Ref = 'REF',
  Spacing = 'SPACING',
  String = 'STRING',
  Timeline = 'TIMELINE',
  Typography = 'TYPOGRAPHY',
  Url = 'URL'
}

export enum Visualizer {
  Cesium = 'CESIUM'
}

export type WidgetAlignSystem = {
  __typename?: 'WidgetAlignSystem';
  inner?: Maybe<WidgetZone>;
  outer?: Maybe<WidgetZone>;
};

export type WidgetArea = {
  __typename?: 'WidgetArea';
  align: WidgetAreaAlign;
  background?: Maybe<Scalars['String']['output']>;
  centered: Scalars['Boolean']['output'];
  gap?: Maybe<Scalars['Int']['output']>;
  padding?: Maybe<WidgetAreaPadding>;
  widgetIds: Array<Scalars['ID']['output']>;
};

export enum WidgetAreaAlign {
  Centered = 'CENTERED',
  End = 'END',
  Start = 'START'
}

export type WidgetAreaPadding = {
  __typename?: 'WidgetAreaPadding';
  bottom: Scalars['Int']['output'];
  left: Scalars['Int']['output'];
  right: Scalars['Int']['output'];
  top: Scalars['Int']['output'];
};

export type WidgetAreaPaddingInput = {
  bottom: Scalars['Int']['input'];
  left: Scalars['Int']['input'];
  right: Scalars['Int']['input'];
  top: Scalars['Int']['input'];
};

export enum WidgetAreaType {
  Bottom = 'BOTTOM',
  Middle = 'MIDDLE',
  Top = 'TOP'
}

export type WidgetExtendable = {
  __typename?: 'WidgetExtendable';
  horizontally: Scalars['Boolean']['output'];
  vertically: Scalars['Boolean']['output'];
};

export type WidgetLayout = {
  __typename?: 'WidgetLayout';
  defaultLocation?: Maybe<WidgetLocation>;
  extendable: WidgetExtendable;
  extended: Scalars['Boolean']['output'];
  floating: Scalars['Boolean']['output'];
};

export type WidgetLocation = {
  __typename?: 'WidgetLocation';
  area: WidgetAreaType;
  section: WidgetSectionType;
  zone: WidgetZoneType;
};

export type WidgetLocationInput = {
  area: WidgetAreaType;
  section: WidgetSectionType;
  zone: WidgetZoneType;
};

export type WidgetSection = {
  __typename?: 'WidgetSection';
  bottom?: Maybe<WidgetArea>;
  middle?: Maybe<WidgetArea>;
  top?: Maybe<WidgetArea>;
};

export enum WidgetSectionType {
  Center = 'CENTER',
  Left = 'LEFT',
  Right = 'RIGHT'
}

export type WidgetZone = {
  __typename?: 'WidgetZone';
  center?: Maybe<WidgetSection>;
  left?: Maybe<WidgetSection>;
  right?: Maybe<WidgetSection>;
};

export enum WidgetZoneType {
  Inner = 'INNER',
  Outer = 'OUTER'
}

export type Workspace = Node & {
  __typename?: 'Workspace';
  assets: AssetConnection;
  enableToCreatePrivateProject: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  members: Array<WorkspaceMember>;
  name: Scalars['String']['output'];
  personal: Scalars['Boolean']['output'];
  policy?: Maybe<Policy>;
  policyId?: Maybe<Scalars['ID']['output']>;
  projects: ProjectConnection;
};


export type WorkspaceAssetsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type WorkspaceProjectsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  role: Role;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type WidgetAlignSystemFragmentFragment = { __typename?: 'WidgetAlignSystem', outer?: { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null } | null, inner?: { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null } | null };

export type WidgetZoneFragmentFragment = { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null };

export type WidgetSectionFragmentFragment = { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null };

export type WidgetAreaFragmentFragment = { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null };

export type FeatureFragmentFragment = { __typename?: 'Feature', id: string, type: string, properties?: any | null, geometry: { __typename?: 'GeometryCollection', type: string, geometries: Array<{ __typename?: 'GeometryCollection' } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> }> } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> } };

type NlsLayerCommon_NlsLayerGroup_Fragment = { __typename?: 'NLSLayerGroup', id: string, index?: number | null, layerType: string, sceneId: string, config?: any | null, title: string, visible: boolean, isSketch: boolean, children: Array<{ __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } | null>, infobox?: { __typename?: 'NLSInfobox', sceneId: string, layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'InfoboxBlock', id: string, pluginId: string, extensionId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> } | null, photoOverlay?: { __typename?: 'NLSPhotoOverlay', layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null } | null, sketch?: { __typename?: 'SketchInfo', customPropertySchema?: any | null, featureCollection?: { __typename?: 'FeatureCollection', type: string, features: Array<{ __typename?: 'Feature', id: string, type: string, properties?: any | null, geometry: { __typename?: 'GeometryCollection', type: string, geometries: Array<{ __typename?: 'GeometryCollection' } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> }> } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> } }> } | null } | null };

type NlsLayerCommon_NlsLayerSimple_Fragment = { __typename?: 'NLSLayerSimple', id: string, index?: number | null, layerType: string, sceneId: string, config?: any | null, title: string, visible: boolean, isSketch: boolean, infobox?: { __typename?: 'NLSInfobox', sceneId: string, layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'InfoboxBlock', id: string, pluginId: string, extensionId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> } | null, photoOverlay?: { __typename?: 'NLSPhotoOverlay', layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null } | null, sketch?: { __typename?: 'SketchInfo', customPropertySchema?: any | null, featureCollection?: { __typename?: 'FeatureCollection', type: string, features: Array<{ __typename?: 'Feature', id: string, type: string, properties?: any | null, geometry: { __typename?: 'GeometryCollection', type: string, geometries: Array<{ __typename?: 'GeometryCollection' } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> }> } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> } }> } | null } | null };

export type NlsLayerCommonFragment = NlsLayerCommon_NlsLayerGroup_Fragment | NlsLayerCommon_NlsLayerSimple_Fragment;

export type NlsLayerStyleFragment = { __typename?: 'Style', id: string, name: string, value: any };

export type PluginFragmentFragment = { __typename?: 'Plugin', id: string, version: string, author: string, name: string, description: string, translatedName: string, translatedDescription: string, extensions: Array<{ __typename?: 'PluginExtension', extensionId: string, description: string, name: string, translatedDescription: string, translatedName: string, icon: string, singleOnly?: boolean | null, type: PluginExtensionType, widgetLayout?: { __typename?: 'WidgetLayout', extended: boolean, floating: boolean, extendable: { __typename?: 'WidgetExtendable', vertically: boolean, horizontally: boolean }, defaultLocation?: { __typename?: 'WidgetLocation', zone: WidgetZoneType, section: WidgetSectionType, area: WidgetAreaType } | null } | null }> };

export type ProjectFragmentFragment = { __typename?: 'Project', id: string, workspaceId: string, name: string, description: string, imageUrl?: string | null, isArchived: boolean, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string, publicTitle: string, publicDescription: string, publicImage: string, publishedAt?: Date | null, publicNoIndex: boolean, alias: string, enableGa: boolean, trackingId: string, publishmentStatus: PublishmentStatus, updatedAt: Date, createdAt: Date, coreSupport: boolean, starred: boolean, isDeleted: boolean, visualizer: Visualizer, visibility: string, projectAlias: string, metadata?: { __typename?: 'ProjectMetadata', id: string, project: string, workspace: string, readme?: string | null, license?: string | null, importStatus?: ProjectImportStatus | null, createdAt?: Date | null, updatedAt?: Date | null } | null };

export type ProjectMetadataFragmentFragment = { __typename?: 'ProjectMetadata', project: string, workspace: string, readme?: string | null, license?: string | null, importStatus?: ProjectImportStatus | null, createdAt?: Date | null, updatedAt?: Date | null };

export type PropertySchemaFieldFragmentFragment = { __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null };

export type PropertySchemaGroupFragmentFragment = { __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> };

export type PropertyFieldFragmentFragment = { __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null };

export type PropertyGroupFragmentFragment = { __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> };

type PropertyItemFragment_PropertyGroup_Fragment = { __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> };

type PropertyItemFragment_PropertyGroupList_Fragment = { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> };

export type PropertyItemFragmentFragment = PropertyItemFragment_PropertyGroup_Fragment | PropertyItemFragment_PropertyGroupList_Fragment;

export type PropertyFragmentWithoutSchemaFragment = { __typename?: 'Property', id: string, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> };

export type PropertyFragmentFragment = { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> };

export type MergedPropertyGroupCommonFragmentFragment = { __typename?: 'MergedPropertyGroup', schemaGroupId: string, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> };

export type MergedPropertyGroupFragmentFragment = { __typename?: 'MergedPropertyGroup', schemaGroupId: string, groups: Array<{ __typename?: 'MergedPropertyGroup', schemaGroupId: string, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> }>, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> };

export type MergedPropertyFragmentWithoutSchemaFragment = { __typename?: 'MergedProperty', originalId?: string | null, parentId?: string | null, groups: Array<{ __typename?: 'MergedPropertyGroup', schemaGroupId: string, groups: Array<{ __typename?: 'MergedPropertyGroup', schemaGroupId: string, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> }>, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> }> };

export type MergedPropertyFragmentFragment = { __typename?: 'MergedProperty', originalId?: string | null, parentId?: string | null, schema?: { __typename?: 'PropertySchema', id: string } | null, groups: Array<{ __typename?: 'MergedPropertyGroup', schemaGroupId: string, groups: Array<{ __typename?: 'MergedPropertyGroup', schemaGroupId: string, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> }>, fields: Array<{ __typename?: 'MergedPropertyField', fieldId: string, type: ValueType, overridden: boolean }> }> };

export type StoryFragmentFragment = { __typename?: 'Story', id: string, title: string, panelPosition: Position, bgColor?: string | null, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string, alias: string, publicTitle: string, publicDescription: string, publishmentStatus: PublishmentStatus, publicImage: string, publicNoIndex: boolean, enableGa: boolean, trackingId: string, pages: Array<{ __typename?: 'StoryPage', id: string, title: string, swipeable: boolean, propertyId: string, layersIds: Array<string>, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'StoryBlock', id: string, pluginId: string, extensionId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> }> };

export type StoryPageFragmentFragment = { __typename?: 'StoryPage', id: string, title: string, swipeable: boolean, propertyId: string, layersIds: Array<string>, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'StoryBlock', id: string, pluginId: string, extensionId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> };

export type GetAssetsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
  pagination?: InputMaybe<Pagination>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<AssetSort>;
}>;


export type GetAssetsQuery = { __typename?: 'Query', assets: { __typename?: 'AssetConnection', totalCount: number, edges: Array<{ __typename?: 'AssetEdge', cursor: string, node?: { __typename?: 'Asset', id: string, workspaceId: string, projectId?: string | null, name: string, size: number, url: string, createdAt: Date, contentType: string, coreSupport: boolean } | null }>, nodes: Array<{ __typename?: 'Asset', id: string, workspaceId: string, projectId?: string | null, name: string, size: number, url: string, createdAt: Date, contentType: string, coreSupport: boolean } | null>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type CreateAssetMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
  file: Scalars['Upload']['input'];
  coreSupport: Scalars['Boolean']['input'];
}>;


export type CreateAssetMutation = { __typename?: 'Mutation', createAsset?: { __typename?: 'CreateAssetPayload', asset: { __typename?: 'Asset', id: string, workspaceId: string, projectId?: string | null, name: string, size: number, url: string, contentType: string } } | null };

export type UpdateAssetMutationVariables = Exact<{
  assetId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpdateAssetMutation = { __typename?: 'Mutation', updateAsset?: { __typename: 'UpdateAssetPayload', assetId: string, projectId?: string | null } | null };

export type RemoveAssetMutationVariables = Exact<{
  assetId: Scalars['ID']['input'];
}>;


export type RemoveAssetMutation = { __typename?: 'Mutation', removeAsset?: { __typename?: 'RemoveAssetPayload', assetId: string } | null };

export type AddGeoJsonFeatureMutationVariables = Exact<{
  input: AddGeoJsonFeatureInput;
}>;


export type AddGeoJsonFeatureMutation = { __typename?: 'Mutation', addGeoJSONFeature: { __typename?: 'Feature', id: string, type: string, properties?: any | null } };

export type UpdateGeoJsonFeatureMutationVariables = Exact<{
  input: UpdateGeoJsonFeatureInput;
}>;


export type UpdateGeoJsonFeatureMutation = { __typename?: 'Mutation', updateGeoJSONFeature: { __typename?: 'Feature', id: string, type: string, properties?: any | null } };

export type DeleteGeoJsonFeatureMutationVariables = Exact<{
  input: DeleteGeoJsonFeatureInput;
}>;


export type DeleteGeoJsonFeatureMutation = { __typename?: 'Mutation', deleteGeoJSONFeature: { __typename?: 'DeleteGeoJSONFeaturePayload', deletedFeatureId: string } };

export type CreateNlsInfoboxMutationVariables = Exact<{
  input: CreateNlsInfoboxInput;
}>;


export type CreateNlsInfoboxMutation = { __typename?: 'Mutation', createNLSInfobox?: { __typename?: 'CreateNLSInfoboxPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } | null };

export type RemoveNlsInfoboxMutationVariables = Exact<{
  input: RemoveNlsInfoboxInput;
}>;


export type RemoveNlsInfoboxMutation = { __typename?: 'Mutation', removeNLSInfobox?: { __typename?: 'RemoveNLSInfoboxPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } | null };

export type AddNlsInfoboxBlockMutationVariables = Exact<{
  input: AddNlsInfoboxBlockInput;
}>;


export type AddNlsInfoboxBlockMutation = { __typename?: 'Mutation', addNLSInfoboxBlock?: { __typename?: 'AddNLSInfoboxBlockPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } | null };

export type MoveNlsInfoboxBlockMutationVariables = Exact<{
  input: MoveNlsInfoboxBlockInput;
}>;


export type MoveNlsInfoboxBlockMutation = { __typename?: 'Mutation', moveNLSInfoboxBlock?: { __typename?: 'MoveNLSInfoboxBlockPayload', index: number, infoboxBlockId: string, layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } | null };

export type RemoveNlsInfoboxBlockMutationVariables = Exact<{
  input: RemoveNlsInfoboxBlockInput;
}>;


export type RemoveNlsInfoboxBlockMutation = { __typename?: 'Mutation', removeNLSInfoboxBlock?: { __typename?: 'RemoveNLSInfoboxBlockPayload', infoboxBlockId: string, layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } | null };

export type AddNlsLayerSimpleMutationVariables = Exact<{
  input: AddNlsLayerSimpleInput;
}>;


export type AddNlsLayerSimpleMutation = { __typename?: 'Mutation', addNLSLayerSimple: { __typename?: 'AddNLSLayerSimplePayload', layers: { __typename?: 'NLSLayerSimple', id: string } } };

export type UpdateNlsLayerMutationVariables = Exact<{
  input: UpdateNlsLayerInput;
}>;


export type UpdateNlsLayerMutation = { __typename?: 'Mutation', updateNLSLayer: { __typename?: 'UpdateNLSLayerPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } };

export type UpdateNlsLayersMutationVariables = Exact<{
  input: UpdateNlsLayersInput;
}>;


export type UpdateNlsLayersMutation = { __typename?: 'Mutation', updateNLSLayers: { __typename?: 'UpdateNLSLayersPayload', layers: Array<{ __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string }> } };

export type RemoveNlsLayerMutationVariables = Exact<{
  input: RemoveNlsLayerInput;
}>;


export type RemoveNlsLayerMutation = { __typename?: 'Mutation', removeNLSLayer: { __typename?: 'RemoveNLSLayerPayload', layerId: string } };

export type UpdateCustomPropertiesMutationVariables = Exact<{
  input: UpdateCustomPropertySchemaInput;
}>;


export type UpdateCustomPropertiesMutation = { __typename?: 'Mutation', updateCustomProperties: { __typename?: 'UpdateNLSLayerPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } };

export type ChangeCustomPropertyTitleMutationVariables = Exact<{
  input: ChangeCustomPropertyTitleInput;
}>;


export type ChangeCustomPropertyTitleMutation = { __typename?: 'Mutation', changeCustomPropertyTitle: { __typename?: 'UpdateNLSLayerPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } };

export type RemoveCustomPropertyMutationVariables = Exact<{
  input: RemoveCustomPropertyInput;
}>;


export type RemoveCustomPropertyMutation = { __typename?: 'Mutation', removeCustomProperty: { __typename?: 'UpdateNLSLayerPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } };

export type AddStyleMutationVariables = Exact<{
  input: AddStyleInput;
}>;


export type AddStyleMutation = { __typename?: 'Mutation', addStyle?: { __typename?: 'AddStylePayload', style: { __typename?: 'Style', id: string, name: string } } | null };

export type UpdateStyleMutationVariables = Exact<{
  input: UpdateStyleInput;
}>;


export type UpdateStyleMutation = { __typename?: 'Mutation', updateStyle?: { __typename?: 'UpdateStylePayload', style: { __typename?: 'Style', id: string, name: string } } | null };

export type RemoveStyleMutationVariables = Exact<{
  input: RemoveStyleInput;
}>;


export type RemoveStyleMutation = { __typename?: 'Mutation', removeStyle?: { __typename?: 'RemoveStylePayload', styleId: string } | null };

export type CreateNlsPhotoOverlayMutationVariables = Exact<{
  input: CreateNlsPhotoOverlayInput;
}>;


export type CreateNlsPhotoOverlayMutation = { __typename?: 'Mutation', createNLSPhotoOverlay?: { __typename?: 'CreateNLSPhotoOverlayPayload', layer: { __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } } | null };

export type InstallPluginMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
}>;


export type InstallPluginMutation = { __typename?: 'Mutation', installPlugin?: { __typename?: 'InstallPluginPayload', scenePlugin: { __typename?: 'ScenePlugin', pluginId: string, propertyId?: string | null } } | null };

export type UpgradePluginMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
  toPluginId: Scalars['ID']['input'];
}>;


export type UpgradePluginMutation = { __typename?: 'Mutation', upgradePlugin?: { __typename?: 'UpgradePluginPayload', scenePlugin: { __typename?: 'ScenePlugin', pluginId: string, propertyId?: string | null } } | null };

export type UploadPluginMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  file?: InputMaybe<Scalars['Upload']['input']>;
  url?: InputMaybe<Scalars['URL']['input']>;
}>;


export type UploadPluginMutation = { __typename?: 'Mutation', uploadPlugin?: { __typename?: 'UploadPluginPayload', plugin: { __typename?: 'Plugin', id: string, name: string, version: string, description: string, author: string }, scenePlugin: { __typename?: 'ScenePlugin', pluginId: string, propertyId?: string | null } } | null };

export type UninstallPluginMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
}>;


export type UninstallPluginMutation = { __typename?: 'Mutation', uninstallPlugin?: { __typename?: 'UninstallPluginPayload', pluginId: string } | null };

export type GetProjectQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type GetProjectQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string } | { __typename?: 'Project', id: string, workspaceId: string, name: string, description: string, imageUrl?: string | null, isArchived: boolean, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string, publicTitle: string, publicDescription: string, publicImage: string, publishedAt?: Date | null, publicNoIndex: boolean, alias: string, enableGa: boolean, trackingId: string, publishmentStatus: PublishmentStatus, updatedAt: Date, createdAt: Date, coreSupport: boolean, starred: boolean, isDeleted: boolean, visualizer: Visualizer, visibility: string, projectAlias: string, scene?: { __typename?: 'Scene', id: string, alias: string } | null, metadata?: { __typename?: 'ProjectMetadata', id: string, project: string, workspace: string, readme?: string | null, license?: string | null, importStatus?: ProjectImportStatus | null, createdAt?: Date | null, updatedAt?: Date | null } | null } | { __typename?: 'Property', id: string } | { __typename?: 'Scene', id: string } | { __typename?: 'Story', id: string } | { __typename?: 'StoryBlock', id: string } | { __typename?: 'StoryPage', id: string } | { __typename?: 'User', id: string } | { __typename?: 'Workspace', id: string } | null };

export type GetProjectsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  pagination?: InputMaybe<Pagination>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ProjectSort>;
}>;


export type GetProjectsQuery = { __typename?: 'Query', projects: { __typename?: 'ProjectConnection', totalCount: number, edges: Array<{ __typename?: 'ProjectEdge', node?: { __typename?: 'Project', id: string, workspaceId: string, name: string, description: string, imageUrl?: string | null, isArchived: boolean, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string, publicTitle: string, publicDescription: string, publicImage: string, publishedAt?: Date | null, publicNoIndex: boolean, alias: string, enableGa: boolean, trackingId: string, publishmentStatus: PublishmentStatus, updatedAt: Date, createdAt: Date, coreSupport: boolean, starred: boolean, isDeleted: boolean, visualizer: Visualizer, visibility: string, projectAlias: string, scene?: { __typename?: 'Scene', id: string, alias: string } | null, metadata?: { __typename?: 'ProjectMetadata', id: string, project: string, workspace: string, readme?: string | null, license?: string | null, importStatus?: ProjectImportStatus | null, createdAt?: Date | null, updatedAt?: Date | null } | null } | null }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null } } };

export type CheckProjectAliasQueryVariables = Exact<{
  alias: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CheckProjectAliasQuery = { __typename?: 'Query', checkProjectAlias: { __typename?: 'ProjectAliasAvailability', alias: string, available: boolean } };

export type CreateProjectMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  visualizer: Visualizer;
  name: Scalars['String']['input'];
  description: Scalars['String']['input'];
  coreSupport?: InputMaybe<Scalars['Boolean']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
  projectAlias?: InputMaybe<Scalars['String']['input']>;
  readme?: InputMaybe<Scalars['String']['input']>;
  license?: InputMaybe<Scalars['String']['input']>;
  topics?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, description: string, coreSupport: boolean } } | null };

export type UpdateProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['URL']['input']>;
  publicTitle?: InputMaybe<Scalars['String']['input']>;
  publicDescription?: InputMaybe<Scalars['String']['input']>;
  publicImage?: InputMaybe<Scalars['String']['input']>;
  deleteImageUrl?: InputMaybe<Scalars['Boolean']['input']>;
  deletePublicImage?: InputMaybe<Scalars['Boolean']['input']>;
  enableGa?: InputMaybe<Scalars['Boolean']['input']>;
  trackingId?: InputMaybe<Scalars['String']['input']>;
  starred?: InputMaybe<Scalars['Boolean']['input']>;
  deleted?: InputMaybe<Scalars['Boolean']['input']>;
  projectAlias?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, workspaceId: string, name: string, description: string, imageUrl?: string | null, isArchived: boolean, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string, publicTitle: string, publicDescription: string, publicImage: string, publishedAt?: Date | null, publicNoIndex: boolean, alias: string, enableGa: boolean, trackingId: string, publishmentStatus: PublishmentStatus, updatedAt: Date, createdAt: Date, coreSupport: boolean, starred: boolean, isDeleted: boolean, visualizer: Visualizer, visibility: string, projectAlias: string, metadata?: { __typename?: 'ProjectMetadata', id: string, project: string, workspace: string, readme?: string | null, license?: string | null, importStatus?: ProjectImportStatus | null, createdAt?: Date | null, updatedAt?: Date | null } | null } } | null };

export type UpdateProjectBasicAuthMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  isBasicAuthActive?: InputMaybe<Scalars['Boolean']['input']>;
  basicAuthUsername?: InputMaybe<Scalars['String']['input']>;
  basicAuthPassword?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateProjectBasicAuthMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, name: string, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string } } | null };

export type PublishProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  alias?: InputMaybe<Scalars['String']['input']>;
  status: PublishmentStatus;
}>;


export type PublishProjectMutation = { __typename?: 'Mutation', publishProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, alias: string, publishmentStatus: PublishmentStatus } } | null };

export type ArchiveProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  archived: Scalars['Boolean']['input'];
}>;


export type ArchiveProjectMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'ProjectPayload', project: { __typename?: 'Project', id: string, isArchived: boolean } } | null };

export type DeleteProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', deleteProject?: { __typename?: 'DeleteProjectPayload', projectId: string } | null };

export type GetStarredProjectsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetStarredProjectsQuery = { __typename?: 'Query', starredProjects: { __typename?: 'ProjectConnection', totalCount: number, nodes: Array<{ __typename?: 'Project', id: string, name: string, starred: boolean, scene?: { __typename?: 'Scene', id: string } | null } | null> } };

export type ExportProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ExportProjectMutation = { __typename?: 'Mutation', exportProject?: { __typename?: 'ExportProjectPayload', projectDataPath: string } | null };

export type GetDeletedProjectsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type GetDeletedProjectsQuery = { __typename?: 'Query', deletedProjects: { __typename?: 'ProjectConnection', totalCount: number, nodes: Array<{ __typename?: 'Project', id: string, name: string, isDeleted: boolean, imageUrl?: string | null } | null> } };

export type UpdateProjectMetadataMutationVariables = Exact<{
  project: Scalars['ID']['input'];
  readme?: InputMaybe<Scalars['String']['input']>;
  license?: InputMaybe<Scalars['String']['input']>;
  topics?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateProjectMetadataMutation = { __typename?: 'Mutation', updateProjectMetadata?: { __typename?: 'ProjectMetadataPayload', metadata: { __typename?: 'ProjectMetadata', id: string, project: string, workspace: string, readme?: string | null, license?: string | null, importStatus?: ProjectImportStatus | null, createdAt?: Date | null, updatedAt?: Date | null } } | null };

export type UpdatePropertyValueMutationVariables = Exact<{
  propertyId: Scalars['ID']['input'];
  schemaGroupId?: InputMaybe<Scalars['ID']['input']>;
  itemId?: InputMaybe<Scalars['ID']['input']>;
  fieldId: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
  type: ValueType;
  lang?: InputMaybe<Scalars['Lang']['input']>;
}>;


export type UpdatePropertyValueMutation = { __typename?: 'Mutation', updatePropertyValue?: { __typename?: 'PropertyFieldPayload', property: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } } | null };

export type AddPropertyItemMutationVariables = Exact<{
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
  lang?: InputMaybe<Scalars['Lang']['input']>;
}>;


export type AddPropertyItemMutation = { __typename?: 'Mutation', addPropertyItem?: { __typename?: 'PropertyItemPayload', property: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } } | null };

export type RemovePropertyItemMutationVariables = Exact<{
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  lang?: InputMaybe<Scalars['Lang']['input']>;
}>;


export type RemovePropertyItemMutation = { __typename?: 'Mutation', removePropertyItem?: { __typename?: 'PropertyItemPayload', property: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } } | null };

export type MovePropertyItemMutationVariables = Exact<{
  propertyId: Scalars['ID']['input'];
  schemaGroupId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  index: Scalars['Int']['input'];
  lang?: InputMaybe<Scalars['Lang']['input']>;
}>;


export type MovePropertyItemMutation = { __typename?: 'Mutation', movePropertyItem?: { __typename?: 'PropertyItemPayload', property: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } } | null };

export type GetSceneQueryVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  lang?: InputMaybe<Scalars['Lang']['input']>;
}>;


export type GetSceneQuery = { __typename?: 'Query', node?: { __typename?: 'Asset', id: string } | { __typename?: 'Project', id: string } | { __typename?: 'Property', id: string } | { __typename?: 'Scene', workspaceId: string, projectId: string, alias: string, id: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, plugins: Array<{ __typename?: 'ScenePlugin', property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, plugin?: { __typename?: 'Plugin', id: string, version: string, author: string, name: string, description: string, translatedName: string, translatedDescription: string, extensions: Array<{ __typename?: 'PluginExtension', extensionId: string, description: string, name: string, translatedDescription: string, translatedName: string, icon: string, singleOnly?: boolean | null, type: PluginExtensionType, widgetLayout?: { __typename?: 'WidgetLayout', extended: boolean, floating: boolean, extendable: { __typename?: 'WidgetExtendable', vertically: boolean, horizontally: boolean }, defaultLocation?: { __typename?: 'WidgetLocation', zone: WidgetZoneType, section: WidgetSectionType, area: WidgetAreaType } | null } | null }> } | null }>, widgets: Array<{ __typename?: 'SceneWidget', id: string, enabled: boolean, extended: boolean, pluginId: string, extensionId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }>, widgetAlignSystem?: { __typename?: 'WidgetAlignSystem', outer?: { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null } | null, inner?: { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null } | null } | null, stories: Array<{ __typename?: 'Story', id: string, title: string, panelPosition: Position, bgColor?: string | null, isBasicAuthActive: boolean, basicAuthUsername: string, basicAuthPassword: string, alias: string, publicTitle: string, publicDescription: string, publishmentStatus: PublishmentStatus, publicImage: string, publicNoIndex: boolean, enableGa: boolean, trackingId: string, pages: Array<{ __typename?: 'StoryPage', id: string, title: string, swipeable: boolean, propertyId: string, layersIds: Array<string>, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'StoryBlock', id: string, pluginId: string, extensionId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> }> }>, newLayers: Array<{ __typename?: 'NLSLayerGroup', id: string, index?: number | null, layerType: string, sceneId: string, config?: any | null, title: string, visible: boolean, isSketch: boolean, children: Array<{ __typename?: 'NLSLayerGroup', id: string } | { __typename?: 'NLSLayerSimple', id: string } | null>, infobox?: { __typename?: 'NLSInfobox', sceneId: string, layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'InfoboxBlock', id: string, pluginId: string, extensionId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> } | null, photoOverlay?: { __typename?: 'NLSPhotoOverlay', layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null } | null, sketch?: { __typename?: 'SketchInfo', customPropertySchema?: any | null, featureCollection?: { __typename?: 'FeatureCollection', type: string, features: Array<{ __typename?: 'Feature', id: string, type: string, properties?: any | null, geometry: { __typename?: 'GeometryCollection', type: string, geometries: Array<{ __typename?: 'GeometryCollection' } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> }> } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> } }> } | null } | null } | { __typename?: 'NLSLayerSimple', id: string, index?: number | null, layerType: string, sceneId: string, config?: any | null, title: string, visible: boolean, isSketch: boolean, infobox?: { __typename?: 'NLSInfobox', sceneId: string, layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null, blocks: Array<{ __typename?: 'InfoboxBlock', id: string, pluginId: string, extensionId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> } | null, photoOverlay?: { __typename?: 'NLSPhotoOverlay', layerId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null } | null, sketch?: { __typename?: 'SketchInfo', customPropertySchema?: any | null, featureCollection?: { __typename?: 'FeatureCollection', type: string, features: Array<{ __typename?: 'Feature', id: string, type: string, properties?: any | null, geometry: { __typename?: 'GeometryCollection', type: string, geometries: Array<{ __typename?: 'GeometryCollection' } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> }> } | { __typename?: 'LineString', type: string, lineStringCoordinates: Array<Array<number>> } | { __typename?: 'MultiPolygon', type: string, multiPolygonCoordinates: Array<Array<Array<Array<number>>>> } | { __typename?: 'Point', type: string, pointCoordinates: Array<number> } | { __typename?: 'Polygon', type: string, polygonCoordinates: Array<Array<Array<number>>> } }> } | null } | null }>, styles: Array<{ __typename?: 'Style', id: string, name: string, value: any }> } | { __typename?: 'Story', id: string } | { __typename?: 'StoryBlock', id: string } | { __typename?: 'StoryPage', id: string } | { __typename?: 'User', id: string } | { __typename?: 'Workspace', id: string } | null };

export type CreateSceneMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type CreateSceneMutation = { __typename?: 'Mutation', createScene?: { __typename?: 'CreateScenePayload', scene: { __typename?: 'Scene', id: string } } | null };

export type CheckSceneAliasQueryVariables = Exact<{
  alias: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CheckSceneAliasQuery = { __typename?: 'Query', checkSceneAlias: { __typename?: 'SceneAliasAvailability', alias: string, available: boolean } };

export type CreateStoryMutationVariables = Exact<{
  input: CreateStoryInput;
}>;


export type CreateStoryMutation = { __typename?: 'Mutation', createStory: { __typename?: 'StoryPayload', story: { __typename?: 'Story', id: string } } };

export type UpdateStoryMutationVariables = Exact<{
  input: UpdateStoryInput;
}>;


export type UpdateStoryMutation = { __typename?: 'Mutation', updateStory: { __typename?: 'StoryPayload', story: { __typename?: 'Story', id: string } } };

export type DeleteStoryMutationVariables = Exact<{
  input: DeleteStoryInput;
}>;


export type DeleteStoryMutation = { __typename?: 'Mutation', deleteStory: { __typename?: 'DeleteStoryPayload', storyId: string } };

export type PublishStoryMutationVariables = Exact<{
  storyId: Scalars['ID']['input'];
  alias?: InputMaybe<Scalars['String']['input']>;
  status: PublishmentStatus;
}>;


export type PublishStoryMutation = { __typename?: 'Mutation', publishStory: { __typename?: 'StoryPayload', story: { __typename?: 'Story', id: string, alias: string, publishmentStatus: PublishmentStatus } } };

export type CreateStoryPageMutationVariables = Exact<{
  input: CreateStoryPageInput;
}>;


export type CreateStoryPageMutation = { __typename?: 'Mutation', createStoryPage: { __typename?: 'StoryPagePayload', story: { __typename?: 'Story', id: string } } };

export type UpdateStoryPageMutationVariables = Exact<{
  input: UpdateStoryPageInput;
}>;


export type UpdateStoryPageMutation = { __typename?: 'Mutation', updateStoryPage: { __typename?: 'StoryPagePayload', story: { __typename?: 'Story', id: string } } };

export type DeleteStoryPageMutationVariables = Exact<{
  input: DeleteStoryPageInput;
}>;


export type DeleteStoryPageMutation = { __typename?: 'Mutation', removeStoryPage: { __typename?: 'DeleteStoryPagePayload', story: { __typename?: 'Story', id: string } } };

export type MoveStoryPageMutationVariables = Exact<{
  input: MoveStoryPageInput;
}>;


export type MoveStoryPageMutation = { __typename?: 'Mutation', moveStoryPage: { __typename?: 'MoveStoryPagePayload', story: { __typename?: 'Story', id: string } } };

export type CreateStoryBlockMutationVariables = Exact<{
  input: CreateStoryBlockInput;
}>;


export type CreateStoryBlockMutation = { __typename?: 'Mutation', createStoryBlock: { __typename?: 'CreateStoryBlockPayload', index: number, block: { __typename?: 'StoryBlock', id: string }, page: { __typename?: 'StoryPage', id: string }, story: { __typename?: 'Story', id: string } } };

export type MoveStoryBlockMutationVariables = Exact<{
  input: MoveStoryBlockInput;
}>;


export type MoveStoryBlockMutation = { __typename?: 'Mutation', moveStoryBlock: { __typename?: 'MoveStoryBlockPayload', index: number, blockId: string, page: { __typename?: 'StoryPage', id: string }, story: { __typename?: 'Story', id: string } } };

export type RemoveStoryBlockMutationVariables = Exact<{
  input: RemoveStoryBlockInput;
}>;


export type RemoveStoryBlockMutation = { __typename?: 'Mutation', removeStoryBlock: { __typename?: 'RemoveStoryBlockPayload', blockId: string, page: { __typename?: 'StoryPage', id: string }, story: { __typename?: 'Story', id: string } } };

export type CheckStoryAliasQueryVariables = Exact<{
  alias: Scalars['String']['input'];
  storyId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CheckStoryAliasQuery = { __typename?: 'Query', checkStoryAlias: { __typename?: 'StoryAliasAvailability', alias: string, available: boolean } };

export type WorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null };

export type GetWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspacesQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, myWorkspace?: { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } | null, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null }> } | null };

export type GetUserBySearchQueryVariables = Exact<{
  nameOrEmail: Scalars['String']['input'];
}>;


export type GetUserBySearchQuery = { __typename?: 'Query', searchUser?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, auths: Array<string>, myWorkspace?: { __typename?: 'Workspace', id: string, name: string, policyId?: string | null, enableToCreatePrivateProject: boolean, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } | null, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, enableToCreatePrivateProject: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null }> } | null };

export type UpdateMeMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['Lang']['input']>;
  theme?: InputMaybe<Theme>;
  password?: InputMaybe<Scalars['String']['input']>;
  passwordConfirmation?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateMeMutation = { __typename?: 'Mutation', updateMe?: { __typename?: 'UpdateMePayload', me: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, myWorkspace?: { __typename?: 'Workspace', id: string, name: string } | null } } | null };

export type DeleteMeMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type DeleteMeMutation = { __typename?: 'Mutation', deleteMe?: { __typename?: 'DeleteMePayload', userId: string } | null };

export type AddWidgetMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  pluginId: Scalars['ID']['input'];
  extensionId: Scalars['ID']['input'];
  lang?: InputMaybe<Scalars['Lang']['input']>;
}>;


export type AddWidgetMutation = { __typename?: 'Mutation', addWidget?: { __typename?: 'AddWidgetPayload', scene: { __typename?: 'Scene', id: string, widgets: Array<{ __typename?: 'SceneWidget', id: string, enabled: boolean, pluginId: string, extensionId: string, propertyId: string, property?: { __typename?: 'Property', id: string, schema?: { __typename?: 'PropertySchema', id: string, groups: Array<{ __typename?: 'PropertySchemaGroup', schemaGroupId: string, title?: string | null, collection?: string | null, translatedTitle: string, isList: boolean, representativeFieldId?: string | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null, fields: Array<{ __typename?: 'PropertySchemaField', fieldId: string, title: string, description: string, placeholder: string, translatedTitle: string, translatedDescription: string, translatedPlaceholder: string, prefix?: string | null, suffix?: string | null, type: ValueType, defaultValue?: any | null, ui?: PropertySchemaFieldUi | null, min?: number | null, max?: number | null, choices?: Array<{ __typename?: 'PropertySchemaFieldChoice', key: string, icon?: string | null, title: string, translatedTitle: string }> | null, isAvailableIf?: { __typename?: 'PropertyCondition', fieldId: string, type: ValueType, value?: any | null } | null }> }> } | null, items: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> } | { __typename?: 'PropertyGroupList', id: string, schemaGroupId: string, groups: Array<{ __typename?: 'PropertyGroup', id: string, schemaGroupId: string, fields: Array<{ __typename?: 'PropertyField', id: string, fieldId: string, type: ValueType, value?: any | null }> }> }> } | null }> }, sceneWidget: { __typename?: 'SceneWidget', id: string, enabled: boolean, pluginId: string, extensionId: string } } | null };

export type UpdateWidgetMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  widgetId: Scalars['ID']['input'];
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<WidgetLocationInput>;
  extended?: InputMaybe<Scalars['Boolean']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateWidgetMutation = { __typename?: 'Mutation', updateWidget?: { __typename?: 'UpdateWidgetPayload', scene: { __typename?: 'Scene', id: string, widgets: Array<{ __typename?: 'SceneWidget', id: string, enabled: boolean, extended: boolean, pluginId: string, extensionId: string, propertyId: string }> } } | null };

export type RemoveWidgetMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  widgetId: Scalars['ID']['input'];
}>;


export type RemoveWidgetMutation = { __typename?: 'Mutation', removeWidget?: { __typename?: 'RemoveWidgetPayload', scene: { __typename?: 'Scene', id: string, widgets: Array<{ __typename?: 'SceneWidget', id: string, enabled: boolean, pluginId: string, extensionId: string, propertyId: string }> } } | null };

export type UpdateWidgetAlignSystemMutationVariables = Exact<{
  sceneId: Scalars['ID']['input'];
  location: WidgetLocationInput;
  align?: InputMaybe<WidgetAreaAlign>;
  padding?: InputMaybe<WidgetAreaPaddingInput>;
  gap?: InputMaybe<Scalars['Int']['input']>;
  centered?: InputMaybe<Scalars['Boolean']['input']>;
  background?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWidgetAlignSystemMutation = { __typename?: 'Mutation', updateWidgetAlignSystem?: { __typename?: 'UpdateWidgetAlignSystemPayload', scene: { __typename?: 'Scene', id: string, widgets: Array<{ __typename?: 'SceneWidget', id: string, enabled: boolean, pluginId: string, extensionId: string, propertyId: string }>, widgetAlignSystem?: { __typename?: 'WidgetAlignSystem', outer?: { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null } | null, inner?: { __typename?: 'WidgetZone', left?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, center?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null, right?: { __typename?: 'WidgetSection', top?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, middle?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null, bottom?: { __typename?: 'WidgetArea', widgetIds: Array<string>, align: WidgetAreaAlign, gap?: number | null, centered: boolean, background?: string | null, padding?: { __typename?: 'WidgetAreaPadding', top: number, bottom: number, left: number, right: number } | null } | null } | null } | null } | null } } | null };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'CreateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } } | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', deleteWorkspace?: { __typename?: 'DeleteWorkspacePayload', workspaceId: string } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } } | null };

export type AddMemberToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  role: Role;
}>;


export type AddMemberToWorkspaceMutation = { __typename?: 'Mutation', addMemberToWorkspace?: { __typename?: 'AddMemberToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } } | null };

export type RemoveMemberFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RemoveMemberFromWorkspaceMutation = { __typename?: 'Mutation', removeMemberFromWorkspace?: { __typename?: 'RemoveMemberFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } } | null };

export type UpdateMemberOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  role: Role;
}>;


export type UpdateMemberOfWorkspaceMutation = { __typename?: 'Mutation', updateMemberOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, policyId?: string | null, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }>, policy?: { __typename?: 'Policy', id: string, name: string, projectCount?: number | null, memberCount?: number | null, publishedProjectCount?: number | null, layerCount?: number | null, assetStorageSize?: number | null } | null } } | null };

export const WidgetAreaFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAreaFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgetIds"}},{"kind":"Field","name":{"kind":"Name","value":"align"}},{"kind":"Field","name":{"kind":"Name","value":"padding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"}},{"kind":"Field","name":{"kind":"Name","value":"bottom"}},{"kind":"Field","name":{"kind":"Name","value":"left"}},{"kind":"Field","name":{"kind":"Name","value":"right"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"centered"}},{"kind":"Field","name":{"kind":"Name","value":"background"}}]}}]} as unknown as DocumentNode<WidgetAreaFragmentFragment, unknown>;
export const WidgetSectionFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetSectionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetSection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"middle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bottom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAreaFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgetIds"}},{"kind":"Field","name":{"kind":"Name","value":"align"}},{"kind":"Field","name":{"kind":"Name","value":"padding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"}},{"kind":"Field","name":{"kind":"Name","value":"bottom"}},{"kind":"Field","name":{"kind":"Name","value":"left"}},{"kind":"Field","name":{"kind":"Name","value":"right"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"centered"}},{"kind":"Field","name":{"kind":"Name","value":"background"}}]}}]} as unknown as DocumentNode<WidgetSectionFragmentFragment, unknown>;
export const WidgetZoneFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetZoneFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetZone"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"center"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAreaFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgetIds"}},{"kind":"Field","name":{"kind":"Name","value":"align"}},{"kind":"Field","name":{"kind":"Name","value":"padding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"}},{"kind":"Field","name":{"kind":"Name","value":"bottom"}},{"kind":"Field","name":{"kind":"Name","value":"left"}},{"kind":"Field","name":{"kind":"Name","value":"right"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"centered"}},{"kind":"Field","name":{"kind":"Name","value":"background"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetSectionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetSection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"middle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bottom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}}]}}]} as unknown as DocumentNode<WidgetZoneFragmentFragment, unknown>;
export const WidgetAlignSystemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAlignSystemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetAlignSystem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"outer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetZoneFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetZoneFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAreaFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgetIds"}},{"kind":"Field","name":{"kind":"Name","value":"align"}},{"kind":"Field","name":{"kind":"Name","value":"padding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"}},{"kind":"Field","name":{"kind":"Name","value":"bottom"}},{"kind":"Field","name":{"kind":"Name","value":"left"}},{"kind":"Field","name":{"kind":"Name","value":"right"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"centered"}},{"kind":"Field","name":{"kind":"Name","value":"background"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetSectionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetSection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"middle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bottom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetZoneFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetZone"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"center"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}}]}}]} as unknown as DocumentNode<WidgetAlignSystemFragmentFragment, unknown>;
export const PropertyFieldFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<PropertyFieldFragmentFragment, unknown>;
export const PropertyGroupFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<PropertyGroupFragmentFragment, unknown>;
export const PropertyItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}}]} as unknown as DocumentNode<PropertyItemFragmentFragment, unknown>;
export const PropertyFragmentWithoutSchemaFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}}]} as unknown as DocumentNode<PropertyFragmentWithoutSchemaFragment, unknown>;
export const PropertySchemaFieldFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<PropertySchemaFieldFragmentFragment, unknown>;
export const PropertySchemaGroupFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<PropertySchemaGroupFragmentFragment, unknown>;
export const PropertyFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}}]} as unknown as DocumentNode<PropertyFragmentFragment, unknown>;
export const FeatureFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FeatureFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Feature"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"properties"}},{"kind":"Field","name":{"kind":"Name","value":"geometry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Point"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"pointCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineString"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lineStringCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Polygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"polygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiPolygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"multiPolygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GeometryCollection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"geometries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Point"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"pointCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineString"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lineStringCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Polygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"polygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiPolygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"multiPolygonCoordinates"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FeatureFragmentFragment, unknown>;
export const NlsLayerCommonFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NLSLayerCommon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NLSLayer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"layerType"}},{"kind":"Field","name":{"kind":"Name","value":"sceneId"}},{"kind":"Field","name":{"kind":"Name","value":"config"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}},{"kind":"Field","name":{"kind":"Name","value":"infobox"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sceneId"}},{"kind":"Field","name":{"kind":"Name","value":"layerId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"photoOverlay"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layerId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isSketch"}},{"kind":"Field","name":{"kind":"Name","value":"sketch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customPropertySchema"}},{"kind":"Field","name":{"kind":"Name","value":"featureCollection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FeatureFragment"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NLSLayerGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FeatureFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Feature"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"properties"}},{"kind":"Field","name":{"kind":"Name","value":"geometry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Point"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"pointCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineString"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lineStringCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Polygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"polygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiPolygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"multiPolygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GeometryCollection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"geometries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Point"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"pointCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineString"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lineStringCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Polygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"polygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiPolygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"multiPolygonCoordinates"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<NlsLayerCommonFragment, unknown>;
export const NlsLayerStyleFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NLSLayerStyle"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Style"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<NlsLayerStyleFragment, unknown>;
export const PluginFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PluginFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Plugin"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"translatedName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"singleOnly"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"widgetLayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extendable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vertically"}},{"kind":"Field","name":{"kind":"Name","value":"horizontally"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extended"}},{"kind":"Field","name":{"kind":"Name","value":"floating"}},{"kind":"Field","name":{"kind":"Name","value":"defaultLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zone"}},{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"area"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PluginFragmentFragment, unknown>;
export const ProjectMetadataFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectMetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"}},{"kind":"Field","name":{"kind":"Name","value":"workspace"}},{"kind":"Field","name":{"kind":"Name","value":"readme"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"importStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ProjectMetadataFragmentFragment, unknown>;
export const ProjectFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}},{"kind":"Field","name":{"kind":"Name","value":"publicTitle"}},{"kind":"Field","name":{"kind":"Name","value":"publicDescription"}},{"kind":"Field","name":{"kind":"Name","value":"publicImage"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publicNoIndex"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"enableGa"}},{"kind":"Field","name":{"kind":"Name","value":"trackingId"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}},{"kind":"Field","name":{"kind":"Name","value":"starred"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectMetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visualizer"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"projectAlias"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectMetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"}},{"kind":"Field","name":{"kind":"Name","value":"workspace"}},{"kind":"Field","name":{"kind":"Name","value":"readme"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"importStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ProjectFragmentFragment, unknown>;
export const MergedPropertyGroupCommonFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"overridden"}}]}}]}}]} as unknown as DocumentNode<MergedPropertyGroupCommonFragmentFragment, unknown>;
export const MergedPropertyGroupFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"overridden"}}]}}]}}]} as unknown as DocumentNode<MergedPropertyGroupFragmentFragment, unknown>;
export const MergedPropertyFragmentWithoutSchemaFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedProperty"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"originalId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"overridden"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"}}]}}]}}]} as unknown as DocumentNode<MergedPropertyFragmentWithoutSchemaFragment, unknown>;
export const MergedPropertyFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedProperty"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"overridden"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedPropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupCommonFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MergedPropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MergedProperty"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"originalId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MergedPropertyGroupFragment"}}]}}]}}]} as unknown as DocumentNode<MergedPropertyFragmentFragment, unknown>;
export const StoryPageFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryPageFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoryPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"swipeable"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"layersIds"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<StoryPageFragmentFragment, unknown>;
export const StoryFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Story"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"panelPosition"}},{"kind":"Field","name":{"kind":"Name","value":"bgColor"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"publicTitle"}},{"kind":"Field","name":{"kind":"Name","value":"publicDescription"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"publicImage"}},{"kind":"Field","name":{"kind":"Name","value":"publicNoIndex"}},{"kind":"Field","name":{"kind":"Name","value":"enableGa"}},{"kind":"Field","name":{"kind":"Name","value":"trackingId"}},{"kind":"Field","name":{"kind":"Name","value":"pages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryPageFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryPageFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoryPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"swipeable"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"layersIds"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}}]} as unknown as DocumentNode<StoryFragmentFragment, unknown>;
export const WorkspaceFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Workspace"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workspace"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]} as unknown as DocumentNode<WorkspaceFragment, unknown>;
export const GetAssetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAssets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AssetSort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetAssetsQuery, GetAssetsQueryVariables>;
export const CreateAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coreSupport"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"coreSupport"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coreSupport"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]} as unknown as DocumentNode<CreateAssetMutation, CreateAssetMutationVariables>;
export const UpdateAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"assetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<UpdateAssetMutation, UpdateAssetMutationVariables>;
export const RemoveAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"assetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetId"}}]}}]}}]} as unknown as DocumentNode<RemoveAssetMutation, RemoveAssetMutationVariables>;
export const AddGeoJsonFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddGeoJSONFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddGeoJSONFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addGeoJSONFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"properties"}}]}}]}}]} as unknown as DocumentNode<AddGeoJsonFeatureMutation, AddGeoJsonFeatureMutationVariables>;
export const UpdateGeoJsonFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateGeoJSONFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateGeoJSONFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateGeoJSONFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"properties"}}]}}]}}]} as unknown as DocumentNode<UpdateGeoJsonFeatureMutation, UpdateGeoJsonFeatureMutationVariables>;
export const DeleteGeoJsonFeatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGeoJSONFeature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteGeoJSONFeatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGeoJSONFeature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedFeatureId"}}]}}]}}]} as unknown as DocumentNode<DeleteGeoJsonFeatureMutation, DeleteGeoJsonFeatureMutationVariables>;
export const CreateNlsInfoboxDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateNLSInfobox"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateNLSInfoboxInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNLSInfobox"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateNlsInfoboxMutation, CreateNlsInfoboxMutationVariables>;
export const RemoveNlsInfoboxDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveNLSInfobox"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveNLSInfoboxInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeNLSInfobox"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveNlsInfoboxMutation, RemoveNlsInfoboxMutationVariables>;
export const AddNlsInfoboxBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddNLSInfoboxBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddNLSInfoboxBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addNLSInfoboxBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<AddNlsInfoboxBlockMutation, AddNlsInfoboxBlockMutationVariables>;
export const MoveNlsInfoboxBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveNLSInfoboxBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveNLSInfoboxBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveNLSInfoboxBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"infoboxBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MoveNlsInfoboxBlockMutation, MoveNlsInfoboxBlockMutationVariables>;
export const RemoveNlsInfoboxBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveNLSInfoboxBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveNLSInfoboxBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeNLSInfoboxBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"infoboxBlockId"}},{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveNlsInfoboxBlockMutation, RemoveNlsInfoboxBlockMutationVariables>;
export const AddNlsLayerSimpleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddNLSLayerSimple"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddNLSLayerSimpleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addNLSLayerSimple"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<AddNlsLayerSimpleMutation, AddNlsLayerSimpleMutationVariables>;
export const UpdateNlsLayerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNLSLayer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNLSLayerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNLSLayer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateNlsLayerMutation, UpdateNlsLayerMutationVariables>;
export const UpdateNlsLayersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNLSLayers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNLSLayersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNLSLayers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateNlsLayersMutation, UpdateNlsLayersMutationVariables>;
export const RemoveNlsLayerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveNLSLayer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveNLSLayerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeNLSLayer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layerId"}}]}}]}}]} as unknown as DocumentNode<RemoveNlsLayerMutation, RemoveNlsLayerMutationVariables>;
export const UpdateCustomPropertiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomProperties"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCustomPropertySchemaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomProperties"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCustomPropertiesMutation, UpdateCustomPropertiesMutationVariables>;
export const ChangeCustomPropertyTitleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeCustomPropertyTitle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeCustomPropertyTitleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeCustomPropertyTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<ChangeCustomPropertyTitleMutation, ChangeCustomPropertyTitleMutationVariables>;
export const RemoveCustomPropertyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCustomProperty"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveCustomPropertyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCustomProperty"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveCustomPropertyMutation, RemoveCustomPropertyMutationVariables>;
export const AddStyleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddStyle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddStyleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addStyle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"style"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AddStyleMutation, AddStyleMutationVariables>;
export const UpdateStyleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStyle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStyleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStyle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"style"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateStyleMutation, UpdateStyleMutationVariables>;
export const RemoveStyleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveStyle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveStyleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeStyle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"styleId"}}]}}]}}]} as unknown as DocumentNode<RemoveStyleMutation, RemoveStyleMutationVariables>;
export const CreateNlsPhotoOverlayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateNLSPhotoOverlay"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateNLSPhotoOverlayInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNLSPhotoOverlay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateNlsPhotoOverlayMutation, CreateNlsPhotoOverlayMutationVariables>;
export const InstallPluginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallPlugin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installPlugin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"pluginId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scenePlugin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}}]}}]}}]}}]} as unknown as DocumentNode<InstallPluginMutation, InstallPluginMutationVariables>;
export const UpgradePluginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpgradePlugin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toPluginId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upgradePlugin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"pluginId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"toPluginId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toPluginId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scenePlugin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}}]}}]}}]}}]} as unknown as DocumentNode<UpgradePluginMutation, UpgradePluginMutationVariables>;
export const UploadPluginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadPlugin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"URL"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadPlugin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plugin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"author"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scenePlugin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}}]}}]}}]}}]} as unknown as DocumentNode<UploadPluginMutation, UploadPluginMutationVariables>;
export const UninstallPluginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UninstallPlugin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uninstallPlugin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"pluginId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pluginId"}}]}}]}}]} as unknown as DocumentNode<UninstallPluginMutation, UninstallPluginMutationVariables>;
export const GetProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"PROJECT"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFragment"}},{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectMetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"}},{"kind":"Field","name":{"kind":"Name","value":"workspace"}},{"kind":"Field","name":{"kind":"Name","value":"readme"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"importStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}},{"kind":"Field","name":{"kind":"Name","value":"publicTitle"}},{"kind":"Field","name":{"kind":"Name","value":"publicDescription"}},{"kind":"Field","name":{"kind":"Name","value":"publicImage"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publicNoIndex"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"enableGa"}},{"kind":"Field","name":{"kind":"Name","value":"trackingId"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}},{"kind":"Field","name":{"kind":"Name","value":"starred"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectMetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visualizer"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"projectAlias"}}]}}]} as unknown as DocumentNode<GetProjectQuery, GetProjectQueryVariables>;
export const GetProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectSort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFragment"}},{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectMetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"}},{"kind":"Field","name":{"kind":"Name","value":"workspace"}},{"kind":"Field","name":{"kind":"Name","value":"readme"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"importStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}},{"kind":"Field","name":{"kind":"Name","value":"publicTitle"}},{"kind":"Field","name":{"kind":"Name","value":"publicDescription"}},{"kind":"Field","name":{"kind":"Name","value":"publicImage"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publicNoIndex"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"enableGa"}},{"kind":"Field","name":{"kind":"Name","value":"trackingId"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}},{"kind":"Field","name":{"kind":"Name","value":"starred"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectMetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visualizer"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"projectAlias"}}]}}]} as unknown as DocumentNode<GetProjectsQuery, GetProjectsQueryVariables>;
export const CheckProjectAliasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckProjectAlias"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alias"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkProjectAlias"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"alias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alias"}}},{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}}]}}]} as unknown as DocumentNode<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>;
export const CreateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visualizer"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Visualizer"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coreSupport"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectAlias"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"readme"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"license"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"topics"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"visualizer"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visualizer"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"coreSupport"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coreSupport"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"visibility"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"projectAlias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectAlias"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"readme"},"value":{"kind":"Variable","name":{"kind":"Name","value":"readme"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"license"},"value":{"kind":"Variable","name":{"kind":"Name","value":"license"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"topics"},"value":{"kind":"Variable","name":{"kind":"Name","value":"topics"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}}]}}]}}]}}]} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"imageUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"URL"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicTitle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicDescription"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicImage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deleteImageUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deletePublicImage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enableGa"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackingId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"starred"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deleted"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectAlias"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"imageUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageUrl"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"publicTitle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicTitle"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"publicDescription"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicDescription"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"publicImage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicImage"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"deleteImageUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deleteImageUrl"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"deletePublicImage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deletePublicImage"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"enableGa"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enableGa"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"trackingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackingId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"starred"},"value":{"kind":"Variable","name":{"kind":"Name","value":"starred"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"deleted"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deleted"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"projectAlias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectAlias"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"visibility"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectMetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"}},{"kind":"Field","name":{"kind":"Name","value":"workspace"}},{"kind":"Field","name":{"kind":"Name","value":"readme"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"importStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}},{"kind":"Field","name":{"kind":"Name","value":"publicTitle"}},{"kind":"Field","name":{"kind":"Name","value":"publicDescription"}},{"kind":"Field","name":{"kind":"Name","value":"publicImage"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publicNoIndex"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"enableGa"}},{"kind":"Field","name":{"kind":"Name","value":"trackingId"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"coreSupport"}},{"kind":"Field","name":{"kind":"Name","value":"starred"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectMetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"visualizer"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"projectAlias"}}]}}]} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const UpdateProjectBasicAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProjectBasicAuth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isBasicAuthActive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"basicAuthUsername"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"basicAuthPassword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"isBasicAuthActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isBasicAuthActive"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"basicAuthUsername"},"value":{"kind":"Variable","name":{"kind":"Name","value":"basicAuthUsername"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"basicAuthPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"basicAuthPassword"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProjectBasicAuthMutation, UpdateProjectBasicAuthMutationVariables>;
export const PublishProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alias"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublishmentStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"alias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alias"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}}]}}]}}]}}]} as unknown as DocumentNode<PublishProjectMutation, PublishProjectMutationVariables>;
export const ArchiveProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"archived"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"archived"},"value":{"kind":"Variable","name":{"kind":"Name","value":"archived"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}}]}}]}}]}}]} as unknown as DocumentNode<ArchiveProjectMutation, ArchiveProjectMutationVariables>;
export const DeleteProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}}]}}]}}]} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const GetStarredProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStarredProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starredProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starred"}},{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetStarredProjectsQuery, GetStarredProjectsQueryVariables>;
export const ExportProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExportProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectDataPath"}}]}}]}}]} as unknown as DocumentNode<ExportProjectMutation, ExportProjectMutationVariables>;
export const GetDeletedProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDeletedProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetDeletedProjectsQuery, GetDeletedProjectsQueryVariables>;
export const UpdateProjectMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProjectMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"project"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"readme"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"license"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"topics"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProjectMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"project"},"value":{"kind":"Variable","name":{"kind":"Name","value":"project"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"readme"},"value":{"kind":"Variable","name":{"kind":"Name","value":"readme"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"license"},"value":{"kind":"Variable","name":{"kind":"Name","value":"license"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"topics"},"value":{"kind":"Variable","name":{"kind":"Name","value":"topics"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectMetadataFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectMetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectMetadata"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"}},{"kind":"Field","name":{"kind":"Name","value":"workspace"}},{"kind":"Field","name":{"kind":"Name","value":"readme"}},{"kind":"Field","name":{"kind":"Name","value":"license"}},{"kind":"Field","name":{"kind":"Name","value":"importStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateProjectMetadataMutation, UpdateProjectMetadataMutationVariables>;
export const UpdatePropertyValueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePropertyValue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fieldId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"value"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Any"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ValueType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePropertyValue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"propertyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"schemaGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"fieldId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fieldId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"value"},"value":{"kind":"Variable","name":{"kind":"Name","value":"value"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePropertyValueMutation, UpdatePropertyValueMutationVariables>;
export const AddPropertyItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPropertyItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPropertyItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"propertyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"schemaGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<AddPropertyItemMutation, AddPropertyItemMutationVariables>;
export const RemovePropertyItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemovePropertyItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removePropertyItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"propertyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"schemaGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<RemovePropertyItemMutation, RemovePropertyItemMutationVariables>;
export const MovePropertyItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MovePropertyItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"index"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"movePropertyItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"propertyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"propertyId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"schemaGroupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"schemaGroupId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"index"},"value":{"kind":"Variable","name":{"kind":"Name","value":"index"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<MovePropertyItemMutation, MovePropertyItemMutationVariables>;
export const GetSceneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScene"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"SCENE"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Scene"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"plugins"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"plugin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PluginFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"extended"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"widgetAlignSystem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAlignSystemFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"newLayers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NLSLayerCommon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"styles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NLSLayerStyle"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAreaFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgetIds"}},{"kind":"Field","name":{"kind":"Name","value":"align"}},{"kind":"Field","name":{"kind":"Name","value":"padding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"}},{"kind":"Field","name":{"kind":"Name","value":"bottom"}},{"kind":"Field","name":{"kind":"Name","value":"left"}},{"kind":"Field","name":{"kind":"Name","value":"right"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"centered"}},{"kind":"Field","name":{"kind":"Name","value":"background"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetSectionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetSection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"middle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bottom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetZoneFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetZone"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"center"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryPageFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoryPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"swipeable"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"layersIds"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FeatureFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Feature"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"properties"}},{"kind":"Field","name":{"kind":"Name","value":"geometry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Point"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"pointCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineString"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lineStringCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Polygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"polygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiPolygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"multiPolygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GeometryCollection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"geometries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Point"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"pointCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineString"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lineStringCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Polygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"polygonCoordinates"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MultiPolygon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"multiPolygonCoordinates"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PluginFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Plugin"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"translatedName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"singleOnly"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"widgetLayout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extendable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vertically"}},{"kind":"Field","name":{"kind":"Name","value":"horizontally"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extended"}},{"kind":"Field","name":{"kind":"Name","value":"floating"}},{"kind":"Field","name":{"kind":"Name","value":"defaultLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zone"}},{"kind":"Field","name":{"kind":"Name","value":"section"}},{"kind":"Field","name":{"kind":"Name","value":"area"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAlignSystemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetAlignSystem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"outer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetZoneFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetZoneFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Story"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"panelPosition"}},{"kind":"Field","name":{"kind":"Name","value":"bgColor"}},{"kind":"Field","name":{"kind":"Name","value":"isBasicAuthActive"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthUsername"}},{"kind":"Field","name":{"kind":"Name","value":"basicAuthPassword"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"publicTitle"}},{"kind":"Field","name":{"kind":"Name","value":"publicDescription"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"publicImage"}},{"kind":"Field","name":{"kind":"Name","value":"publicNoIndex"}},{"kind":"Field","name":{"kind":"Name","value":"enableGa"}},{"kind":"Field","name":{"kind":"Name","value":"trackingId"}},{"kind":"Field","name":{"kind":"Name","value":"pages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryPageFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NLSLayerCommon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NLSLayer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"layerType"}},{"kind":"Field","name":{"kind":"Name","value":"sceneId"}},{"kind":"Field","name":{"kind":"Name","value":"config"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"visible"}},{"kind":"Field","name":{"kind":"Name","value":"infobox"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sceneId"}},{"kind":"Field","name":{"kind":"Name","value":"layerId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"photoOverlay"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layerId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isSketch"}},{"kind":"Field","name":{"kind":"Name","value":"sketch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customPropertySchema"}},{"kind":"Field","name":{"kind":"Name","value":"featureCollection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FeatureFragment"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NLSLayerGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NLSLayerStyle"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Style"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<GetSceneQuery, GetSceneQueryVariables>;
export const CreateSceneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateScene"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createScene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSceneMutation, CreateSceneMutationVariables>;
export const CheckSceneAliasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckSceneAlias"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alias"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkSceneAlias"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"alias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alias"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}}]}}]} as unknown as DocumentNode<CheckSceneAliasQuery, CheckSceneAliasQueryVariables>;
export const CreateStoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateStoryMutation, CreateStoryMutationVariables>;
export const UpdateStoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateStoryMutation, UpdateStoryMutationVariables>;
export const DeleteStoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteStory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteStoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}}]} as unknown as DocumentNode<DeleteStoryMutation, DeleteStoryMutationVariables>;
export const PublishStoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishStory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alias"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublishmentStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishStory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"alias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alias"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"publishmentStatus"}}]}}]}}]}}]} as unknown as DocumentNode<PublishStoryMutation, PublishStoryMutationVariables>;
export const CreateStoryPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStoryPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStoryPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStoryPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateStoryPageMutation, CreateStoryPageMutationVariables>;
export const UpdateStoryPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStoryPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStoryPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStoryPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateStoryPageMutation, UpdateStoryPageMutationVariables>;
export const DeleteStoryPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteStoryPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteStoryPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeStoryPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteStoryPageMutation, DeleteStoryPageMutationVariables>;
export const MoveStoryPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveStoryPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveStoryPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveStoryPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MoveStoryPageMutation, MoveStoryPageMutationVariables>;
export const CreateStoryBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStoryBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStoryBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStoryBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateStoryBlockMutation, CreateStoryBlockMutationVariables>;
export const MoveStoryBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveStoryBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveStoryBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveStoryBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"blockId"}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MoveStoryBlockMutation, MoveStoryBlockMutationVariables>;
export const RemoveStoryBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveStoryBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveStoryBlockInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeStoryBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockId"}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveStoryBlockMutation, RemoveStoryBlockMutationVariables>;
export const CheckStoryAliasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckStoryAlias"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alias"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkStoryAlias"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"alias"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alias"}}},{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alias"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}}]}}]} as unknown as DocumentNode<CheckStoryAliasQuery, CheckStoryAliasQueryVariables>;
export const GetWorkspacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"myWorkspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Workspace"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Workspace"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Workspace"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Workspace"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]} as unknown as DocumentNode<GetWorkspacesQuery, GetWorkspacesQueryVariables>;
export const GetUserBySearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserBySearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nameOrEmail"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nameOrEmail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nameOrEmail"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<GetUserBySearchQuery, GetUserBySearchQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"myWorkspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}},{"kind":"Field","name":{"kind":"Name","value":"enableToCreatePrivateProject"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}},{"kind":"Field","name":{"kind":"Name","value":"enableToCreatePrivateProject"}}]}},{"kind":"Field","name":{"kind":"Name","value":"auths"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const UpdateMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"theme"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Theme"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"theme"},"value":{"kind":"Variable","name":{"kind":"Name","value":"theme"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"passwordConfirmation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"passwordConfirmation"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"lang"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"myWorkspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMeMutation, UpdateMeMutationVariables>;
export const DeleteMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<DeleteMeMutation, DeleteMeMutationVariables>;
export const AddWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"extensionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lang"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Lang"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addWidget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"pluginId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pluginId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"extensionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"extensionId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}},{"kind":"Field","name":{"kind":"Name","value":"property"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragment"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sceneWidget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroupList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertyGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyGroupFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaFieldFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaField"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"translatedPlaceholder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"suffix"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"ui"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertySchemaGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PropertySchemaGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"schemaGroupId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"translatedTitle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"lang"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lang"}}}]},{"kind":"Field","name":{"kind":"Name","value":"isList"}},{"kind":"Field","name":{"kind":"Name","value":"representativeFieldId"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailableIf"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fieldId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaFieldFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PropertyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertyFragmentWithoutSchema"}},{"kind":"Field","name":{"kind":"Name","value":"schema"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PropertySchemaGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<AddWidgetMutation, AddWidgetMutationVariables>;
export const UpdateWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"widgetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"location"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetLocationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"extended"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"index"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWidget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"widgetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"widgetId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"enabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"location"},"value":{"kind":"Variable","name":{"kind":"Name","value":"location"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"extended"},"value":{"kind":"Variable","name":{"kind":"Name","value":"extended"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"index"},"value":{"kind":"Variable","name":{"kind":"Name","value":"index"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"extended"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateWidgetMutation, UpdateWidgetMutationVariables>;
export const RemoveWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"widgetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeWidget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"widgetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"widgetId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RemoveWidgetMutation, RemoveWidgetMutationVariables>;
export const UpdateWidgetAlignSystemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWidgetAlignSystem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"location"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetLocationInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"align"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetAreaAlign"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"padding"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetAreaPaddingInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gap"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"centered"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"background"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWidgetAlignSystem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"sceneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sceneId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"location"},"value":{"kind":"Variable","name":{"kind":"Name","value":"location"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"align"},"value":{"kind":"Variable","name":{"kind":"Name","value":"align"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"padding"},"value":{"kind":"Variable","name":{"kind":"Name","value":"padding"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"gap"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gap"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"centered"},"value":{"kind":"Variable","name":{"kind":"Name","value":"centered"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"background"},"value":{"kind":"Variable","name":{"kind":"Name","value":"background"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scene"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"widgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"pluginId"}},{"kind":"Field","name":{"kind":"Name","value":"extensionId"}},{"kind":"Field","name":{"kind":"Name","value":"propertyId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"widgetAlignSystem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAlignSystemFragment"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAreaFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"widgetIds"}},{"kind":"Field","name":{"kind":"Name","value":"align"}},{"kind":"Field","name":{"kind":"Name","value":"padding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"}},{"kind":"Field","name":{"kind":"Name","value":"bottom"}},{"kind":"Field","name":{"kind":"Name","value":"left"}},{"kind":"Field","name":{"kind":"Name","value":"right"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"centered"}},{"kind":"Field","name":{"kind":"Name","value":"background"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetSectionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetSection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"top"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"middle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bottom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetAreaFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetZoneFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetZone"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"center"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetSectionFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WidgetAlignSystemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WidgetAlignSystem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"outer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetZoneFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WidgetZoneFragment"}}]}}]}}]} as unknown as DocumentNode<UpdateWidgetAlignSystemMutation, UpdateWidgetAlignSystemMutationVariables>;
export const CreateWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;
export const DeleteWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}}]}}]}}]} as unknown as DocumentNode<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;
export const UpdateWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export const AddMemberToWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddMemberToWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addMemberToWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>;
export const RemoveMemberFromWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMemberFromWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMemberFromWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>;
export const UpdateMemberOfWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberOfWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberOfWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"personal"}},{"kind":"Field","name":{"kind":"Name","value":"policyId"}},{"kind":"Field","name":{"kind":"Name","value":"policy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedProjectCount"}},{"kind":"Field","name":{"kind":"Name","value":"layerCount"}},{"kind":"Field","name":{"kind":"Name","value":"assetStorageSize"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>;