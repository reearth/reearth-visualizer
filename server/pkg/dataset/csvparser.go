package dataset

import (
	"encoding/csv"
	"errors"
	"io"
	"strconv"
	"strings"
)

var (
	ErrFailedToParseCSVorTSVFile error = errors.New("failed to parse file content")
	ErrIncompatibleSchema        error = errors.New("schema is not compatible with csv")
	ErrDuplicatiedNameFields     error = errors.New("failed to parse, name-duplicated fields")
)

type DatasetCSVParser struct {
	reader    *csv.Reader
	firstline []string
	headers   []string
	schema    *Schema
	name      string
}

func NewCSVParser(r io.Reader, n string, seperator rune) *DatasetCSVParser {
	r2 := csv.NewReader(r)
	r2.Comma = seperator
	obj := &DatasetCSVParser{
		reader: r2,
		name:   n,
	}
	return obj
}

func (p *DatasetCSVParser) Init() error {
	headers, err := p.reader.Read()
	if err != nil {
		return ErrFailedToParseCSVorTSVFile
	}
	p.headers = headers
	p.firstline, err = p.reader.Read()
	if err != nil {
		return ErrFailedToParseCSVorTSVFile
	}
	return nil
}
func (p *DatasetCSVParser) validateLine(line []string) bool {
	return len(p.headers) == len(line)
}

func (p *DatasetCSVParser) GuessSchema(sid SceneID) error {
	if !p.validateLine(p.firstline) {
		return ErrFailedToParseCSVorTSVFile
	}
	schemafields := []*SchemaField{}
	haslat, haslng := false, false
	for k, h := range p.headers {
		if h == "lat" {
			haslat = true
		}
		if h == "lng" {
			haslng = true
		}
		if h != "lng" && h != "lat" && strings.TrimSpace(h) != "" {
			t := ValueFromStringOrNumber(p.firstline[k]).Type()
			field, _ := NewSchemaField().NewID().Name(h).Type(t).Build()
			schemafields = append(schemafields, field)
		}
	}
	if haslat && haslng {
		field, _ := NewSchemaField().NewID().Name("location").Type(ValueTypeLatLng).Build()
		schemafields = append(schemafields, field)
	}
	schema, err := NewSchema().
		NewID().
		Scene(sid).
		Name(p.name).
		Source("file:///" + p.name).
		Fields(schemafields).
		Build()
	if err != nil {
		return err
	}
	p.schema = schema
	return nil
}

func (p *DatasetCSVParser) ReadAll() (*Schema, []*Dataset, error) {
	if p.schema == nil {
		return nil, nil, errors.New("schema is not generated yet")
	}
	var fields []*Field
	schemafieldmap := make(map[string]FieldID)
	for _, f := range p.schema.Fields() {
		if _, ok := schemafieldmap[f.Name()]; !ok {
			schemafieldmap[f.Name()] = f.ID()
		} else {
			return nil, nil, ErrDuplicatiedNameFields
		}
	}
	datasets := []*Dataset{}
	i := 0
	for {
		var line []string
		var err error
		if i == 0 {
			// process first line
			line = p.firstline
		} else {
			line, err = p.reader.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				return nil, nil, err
			}
		}
		if !p.validateLine(line) {
			return nil, nil, ErrFailedToParseCSVorTSVFile
		}

		fields, err = p.getFields(line, schemafieldmap)
		if err != nil {
			return nil, nil, err
		}
		ds, err := New().NewID().
			Fields(fields).
			Scene(p.schema.Scene()).Schema(p.schema.ID()).Build()
		if err != nil {
			return nil, nil, err
		}
		datasets = append(datasets, ds)
		i++
	}

	return p.schema, datasets, nil
}

func (p *DatasetCSVParser) getFields(line []string, sfm map[string]FieldID) ([]*Field, error) {
	fields := []*Field{}
	var lat, lng *float64
	for i, record := range line {
		value := ValueFromStringOrNumber(record)
		if p.headers[i] == "lng" {
			value, err := strconv.ParseFloat(record, 64)
			if err != nil {
				return nil, ErrFailedToParseCSVorTSVFile
			}
			lng = &value
		}
		if p.headers[i] == "lat" {
			value, err := strconv.ParseFloat(record, 64)
			if err != nil {
				return nil, ErrFailedToParseCSVorTSVFile
			}
			lat = &value
		}

		if p.headers[i] != "lat" && p.headers[i] != "lng" {
			fields = append(fields, NewField(sfm[p.headers[i]], value, ""))
		}
	}
	if lat != nil && lng != nil {
		latlng := LatLng{Lat: *lat, Lng: *lng}
		fields = append(fields, NewField(sfm["location"], ValueTypeLatLng.ValueFrom(latlng), ""))
	}
	return append([]*Field{}, fields...), nil
}

func (p *DatasetCSVParser) CheckCompatible(s *Schema) error {
	fieldsmap := make(map[string]*SchemaField)
	for _, f := range s.Fields() {
		fieldsmap[f.Name()] = f
	}
	haslat, haslng := false, false
	for i, h := range p.headers {
		if h != "lat" && h != "lng" {
			if fieldsmap[h] == nil {
				return ErrIncompatibleSchema
			}
			t := fieldsmap[h].Type()
			v := ValueFromStringOrNumber(p.firstline[i])
			if v.Type() != t {
				return ErrIncompatibleSchema
			}
		}
		if h == "lat" {
			haslat = true
		}
		if h == "lng" {
			haslng = true
		}
	}
	// check for location fields
	if haslat && haslng {
		if fieldsmap["location"] == nil {
			return ErrIncompatibleSchema
		}
	} else {
		if fieldsmap["location"] != nil {
			return ErrIncompatibleSchema
		}
	}

	p.schema = s
	return nil
}
