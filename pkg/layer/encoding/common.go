package encoding

import (
	"image/color"
	"strconv"
	"strings"

	"gopkg.in/go-playground/colors.v1"
)

func getColor(str string) *color.RGBA {
	if len(str) == 0 {
		return nil
	}

	cs := str
	a := ""

	if str[0] == '#' {
		if len(str) == 5 {
			cs = str[:len(str)-1]
			a = strings.Repeat(str[len(str)-1:], 2)
		} else if len(str) == 9 {
			cs = str[:len(str)-2]
			a = str[len(str)-2:]
		}
	}

	b, err := colors.Parse(cs)
	if err != nil || b == nil {
		return nil
	}

	c := b.ToRGBA()
	var alpha uint8
	if a != "" {
		a2, _ := strconv.ParseUint(a, 16, 8)
		alpha = uint8(a2)
	} else {
		alpha = uint8(c.A * 255)
	}

	return &color.RGBA{R: c.R, G: c.G, B: c.B, A: alpha}
}
