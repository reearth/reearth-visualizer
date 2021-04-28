package graphql

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
	"strconv"

	graphql1 "github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func MarshalURL(t url.URL) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalURL(v interface{}) (url.URL, error) {
	if tmpStr, ok := v.(string); ok {
		u, err := url.Parse(tmpStr)
		if u != nil {
			return *u, err
		}
		return url.URL{}, err
	}
	return url.URL{}, errors.New("Invalid URL")
}

func MarshalID(t id.ID) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalID(v interface{}) (id.ID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.NewIDWith(tmpStr)
	}
	return id.ID{}, errors.New("Invalid ID")
}

func MarshalCursor(t usecase.Cursor) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(string(t)))
	})
}

func UnmarshalCursor(v interface{}) (usecase.Cursor, error) {
	if tmpStr, ok := v.(string); ok {
		return usecase.Cursor(tmpStr), nil
	}
	return usecase.Cursor(""), errors.New("Invalid cursor")
}

func MarshalPluginID(t id.PluginID) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPluginID(v interface{}) (id.PluginID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PluginIDFrom(tmpStr)
	}
	return id.PluginID{}, errors.New("Invalid ID")
}

func MarshalPluginExtensionID(t id.PluginExtensionID) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPluginExtensionID(v interface{}) (id.PluginExtensionID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PluginExtensionID(tmpStr), nil
	}
	return id.PluginExtensionID(""), errors.New("Invalid ID")
}

func MarshalPropertySchemaID(t id.PropertySchemaID) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPropertySchemaID(v interface{}) (id.PropertySchemaID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertySchemaIDFrom(tmpStr)
	}
	return id.PropertySchemaID{}, errors.New("Invalid ID")
}

func MarshalPropertySchemaFieldID(t id.PropertySchemaFieldID) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPropertySchemaFieldID(v interface{}) (id.PropertySchemaFieldID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertySchemaFieldID(tmpStr), nil
	}
	return id.PropertySchemaFieldID(""), errors.New("Invalid ID")
}

func MarshalMap(val map[string]string) graphql1.Marshaler {
	return graphql1.WriterFunc(func(w io.Writer) {
		_ = json.NewEncoder(w).Encode(val)
	})
}

func UnmarshalMap(v interface{}) (map[string]string, error) {
	if m, ok := v.(map[string]string); ok {
		return m, nil
	}
	return nil, fmt.Errorf("%T is not a map", v)
}
