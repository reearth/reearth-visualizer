package app

import (
	"context"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/auth0"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/infrastructure/google"
	"github.com/reearth/reearth/server/internal/infrastructure/marketplace"
	mongorepo "github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/infrastructure/s3"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox"
	"github.com/spf13/afero"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func initAccountDatabase(client *mongo.Client, txAvailable bool, ctx context.Context, conf *config.Config) *accountrepo.Container {
	accountDatabase := conf.DB_Account
	log.Infof("accountDatabase: %s", accountDatabase)

	accountUsers := make([]accountrepo.User, 0, len(conf.DB_Users))
	for _, u := range conf.DB_Users {
		c, err := mongo.Connect(ctx, options.Client().ApplyURI(u.URI).SetMonitor(otelmongo.NewMonitor()))
		if err != nil {
			log.Fatalf("mongo error: %+v\n", err)
		}
		accountUsers = append(accountUsers, accountmongo.NewUserWithHost(mongox.NewClient(accountDatabase, c), u.Name))
	}

	// this flag is for old database structure compatibility
	// on this service, it is always false
	useLegacyStructure := false
	accountRepos, err := accountmongo.New(ctx, client, accountDatabase, txAvailable, useLegacyStructure, accountUsers)
	if err != nil {
		log.Fatalf("Failed to init mongo database account: %+v\n", err)
	}
	return accountRepos
}

func initVisDatabase(client *mongo.Client, txAvailable bool, accountRepos *accountrepo.Container, ctx context.Context, conf *config.Config) *repo.Container {
	visDatabase := conf.DB_Vis
	log.Infof("visDatabase: %s", visDatabase)

	repos, err := mongorepo.NewWithExtensions(ctx, client.Database(visDatabase), accountRepos, txAvailable, conf.Ext_Plugin)
	if err != nil {
		log.Fatalf("Failed to init mongo database visualizer: %+v\n", err)
	}
	return repos
}

func initReposAndGateways(ctx context.Context, conf *config.Config, debug bool) (*repo.Container, *gateway.Container, *accountrepo.Container, *accountgateway.Container) {
	gateways := &gateway.Container{}
	acGateways := &accountgateway.Container{}

	// Mongo
	client, err := mongo.Connect(
		ctx,
		options.Client().
			ApplyURI(conf.DB).
			SetMonitor(otelmongo.NewMonitor()),
	)
	if err != nil {
		log.Fatalf("mongo error: %+v\n", err)
	}
	txAvailable := mongox.IsTransactionAvailable(conf.DB)
	accountRepos := initAccountDatabase(client, txAvailable, ctx, conf)
	visRepos := initVisDatabase(client, txAvailable, accountRepos, ctx, conf)

	// File
	gateways.File = initFile(ctx, conf)

	// Auth0
	auth0 := auth0.New(conf.Auth0.Domain, conf.Auth0.ClientID, conf.Auth0.ClientSecret)
	gateways.Authenticator = auth0
	acGateways.Authenticator = auth0

	// google
	gateways.Google = google.NewGoogle()

	// mailer
	mailer := mailer.New(ctx, &conf.Config)
	gateways.Mailer = mailer
	acGateways.Mailer = mailer
	// Marketplace
	if conf.Marketplace.Endpoint != "" {
		gateways.PluginRegistry = marketplace.New(conf.Marketplace.Endpoint, conf.Marketplace.Secret, conf.Marketplace.OAuth.Config())
	}

	// release lock of all scenes
	if err := visRepos.SceneLock.ReleaseAllLock(context.Background()); err != nil {
		log.Fatalf("repo initialization error: %v", err)
	}

	return visRepos, gateways, accountRepos, acGateways
}

func initFile(ctx context.Context, conf *config.Config) (fileRepo gateway.File) {
	var err error
	if conf.GCS.IsConfigured() {
		log.Infofc(ctx, "file: GCS storage is used: %s\n", conf.GCS.BucketName)
		fileRepo, err = gcs.NewFile(false, conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
		if err != nil {
			log.Warnf("file: failed to init GCS storage: %s\n", err.Error())
		}
		return

	}

	if conf.S3.IsConfigured() {
		log.Infofc(ctx, "file: S3 storage is used: %s\n", conf.S3.BucketName)
		fileRepo, err = s3.NewS3(ctx, conf.S3.BucketName, conf.AssetBaseURL, conf.S3.PublicationCacheControl)
		if err != nil {
			log.Warnf("file: failed to init S3 storage: %s\n", err.Error())
		}
		return
	}

	log.Infof("file: local storage is used")
	afs := afero.NewBasePathFs(afero.NewOsFs(), "data")
	fileRepo, err = fs.NewFile(afs, conf.AssetBaseURL)
	if err != nil {
		log.Fatalf("file: init error: %+v", err)
	}
	return fileRepo
}
