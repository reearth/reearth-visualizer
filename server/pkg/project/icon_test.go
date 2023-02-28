package project

// import (
// 	"net/http"
// 	"os"
// 	"testing"

// 	"github.com/samber/lo"
// 	"github.com/stretchr/testify/assert"
// )

// func TestGenerateIcon(t *testing.T) {
// 	res := lo.Must(http.Get(""))
// 	defer func() {
// 		_ = res.Body.Close()
// 	}()

// 	ico, err := GenerateIcon(res.Body)
// 	assert.NoError(t, err)

// 	lo.Must0(os.WriteFile("test.ico", ico, 0644))
// }
