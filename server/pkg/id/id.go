package id

import "github.com/reearth/reearthx/idx"

type Asset struct{}
type AuthRequest struct{}
type InfoboxField struct{}
type NLSLayer struct{}
type PluginExtension struct{}
type Project struct{}
type Property struct{}
type PropertyItem struct{}
type PropertyField struct{}
type PropertySchemaGroup struct{}
type Scene struct{}
type Workspace struct{}
type User struct{}
type Widget struct{}
type Style struct{}
type Infobox struct{}
type PhotoOverlay struct{}
type InfoboxBlock struct{}
type Feature struct{}

func (Asset) Type() string               { return "asset" }
func (AuthRequest) Type() string         { return "authRequest" }
func (InfoboxField) Type() string        { return "infoboxField" }
func (NLSLayer) Type() string            { return "nlsLayer" }
func (PluginExtension) Type() string     { return "pluginExtension" }
func (Project) Type() string             { return "project" }
func (Property) Type() string            { return "property" }
func (PropertyItem) Type() string        { return "propertyItem" }
func (PropertyField) Type() string       { return "propertyField" }
func (PropertySchemaGroup) Type() string { return "propertySchemaGroup" }
func (Scene) Type() string               { return "scene" }
func (Workspace) Type() string           { return "workspace" }
func (User) Type() string                { return "user" }
func (Widget) Type() string              { return "widget" }
func (Style) Type() string               { return "style" }
func (Infobox) Type() string             { return "infobox" }
func (PhotoOverlay) Type() string        { return "photoOverlay" }
func (InfoboxBlock) Type() string        { return "infoboxBlock" }
func (Feature) Type() string             { return "feature" }

type AssetID = idx.ID[Asset]
type AuthRequestID = idx.ID[AuthRequest]
type InfoboxFieldID = idx.ID[InfoboxField]
type NLSLayerID = idx.ID[NLSLayer]
type ProjectID = idx.ID[Project]
type PropertyID = idx.ID[Property]
type PropertyItemID = idx.ID[PropertyItem]
type SceneID = idx.ID[Scene]
type UserID = idx.ID[User]
type WidgetID = idx.ID[Widget]
type StyleID = idx.ID[Style]
type InfoboxID = idx.ID[Infobox]
type PhotoOverlayID = idx.ID[PhotoOverlay]
type InfoboxBlockID = idx.ID[InfoboxBlock]
type FeatureID = idx.ID[Feature]

type PluginExtensionID = idx.StringID[PluginExtension]
type PropertySchemaGroupID = idx.StringID[PropertySchemaGroup]
type PropertyFieldID = idx.StringID[PropertyField]

var NewAssetID = idx.New[Asset]
var NewAuthRequestID = idx.New[AuthRequest]
var NewInfoboxFieldID = idx.New[InfoboxField]
var NewNLSLayerID = idx.New[NLSLayer]
var NewProjectID = idx.New[Project]
var NewPropertyID = idx.New[Property]
var NewPropertyItemID = idx.New[PropertyItem]
var NewSceneID = idx.New[Scene]
var NewWidgetID = idx.New[Widget]
var NewStyleID = idx.New[Style]
var NewInfoboxID = idx.New[Infobox]
var NewPhotoOverlayID = idx.New[PhotoOverlay]
var NewInfoboxBlockID = idx.New[InfoboxBlock]
var NewFeatureID = idx.New[Feature]

var MustAssetID = idx.Must[Asset]
var MustAuthRequestID = idx.Must[AuthRequest]
var MustInfoboxFieldID = idx.Must[InfoboxField]
var MustNLSLayerID = idx.Must[NLSLayer]
var MustProjectID = idx.Must[Project]
var MustPropertyID = idx.Must[Property]
var MustPropertyItemID = idx.Must[PropertyItem]
var MustSceneID = idx.Must[Scene]
var MustUserID = idx.Must[User]
var MustWidgetID = idx.Must[Widget]
var MustStyleID = idx.Must[Style]
var MustInfoboxID = idx.Must[Infobox]
var MustPhotoOverlayID = idx.Must[PhotoOverlay]
var MustInfoboxBlockID = idx.Must[InfoboxBlock]
var MustFeatureID = idx.Must[Feature]

var AssetIDFrom = idx.From[Asset]
var AuthRequestIDFrom = idx.From[AuthRequest]
var InfoboxFieldIDFrom = idx.From[InfoboxField]
var NLSLayerIDFrom = idx.From[NLSLayer]
var ProjectIDFrom = idx.From[Project]
var PropertyIDFrom = idx.From[Property]
var PropertyItemIDFrom = idx.From[PropertyItem]
var SceneIDFrom = idx.From[Scene]
var UserIDFrom = idx.From[User]
var WidgetIDFrom = idx.From[Widget]
var StyleIDFrom = idx.From[Style]
var InfoboxIDFrom = idx.From[Infobox]
var PhotoOverlayIDFrom = idx.From[PhotoOverlay]
var InfoboxBlockIDFrom = idx.From[InfoboxBlock]
var FeatureIDFrom = idx.From[Feature]

var AssetIDFromRef = idx.FromRef[Asset]
var AuthRequestIDFromRef = idx.FromRef[AuthRequest]
var InfoboxFieldIDFromRef = idx.FromRef[InfoboxField]
var NLSLayerIDFromRef = idx.FromRef[NLSLayer]
var ProjectIDFromRef = idx.FromRef[Project]
var PropertyIDFromRef = idx.FromRef[Property]
var PropertyItemIDFromRef = idx.FromRef[PropertyItem]
var SceneIDFromRef = idx.FromRef[Scene]
var UserIDFromRef = idx.FromRef[User]
var WidgetIDFromRef = idx.FromRef[Widget]
var StyleIDFromRef = idx.FromRef[Style]
var InfoboxIDFromRef = idx.FromRef[Infobox]
var PhotoOverlayIDFromRef = idx.FromRef[PhotoOverlay]
var InfoboxBlockIDFromRef = idx.FromRef[InfoboxBlock]
var FeatureIDFromRef = idx.FromRef[Feature]

var PluginExtensionIDFromRef = idx.StringIDFromRef[PluginExtension]
var PropertyFieldIDFromRef = idx.StringIDFromRef[PropertyField]
var PropertySchemaGroupIDFromRef = idx.StringIDFromRef[PropertySchemaGroup]

type AssetIDList = idx.List[Asset]
type AuthRequestIDList = idx.List[AuthRequest]
type InfoboxFieldIDList = idx.List[InfoboxField]
type NLSLayerIDList = idx.List[NLSLayer]
type ProjectIDList = idx.List[Project]
type PropertyIDList = idx.List[Property]
type PropertyItemIDList = idx.List[PropertyItem]
type SceneIDList = idx.List[Scene]
type UserIDList = idx.List[User]
type WidgetIDList = idx.List[Widget]
type StyleIDList = idx.List[Style]
type InfoboxIDList = idx.List[Infobox]
type PhotoOverlayIDList = idx.List[PhotoOverlay]
type InfoboxBlockIDList = idx.List[InfoboxBlock]
type FeatureIDList = idx.List[Feature]

var AssetIDListFrom = idx.ListFrom[Asset]
var AuthRequestIDListFrom = idx.ListFrom[AuthRequest]
var InfoboxFieldIDListFrom = idx.ListFrom[InfoboxField]
var NLSLayerIDListFrom = idx.ListFrom[NLSLayer]
var ProjectIDListFrom = idx.ListFrom[Project]
var PropertyIDListFrom = idx.ListFrom[Property]
var PropertyItemIDListFrom = idx.ListFrom[PropertyItem]
var SceneIDListFrom = idx.ListFrom[Scene]
var UserIDListFrom = idx.ListFrom[User]
var WidgetIDListFrom = idx.ListFrom[Widget]
var StyleIDListFrom = idx.ListFrom[Style]
var InfoboxIDListFrom = idx.ListFrom[Infobox]
var PhotoOverlayIDListFrom = idx.ListFrom[PhotoOverlay]
var InfoboxBlockIDListFrom = idx.ListFrom[InfoboxBlock]
var FeatureIDListFrom = idx.ListFrom[Feature]

type AssetIDSet = idx.Set[Asset]
type AuthRequestIDSet = idx.Set[AuthRequest]
type InfoboxFieldIDSet = idx.Set[InfoboxField]
type NLSLayerIDSet = idx.Set[NLSLayer]
type ProjectIDSet = idx.Set[Project]
type PropertyIDSet = idx.Set[Property]
type PropertyItemIDSet = idx.Set[PropertyItem]
type SceneIDSet = idx.Set[Scene]
type UserIDSet = idx.Set[User]
type WidgetIDSet = idx.Set[Widget]
type StyleIDSet = idx.Set[Style]
type InfoboxIDSet = idx.Set[Infobox]
type PhotoOverlayIDSet = idx.Set[PhotoOverlay]
type InfoboxBlockIDSet = idx.Set[InfoboxBlock]
type FeatureIDSet = idx.Set[Feature]

var NewAssetIDSet = idx.NewSet[Asset]
var NewAuthRequestIDSet = idx.NewSet[AuthRequest]
var NewInfoboxFieldIDSet = idx.NewSet[InfoboxField]
var NewNLSLayerIDSet = idx.NewSet[NLSLayer]
var NewProjectIDSet = idx.NewSet[Project]
var NewPropertyIDSet = idx.NewSet[Property]
var NewPropertyItemIDSet = idx.NewSet[PropertyItem]
var NewSceneIDSet = idx.NewSet[Scene]
var NewUserIDSet = idx.NewSet[User]
var NewWidgetIDSet = idx.NewSet[Widget]
var NewStyleIDSet = idx.NewSet[Style]
var NewPhotoOverlayIDSet = idx.NewSet[PhotoOverlay]
var NewInfoboxIDSet = idx.NewSet[InfoboxBlock]
var NewInfoboxBlockIDSet = idx.NewSet[InfoboxBlock]
var NewFeatureIDSet = idx.NewSet[Feature]

// Storytelling ids

type Story struct{}
type Page struct{}
type Block struct{}

func (Story) Type() string { return "story" }
func (Page) Type() string  { return "page" }
func (Block) Type() string { return "block" }

type StoryID = idx.ID[Story]
type PageID = idx.ID[Page]
type BlockID = idx.ID[Block]

var NewStoryID = idx.New[Story]
var NewPageID = idx.New[Page]
var NewBlockID = idx.New[Block]

var MustStoryID = idx.Must[Story]
var MustPageID = idx.Must[Page]
var MustBlockID = idx.Must[Block]

var StoryIDFrom = idx.From[Story]
var PageIDFrom = idx.From[Page]
var BlockIDFrom = idx.From[Block]

var StoryIDFromRef = idx.FromRef[Story]
var PageIDFromRef = idx.FromRef[Page]
var BlockIDFromRef = idx.FromRef[Block]

type StoryIDList = idx.List[Story]
type PageIDList = idx.List[Page]
type BlockIDList = idx.List[Block]

var StoryIDListFrom = idx.ListFrom[Story]
var PageIDListFrom = idx.ListFrom[Page]
var BlockIDListFrom = idx.ListFrom[Block]
