package domain

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestNewDefaultChecker(t *testing.T) {
	checker := NewDefaultChecker()
	assert.NotNil(t, checker)
	assert.IsType(t, &DefaultChecker{}, checker)
}

func TestDefaultChecker_CheckDomain(t *testing.T) {
	t.Run("always returns not allowed", func(t *testing.T) {
		checker := NewDefaultChecker()
		ctx := context.Background()
		
		req := gateway.DomainCheckRequest{
			Domain: "https://example.com",
		}
		
		resp, err := checker.CheckDomain(ctx, req)
		
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.False(t, resp.Allowed)
	})

	t.Run("different domains all return not allowed", func(t *testing.T) {
		checker := NewDefaultChecker()
		ctx := context.Background()
		
		testDomains := []string{
			"https://example.com",
			"http://localhost:3000",
			"https://subdomain.example.com",
			"https://another-domain.org",
			"",
			"invalid-url",
		}
		
		for _, domain := range testDomains {
			t.Run(domain, func(t *testing.T) {
				req := gateway.DomainCheckRequest{
					Domain: domain,
				}
				
				resp, err := checker.CheckDomain(ctx, req)
				
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.False(t, resp.Allowed)
			})
		}
	})

	t.Run("with cancelled context", func(t *testing.T) {
		checker := NewDefaultChecker()
		ctx, cancel := context.WithCancel(context.Background())
		cancel()
		
		req := gateway.DomainCheckRequest{
			Domain: "https://example.com",
		}
		
		resp, err := checker.CheckDomain(ctx, req)
		
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.False(t, resp.Allowed)
	})

	t.Run("concurrent requests", func(t *testing.T) {
		checker := NewDefaultChecker()
		ctx := context.Background()
		
		concurrentRequests := 100
		done := make(chan bool, concurrentRequests)
		
		for i := 0; i < concurrentRequests; i++ {
			go func(idx int) {
				req := gateway.DomainCheckRequest{
					Domain: "https://example.com",
				}
				
				resp, err := checker.CheckDomain(ctx, req)
				
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.False(t, resp.Allowed)
				
				done <- true
			}(i)
		}
		
		for i := 0; i < concurrentRequests; i++ {
			<-done
		}
	})
}

func BenchmarkDefaultChecker_CheckDomain(b *testing.B) {
	checker := NewDefaultChecker()
	ctx := context.Background()
	req := gateway.DomainCheckRequest{
		Domain: "https://example.com",
	}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = checker.CheckDomain(ctx, req)
	}
}