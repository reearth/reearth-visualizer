package adapter

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/log"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestLang(t *testing.T) {

	// Default language for testing
	defaultLang := language.English // or set it to whatever your defaultLang is

	t.Run("Lang is provided and valid", func(t *testing.T) {
		lang := language.Japanese
		result := Lang(context.Background(), &lang)
		assert.Equal(t, "ja", result)
	})

	t.Run("Lang is nil, context has valid lang", func(t *testing.T) {
		lang := language.French
		ctx := context.WithValue(context.Background(), contextLang, lang)
		result := Lang(ctx, nil)
		log.Infofc(ctx, "result: %s", result)
		assert.Equal(t, "fr", result)
	})

	t.Run("Lang is nil, context lang is empty", func(t *testing.T) {
		ctx := context.WithValue(context.Background(), contextLang, language.Make(""))
		result := Lang(ctx, nil)
		assert.Equal(t, defaultLang.String(), result)
	})

	t.Run("Lang is nil, context has no lang", func(t *testing.T) {
		result := Lang(context.Background(), nil)
		assert.Equal(t, defaultLang.String(), result)
	})

	t.Run("Lang is root, context has no lang", func(t *testing.T) {
		rootLang := language.Und
		result := Lang(context.Background(), &rootLang)
		assert.Equal(t, defaultLang.String(), result)
	})

	t.Run("Lang is french, context has no lang", func(t *testing.T) {
		lang := language.French
		result := Lang(context.Background(), &lang)
		assert.Equal(t, lang.String(), result)
	})

}
