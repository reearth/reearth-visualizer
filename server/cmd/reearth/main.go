package main

import "github.com/reearth/reearth/server/internal/app"

var version = "" // set via -ldflags at build time

func main() {
	app.Start(debug, version)
}
