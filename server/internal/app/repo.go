package app

import (
	"context"
	"fmt"

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
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox"
	"github.com/spf13/afero"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func initReposAndGateways(ctx context.Context, conf *config.Config, debug bool) (*repo.Container, *gateway.Container) {
	gateways := &gateway.Container{}

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

	repos, err := mongorepo.New(ctx, client.Database("reearth"), mongox.IsTransactionAvailable(conf.DB))
	if err != nil {
		log.Fatalf("Failed to init mongo: %+v\n", err)
	}

	// File
	gateways.File = initFile(ctx, conf)

	// Auth0
	gateways.Authenticator = auth0.New(conf.Auth0.Domain, conf.Auth0.ClientID, conf.Auth0.ClientSecret)

	// google
	gateways.Google = google.NewGoogle()

	// mailer
	gateways.Mailer = mailer.New(ctx, &conf.Config)

	// Marketplace
	if conf.Marketplace.Endpoint != "" {
		gateways.PluginRegistry = marketplace.New(conf.Marketplace.Endpoint, conf.Marketplace.Secret, conf.Marketplace.OAuth.Config())
	}

	// release lock of all scenes
	if err := repos.SceneLock.ReleaseAllLock(context.Background()); err != nil {
		log.Fatal(fmt.Sprintf("repo initialization error: %+v", err))
	}

	return repos, gateways
}

func initFile(ctx context.Context, conf *config.Config) (fileRepo gateway.File) {
	var err error
	if conf.GCS.IsConfigured() {
		log.Infof("file: GCS storage is used: %s\n", conf.GCS.BucketName)
		fileRepo, err = gcs.NewFile(conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
		if err != nil {
			log.Warnf("file: failed to init GCS storage: %s\n", err.Error())
		}
		return

	}

	if conf.S3.IsConfigured() {
		log.Infof("file: S3 storage is used: %s\n", conf.S3.BucketName)
		fileRepo, err = s3.NewS3(ctx, conf.S3.BucketName, conf.AssetBaseURL, conf.S3.PublicationCacheControl)
		if err != nil {
			log.Warnf("file: failed to init S3 storage: %s\n", err.Error())
		}
		return
	}

	log.Info("file: local storage is used")
	afs := afero.NewBasePathFs(afero.NewOsFs(), "data")
	fileRepo, err = fs.NewFile(afs, conf.AssetBaseURL)
	if err != nil {
		log.Fatal(fmt.Sprintf("file: init error: %+v", err))
	}
	return fileRepo
}
