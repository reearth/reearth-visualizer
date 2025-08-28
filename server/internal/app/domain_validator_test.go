package app

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestDomainValidator_RegisterProjectDomain(t *testing.T) {
	validator := NewDomainValidator()
	projectID := id.NewProjectID()

	validator.RegisterProjectDomain(projectID, "example.com")
	validator.RegisterProjectDomain(projectID, "subdomain.example.com")
	validator.RegisterProjectDomain(projectID, "example.com")

	domains := validator.GetDomainsForProject(projectID)
	assert.Len(t, domains, 2)
	assert.Contains(t, domains, "example.com")
	assert.Contains(t, domains, "subdomain.example.com")

	projects := validator.GetProjectsForDomain("example.com")
	assert.Len(t, projects, 1)
	assert.Contains(t, projects, projectID)
}

func TestDomainValidator_SetProjectPublic(t *testing.T) {
	validator := NewDomainValidator()
	projectID := id.NewProjectID()

	assert.False(t, validator.IsProjectPublic(projectID))

	validator.SetProjectPublic(projectID, true)
	assert.True(t, validator.IsProjectPublic(projectID))

	validator.SetProjectPublic(projectID, false)
	assert.False(t, validator.IsProjectPublic(projectID))
}

func TestDomainValidator_ValidateDomainForProject(t *testing.T) {
	validator := NewDomainValidator()
	projectID1 := id.NewProjectID()
	projectID2 := id.NewProjectID()

	validator.RegisterProjectDomain(projectID1, "project1.com")
	validator.RegisterProjectDomain(projectID1, "*.wildcard1.com")
	validator.SetProjectPublic(projectID1, false)

	validator.RegisterProjectDomain(projectID2, "project2.com")
	validator.SetProjectPublic(projectID2, true)

	assert.True(t, validator.ValidateDomainForProject("project1.com", projectID1))
	assert.True(t, validator.ValidateDomainForProject("app.wildcard1.com", projectID1))
	assert.True(t, validator.ValidateDomainForProject("api.app.wildcard1.com", projectID1))
	assert.False(t, validator.ValidateDomainForProject("unauthorized.com", projectID1))
	assert.True(t, validator.ValidateDomainForProject("any-random-domain.com", projectID2))
	assert.True(t, validator.ValidateDomainForProject("https://project1.com", projectID1))
	assert.True(t, validator.ValidateDomainForProject("project1.com:8080", projectID1))
}

func TestDomainValidator_GetProjectsForDomain(t *testing.T) {
	validator := NewDomainValidator()
	projectID1 := id.NewProjectID()
	projectID2 := id.NewProjectID()

	validator.RegisterProjectDomain(projectID1, "shared.com")
	validator.RegisterProjectDomain(projectID2, "shared.com")
	validator.RegisterProjectDomain(projectID1, "unique1.com")

	sharedProjects := validator.GetProjectsForDomain("shared.com")
	assert.Len(t, sharedProjects, 2)
	assert.Contains(t, sharedProjects, projectID1)
	assert.Contains(t, sharedProjects, projectID2)

	uniqueProjects := validator.GetProjectsForDomain("unique1.com")
	assert.Len(t, uniqueProjects, 1)
	assert.Contains(t, uniqueProjects, projectID1)

	noProjects := validator.GetProjectsForDomain("nonexistent.com")
	assert.Len(t, noProjects, 0)
}

func TestDomainValidator_LoadProjectDomains(t *testing.T) {
	ctx := context.Background()
	validator := NewDomainValidator()
	workspaceID := accountdomain.NewWorkspaceID()
	projectID := id.NewProjectID()

	testProject := project.New().
		ID(projectID).
		Workspace(workspaceID).
		Alias("myproject").
		PublishmentStatus(project.PublishmentStatusPublic).
		PublicTitle("My Public Project").
		MustBuild()

	validator.LoadProjectDomains(ctx, testProject)

	assert.True(t, validator.IsProjectPublic(projectID))

	domains := validator.GetDomainsForProject(projectID)
	assert.Len(t, domains, 3)
	assert.Contains(t, domains, "myproject.reearth.io")
	assert.Contains(t, domains, "myproject.reearth.dev")
	assert.Contains(t, domains, "myproject.reearth-app.com")

	assert.True(t, validator.ValidateDomainForProject("myproject.reearth.io", projectID))
	assert.True(t, validator.ValidateDomainForProject("myproject.reearth.dev", projectID))
	assert.True(t, validator.ValidateDomainForProject("myproject.reearth-app.com", projectID))
}

func TestNormalizeDomain_Extended(t *testing.T) {
	assert.Equal(t, "example.com", normalizeDomain("example.com"))
	assert.Equal(t, "example.com", normalizeDomain("https://example.com"))
	assert.Equal(t, "example.com", normalizeDomain("http://example.com/path/to/resource"))
	assert.Equal(t, "example.com", normalizeDomain("example.com:8080"))
	assert.Equal(t, "example.com", normalizeDomain("https://example.com:443"))
	assert.Equal(t, "example.com", normalizeDomain("Example.COM"))
	assert.Equal(t, "example.com", normalizeDomain("example.com."))
	assert.Equal(t, "sub.example.com", normalizeDomain("HTTPS://Sub.Example.COM:8080/path?query=value#hash"))
	assert.Equal(t, "192.168.1.1", normalizeDomain("192.168.1.1:8080"))
	assert.Equal(t, "[2001:db8::1]", normalizeDomain("[2001:db8::1]:8080"))
	assert.Equal(t, "api.v2.example.com", normalizeDomain("api.v2.example.com"))
	assert.Equal(t, "", normalizeDomain(""))
}

func TestDomainValidator_WildcardMatching(t *testing.T) {
	validator := NewDomainValidator()
	projectID := id.NewProjectID()

	validator.RegisterProjectDomain(projectID, "*.example.com")
	validator.RegisterProjectDomain(projectID, "*.*.multi.com")
	validator.RegisterProjectDomain(projectID, "specific.domain.com")

	assert.True(t, validator.ValidateDomainForProject("app.example.com", projectID))
	assert.True(t, validator.ValidateDomainForProject("api.app.example.com", projectID))
	assert.True(t, validator.ValidateDomainForProject("example.com", projectID))
	assert.False(t, validator.ValidateDomainForProject("api.v2.multi.com", projectID))
	assert.True(t, validator.ValidateDomainForProject("specific.domain.com", projectID))
	assert.False(t, validator.ValidateDomainForProject("sub.specific.domain.com", projectID))
}

func TestDomainValidator_ConcurrentAccess(t *testing.T) {
	validator := NewDomainValidator()
	projectID := id.NewProjectID()

	done := make(chan bool, 3)

	go func() {
		for i := 0; i < 100; i++ {
			validator.RegisterProjectDomain(projectID, "domain.com")
		}
		done <- true
	}()

	go func() {
		for i := 0; i < 100; i++ {
			validator.ValidateDomainForProject("domain.com", projectID)
		}
		done <- true
	}()

	go func() {
		for i := 0; i < 100; i++ {
			validator.SetProjectPublic(projectID, i%2 == 0)
		}
		done <- true
	}()

	for i := 0; i < 3; i++ {
		<-done
	}

	assert.NotPanics(t, func() {
		validator.ValidateDomainForProject("domain.com", projectID)
	})
}

func TestEnhancedDomainAuthorizationService_ValidateAssetAccessEnhanced(t *testing.T) {
	ctx := context.Background()

	assetID := id.NewAssetID()
	projectID := id.NewProjectID()
	workspaceID := accountdomain.NewWorkspaceID()

	testAsset := asset.New().
		ID(assetID).
		Workspace(workspaceID).
		Project(&projectID).
		Name("test.jpg").
		Size(1024).
		URL("https://example.com/assets/" + assetID.String()).
		ContentType("image/jpeg").
		MustBuild()

	testProject := project.New().
		ID(projectID).
		Workspace(workspaceID).
		Alias("enhanced-test").
		PublishmentStatus(project.PublishmentStatusPublic).
		MustBuild()

	assetRepo := memory.NewAsset()
	_ = assetRepo.Save(ctx, testAsset)

	projectRepo := memory.NewProject()
	_ = projectRepo.Save(ctx, testProject)

	basicService := NewDomainAuthorizationService(assetRepo, projectRepo, nil)
	validator := NewDomainValidator()

	validator.RegisterProjectDomain(projectID, "enhanced-test.reearth.io")
	validator.SetProjectPublic(projectID, true)

	enhancedService := NewEnhancedDomainAuthorizationService(basicService, validator)

	pid, err := enhancedService.ValidateAssetAccessEnhanced(ctx, assetID.String(), "https://enhanced-test.reearth.io")
	assert.NoError(t, err)
	assert.NotNil(t, pid)
	assert.Equal(t, projectID, *pid)

	pid, err = enhancedService.ValidateAssetAccessEnhanced(ctx, assetID.String(), "https://any-domain.com")
	assert.NoError(t, err)
	assert.NotNil(t, pid)
	assert.Equal(t, projectID, *pid)

	_, err = enhancedService.ValidateAssetAccessEnhanced(ctx, "invalid", "https://enhanced-test.reearth.io")
	assert.Error(t, err)
}
