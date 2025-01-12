package adapter

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/log"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestAttachLang(t *testing.T) {
	t.Run("Valid language tag", func(t *testing.T) {
		ctx := context.Background()

		lang := language.Japanese
		newCtx := AttachLang(ctx, lang)

		storedLang := newCtx.Value(contextLang)

		assert.NotNil(t, storedLang, "Language should be stored in context")
		assert.Equal(t, lang, storedLang, "Stored language should match the input")
	})

	t.Run("Default language (Und)", func(t *testing.T) {
		ctx := context.Background()

		lang := language.Und
		newCtx := AttachLang(ctx, lang)

		storedLang := newCtx.Value(contextLang)

		assert.NotNil(t, storedLang, "Language should be stored in context")
		assert.Equal(t, lang, storedLang, "Stored language should match the input")
	})

	t.Run("Context chaining", func(t *testing.T) {
		ctx := context.Background()

		lang1 := language.English
		ctx1 := AttachLang(ctx, lang1)

		lang2 := language.French
		ctx2 := AttachLang(ctx1, lang2)

		// confirm that the latest language is stored in the context
		assert.Equal(t, lang2, ctx2.Value(contextLang), "Latest language should be stored in context")

		// old context is not affected
		assert.Equal(t, lang1, ctx1.Value(contextLang), "Old context should retain its value")
	})
}

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
