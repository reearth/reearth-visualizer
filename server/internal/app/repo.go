package app

import (
	"context"

	adpaccounts "github.com/reearth/reearth/server/internal/adapter/accounts"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts"
	"github.com/reearth/reearth/server/internal/infrastructure/auth0"
	"github.com/reearth/reearth/server/internal/infrastructure/domain"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/infrastructure/google"
	"github.com/reearth/reearth/server/internal/infrastructure/marketplace"
	mongorepo "github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/infrastructure/policy"
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

func initReposAndGateways(ctx context.Context, conf *config.Config, debug bool) (*repo.Container, *gateway.Container, *accountrepo.Container, *accountgateway.Container, *accounts.Client) {
	gateways := &gateway.Container{}
	acGateways := &accountgateway.Container{}

	// Initialize Accounts API client if enabled
	var accountsAPIClient *accounts.Client
	if conf.AccountsAPI.Enabled {
		log.Infof("accounts API: enabled at %s", conf.AccountsAPI.Host)
		accountsAPIClient = accounts.NewClient(
			conf.AccountsAPI.Host,
			conf.AccountsAPI.Timeout,
			adpaccounts.DynamicAuthTransport{},
		)
	}

	// Mongo

	clientOpts := options.Client().
		ApplyURI(conf.DB).
		SetMonitor(otelmongo.NewMonitor())
	client, err := mongo.Connect(
		ctx,
		clientOpts,
	)

	if err != nil {
		log.Fatalf("mongo error: %+v\n", err)
	}

	txAvailable := mongox.IsTransactionAvailable(conf.DB)
	accountRepos := initAccountDatabase(client, txAvailable, ctx, conf)
	visRepos := initVisDatabase(client, txAvailable, accountRepos, ctx, conf)

	// File
	gateways.File = initFile(ctx, conf)

	// Policy Checker - configurable via environment
	var policyChecker gateway.PolicyChecker
	switch conf.Visualizer.Policy.Checker.Type {
	case "http":
		if conf.Visualizer.Policy.Checker.Endpoint == "" {
			log.Fatalf("policy checker HTTP endpoint is required")
		}
		policyChecker = policy.NewHTTPPolicyChecker(
			conf.Visualizer.Policy.Checker.Endpoint,
			conf.Visualizer.Policy.Checker.Token,
			conf.Visualizer.Policy.Checker.Timeout,
		)
		log.Infof("policy checker: using HTTP checker with endpoint: %s", conf.Visualizer.Policy.Checker.Endpoint)
	case "permissive":
		fallthrough
	default:
		policyChecker = policy.NewPermissiveChecker()
		log.Infof("policy checker: using permissive checker (OSS mode)")
	}
	gateways.PolicyChecker = policyChecker

	// Domain Checker - configurable via environment
	var domainChecker gateway.DomainChecker
	switch conf.Visualizer.DomainChecker.Type {
	case "http":
		if conf.Visualizer.DomainChecker.Endpoint == "" {
			log.Fatalf("domain checker HTTP endpoint is required")
		}
		domainChecker = domain.NewHTTPDomainChecker(
			conf.Visualizer.DomainChecker.Endpoint,
			conf.Visualizer.DomainChecker.Token,
			conf.Visualizer.DomainChecker.Timeout,
		)
		log.Infof("domain checker: using HTTP checker with endpoint: %s", conf.Visualizer.DomainChecker.Endpoint)
	default:
		domainChecker = domain.NewDefaultChecker()
		log.Infof("domain checker: using default checker (OSS mode)")
	}
	gateways.DomainChecker = domainChecker

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

	return visRepos, gateways, accountRepos, acGateways, accountsAPIClient
}

func initFile(ctx context.Context, conf *config.Config) (fileRepo gateway.File) {
	var err error
	if conf.GCS.IsConfigured() {
		isFake := conf.GCS.IsFake
		fileRepo, err = gcs.NewFile(isFake, conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
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
