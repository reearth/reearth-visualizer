package dataset

import (
	"encoding/csv"
	"errors"
	"fmt"
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
	url       string
}

func NewCSVParser(r io.Reader, n, url string, separator rune) *DatasetCSVParser {
	r2 := csv.NewReader(r)
	r2.Comma = separator
	obj := &DatasetCSVParser{
		reader: r2,
		name:   n,
		url:    url,
	}
	return obj
}

func (p *DatasetCSVParser) Init() error {
	headers, err := p.reader.Read()
	if err != nil {
		return ErrFailedToParseCSVorTSVFile
	}
	if len(headers) == 0 || strings.TrimSpace(strings.Join(headers, "")) == "" {
		return errors.New("empty CSV file")
	}
	p.headers = headers
	p.firstline, err = p.reader.Read()
	if err != nil {
		if err == io.EOF {
			return errors.New("CSV file has no data rows")
		}
		return ErrFailedToParseCSVorTSVFile
	}
	if len(p.firstline) == 0 || !p.validateLine(p.firstline) {
		return ErrFailedToParseCSVorTSVFile
	}
	return nil
}

func (p *DatasetCSVParser) validateLine(line []string) bool {
	return len(p.headers) == len(line)
}

func (p *DatasetCSVParser) GuessSchema(sid SceneID) error {
	if len(p.headers) == 0 {
		return errors.New("no headers in CSV")
	}
	if !p.validateLine(p.firstline) {
		return ErrFailedToParseCSVorTSVFile
	}

	schemafields := []*SchemaField{}
	haslat, haslng := false, false

	for k, h := range p.headers {
		header := strings.TrimSpace(h)
		lower := strings.ToLower(header)

		if lower == "lat" {
			haslat = true
			continue
		}
		if lower == "lng" {
			haslng = true
			continue
		}

		if header != "" {
			t := ValueFromStringOrNumber(p.firstline[k]).Type()
			field, _ := NewSchemaField().NewID().Name(strings.TrimSpace(header)).Type(t).Build()
			schemafields = append(schemafields, field)
		}
	}

	if haslat && haslng {
		field, _ := NewSchemaField().NewID().Name("location").Type(ValueTypeLatLng).Build()
		schemafields = append(schemafields, field)
	}

	source := p.url
	if source == "" {
		source = "file:///" + p.name
	}

	schema, err := NewSchema().
		NewID().
		Scene(sid).
		Name(p.name).
		Source(source).
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
		name := strings.ToLower(strings.TrimSpace(f.Name()))
		if _, ok := schemafieldmap[name]; !ok {
			schemafieldmap[name] = f.ID()
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
			Scene(p.schema.Scene()).
			Schema(p.schema.ID()).
			Build()
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
		header := strings.TrimSpace(p.headers[i])
		lower := strings.ToLower(header)

		switch lower {
		case "lng":
			val, err := strconv.ParseFloat(record, 64)
			if err != nil {
				return nil, ErrFailedToParseCSVorTSVFile
			}
			lng = &val
			continue
		case "lat":
			val, err := strconv.ParseFloat(record, 64)
			if err != nil {
				return nil, ErrFailedToParseCSVorTSVFile
			}
			lat = &val
			continue
		default:
			fieldID := sfm[lower]
			fields = append(fields, NewField(fieldID, ValueFromStringOrNumber(record), ""))
		}
	}

	if lat != nil && lng != nil {
		if id, ok := sfm["location"]; ok {
			latlng := LatLng{Lat: *lat, Lng: *lng}
			fields = append(fields, NewField(id, ValueTypeLatLng.ValueFrom(latlng), ""))
		}
	}

	return append([]*Field{}, fields...), nil
}

func (p *DatasetCSVParser) CheckCompatible(s *Schema) error {
	fieldsmap := make(map[string]*SchemaField)
	for _, f := range s.Fields() {
		name := strings.ToLower(strings.TrimSpace(f.Name()))
		fieldsmap[name] = f
	}

	hasLat, hasLng := false, false

	for i, rawHeader := range p.headers {
		header := strings.ToLower(strings.TrimSpace(rawHeader))

		switch header {
		case "lat":
			hasLat = true
			continue
		case "lng":
			hasLng = true
			continue
		}

		field := fieldsmap[header]
		if field == nil {
			continue
		}

		expectedType := field.Type()
		value := ValueFromStringOrNumber(p.firstline[i])

		if value.Type() != expectedType && value.Type() != ValueTypeUnknown {
			return fmt.Errorf(
				"%w: field '%s' type mismatch (expected %s, got %s)",
				ErrIncompatibleSchema, field.Name(), expectedType, value.Type(),
			)
		}
	}

	locationFieldExists := false
	for name := range fieldsmap {
		if name == "location" {
			locationFieldExists = true
			break
		}
	}

	if hasLat && hasLng && !locationFieldExists {
		return fmt.Errorf(
			"%w: lat/lng present but no 'location' field in schema",
			ErrIncompatibleSchema,
		)
	}

	p.schema = s
	return nil
}

func (p *DatasetCSVParser) SetSchema(s *Schema) {
	p.schema = s
}
