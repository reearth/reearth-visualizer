package main

import (
	"crypto/subtle"
	"net/url"
	"os"
	"os/exec"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const godocPort = "8080"

func main() {
	e := echo.New()
	err := exec.Command("godoc", "-http=:"+godocPort).Start()
	if err != nil {
		e.Logger.Fatal(err)
	}
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.BasicAuth(func(username, password string, c echo.Context) (bool, error) {
		if subtle.ConstantTimeCompare([]byte(username), []byte(os.Getenv("BASIC_AUTH_USERNAME"))) == 1 &&
			subtle.ConstantTimeCompare([]byte(password), []byte(os.Getenv("BASIC_AUTH_PASSWORD"))) == 1 {
			return true, nil
		}
		return false, nil
	}))
	t, err := url.Parse("http://localhost:8080/")
	if err != nil {
		e.Logger.Fatal(err)
	}
	tl := []*middleware.ProxyTarget{
		{
			URL: t,
		},
	}
	e.Group("", middleware.Proxy(middleware.NewRoundRobinBalancer(tl)))
	e.Logger.Fatal(e.Start(":" + os.Getenv("PORT")))
}
