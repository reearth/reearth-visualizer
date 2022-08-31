package decoding

import (
	"encoding/xml"
	"errors"
	"io"
	"net/url"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/kml"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
)

var _ Decoder = &KMLDecoder{}

const kmlmock = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Folder>
      <Style id="CZMLGeometries_01e65">
				<IconStyle>
					<scale>4</scale>
					<color>ff00ff7f</color>
					<Icon>
						<href>http://maps.google.com/mapfiles/kml/pal3/icon19.png</href>
					</Icon>
				</IconStyle>
			</Style>
			<Style id="examplePolyStyle">
				<LineStyle>
					<color>4DFF0000</color>
					<width>4</width>
				</LineStyle>
				<PolyStyle>
					<color>FF0000</color>
					<colorMode>normal</colorMode>
					<fill>1</fill>
					<outline>1</outline>
				</PolyStyle>
			</Style>
			<Style id="exampleLineStyle">
				<LineStyle>
						<color>4DFF0000</color>
						<width>4</width>
					</LineStyle>
			</Style>
			<Placemark>
				<name>CZML Geometries</name>
				<Point>
					<coordinates>-122.0822035425683,37.42228990140251,43</coordinates>
				</Point>
				<styleUrl>#CZMLGeometries_01e65</styleUrl>
			</Placemark>
			<Placemark>
				<styleUrl>#examplePolyStyle</styleUrl>
				<Polygon>
					<outerBoundaryIs>
						<LinearRing>
							<coordinates> -77.05788457660967,38.87253259892824,100
								-77.05465973756702,38.87291016281703,100
								-77.05315536854791,38.87053267794386,100 </coordinates>
						</LinearRing>
					</outerBoundaryIs>
				</Polygon>
			</Placemark>
			<Placemark>
				<styleUrl>#exampleLineStyle</styleUrl>
				<LineString>
					<tessellate>1</tessellate>
					<coordinates> -112.0814237830345,36.10677870477137,0
						-112.0870267752693,36.0905099328766,0 </coordinates>
				</LineString>
			</Placemark>
			<Placemark></Placemark>
    </Folder>
  </Document>
</kml>`

func TestNewKMLDecoder(t *testing.T) {
	d := NewKMLDecoder(xml.NewDecoder(strings.NewReader(``)), layer.NewSceneID())
	assert.NotNil(t, d)
}

func TestKMLDecoder_Decode(t *testing.T) {
	r := strings.NewReader(kmlmock)
	d := xml.NewDecoder(r)
	s := layer.NewSceneID()
	k := NewKMLDecoder(d, s)

	result, err := k.Decode()
	assert.NoError(t, err)
	assert.Equal(t, 6, len(result.Layers))
	assert.Equal(t, 4, len(result.Properties))

	// Root layer
	rootLayer := result.RootLayers().ToLayerGroupList()[0]
	assert.NotNil(t, rootLayer)
	assert.Equal(t, 1, rootLayer.Layers().LayerCount())

	// Folder
	folder := result.Layers.Group(rootLayer.Layers().LayerAt(0))
	assert.NotNil(t, folder)
	assert.Equal(t, 4, folder.Layers().LayerCount())

	// Marker Test
	l := result.Layers.Layer(folder.Layers().LayerAt(0))
	prop := result.Properties[*l.Property()]
	fPoint, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, propertyFields["Point"]))
	assert.Equal(t, property.LatLng{Lng: -122.0822035425683, Lat: 37.42228990140251}, fPoint.Value().Value())
	fColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "pointColor"))
	assert.Equal(t, "ff00ff7f", fColor.Value().Value())
	fSize, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "imageSize"))
	assert.Equal(t, 4.0, fSize.Value().Value())
	fImage, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "image"))
	actUrl, _ := url.Parse("http://maps.google.com/mapfiles/kml/pal3/icon19.png")
	assert.Equal(t, actUrl, fImage.Value().Value())
	fh, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, property.FieldID("height")))
	assert.Equal(t, 43.0, fh.Value().Value())

	// Polygon test
	l = result.Layers.Layer(folder.Layers().LayerAt(1))
	prop = result.Properties[*l.Property()]
	polygon, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, propertyFields["Polygon"]))
	assert.Equal(t, property.Polygon{{
		{Lng: -77.05788457660967, Lat: 38.87253259892824, Height: 100},
		{Lng: -77.05465973756702, Lat: 38.87291016281703, Height: 100},
		{Lng: -77.0531553685479, Lat: 38.87053267794386, Height: 100},
	}}, polygon.Value().Value())
	fill, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "fill"))
	assert.Equal(t, true, fill.Value().Value())
	stroke, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "stroke"))
	assert.Equal(t, true, stroke.Value().Value())
	fillColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "fillColor"))
	assert.Equal(t, "FF0000", fillColor.Value().Value())
	strokeColor, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeColor"))
	assert.Equal(t, "4DFF0000", strokeColor.Value().Value())
	strokeWidth, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeWidth"))
	assert.Equal(t, 4.0, strokeWidth.Value().Value())

	// Polyline test
	l = result.Layers.Layer(folder.Layers().LayerAt(2))
	prop = result.Properties[*l.Property()]
	polyline, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, propertyFields["Polyline"]))
	assert.Equal(t, property.Coordinates{
		{Lng: -112.0814237830345, Lat: 36.10677870477137, Height: 0},
		{Lng: -112.0870267752693, Lat: 36.0905099328766, Height: 0},
	}, polyline.Value().Value())
	strokeColor2, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeColor"))
	assert.Equal(t, "4DFF0000", strokeColor2.Value().Value())
	strokeWidth2, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, "strokeWidth"))
	assert.Equal(t, 4.0, strokeWidth2.Value().Value())

	// Empty test
	l = result.Layers.Layer(folder.Layers().LayerAt(3))
	prop = result.Properties[*l.Property()]
	assert.Equal(t, propertySchemas["Point"], prop.Schema())
	point, _, _ := prop.Field(property.PointFieldBySchemaGroup(propertyItems, propertyFields["Point"]))
	assert.Nil(t, point.Value().Value())
}

//	func TestKMLCoordinatesToLatLng(t *testing.T) {
//		tests := []struct {
//			name, cords    string
//			expectedLatLng *property.LatLng
//			expectedHeight float64
//			err            error
//		}{
//			{
//				name: "Valid LatLng", cords: "-122.0822035425683,37.42228990140251,43",
//				expectedLatLng: &property.LatLng{
//					Lng: -122.0822035425683,
//					Lat: 37.42228990140251,
//				},
//				expectedHeight: 43,
//				err:            nil,
//			},
//			{
//				name: "Failed to parse Lat", cords: "-122.0822035425683,xxx,43",
//				expectedLatLng: nil,
//				expectedHeight: 0,
//				err:            strconv.ErrSyntax,
//			},
//			{
//				name: "Failed to parse Lng", cords: "xxx,-122.0822035425683,43",
//				expectedLatLng: nil,
//				expectedHeight: 0,
//				err:            strconv.ErrSyntax,
//			},
//			{
//				name: "Failed to parse Height", cords: "-122.0822035425683,43,xxx",
//				expectedLatLng: nil,
//				expectedHeight: 0,
//				err:            strconv.ErrSyntax,
//			},
//		}
//		for _, tt := range tests {
//			tt := tt
//			t.Run(tt.name, func(t *testing.T) {
//				t.Parallel()
//				ll, h, err := coordinatesToLatLngHeight(tt.cords)
//				if tt.err == nil {
//					assert.True(t, reflect.DeepEqual(ll, tt.expectedLatLng))
//					assert.Equal(t, tt.expectedHeight, h)
//				} else {
//					assert.Equal(t, tt.err, err)
//				}
//			})
//		}
//	}
//
//	func TestKMLCoordinatesToLatLngList(t *testing.T) {
//		tests := []struct {
//			name, cords string
//			expected    []property.LatLngHeight
//			err         error
//		}{
//			{
//				name: "Valid Cords", cords: ` -112.0814237830345,36.10677870477137,0
//	 											-112.0870267752693,36.0905099328766,0 `,
//				expected: []property.LatLngHeight{
//					{
//						Lat:    36.10677870477137,
//						Lng:    -112.0814237830345,
//						Height: 0,
//					},
//					{
//						Lat:    36.0905099328766,
//						Lng:    -112.0870267752693,
//						Height: 0,
//					},
//				},
//				err: nil,
//			},
//			{
//				name: "Failed to parse Lng", cords: ` xxx,36.10677870477137,0
//	 											-112.0870267752693,36.0905099328766,0 `,
//				expected: nil,
//				err:      strconv.ErrSyntax,
//			},
//			{
//				name: "Failed to parse Lat", cords: ` -112.0814237830345,xxx,0
//	 											-112.0870267752693,36.0905099328766,0 `,
//				expected: nil,
//				err:      strconv.ErrSyntax,
//			},
//			{
//				name: "Failed to parse Height", cords: ` -112.0814237830345,36.10677870477137,xxx
//	 											-112.0870267752693,36.0905099328766,0 `,
//				expected: nil,
//				err:      strconv.ErrSyntax,
//			},
//		}
//		for _, tt := range tests {
//			tt := tt
//			t.Run(tt.name, func(t *testing.T) {
//				t.Parallel()
//				res, err := coordinatesToLatLngHeightList(tt.cords)
//				if tt.err == nil {
//					assert.True(t, reflect.DeepEqual(res, tt.expected))
//				} else {
//					assert.Equal(t, tt.err, err)
//				}
//			})
//		}
//	}
//
//	func TestKMLGetPolygon(t *testing.T) {
//		cl1 := []property.LatLngHeight{
//			{
//				Lng:    36,
//				Lat:    -112,
//				Height: 0,
//			},
//			{
//				Lng:    34,
//				Lat:    -112,
//				Height: 0,
//			},
//			{
//				Lng:    35,
//				Lat:    -111,
//				Height: 0,
//			},
//		}
//		cl2 := []property.LatLngHeight{
//			{
//				Lng:    35,
//				Lat:    -111,
//				Height: 10,
//			},
//			{
//				Lng:    32,
//				Lat:    -109,
//				Height: 10,
//			},
//			{
//				Lng:    34,
//				Lat:    -119,
//				Height: 10,
//			},
//		}
//		expected := [][]property.LatLngHeight{cl1, cl2}
//		tests := []struct {
//			name     string
//			polygon  *kml.Polygon
//			expected [][]property.LatLngHeight
//			err      error
//		}{
//			{
//				name: "Valid Polygon",
//				polygon: &kml.Polygon{
//					OuterBoundaryIs: kml.BoundaryIs{
//						LinearRing: kml.LinearRing{
//							Coordinates: ` 36,-112,0
//	 										34,-112,0
//											35,-111,0`,
//						},
//					},
//					InnerBoundaryIs: []kml.BoundaryIs{
//						{
//							LinearRing: kml.LinearRing{
//								Coordinates: ` 35,-111,10
//											32,-109,10
//											34,-119,10 `,
//							},
//						},
//					},
//				},
//				expected: expected,
//				err:      nil,
//			},
//			{
//				name: "Failed to parse Outer",
//				polygon: &kml.Polygon{
//					OuterBoundaryIs: kml.BoundaryIs{
//						LinearRing: kml.LinearRing{
//							Coordinates: ` xxx,-112,0
//	 										34,-112,0
//											35,-111,0`,
//						},
//					},
//					InnerBoundaryIs: []kml.BoundaryIs{
//						{
//							LinearRing: kml.LinearRing{
//								Coordinates: ` 35,-111,10
//											32,-109,10
//											34,-119,10 `,
//							},
//						},
//					},
//				},
//				expected: nil,
//				err:      strconv.ErrSyntax,
//			},
//			{
//				name: "Failed to parse Inner",
//				polygon: &kml.Polygon{
//					OuterBoundaryIs: kml.BoundaryIs{
//						LinearRing: kml.LinearRing{
//							Coordinates: ` 36,-112,0
//	 										34,-112,0
//											35,-111,0`,
//						},
//					},
//					InnerBoundaryIs: []kml.BoundaryIs{
//						{
//							LinearRing: kml.LinearRing{
//								Coordinates: ` xxx,-111,10
//											32,-109,10
//											34,-119,10 `,
//							},
//						},
//					},
//				},
//
//				expected: nil,
//				err:      strconv.ErrSyntax,
//			},
//		}
//		for _, tt := range tests {
//			tt := tt
//			t.Run(tt.name, func(t *testing.T) {
//				t.Parallel()
//				res, err := getPolygon(tt.polygon)
//				if tt.err == nil {
//					assert.True(t, reflect.DeepEqual(res, tt.expected))
//				} else {
//					assert.Equal(t, tt.err, err)
//				}
//			})
//		}
//	}
func TestKMLparseKML(t *testing.T) {
	s := layer.NewSceneID()

	tests := []struct {
		name, KMLstr string
		expected     interface{}
		err          error
	}{
		{
			name: "parse document",
			KMLstr: `<?xml version="1.0" encoding="UTF-8"?>
						<kml xmlns="http://www.opengis.net/kml/2.2">
 							<Document>
							<name>test_doc</name>
 							</Document>
						</kml>`,
			expected: kml.Collection{
				Folders:    nil,
				Placemarks: nil,
				Styles:     nil,
				Name:       "test_doc",
			},
			err: io.EOF,
		},
		{
			name: "parse folder",
			KMLstr: `<?xml version="1.0" encoding="UTF-8"?>
						<kml xmlns="http://www.opengis.net/kml/2.2">
 							<Folder>
							<name>test_fol</name>
 							</Folder>
						</kml>`,
			expected: kml.Collection{
				Folders:    nil,
				Placemarks: nil,
				Styles:     nil,
				Name:       "test_fol",
			},
			err: io.EOF,
		},
		{
			name: "parse placemark",
			KMLstr: `<?xml version="1.0" encoding="UTF-8"?>
						<kml xmlns="http://www.opengis.net/kml/2.2">
								<Placemark>
									<name>test_place</name>
								</Placemark>
						</kml>`,
			expected: kml.Placemark{
				Point: kml.Point{Coordinates: ""},
				Polygon: kml.Polygon{
					OuterBoundaryIs: kml.BoundaryIs{
						LinearRing: kml.LinearRing{Coordinates: ""},
					},
					InnerBoundaryIs: []kml.BoundaryIs(nil)},
				Polyline: kml.LineString{Coordinates: ""},
				Name:     "test_place",
				StyleUrl: "",
			},
			err: io.EOF,
		},
		{
			name: "err parse token",
			KMLstr: `<?xml version="1.0" encoding="UTF-8"?>
						<kml xmlns="http://www.opengis.net/kml/2.2">
								<Placemark>
									<name>test_place</name>
									<xxx></fff>
								</Placemark>
						</kml>`,
			expected: nil,
			err:      errors.New("XML syntax error on line 5: element <xxx> closed by </fff>"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			d := NewKMLDecoder(xml.NewDecoder(strings.NewReader(tt.KMLstr)), s)
			res, err := d.parseKML()
			if tt.expected != nil {
				assert.Equal(t, tt.expected, res)
			} else {
				assert.Equal(t, tt.err.Error(), err.Error())
			}
		})
	}
}
func TestKMLdecodePlacemark(t *testing.T) {
	s := layer.NewSceneID()
	point := MustCreateProperty("Point", property.LatLngHeight{
		Lat:    23,
		Lng:    40,
		Height: 0,
	}, s, nil, "kml")
	polyline := MustCreateProperty("Polyline", property.Coordinates{
		property.LatLngHeight{
			Lat:    23,
			Lng:    40,
			Height: 0,
		},
		property.LatLngHeight{
			Lat:    66,
			Lng:    34,
			Height: 10,
		},
	}, s, nil, "kml")
	polygon := MustCreateProperty("Polygon", []property.Coordinates{{
		property.LatLngHeight{
			Lat:    23,
			Lng:    40,
			Height: 0,
		},
		property.LatLngHeight{
			Lat:    66,
			Lng:    34,
			Height: 10,
		},
		property.LatLngHeight{
			Lat:    50,
			Lng:    12,
			Height: 3,
		},
	},
	}, s, nil, "kml")
	pointExt := extensions["Point"]
	polylineExt := extensions["Polyline"]
	polygonExt := extensions["Polygon"]

	tests := []struct {
		name, pt         string
		placemark        kml.Placemark
		expectedLayer    *layer.Item
		expectedProperty *property.Property
		err              error
	}{
		{
			name: "parse point",
			pt:   "Point",
			placemark: kml.Placemark{
				Point: kml.Point{
					Coordinates: "40,23,0",
				},
				Polygon:  kml.Polygon{},
				Polyline: kml.LineString{},
				Name:     "",
				StyleUrl: "",
			},
			expectedLayer: layer.
				NewItem().
				NewID().
				Name("Point").
				Scene(s).
				Property(point.IDRef()).
				Extension(&pointExt).
				Plugin(&layer.OfficialPluginID).
				MustBuild(),
			expectedProperty: point,
			err:              nil,
		},
		{
			name: "parse polyline",
			pt:   "Polyline",
			placemark: kml.Placemark{
				Point:   kml.Point{},
				Polygon: kml.Polygon{},
				Polyline: kml.LineString{
					Coordinates: `40,23,0
									34,66,10`},
				Name:     "",
				StyleUrl: "",
			},
			expectedLayer: layer.
				NewItem().
				NewID().
				Name("Polyline").
				Scene(s).
				Property(polyline.IDRef()).
				Extension(&polylineExt).
				Plugin(&layer.OfficialPluginID).
				MustBuild(),
			expectedProperty: polyline,
			err:              nil,
		},
		{
			name: "parse polygon",
			pt:   "Polygon",
			placemark: kml.Placemark{
				Point: kml.Point{},
				Polygon: kml.Polygon{
					OuterBoundaryIs: kml.BoundaryIs{
						LinearRing: kml.LinearRing{
							Coordinates: `40,23,0
										  34,66,10
										  12,50,3`,
						},
					},
					InnerBoundaryIs: nil,
				},
				Polyline: kml.LineString{},
				Name:     "",
				StyleUrl: "",
			},
			expectedLayer: layer.
				NewItem().
				NewID().
				Name("Polygon").
				Scene(s).
				Property(polygon.IDRef()).
				Extension(&polygonExt).
				Plugin(&layer.OfficialPluginID).
				MustBuild(),
			expectedProperty: polygon,
			err:              nil,
		},
		{
			name: "parse other",
			pt:   "Point",
			placemark: kml.Placemark{
				Point:    kml.Point{},
				Polygon:  kml.Polygon{},
				Polyline: kml.LineString{},
				Name:     "",
				StyleUrl: "",
			},
			expectedLayer: layer.
				NewItem().
				NewID().
				Name("Point").
				Scene(s).
				Extension(&pointExt).
				Plugin(&layer.OfficialPluginID).
				MustBuild(),
			expectedProperty: nil,
			err:              nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			d := NewKMLDecoder(xml.NewDecoder(strings.NewReader(``)), s)
			l, p, err := d.decodePlacemark(tt.placemark)
			if tt.err == nil {
				assert.NotNil(t, l)
				assert.NotNil(t, p)
				assert.Equal(t, l.Name(), tt.expectedLayer.Name())
				ps := builtin.GetPropertySchema(propertySchemas[tt.pt])
				fa, _, _, _ := p.GetOrCreateField(ps, property.PointFieldBySchemaGroup(propertyItems, propertyFields[tt.pt]))
				fe, _, _, _ := tt.expectedProperty.GetOrCreateField(ps, property.PointFieldBySchemaGroup(propertyItems, propertyFields[tt.pt]))
				assert.Equal(t, fe.Value(), fa.Value())
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

// @todo not finished yet
//func TestKMLdecodeCollection(t *testing.T) {
//	// @todo err and style cases
//	s := layer.NewSceneID()
//	pointExt := extensions["Point"]
//	point := MustCreateProperty("Point", property.LatLngHeight{
//		Lat:    39,
//		Lng:    20,
//		Height: 4,
//	}, s, nil, "kml")
//	li := layer.
//		NewItem().
//		NewID().
//		Name("test_placemark").
//		Scene(s).
//		Property(point.IDRef()).
//		Extension(&pointExt).
//		Plugin(&layer.OfficialPluginID).
//		MustBuild()
//	var ll layer.Layer = li
//	tests := []struct {
//		name               string
//		collection         *kml.Collection
//		expectedLayers     []*layer.Layer
//		expectedProperties []*property.Property
//		expectedGroupLayer *layer.Group
//		err                error
//	}{
//		{
//			name: "Folders",
//			collection: &kml.Collection{
//				Folders:    []kml.Collection{},
//				Placemarks: nil,
//				Styles:     nil,
//				Name:       "test_folder",
//			},
//			expectedLayers:     nil,
//			expectedProperties: nil,
//			expectedGroupLayer: layer.NewGroup().NewID().Name("test_folder").MustBuild(),
//			err:                nil,
//		},
//		{
//			name: "Placemarks",
//			collection: &kml.Collection{
//				Folders: nil,
//				Placemarks: []kml.Placemark{
//					{
//						Point:    kml.Point{Coordinates: `20,39,4`},
//						Name:     "test_placemark",
//						StyleUrl: "",
//					},
//				},
//				Styles: nil,
//				Name:   "test_placemark_group",
//			},
//			expectedGroupLayer: layer.NewGroup().NewID().Name("test_placemark_group").MustBuild(),
//			expectedLayers:     []*layer.Layer{&ll},
//			expectedProperties: []*property.Property{point},
//			err:                nil,
//		},
//	}
//
//	for _, tt := range tests {
//		tt := tt
//		t.Run(tt.name, func(t *testing.T) {
//			d := NewKMLDecoder(xml.NewDecoder(strings.NewReader(``)), s)
//			_, lm, pm, _ := d.decodeCollection(*tt.collection, 0)
//			//if tt.err == nil {
//			//	if tt.expectedGroupLayer != nil {
//			//		assert.NotNil(t, lg)
//			//		assert.Equal(t, tt.expectedGroupLayer.Name(), lg.Name())
//			//	}
//			//	if tt.expectedLayers != nil {
//			//		assert.NotNil(t, ll)
//			//		assert.True(t, len(ll) == 1)
//			//		el := *tt.expectedLayers[0]
//			//		al := *ll[0]
//			//		assert.Equal(t, el.Name(), al.Name())
//			//		assert.NotNil(t, al.Property())
//			//	}
//			//	if tt.expectedProperties != nil {
//			//		assert.NotNil(t, pl)
//			//		assert.True(t, len(pl) == 1)
//			//		ep := *tt.expectedProperties[0]
//			//		ap := pl.Keys()[0]
//			//		fa, _, _, _ := ap.GetOrCreateField(builtin.GetPropertySchema(propertySchemas["Point"]), property.PointFieldBySchemaGroup(propertyItems, propertyFields["Point"]))
//			//		fe, _, _, _ := ep.GetOrCreateField(builtin.GetPropertySchema(propertySchemas["Point"]), property.PointFieldBySchemaGroup(propertyItems, propertyFields["Point"]))
//			//		assert.Equal(t, fe.Value(), fa.Value())
//			//	}
//			//} else {
//			//	assert.Equal(t, tt.err, err)
//			//}
//		})
//	}
//
//}
