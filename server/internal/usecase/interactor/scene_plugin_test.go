package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/plugin/pluginpack"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestScene_InstallPlugin(t *testing.T) {
	type args struct {
		pluginID plugin.ID
		operator *usecase.Operator
	}

	type test struct {
		name                  string
		installedScenePlugins []*scene.Plugin
		args                  args
		wantErr               error
	}

	sid := scene.NewID()
	pid := plugin.MustID("plugin~1.0.0")
	pid2 := plugin.MustID("plugin~1.0.1")
	pid3 := plugin.MustID("plugin~1.0.1").WithScene(&sid)
	pid4 := plugin.MustID("plugin~1.0.1").WithScene(scene.NewID().Ref())

	tests := []test{
		{
			name: "should install a plugin",
			args: args{
				pluginID: pid,
			},
		},
		{
			name: "should install a private plugin with property schema",
			args: args{
				pluginID: pid3,
			},
		},
		{
			name: "already installed",
			installedScenePlugins: []*scene.Plugin{
				scene.NewPlugin(pid, nil),
			},
			args: args{
				pluginID: pid,
			},
			wantErr: interfaces.ErrPluginAlreadyInstalled,
		},
		{
			name: "not found",
			args: args{
				pluginID: pid2,
			},
			wantErr: interfaces.ErrPluginNotFound,
		},
		{
			name: "diff scene",
			args: args{
				pluginID: pid4,
			},
			wantErr: interfaces.ErrPluginNotFound,
		},
		{
			name: "operation denied",
			args: args{
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				},
			},
			wantErr: interfaces.ErrOperationDenied,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel() // avoid data race
			assert := assert.New(t)
			ctx := context.Background()

			tid := accountdomain.NewWorkspaceID()
			sc := scene.New().ID(sid).Workspace(tid).MustBuild()
			for _, p := range tt.installedScenePlugins {
				sc.Plugins().Add(p)
			}
			sr := memory.NewSceneWith(sc)
			pl := plugin.New().ID(pid).MustBuild()
			pl2 := plugin.New().ID(pid3).Schema(id.NewPropertySchemaID(pid3, "@").Ref()).MustBuild()
			pl3 := plugin.New().ID(pid4).MustBuild()
			pr := memory.NewPluginWith(pl, pl2, pl3)

			prr := memory.NewProperty()

			uc := &Scene{
				sceneRepo:      sr,
				pluginRepo:     pr,
				pluginRegistry: &mockPluginRegistry{},
				propertyRepo:   prr,
				transaction:    &usecasex.NopTransaction{},
			}

			o := tt.args.operator
			if o == nil {
				o = &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						WritableWorkspaces: accountdomain.WorkspaceIDList{tid},
					},
				}
			}
			gotSc, gotPrid, err := uc.InstallPlugin(ctx, sid, tt.args.pluginID, o)

			if tt.wantErr != nil {
				assert.Equal(tt.wantErr, err)
				assert.Nil(gotSc)
				assert.True(gotPrid.IsNil())
			} else {
				assert.NoError(err)
				assert.Same(sc, gotSc)
				if tt.args.pluginID.Equal(pl2.ID()) {
					assert.False(gotPrid.IsNil())
					gotPr, _ := prr.FindByID(ctx, *gotPrid)
					assert.Equal(*pl2.Schema(), gotPr.Schema())
				} else {
					assert.True(gotPrid.IsNil())
				}
				assert.True(gotSc.Plugins().Has(tt.args.pluginID))
			}
		})
	}
}

func TestScene_UninstallPlugin(t *testing.T) {
	type args struct {
		pluginID plugin.ID
		operator *usecase.Operator
	}

	type test struct {
		name    string
		args    args
		wantErr error
	}

	sid := scene.NewID()
	pid := plugin.MustID("plugin~1.0.0")
	pid2 := plugin.MustID("plugin~1.0.1")
	pid3 := plugin.MustID("plugin~1.0.2")
	pid4 := plugin.MustID("plugin2~1.0.3").WithScene(&sid)

	tests := []test{
		{
			name: "should uninstall a plugin",
			args: args{
				pluginID: pid,
			},
		},
		{
			name: "should uninstall a private plugin",
			args: args{
				pluginID: pid4,
			},
		},
		{
			name: "not installed plugin",
			args: args{
				pluginID: pid2,
			},
			wantErr: interfaces.ErrPluginNotInstalled,
		},
		{
			name: "not found",
			args: args{
				pluginID: pid3,
			},
			wantErr: interfaces.ErrPluginNotFound,
		},
		{
			name: "operation denied",
			args: args{
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				}},
			wantErr: interfaces.ErrOperationDenied,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert := assert.New(t)
			ctx := context.Background()

			psid := id.NewPropertySchemaID(pid, "@")
			pl3ps := property.NewSchema().ID(psid).MustBuild()
			psr := memory.NewPropertySchemaWith(pl3ps)

			pl1 := plugin.New().ID(pid).MustBuild()
			pl2 := plugin.New().ID(pid2).MustBuild()
			pl3 := plugin.New().ID(pid4).Schema(&psid).MustBuild()
			pr := memory.NewPluginWith(pl1, pl2, pl3)

			ppr := property.New().NewID().Scene(sid).Schema(*pl3.Schema()).MustBuild()
			ppr2 := property.New().NewID().Scene(sid).Schema(id.NewPropertySchemaID(pid, "a")).MustBuild()
			prr := memory.NewPropertyWith(ppr, ppr2)

			ibf := layer.NewInfoboxField().NewID().Plugin(pid).Extension("a").Property(id.NewPropertyID()).MustBuild()
			ib := layer.NewInfobox([]*layer.InfoboxField{ibf}, id.NewPropertyID())
			l1 := layer.New().NewID().Scene(sid).Infobox(ib).Item().MustBuild()
			l2 := layer.New().NewID().Scene(sid).Group().Layers(layer.NewIDList([]layer.ID{l1.ID()})).MustBuild()
			lr := memory.NewLayerWith(l1, l2)

			tid := accountdomain.NewWorkspaceID()
			sc := scene.New().ID(sid).Workspace(tid).MustBuild()
			sc.Plugins().Add(scene.NewPlugin(pid, nil))
			sc.Plugins().Add(scene.NewPlugin(pid4, ppr.ID().Ref()))
			sw, _ := scene.NewWidget(scene.NewWidgetID(), pid, "a", ppr2.ID(), true, false)
			sc.Widgets().Add(sw)
			sr := memory.NewSceneWith(sc)

			fsg, _ := fs.NewFile(afero.NewMemMapFs(), "")

			uc := &Scene{
				sceneRepo:          sr,
				pluginRepo:         pr,
				propertyRepo:       prr,
				layerRepo:          lr,
				propertySchemaRepo: psr,
				file:               fsg,
				transaction:        &usecasex.NopTransaction{},
			}

			o := tt.args.operator
			if o == nil {
				o = &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						WritableWorkspaces: accountdomain.WorkspaceIDList{tid},
					},
				}
			}
			gotSc, err := uc.UninstallPlugin(ctx, sid, tt.args.pluginID, o)

			if tt.wantErr != nil {
				assert.Equal(tt.wantErr, err)
				assert.Nil(gotSc)
			} else {
				assert.NoError(err)
				assert.Same(sc, gotSc)
				assert.False(gotSc.Plugins().Has(tt.args.pluginID))

				if tt.args.pluginID.Equal(pid) {
					assert.False(sc.Widgets().Has(sw.ID()))
					_, err = prr.FindByID(ctx, ppr2.ID())
					assert.Equal(rerror.ErrNotFound, err)
				}

				if tt.args.pluginID.Equal(pid4) {
					_, err = prr.FindByID(ctx, ppr.ID())
					assert.Equal(rerror.ErrNotFound, err)
				}

				if !tt.args.pluginID.Scene().IsNil() {
					if tt.args.pluginID.Equal(pid4) {
						_, err := psr.FindByID(ctx, ppr.Schema())
						assert.Equal(rerror.ErrNotFound, err)
					}

					_, err = pr.FindByID(ctx, tt.args.pluginID)
					assert.Equal(rerror.ErrNotFound, err)
				}
			}
		})
	}
}

func TestScene_UpgradePlugin(t *testing.T) {
	type args struct {
		old      plugin.ID
		new      plugin.ID
		operator *usecase.Operator
	}

	type test struct {
		name    string
		args    args
		wantErr error
	}

	sid := scene.NewID()
	pid1 := plugin.MustID("plugin~1.0.0")
	pid2 := plugin.MustID("plugin~1.0.1")
	pid3 := plugin.MustID("plugin~1.0.2")
	pid4 := plugin.MustID("pluginx~1.0.2")

	tests := []test{
		{
			name: "should upgrade a plugin",
			args: args{
				old: pid1,
				new: pid2,
			},
		},
		{
			name: "not installed",
			args: args{
				old: pid2,
				new: pid3,
			},
			wantErr: interfaces.ErrPluginNotInstalled,
		},
		{
			name: "diff names",
			args: args{
				old: pid1,
				new: pid4,
			},
			wantErr: interfaces.ErrCannotUpgradeToPlugin,
		},
		{
			name: "operation denied",
			args: args{
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				}},
			wantErr: interfaces.ErrOperationDenied,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert := assert.New(t)
			ctx := context.Background()

			pl1ps := property.NewSchema().ID(id.NewPropertySchemaID(pid1, "@")).MustBuild()
			pl2ps := property.NewSchema().ID(id.NewPropertySchemaID(pid2, "@")).MustBuild()
			psr := memory.NewPropertySchemaWith(pl1ps, pl2ps)

			pl1 := plugin.New().ID(pid1).Schema(pl1ps.ID().Ref()).Extensions([]*plugin.Extension{
				plugin.NewExtension().ID("a").Type(plugin.ExtensionTypeBlock).Schema(pl1ps.ID()).MustBuild(),
			}).MustBuild()
			pl2 := plugin.New().ID(pid2).Schema(pl2ps.ID().Ref()).Extensions([]*plugin.Extension{
				plugin.NewExtension().ID("a").Type(plugin.ExtensionTypeBlock).Schema(pl2ps.ID()).MustBuild(),
			}).MustBuild()
			pr := memory.NewPluginWith(pl1, pl2)

			pl1p := property.New().NewID().Scene(sid).Schema(*pl1.Schema()).MustBuild()
			pl2p := property.New().NewID().Scene(sid).Schema(*pl1.Schema()).MustBuild()
			prr := memory.NewPropertyWith(pl1p, pl2p)

			ibf1 := layer.NewInfoboxField().NewID().Plugin(plugin.OfficialPluginID).Extension("textblock").Property(id.NewPropertyID()).MustBuild()
			ibf2 := layer.NewInfoboxField().NewID().Plugin(pid1).Extension("a").Property(pl2p.ID()).MustBuild()
			ib := layer.NewInfobox([]*layer.InfoboxField{ibf1, ibf2}, id.NewPropertyID())
			l1 := layer.New().NewID().Plugin(plugin.OfficialPluginID.Ref()).Scene(sid).Infobox(ib).Item().MustBuild()
			l2 := layer.New().NewID().Plugin(plugin.OfficialPluginID.Ref()).Scene(sid).Group().Layers(layer.NewIDList([]layer.ID{l1.ID()})).MustBuild()
			lr := memory.NewLayerWith(l1, l2)

			dsr := memory.NewDataset()

			tid := accountdomain.NewWorkspaceID()
			sc := scene.New().ID(sid).Workspace(tid).MustBuild()
			sc.Plugins().Add(scene.NewPlugin(pid1, pl1p.ID().Ref()))
			sr := memory.NewSceneWith(sc)

			uc := &Scene{
				sceneRepo:          sr,
				pluginRepo:         pr,
				propertyRepo:       prr,
				propertySchemaRepo: psr,
				layerRepo:          lr,
				datasetRepo:        dsr,
				pluginRegistry:     &mockPluginRegistry{},
				transaction:        &usecasex.NopTransaction{},
			}

			o := tt.args.operator
			if o == nil {
				o = &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						WritableWorkspaces: accountdomain.WorkspaceIDList{tid},
					},
				}
			}
			gotSc, err := uc.UpgradePlugin(ctx, sid, tt.args.old, tt.args.new, o)

			if tt.wantErr != nil {
				assert.Equal(tt.wantErr, err)
				assert.Nil(gotSc)
				return
			}

			assert.NoError(err)
			assert.Same(sc, gotSc)
			assert.False(gotSc.Plugins().Has(tt.args.old))
			assert.True(gotSc.Plugins().Has(tt.args.new))
			p, _ := prr.FindByID(ctx, *gotSc.Plugins().Plugin(tt.args.new).Property())
			assert.Equal(*pl2.Schema(), p.Schema())

			// layers plugin id should not be changed
			ls, err := lr.FindByScene(ctx, sid)
			assert.NoError(err)
			for _, l := range ls {
				assert.Equal(plugin.OfficialPluginID.Ref(), (*l).Plugin())
			}

			// layer > infobox > field
			ll1 := *ls.Find(l1.ID())
			assert.NotNil(ll1.Infobox().Field(ibf1.ID()))
			assert.Equal(id.OfficialPluginID, ll1.Infobox().Field(ibf1.ID()).Plugin())
			assert.NotNil(ll1.Infobox().Field(ibf2.ID()))
			assert.Equal(tt.args.new, ll1.Infobox().Field(ibf2.ID()).Plugin())
			prop, err := prr.FindByID(ctx, ll1.Infobox().Field(ibf2.ID()).Property())
			assert.NoError(err)
			assert.Equal(tt.args.new, prop.Schema().Plugin())
		})
	}
}

type mockPluginRegistry struct {
	gateway.PluginRegistry
}

func (g *mockPluginRegistry) FetchPluginPackage(context.Context, id.PluginID) (*pluginpack.Package, error) {
	return nil, rerror.ErrNotFound
}

func (g *mockPluginRegistry) NotifyDownload(context.Context, id.PluginID) error {
	return nil
}
