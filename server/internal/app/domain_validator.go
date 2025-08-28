package app

import (
	"context"
	"net/url"
	"strings"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/log"
)

type DomainValidator struct {
	allowedDomains map[string][]id.ProjectID
	
	projectDomains map[id.ProjectID][]string
	
	publicProjects map[id.ProjectID]bool
}

func NewDomainValidator() *DomainValidator {
	return &DomainValidator{
		allowedDomains: make(map[string][]id.ProjectID),
		projectDomains: make(map[id.ProjectID][]string),
		publicProjects: make(map[id.ProjectID]bool),
	}
}

func (v *DomainValidator) RegisterProjectDomain(projectID id.ProjectID, domain string) {
	domain = normalizeDomain(domain)
	
	// Add to domain -> projects mapping
	if _, exists := v.allowedDomains[domain]; !exists {
		v.allowedDomains[domain] = []id.ProjectID{}
	}
	
	for _, pid := range v.allowedDomains[domain] {
		if pid == projectID {
			return
		}
	}
	
	v.allowedDomains[domain] = append(v.allowedDomains[domain], projectID)
	
	if _, exists := v.projectDomains[projectID]; !exists {
		v.projectDomains[projectID] = []string{}
	}
	
	for _, d := range v.projectDomains[projectID] {
		if d == domain {
			return
		}
	}
	
	v.projectDomains[projectID] = append(v.projectDomains[projectID], domain)
}

func (v *DomainValidator) SetProjectPublic(projectID id.ProjectID, isPublic bool) {
	v.publicProjects[projectID] = isPublic
}

func (v *DomainValidator) IsProjectPublic(projectID id.ProjectID) bool {
	return v.publicProjects[projectID]
}

func (v *DomainValidator) ValidateDomainForProject(domain string, projectID id.ProjectID) bool {
	if v.IsProjectPublic(projectID) {
		return true
	}
	
	domain = normalizeDomain(domain)
	
	domains, exists := v.projectDomains[projectID]
	if !exists {
		return false
	}
	
	for _, d := range domains {
		if d == domain {
			return true
		}
		if strings.HasPrefix(d, "*.") {
			baseDomain := strings.TrimPrefix(d, "*.")
			if strings.HasSuffix(domain, baseDomain) {
				return true
			}
		}
	}
	
	return false
}

func (v *DomainValidator) GetProjectsForDomain(domain string) []id.ProjectID {
	domain = normalizeDomain(domain)
	projects, exists := v.allowedDomains[domain]
	if !exists {
		return []id.ProjectID{}
	}
	return projects
}

func (v *DomainValidator) GetDomainsForProject(projectID id.ProjectID) []string {
	domains, exists := v.projectDomains[projectID]
	if !exists {
		return []string{}
	}
	return domains
}

func (v *DomainValidator) LoadProjectDomains(ctx context.Context, p *project.Project) {
	if p == nil {
		return
	}
	
	projectID := p.ID()
	
	isPublic := p.PublishmentStatus() == project.PublishmentStatusPublic
	v.SetProjectPublic(projectID, isPublic)
	
	if alias := p.Alias(); alias != "" {
		domains := []string{
			alias + ".reearth.io",
			alias + ".reearth.dev", 
			alias + ".reearth-app.com",
		}
		
		for _, domain := range domains {
			v.RegisterProjectDomain(projectID, domain)
			log.Debugfc(ctx, "domain_validator: registered domain %s for project %s", domain, projectID.String())
		}
	}
	
	// Register custom domains if available
	// This would need to be extended based on our actual domain management
	if p.PublicTitle() != "" {
		// If project has public configuration, it might have custom domains
		// These would need to be loaded from a separate domain configuration
		log.Debugfc(ctx, "domain_validator: project %s has public config, custom domains may apply", projectID.String())
	}
}

func normalizeDomain(domain string) string {
	if strings.Contains(domain, "://") {
		if u, err := url.Parse(domain); err == nil {
			domain = u.Host
		}
	}
	
	if idx := strings.LastIndex(domain, ":"); idx != -1 {
		portPart := domain[idx+1:]
		isPort := true
		for _, c := range portPart {
			if c < '0' || c > '9' {
				isPort = false
				break
			}
		}
		if isPort {
			domain = domain[:idx]
		}
	}
	
	domain = strings.ToLower(domain)
	
	domain = strings.TrimSuffix(domain, ".")
	
	return domain
}

type EnhancedDomainAuthorizationService struct {
	*DomainAuthorizationService
	validator *DomainValidator
}

func NewEnhancedDomainAuthorizationService(
	basicService *DomainAuthorizationService,
	validator *DomainValidator,
) *EnhancedDomainAuthorizationService {
	return &EnhancedDomainAuthorizationService{
		DomainAuthorizationService: basicService,
		validator:                  validator,
	}
}

func (s *EnhancedDomainAuthorizationService) ValidateAssetAccessEnhanced(
	ctx context.Context,
	assetIDStr string,
	origin string,
) (*id.ProjectID, error) {
	projectID, err := s.ValidateAssetAccess(ctx, assetIDStr, origin)
	if err != nil {
		
		assetID, parseErr := id.AssetIDFrom(assetIDStr)
		if parseErr != nil {
			return nil, err
		}
		
		asset, findErr := s.assetRepo.FindByID(ctx, assetID)
		if findErr != nil {
			return nil, err
		}
		
		pid := asset.Project()
		if pid == nil {
			return nil, err
		}
		
		if s.validator.ValidateDomainForProject(origin, *pid) {
			log.Infofc(ctx, "domain_validator: enhanced validation succeeded for %s to project %s", origin, pid.String())
			return pid, nil
		}
		
		return nil, err
	}
	
	return projectID, nil
}
