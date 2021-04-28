package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParse(t *testing.T) {
	flags, args, err := Parse(nil)
	assert.NoError(t, err)
	assert.Equal(t, Flags(nil), flags)
	assert.Equal(t, []string(nil), args)

	flags, args, err = Parse([]string{})
	assert.NoError(t, err)
	assert.Equal(t, Flags(nil), flags)
	assert.Equal(t, []string(nil), args)

	flags, args, err = Parse([]string{"-a=b"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(map[string][]string{
		"a": {"b"},
	}), flags)
	assert.Equal(t, []string(nil), args)

	flags, args, err = Parse([]string{"-a"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(map[string][]string{
		"a": {""},
	}), flags)
	assert.Equal(t, []string(nil), args)

	flags, args, err = Parse([]string{"-a", "-b"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(map[string][]string{
		"a": {""},
		"b": {""},
	}), flags)
	assert.Equal(t, []string(nil), args)

	flags, args, err = Parse([]string{"--hoge=a", "--hoge=b"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(map[string][]string{
		"hoge": {"a", "b"},
	}), flags)
	assert.Equal(t, []string(nil), args)

	flags, args, err = Parse([]string{"aaa", "bbb"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(nil), flags)
	assert.Equal(t, []string{"aaa", "bbb"}, args)

	flags, args, err = Parse([]string{"aaa", "-a", "--", "-b", "bbb"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(nil), flags)
	assert.Equal(t, []string{"aaa", "-a", "--", "-b", "bbb"}, args)

	flags, args, err = Parse([]string{"-a", "--", "-b", "bbb"})
	assert.NoError(t, err)
	assert.Equal(t, Flags(map[string][]string{
		"a": {""},
	}), flags)
	assert.Equal(t, []string{"-b", "bbb"}, args)
}

func TestFlags_Bool(t *testing.T) {
	assert.Equal(t, false, Flags(nil).Bool("hoge"))
	assert.Equal(t, true, Flags(map[string][]string{
		"hoge": nil,
	}).Bool("hoge"))
	assert.Equal(t, true, Flags(map[string][]string{
		"hoge": {""},
	}).Bool("hoge"))
	assert.Equal(t, true, Flags(map[string][]string{
		"hoge": {"a"},
		"h":    {"b"},
	}).Bool("hoge"))

	assert.Equal(t, false, Flags(nil).Bool("hoge", "h"))
	assert.Equal(t, true, Flags(map[string][]string{
		"h": nil,
	}).Bool("hoge", "h"))
	assert.Equal(t, true, Flags(map[string][]string{
		"h": {""},
	}).Bool("hoge", "h"))
	assert.Equal(t, true, Flags(map[string][]string{
		"h": {"a"},
	}).Bool("hoge", "h"))
}

func TestFlags_String(t *testing.T) {
	assert.Equal(t, "", Flags(nil).String("hoge"))
	assert.Equal(t, "", Flags(map[string][]string{
		"hoge": nil,
	}).String("hoge"))
	assert.Equal(t, "a", Flags(map[string][]string{
		"hoge": {"a"},
		"h":    {"b"},
	}).String("hoge"))
	assert.Equal(t, "a", Flags(map[string][]string{
		"hoge": {"a", "b"},
	}).String("hoge"))

	assert.Equal(t, "", Flags(nil).String("hoge", "h"))
	assert.Equal(t, "", Flags(map[string][]string{
		"h": nil,
	}).String("hoge", "h"))
	assert.Equal(t, "a", Flags(map[string][]string{
		"h": {"a"},
	}).String("hoge", "h"))
	assert.Equal(t, "a", Flags(map[string][]string{
		"h": {"a", "b"},
	}).String("hoge", "h"))
}

func TestFlags_Strings(t *testing.T) {
	assert.Equal(t, []string(nil), Flags(nil).Strings("hoge"))
	assert.Equal(t, []string{""}, Flags(map[string][]string{
		"hoge": {""},
	}).Strings("hoge"))
	assert.Equal(t, []string{"a", "b"}, Flags(map[string][]string{
		"hoge": {"a", "b"},
		"h":    {"a"},
	}).Strings("hoge"))
	assert.Equal(t, []string(nil), Flags(nil).Strings("hoge", "h"))
	assert.Equal(t, []string{"a"}, Flags(map[string][]string{
		"h": {"a"},
	}).Strings("hoge", "h"))
}
