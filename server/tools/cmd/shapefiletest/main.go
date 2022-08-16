package main

import (
	"log"
	"strconv"

	"github.com/jonas-p/go-shp"
)

func main() {
	// points to write
	points := []shp.Point{
		{X: 10.0, Y: 10.0},
		{X: 10.0, Y: 15.0},
		{X: 15.0, Y: 15.0},
		{X: 15.0, Y: 10.0},
	}

	// fields to write
	fields := []shp.Field{
		// String attribute field with length 25
		shp.StringField("NAME", 25),
	}

	// create and open a shapefile for writing points
	shape, err := shp.Create("points.shp", shp.POINT)
	if err != nil {
		log.Fatal(err)
	}
	defer shape.Close()

	// setup fields for attributes
	if err := shape.SetFields(fields); err != nil {
		log.Fatal(err)
	}

	// write points and attributes
	for n, point := range points {
		shape.Write(&point)

		// write attribute for object n for field 0 (NAME)
		if err := shape.WriteAttribute(n, 0, "Point "+strconv.Itoa(n+1)); err != nil {
			log.Fatal(err)
		}
	}
}
