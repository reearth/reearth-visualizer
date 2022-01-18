package shp

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReadZipFrom(t *testing.T) {
	p := "test_files/ne_110m_admin_0_countries.zip"

	ior, err := os.Open(p)
	assert.Nil(t, err)
	defer func() {
		err := ior.Close()
		assert.Nil(t, err)
	}()

	zr, err := ReadZipFrom(ior)
	assert.Nil(t, err)
	defer func() {
		err := zr.Close()
		assert.Nil(t, err)
	}()

	var shps []Shape
	for zr.Next() {
		_, shp := zr.Shape()
		shps = append(shps, shp)
	}
	assert.Nil(t, zr.Err())
	assert.Equal(t, 177, len(shps))
}

func TestReadZipFromWrongScenarios(t *testing.T) {
	tests := []struct {
		name  string
		input string
	}{
		{
			name:  "ReadZipFromWrongFile",
			input: "test_files/point.shp",
		},
		{
			name:  "ReadZipFromEmptyZip",
			input: "test_files/empty.zip",
		},
		{
			name:  "ReadZipFromMultiZip",
			input: "test_files/multi.zip",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ior, err := os.Open(tc.input)
			assert.Nil(t, err)
			defer func() {
				err := ior.Close()
				assert.Nil(t, err)
			}()

			_, err = ReadZipFrom(ior)
			assert.NotNil(t, err)
		})
	}
}

func TestReadZipFromClosedReader(t *testing.T) {
	p := "test_files/point.shp"

	ior, err := os.Open(p)
	assert.Nil(t, err)

	err = ior.Close()
	assert.Nil(t, err)

	_, err = ReadZipFrom(ior)
	assert.NotNil(t, err)
}
