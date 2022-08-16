package main

import "github.com/reearth/reearth/server/internal/app"

var version = ""

func main() {
	app.Start(debug, version)
}
