package main

import "github.com/reearth/reearth-backend/internal/app"

var version = ""

func main() {
	app.Start(debug, version)
}
