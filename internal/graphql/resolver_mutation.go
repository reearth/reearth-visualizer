package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
)

func (r *Resolver) Mutation() MutationResolver {
	return &mutationResolver{r}
}

type mutationResolver struct{ *Resolver }

func (r *mutationResolver) CreateAsset(ctx context.Context, input graphql1.CreateAssetInput) (*graphql1.CreateAssetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.AssetController.Create(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveAsset(ctx context.Context, input graphql1.RemoveAssetInput) (*graphql1.RemoveAssetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.AssetController.Remove(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdateDatasetSchema(ctx context.Context, input graphql1.UpdateDatasetSchemaInput) (*graphql1.UpdateDatasetSchemaPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.UpdateDatasetSchema(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddDynamicDatasetSchema(ctx context.Context, input graphql1.AddDynamicDatasetSchemaInput) (*graphql1.AddDynamicDatasetSchemaPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.AddDynamicDatasetSchema(ctx, &input)
}

func (r *mutationResolver) AddDynamicDataset(ctx context.Context, input graphql1.AddDynamicDatasetInput) (*graphql1.AddDynamicDatasetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.AddDynamicDataset(ctx, &input)
}

func (r *mutationResolver) Signup(ctx context.Context, input graphql1.SignupInput) (*graphql1.SignupPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.UserController.Signup(ctx, &input, getSub(ctx))
}

func (r *mutationResolver) UpdateMe(ctx context.Context, input graphql1.UpdateMeInput) (*graphql1.UpdateMePayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.UserController.UpdateMe(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveMyAuth(ctx context.Context, input graphql1.RemoveMyAuthInput) (*graphql1.UpdateMePayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.UserController.RemoveMyAuth(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) DeleteMe(ctx context.Context, input graphql1.DeleteMeInput) (*graphql1.DeleteMePayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.UserController.DeleteMe(ctx, input.UserID, getOperator(ctx))
}

func (r *mutationResolver) CreateTeam(ctx context.Context, input graphql1.CreateTeamInput) (*graphql1.CreateTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.Create(ctx, &input, getUser(ctx))
}

func (r *mutationResolver) DeleteTeam(ctx context.Context, input graphql1.DeleteTeamInput) (*graphql1.DeleteTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.Remove(ctx, input.TeamID, getOperator(ctx))
}

func (r *mutationResolver) UpdateTeam(ctx context.Context, input graphql1.UpdateTeamInput) (*graphql1.UpdateTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.Update(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddMemberToTeam(ctx context.Context, input graphql1.AddMemberToTeamInput) (*graphql1.AddMemberToTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.AddMember(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveMemberFromTeam(ctx context.Context, input graphql1.RemoveMemberFromTeamInput) (*graphql1.RemoveMemberFromTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.RemoveMember(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdateMemberOfTeam(ctx context.Context, input graphql1.UpdateMemberOfTeamInput) (*graphql1.UpdateMemberOfTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.UpdateMember(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) CreateProject(ctx context.Context, input graphql1.CreateProjectInput) (*graphql1.ProjectPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.Create(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input graphql1.UpdateProjectInput) (*graphql1.ProjectPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.Update(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) PublishProject(ctx context.Context, input graphql1.PublishProjectInput) (*graphql1.ProjectPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.Publish(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) DeleteProject(ctx context.Context, input graphql1.DeleteProjectInput) (*graphql1.DeleteProjectPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.Delete(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UploadPlugin(ctx context.Context, input graphql1.UploadPluginInput) (*graphql1.UploadPluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PluginController.Upload(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) CreateScene(ctx context.Context, input graphql1.CreateSceneInput) (*graphql1.CreateScenePayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.Create(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddWidget(ctx context.Context, input graphql1.AddWidgetInput) (*graphql1.AddWidgetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.AddWidget(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdateWidget(ctx context.Context, input graphql1.UpdateWidgetInput) (*graphql1.UpdateWidgetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.UpdateWidget(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveWidget(ctx context.Context, input graphql1.RemoveWidgetInput) (*graphql1.RemoveWidgetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.RemoveWidget(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) InstallPlugin(ctx context.Context, input graphql1.InstallPluginInput) (*graphql1.InstallPluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.InstallPlugin(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UninstallPlugin(ctx context.Context, input graphql1.UninstallPluginInput) (*graphql1.UninstallPluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.UninstallPlugin(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpgradePlugin(ctx context.Context, input graphql1.UpgradePluginInput) (*graphql1.UpgradePluginPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.SceneController.UpgradePlugin(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) SyncDataset(ctx context.Context, input graphql1.SyncDatasetInput) (*graphql1.SyncDatasetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.Sync(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdatePropertyValue(ctx context.Context, input graphql1.UpdatePropertyValueInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UpdateValue(ctx,
		input.PropertyID, input.SchemaItemID, input.ItemID, input.FieldID, input.Value, input.Type, getOperator(ctx))
}

func (r *mutationResolver) UpdatePropertyValueLatLng(ctx context.Context, input graphql1.UpdatePropertyValueLatLngInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UpdateValue(ctx,
		input.PropertyID, input.SchemaItemID, input.ItemID, input.FieldID, graphql1.LatLng{
			Lat: input.Lat,
			Lng: input.Lng,
		}, graphql1.ValueTypeLatlng, getOperator(ctx))
}

func (r *mutationResolver) UpdatePropertyValueLatLngHeight(ctx context.Context, input graphql1.UpdatePropertyValueLatLngHeightInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UpdateValue(ctx,
		input.PropertyID, input.SchemaItemID, input.ItemID, input.FieldID, graphql1.LatLngHeight{
			Lat:    input.Lat,
			Lng:    input.Lng,
			Height: input.Height,
		}, graphql1.ValueTypeLatlngheight, getOperator(ctx))
}

func (r *mutationResolver) UpdatePropertyValueCamera(ctx context.Context, input graphql1.UpdatePropertyValueCameraInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UpdateValue(ctx,
		input.PropertyID, input.SchemaItemID, input.ItemID, input.FieldID, graphql1.Camera{
			Lat:      input.Lat,
			Lng:      input.Lng,
			Altitude: input.Altitude,
			Heading:  input.Heading,
			Pitch:    input.Pitch,
			Roll:     input.Roll,
			Fov:      input.Fov,
		}, graphql1.ValueTypeLatlngheight, getOperator(ctx))
}

func (r *mutationResolver) UpdatePropertyValueTypography(ctx context.Context, input graphql1.UpdatePropertyValueTypographyInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UpdateValue(ctx,
		input.PropertyID, input.SchemaItemID, input.ItemID, input.FieldID, graphql1.Typography{
			FontFamily: input.FontFamily,
			FontSize:   input.FontSize,
			FontWeight: input.FontWeight,
			Color:      input.Color,
			TextAlign:  input.TextAlign,
			Bold:       input.Bold,
			Italic:     input.Italic,
			Underline:  input.Underline,
		}, graphql1.ValueTypeLatlngheight, getOperator(ctx))
}

func (r *mutationResolver) RemovePropertyField(ctx context.Context, input graphql1.RemovePropertyFieldInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.RemoveField(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UploadFileToProperty(ctx context.Context, input graphql1.UploadFileToPropertyInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UploadFile(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) LinkDatasetToPropertyValue(ctx context.Context, input graphql1.LinkDatasetToPropertyValueInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.LinkValue(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UnlinkPropertyValue(ctx context.Context, input graphql1.UnlinkPropertyValueInput) (*graphql1.PropertyFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UnlinkValue(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddPropertyItem(ctx context.Context, input graphql1.AddPropertyItemInput) (*graphql1.PropertyItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.AddItem(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) MovePropertyItem(ctx context.Context, input graphql1.MovePropertyItemInput) (*graphql1.PropertyItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.MoveItem(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemovePropertyItem(ctx context.Context, input graphql1.RemovePropertyItemInput) (*graphql1.PropertyItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.RemoveItem(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdatePropertyItems(ctx context.Context, input graphql1.UpdatePropertyItemInput) (*graphql1.PropertyItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.PropertyController.UpdateItems(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddLayerItem(ctx context.Context, input graphql1.AddLayerItemInput) (*graphql1.AddLayerItemPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.AddItem(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddLayerGroup(ctx context.Context, input graphql1.AddLayerGroupInput) (*graphql1.AddLayerGroupPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.AddGroup(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveLayer(ctx context.Context, input graphql1.RemoveLayerInput) (*graphql1.RemoveLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.Remove(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) UpdateLayer(ctx context.Context, input graphql1.UpdateLayerInput) (*graphql1.UpdateLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.Update(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) MoveLayer(ctx context.Context, input graphql1.MoveLayerInput) (*graphql1.MoveLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.Move(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) CreateInfobox(ctx context.Context, input graphql1.CreateInfoboxInput) (*graphql1.CreateInfoboxPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.CreateInfobox(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveInfobox(ctx context.Context, input graphql1.RemoveInfoboxInput) (*graphql1.RemoveInfoboxPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.RemoveInfobox(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddInfoboxField(ctx context.Context, input graphql1.AddInfoboxFieldInput) (*graphql1.AddInfoboxFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.AddInfoboxField(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) MoveInfoboxField(ctx context.Context, input graphql1.MoveInfoboxFieldInput) (*graphql1.MoveInfoboxFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.MoveInfoboxField(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveInfoboxField(ctx context.Context, input graphql1.RemoveInfoboxFieldInput) (*graphql1.RemoveInfoboxFieldPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.RemoveInfoboxField(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) RemoveDatasetSchema(ctx context.Context, input graphql1.RemoveDatasetSchemaInput) (*graphql1.RemoveDatasetSchemaPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.RemoveDatasetSchema(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) AddDatasetSchema(ctx context.Context, input graphql1.AddDatasetSchemaInput) (*graphql1.AddDatasetSchemaPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.AddDatasetSchema(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) ImportLayer(ctx context.Context, input graphql1.ImportLayerInput) (*graphql1.ImportLayerPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.ImportLayer(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) ImportDataset(ctx context.Context, input graphql1.ImportDatasetInput) (*graphql1.ImportDatasetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.ImportDataset(ctx, &input, getOperator(ctx))
}

func (r *mutationResolver) ImportDatasetFromGoogleSheet(ctx context.Context, input graphql1.ImportDatasetFromGoogleSheetInput) (*graphql1.ImportDatasetPayload, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.ImportDatasetFromGoogleSheet(ctx, &input, getOperator(ctx))
}
