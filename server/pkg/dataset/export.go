package dataset

import (
	"encoding/csv"
	"encoding/json"
	"io"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

type Format struct {
	Ext         string
	ContentType string
	export      func(io.Writer, *Schema, func(func(*Dataset) error) error) error
}

var formats = map[string]Format{
	"csv": {
		Ext:         "csv",
		ContentType: "text/csv",
		export:      ExportCSV,
	},
	"json": {
		Ext:         "json",
		ContentType: "application/json",
		export:      ExportJSON,
	},
}

var ErrUnknownFormat = rerror.NewE(i18n.T("unknown format"))

func ExportFormat(f string) (Format, bool) {
	format, ok := formats[f]
	return format, ok
}

func Export(w io.Writer, f string, ds *Schema, cb func(func(*Dataset) error) error) error {
	format, ok := formats[f]
	if !ok {
		return ErrUnknownFormat
	}

	if err := format.export(w, ds, cb); err != nil {
		return err
	}

	return nil
}

func ExportCSV(w io.Writer, ds *Schema, loader func(func(*Dataset) error) error) error {
	csvw := csv.NewWriter(w)
	dsfields := ds.Fields()

	// Write header
	header := make([]string, len(dsfields))
	for i, f := range dsfields {
		header[i] = f.Name()
	}

	if err := csvw.Write(header); err != nil {
		return err
	}

	// Write data
	if err := loader(func(d *Dataset) error {
		row := make([]string, len(dsfields))
		for i, sf := range dsfields {
			f := d.Field(sf.ID())
			v := f.Value()
			if v == nil {
				row[i] = ""
				continue
			}
			row[i] = v.String()
		}

		return csvw.Write(row)
	}); err != nil {
		return err
	}

	csvw.Flush()
	return csvw.Error()
}

func ExportJSON(w io.Writer, ds *Schema, loader func(func(*Dataset) error) error) error {
	j := json.NewEncoder(w)
	res := []any{}

	if err := loader(func(d *Dataset) error {
		res = append(res, d.Interface(ds))
		return nil
	}); err != nil {
		return err
	}

	return j.Encode(res)
}
