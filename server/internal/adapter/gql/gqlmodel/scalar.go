package gqlmodel

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
	"strconv"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearthx/usecasex"
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

func MarshalCursor(t usecasex.Cursor) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, _ = io.WriteString(w, strconv.Quote(string(t)))
	})
}

func UnmarshalCursor(v interface{}) (usecasex.Cursor, error) {
	if tmpStr, ok := v.(string); ok {
		return usecasex.Cursor(tmpStr), nil
	}
	return usecasex.Cursor(""), errors.New("invalid cursor")
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
