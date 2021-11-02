package app

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth-backend/internal/infrastructure/github"
	"github.com/reearth/reearth-backend/internal/infrastructure/google"
	"github.com/spf13/afero"

	"github.com/reearth/reearth-backend/internal/infrastructure/auth0"
	"github.com/reearth/reearth-backend/internal/infrastructure/fs"
	"github.com/reearth/reearth-backend/internal/infrastructure/gcs"
	mongorepo "github.com/reearth/reearth-backend/internal/infrastructure/mongo"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func initReposAndGateways(ctx context.Context, conf *Config, debug bool) (*repo.Container, *gateway.Container) {
	repos := &repo.Container{}
	gateways := &gateway.Container{}

	// Mongo
	client, err := mongo.Connect(
		ctx,
		options.Client().
			ApplyURI(conf.DB).
			SetConnectTimeout(time.Second*10).
			SetMonitor(otelmongo.NewMonitor()),
	)
	if err != nil {
		log.Fatalln(fmt.Sprintf("repo initialization error: %+v", err))
	}
	if err := mongorepo.InitRepos(ctx, repos, client, "reearth"); err != nil {
		log.Fatalln(fmt.Sprintf("Failed to init mongo: %+v", err))
	}

	// File
	datafs := afero.NewBasePathFs(afero.NewOsFs(), "data")
	var fileRepo gateway.File
	if conf.GCS.BucketName == "" {
		log.Infoln("file: local storage is used")
		fileRepo, err = fs.NewFile(datafs, conf.AssetBaseURL)
	} else {
		log.Infof("file: GCS storage is used: %s\n", conf.GCS.BucketName)
		fileRepo, err = gcs.NewFile(conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
		if err != nil {
			if debug {
				log.Warnf("file: failed to init GCS storage: %s\n", err.Error())
				err = nil
			}
		}
	}
	if err != nil {
		log.Fatalln(fmt.Sprintf("file: init error: %+v", err))
	}
	gateways.File = fileRepo

	// Auth0
	gateways.Authenticator = auth0.New(conf.Auth0.Domain, conf.Auth0.ClientID, conf.Auth0.ClientSecret)

	// github
	gateways.PluginRegistry = github.NewPluginRegistry()

	// google
	gateways.Google = google.NewGoogle()

	// release lock of all scenes
	if err := repos.SceneLock.ReleaseAllLock(context.Background()); err != nil {
		log.Fatalln(fmt.Sprintf("repo initialization error: %+v", err))
	}

	return repos, gateways
}
