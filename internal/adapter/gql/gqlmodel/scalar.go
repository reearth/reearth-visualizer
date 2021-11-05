package gqlmodel

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
	"strconv"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"golang.org/x/text/language"
)

func MarshalURL(t url.URL) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
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
	return url.URL{}, errors.New("invalid URL")
}

func MarshalLang(t language.Tag) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalLang(v interface{}) (language.Tag, error) {
	if tmpStr, ok := v.(string); ok {
		if tmpStr == "" {
			return language.Tag{}, nil
		}
		l, err := language.Parse(tmpStr)
		if err != nil {
			return language.Tag{}, err
		}
		return l, nil
	}
	return language.Tag{}, errors.New("invalid lang")
}

func MarshalID(t id.ID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalID(v interface{}) (id.ID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.NewIDWith(tmpStr)
	}
	return id.ID{}, errors.New("invalid ID")
}

func MarshalCursor(t usecase.Cursor) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(string(t)))
	})
}

func UnmarshalCursor(v interface{}) (usecase.Cursor, error) {
	if tmpStr, ok := v.(string); ok {
		return usecase.Cursor(tmpStr), nil
	}
	return usecase.Cursor(""), errors.New("invalid cursor")
}

func MarshalPluginID(t id.PluginID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPluginID(v interface{}) (id.PluginID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PluginIDFrom(tmpStr)
	}
	return id.PluginID{}, errors.New("invalid ID")
}

func MarshalPluginExtensionID(t id.PluginExtensionID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPluginExtensionID(v interface{}) (id.PluginExtensionID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PluginExtensionID(tmpStr), nil
	}
	return id.PluginExtensionID(""), errors.New("invalid ID")
}

func MarshalPropertySchemaID(t id.PropertySchemaID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPropertySchemaID(v interface{}) (id.PropertySchemaID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertySchemaIDFrom(tmpStr)
	}
	return id.PropertySchemaID{}, errors.New("invalid ID")
}

func MarshalPropertySchemaGroupID(t id.PropertySchemaGroupID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPropertySchemaGroupID(v interface{}) (id.PropertySchemaGroupID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertySchemaGroupID(tmpStr), nil
	}
	return id.PropertySchemaGroupID(""), errors.New("invalid ID")
}

func MarshalPropertySchemaFieldID(t id.PropertySchemaFieldID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalPropertySchemaFieldID(v interface{}) (id.PropertySchemaFieldID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertySchemaFieldID(tmpStr), nil
	}
	return id.PropertySchemaFieldID(""), errors.New("invalid ID")
}

func MarshalDatasetSchemaFieldID(t id.DatasetSchemaFieldID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(t.String()))
	})
}

func UnmarshalDatasetSchemaFieldID(v interface{}) (id.DatasetSchemaFieldID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.DatasetSchemaFieldIDFrom(tmpStr)
	}
	return id.NewDatasetSchemaFieldID(), errors.New("invalid ID")
}

func MarshalMap(val map[string]string) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_ = json.NewEncoder(w).Encode(val)
	})
}

func UnmarshalMap(v interface{}) (map[string]string, error) {
	if m, ok := v.(map[string]string); ok {
		return m, nil
	}
	return nil, fmt.Errorf("%T is not a map", v)
}
