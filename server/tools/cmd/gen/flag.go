package main

import (
	"fmt"
)

type Flags map[string][]string

func (f Flags) Bool(keys ...string) bool {
	for _, k := range keys {
		_, ok := f[k]
		if !ok {
			continue
		}
		return true
	}
	return false
}

func (f Flags) String(keys ...string) string {
	for _, k := range keys {
		v, ok := f[k]
		if !ok || len(v) == 0 {
			continue
		}
		return v[0]
	}
	return ""
}

func (f Flags) Strings(keys ...string) []string {
	for _, k := range keys {
		v, ok := f[k]
		if !ok || len(v) == 0 {
			continue
		}
		return v
	}
	return nil
}

type flagSet struct {
	args   []string
	parsed bool
	flags  Flags
}

func Parse(args []string) (Flags, []string, error) {
	fs := flagSet{}
	if err := fs.parse(args); err != nil {
		return nil, nil, err
	}
	if len(fs.args) == 0 {
		fs.args = nil
	}
	return fs.flags, fs.args, nil
}

func (f *flagSet) parse(arguments []string) error {
	f.parsed = true
	f.args = arguments
	for {
		seen, err := f.parseOne()
		if seen {
			continue
		}
		if err == nil {
			break
		}
	}
	return nil
}

func (f *flagSet) parseOne() (bool, error) {
	if len(f.args) == 0 {
		return false, nil
	}
	s := f.args[0]
	if len(s) < 2 || s[0] != '-' {
		return false, nil
	}
	numMinuses := 1
	if s[1] == '-' {
		numMinuses++
		if len(s) == 2 { // "--" terminates the flags
			f.args = f.args[1:]
			return false, nil
		}
	}
	name := s[numMinuses:]
	if len(name) == 0 || name[0] == '-' || name[0] == '=' {
		return false, fmt.Errorf("bad flag syntax: %s", s)
	}

	// it's a flag. does it have an argument?
	f.args = f.args[1:]
	hasValue := false
	value := ""
	for i := 1; i < len(name); i++ { // equals cannot be first
		if name[i] == '=' {
			value = name[i+1:]
			hasValue = true
			name = name[0:i]
			break
		}
	}

	var actualValue string
	if hasValue {
		actualValue = value
	}

	if existingValue, alreadythere := f.flags[name]; alreadythere {
		f.flags[name] = append(existingValue, actualValue)
	} else {
		if f.flags == nil {
			f.flags = make(map[string][]string)
		}
		f.flags[name] = []string{actualValue}
	}

	return true, nil
}
