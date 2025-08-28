package app

import (
	"context"
	"io"
	"mime"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type DomainAuthorizationService struct {
	assetRepo   repo.Asset
	projectRepo repo.Project
	pluginRepo  repo.Plugin
}

func NewDomainAuthorizationService(
	assetRepo repo.Asset,
	projectRepo repo.Project,
	pluginRepo repo.Plugin,
) *DomainAuthorizationService {
	return &DomainAuthorizationService{
		assetRepo:   assetRepo,
		projectRepo: projectRepo,
		pluginRepo:  pluginRepo,
	}
}

// ValidateAssetAccess checks if a domain is authorized to access an asset
func (s *DomainAuthorizationService) ValidateAssetAccess(ctx context.Context, assetIDStr string, origin string) (*id.ProjectID, error) {
	assetID, err := id.AssetIDFrom(assetIDStr)
	if err != nil {
		log.Debugfc(ctx, "secure_file: invalid asset ID: %s", assetIDStr)
		return nil, rerror.ErrNotFound
	}

	asset, err := s.assetRepo.FindByID(ctx, assetID)
	if err != nil {
		log.Debugfc(ctx, "secure_file: asset not found: %s", assetIDStr)
		return nil, rerror.ErrNotFound
	}

	projectID := asset.Project()
	if projectID == nil {
		log.Warnfc(ctx, "secure_file: asset has no project: %s", assetIDStr)
		return nil, rerror.ErrNotFound
	}

	authorized, err := s.isDomainAuthorizedForProject(ctx, origin, *projectID)
	if err != nil {
		log.Errorfc(ctx, "secure_file: error checking domain authorization: %v", err)
		return nil, rerror.ErrInternalBy(err)
	}

	if !authorized {
		log.Warnfc(ctx, "secure_file: unauthorized domain %s for project %s", origin, projectID.String())
		return nil, rerror.ErrNotFound
	}

	return projectID, nil
}

func (s *DomainAuthorizationService) ValidatePluginAccess(ctx context.Context, pluginIDStr string, origin string) error {
	pluginID, err := id.PluginIDFrom(pluginIDStr)
	if err != nil {
		log.Debugfc(ctx, "secure_file: invalid plugin ID: %s", pluginIDStr)
		return rerror.ErrNotFound
	}

	plugin, err := s.pluginRepo.FindByID(ctx, pluginID)
	if err != nil {
		log.Debugfc(ctx, "secure_file: plugin not found: %s", pluginIDStr)
		return rerror.ErrNotFound
	}

	// System plugins are public
	if plugin.ID().System() {
		return nil
	}

	log.Infofc(ctx, "secure_file: plugin access from %s to %s (validation pending)", origin, pluginIDStr)
	
	return nil
}

func (s *DomainAuthorizationService) ValidateExportAccess(ctx context.Context, filename string, origin string) error {
	// Export filename format: project_[projectID]_export_[timestamp].zip
	parts := strings.Split(filename, "_")
	if len(parts) < 2 || parts[0] != "project" {
		log.Warnfc(ctx, "secure_file: invalid export filename format: %s", filename)
		return rerror.ErrNotFound
	}

	projectIDStr := parts[1]
	projectID, err := id.ProjectIDFrom(projectIDStr)
	if err != nil {
		log.Debugfc(ctx, "secure_file: invalid project ID in export filename: %s", projectIDStr)
		return rerror.ErrNotFound
	}

	authorized, err := s.isDomainAuthorizedForProject(ctx, origin, projectID)
	if err != nil {
		log.Errorfc(ctx, "secure_file: error checking domain authorization: %v", err)
		return rerror.ErrInternalBy(err)
	}

	if !authorized {
		log.Warnfc(ctx, "secure_file: unauthorized domain %s for export of project %s", origin, projectID.String())
		return rerror.ErrNotFound
	}

	return nil
}

func (s *DomainAuthorizationService) isDomainAuthorizedForProject(ctx context.Context, origin string, projectID id.ProjectID) (bool, error) {
	domain := extractDomain(origin)
	if domain == "" {
		return false, nil
	}

	proj, err := s.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		return false, err
	}

	if proj.PublishmentStatus() == project.PublishmentStatusPublic {
		if proj.Alias() != "" && strings.Contains(domain, proj.Alias()) {
			return true, nil
		}
	}
	
	return false, nil
}

func extractDomain(origin string) string {
	if origin == "" {
		return ""
	}
	
	domain := strings.TrimPrefix(origin, "https://")
	domain = strings.TrimPrefix(domain, "http://")
	
	if idx := strings.Index(domain, ":"); idx != -1 {
		domain = domain[:idx]
	}
	
	if idx := strings.Index(domain, "/"); idx != -1 {
		domain = domain[:idx]
	}
	
	return domain
}

func SecureFileServingMiddleware(authService *DomainAuthorizationService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			origin := c.Request().Header.Get("Origin")
			if origin == "" {
				origin = c.Request().Header.Get("Referer")
			}

			path := c.Request().URL.Path

			log.Debugfc(c.Request().Context(), "secure_file: access attempt from %s to %s", origin, path)

			if strings.HasPrefix(path, "/api/ping") || strings.HasPrefix(path, "/api/health") {
				return next(c)
			}

			c.Response().Header().Set("X-Content-Type-Options", "nosniff")
			c.Response().Header().Set("X-Frame-Options", "DENY")
			
			return next(c)
		}
	}
}

func secureServeFiles(
	ec *echo.Echo,
	fileRepo gateway.File,
	authService *DomainAuthorizationService,
) {
	if fileRepo == nil || authService == nil {
		return
	}

	secureFileHandler := func(
		handler func(echo.Context) (io.Reader, string, *id.ProjectID, error),
	) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			reader, filename, projectID, err := handler(ctx)
			if err != nil {
				log.Errorfc(ctx.Request().Context(), "secure_file: handler error: %v", err)
				return err
			}

			origin := ctx.Request().Header.Get("Origin")
			if origin == "" {
				origin = ctx.Request().Header.Get("Referer")
			}

			if origin != "" && projectID != nil {
				ctx.Response().Header().Set("Access-Control-Allow-Origin", origin)
				ctx.Response().Header().Set("Access-Control-Allow-Credentials", "true")
				ctx.Response().Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			}

			ct := "application/octet-stream"
			if ext := path.Ext(filename); ext != "" {
				ct2 := mime.TypeByExtension(ext)
				if ct2 != "" {
					ct = ct2
				}
			}

			if strings.HasPrefix(ctx.Request().URL.Path, "/assets/") {
				ctx.Response().Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			}

			return ctx.Stream(http.StatusOK, ct, reader)
		}
	}

	ec.GET(
		"/assets/:filename",
		secureFileHandler(func(ctx echo.Context) (io.Reader, string, *id.ProjectID, error) {
			filename := ctx.Param("filename")
			origin := ctx.Request().Header.Get("Origin")
			
			projectID, err := authService.ValidateAssetAccess(ctx.Request().Context(), filename, origin)
			if err != nil {
				return nil, "", nil, err
			}

			r, err := fileRepo.ReadAsset(ctx.Request().Context(), filename)
			return r, filename, projectID, err
		}),
	)

	ec.GET(
		"/export/:filename",
		secureFileHandler(func(ctx echo.Context) (io.Reader, string, *id.ProjectID, error) {
			filename := ctx.Param("filename")
			origin := ctx.Request().Header.Get("Origin")

			err := authService.ValidateExportAccess(ctx.Request().Context(), filename, origin)
			if err != nil {
				return nil, "", nil, err
			}

			r, err := fileRepo.ReadExportProjectZip(ctx.Request().Context(), filename)
			if err != nil {
				return nil, "", nil, err
			}

			go func(fname string) {
				ctx := context.Background()
				time.Sleep(5 * time.Second)
				if err := fileRepo.RemoveExportProjectZip(ctx, fname); err != nil {
					log.Errorfc(ctx, "secure_file: failed to delete export file %s: %v", fname, err)
				} else {
					log.Infofc(ctx, "secure_file: deleted export file %s", fname)
				}
			}(filename)

			return r, filename, nil, nil
		}),
	)

	ec.GET(
		"/plugins/:plugin/:filename",
		secureFileHandler(func(ctx echo.Context) (io.Reader, string, *id.ProjectID, error) {
			pluginIDStr := ctx.Param("plugin")
			filename := ctx.Param("filename")
			origin := ctx.Request().Header.Get("Origin")

			err := authService.ValidatePluginAccess(ctx.Request().Context(), pluginIDStr, origin)
			if err != nil {
				return nil, "", nil, err
			}

			pid, err := id.PluginIDFrom(pluginIDStr)
			if err != nil {
				return nil, "", nil, rerror.ErrNotFound
			}

			r, err := fileRepo.ReadPluginFile(ctx.Request().Context(), pid, filename)
			return r, filename, nil, err
		}),
	)

	ec.GET(
		"/published/:name",
		secureFileHandler(func(ctx echo.Context) (io.Reader, string, *id.ProjectID, error) {
			name := ctx.Param("name")
			
			r, err := fileRepo.ReadBuiltSceneFile(ctx.Request().Context(), name)
			return r, name + ".json", nil, err
		}),
	)
}

func AttachDomainAuthorizationMiddleware(repos *repo.Container) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if repos == nil {
				return next(c)
			}

			authService := NewDomainAuthorizationService(
				repos.Asset,
				repos.Project,
				repos.Plugin,
			)

			ctx := context.WithValue(c.Request().Context(), "domainAuthService", authService)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

func getDomainAuthService(c echo.Context) *DomainAuthorizationService {
	if val := c.Request().Context().Value("domainAuthService"); val != nil {
		if authService, ok := val.(*DomainAuthorizationService); ok {
			return authService
		}
	}
	return nil
}
