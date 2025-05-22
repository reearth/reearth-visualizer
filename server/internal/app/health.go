package app

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"cloud.google.com/go/storage"
	"github.com/hellofresh/health-go/v5"
	"github.com/hellofresh/health-go/v5/checks/mongo"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
)

func HealthCheck(conf *config.Config, ver string) echo.HandlerFunc {
	checks := []health.Config{
		{
			Name:      "db",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     mongo.New(mongo.Config{DSN: conf.DB}),
		},
	}

	for _, u := range conf.DB_Users {
		checks = append(checks, health.Config{
			Name:      "db-" + u.Name,
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     mongo.New(mongo.Config{DSN: u.URI}),
		})
	}

	if conf.GCS.BucketName != "" {
		checks = append(checks, health.Config{
			Name:      "gcs",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     func(ctx context.Context) error { return gcsCheck(ctx, conf.GCS.BucketName) },
		})
	}

	for _, a := range conf.Auths() {
		if a.ISS != "" {
			u, err := url.Parse(a.ISS)
			if err != nil {
				log.Fatalf("invalid issuer URL: %v", err)
			}
			// Capture the issuer URL string so each closure gets its own copy.
			issuerURL := u.JoinPath(".well-known/openid-configuration").String()
			checks = append(checks, health.Config{
				Name:      "auth:" + a.ISS,
				Timeout:   time.Second * 5,
				SkipOnErr: false,
				Check: func(ctx context.Context) error {
					return authServerPingCheck(issuerURL)
				},
			})
		}
	}

	h, err := health.New(health.WithComponent(health.Component{
		Name:    "reearth-visualizer",
		Version: ver,
	}), health.WithChecks(checks...))
	if err != nil {
		log.Fatalf("failed to create health check: %v", err)
	}

	return func(c echo.Context) error {
		// Optional HTTP Basic Auth
		if conf.HealthCheck.Username != "" && conf.HealthCheck.Password != "" {
			username, password, ok := c.Request().BasicAuth()
			if !ok || username != conf.HealthCheck.Username || password != conf.HealthCheck.Password {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "unauthorized",
				})
			}
		}

		// Serve the health check
		h.Handler().ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func gcsCheck(ctx context.Context, bucketName string) (checkErr error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("GCS client creation failed: %v", err)
	}
	defer func(client *storage.Client) {
		err := client.Close()
		if err != nil {
			checkErr = fmt.Errorf("GCS client close failed: %v", err)
		}
	}(client)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	_, err = client.Bucket(bucketName).Attrs(ctx)
	if err != nil {
		return fmt.Errorf("GCS bucket access failed: %v", err)
	}
	return nil
}

func authServerPingCheck(issuerURL string) (checkErr error) {
	client := http.Client{
		Timeout: 2 * time.Second,
	}
	resp, err := client.Get(issuerURL)
	if err != nil {
		return fmt.Errorf("auth server unreachable: %v", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			checkErr = fmt.Errorf("failed to close response body: %v", err)
		}
	}(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("auth server unhealthy, status: %d", resp.StatusCode)
	}
	return nil
}
