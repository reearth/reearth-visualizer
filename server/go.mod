module github.com/reearth/reearth/server

require (
	cloud.google.com/go/profiler v0.3.1
	cloud.google.com/go/storage v1.30.1
	github.com/99designs/gqlgen v0.17.30
	github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace v1.13.1
	github.com/auth0/go-jwt-middleware/v2 v2.1.0
	github.com/avast/retry-go/v4 v4.3.4
	github.com/blang/semver v3.5.1+incompatible
	github.com/gavv/httpexpect/v2 v2.15.0
	github.com/goccy/go-yaml v1.11.0
	github.com/google/uuid v1.3.0
	github.com/iancoleman/strcase v0.2.0
	github.com/idubinskiy/schematyper v0.0.0-20190118213059-f71b40dac30d
	github.com/jarcoal/httpmock v1.3.0
	github.com/joho/godotenv v1.5.1
	github.com/jonas-p/go-shp v0.1.1
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/kennygrant/sanitize v1.2.4
	github.com/labstack/echo/v4 v4.10.2
	github.com/labstack/gommon v0.4.0
	github.com/mitchellh/mapstructure v1.5.0
	github.com/paulmach/go.geojson v1.4.0
	github.com/pkg/errors v0.9.1
	github.com/ravilushqa/otelgqlgen v0.11.0
	github.com/reearth/reearthx v0.0.0-20230424025048-6dbbe40aad26
	github.com/samber/lo v1.38.1
	github.com/sendgrid/sendgrid-go v3.12.0+incompatible
	github.com/sirupsen/logrus v1.9.0
	github.com/spf13/afero v1.9.5
	github.com/square/mongo-lock v0.0.0-20230501160337-eb07183bebe1
	github.com/stretchr/testify v1.8.2
	github.com/twpayne/go-kml v1.5.2
	github.com/uber/jaeger-client-go v2.30.0+incompatible
	github.com/uber/jaeger-lib v2.4.1+incompatible
	github.com/vektah/dataloaden v0.3.0
	github.com/vektah/gqlparser/v2 v2.5.1
	github.com/zitadel/oidc v1.13.4
	go.mongodb.org/mongo-driver v1.11.4
	go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho v0.41.0
	go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo v0.41.0
	go.opentelemetry.io/otel v1.15.0
	go.opentelemetry.io/otel/sdk v1.15.0
	golang.org/x/crypto v0.8.0
	golang.org/x/exp v0.0.0-20230425010034-47ecfdc1ba53
	golang.org/x/net v0.9.0
	golang.org/x/oauth2 v0.7.0
	golang.org/x/text v0.9.0
	golang.org/x/tools v0.8.0
	google.golang.org/api v0.120.0
	gopkg.in/go-playground/colors.v1 v1.2.0
	gopkg.in/h2non/gock.v1 v1.1.2
	gopkg.in/square/go-jose.v2 v2.6.0
)

require (
	cloud.google.com/go v0.110.0 // indirect
	cloud.google.com/go/compute v1.19.0 // indirect
	cloud.google.com/go/compute/metadata v0.2.3 // indirect
	cloud.google.com/go/iam v0.13.0 // indirect
	cloud.google.com/go/trace v1.9.0 // indirect
	github.com/GoogleCloudPlatform/opentelemetry-operations-go/internal/resourcemapping v0.37.1 // indirect
	github.com/agnivade/levenshtein v1.1.1 // indirect
	github.com/ajg/form v1.5.1 // indirect
	github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751 // indirect
	github.com/alecthomas/units v0.0.0-20210927113745-59d0afb8317a // indirect
	github.com/andybalholm/brotli v1.0.4 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/dgryski/trifles v0.0.0-20200705224438-cafc02a1ee2b // indirect
	github.com/fatih/color v1.13.0 // indirect
	github.com/fatih/structs v1.1.0 // indirect
	github.com/gedex/inflector v0.0.0-20170307190818-16278e9db813 // indirect
	github.com/go-logr/logr v1.2.4 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/gobwas/glob v0.2.3 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/golang/gddo v0.0.0-20210115222349-20d68f94ee1f // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/golang/snappy v0.0.3 // indirect
	github.com/google/go-cmp v0.5.9 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/google/pprof v0.0.0-20221103000818-d260c55eee4c // indirect
	github.com/google/s2a-go v0.1.2 // indirect
	github.com/googleapis/enterprise-certificate-proxy v0.2.3 // indirect
	github.com/googleapis/gax-go/v2 v2.8.0 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20200217142428-fce0ec30dd00 // indirect
	github.com/gorilla/mux v1.8.0 // indirect
	github.com/gorilla/schema v1.2.0 // indirect
	github.com/gorilla/securecookie v1.1.1 // indirect
	github.com/gorilla/websocket v1.5.0 // indirect
	github.com/h2non/parth v0.0.0-20190131123155-b4df798d6542 // indirect
	github.com/hashicorp/golang-lru/v2 v2.0.1 // indirect
	github.com/hpcloud/tail v1.0.0 // indirect
	github.com/imkira/go-interpol v1.1.0 // indirect
	github.com/klauspost/compress v1.15.0 // indirect
	github.com/maruel/panicparse/v2 v2.3.1 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.17 // indirect
	github.com/mitchellh/go-wordwrap v1.0.1 // indirect
	github.com/montanaflynn/stats v0.0.0-20171201202039-1bf9dbcd8cbe // indirect
	github.com/nicksnyder/go-i18n/v2 v2.2.1 // indirect
	github.com/oklog/ulid v1.3.1 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/rs/cors v1.8.3 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/sanity-io/litter v1.5.5 // indirect
	github.com/sendgrid/rest v2.6.9+incompatible // indirect
	github.com/sergi/go-diff v1.1.0 // indirect
	github.com/smartystreets/assertions v1.1.1 // indirect
	github.com/smartystreets/goconvey v1.6.4 // indirect
	github.com/tidwall/pretty v1.0.1 // indirect
	github.com/urfave/cli/v2 v2.24.4 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.34.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.1 // indirect
	github.com/xdg-go/stringprep v1.0.3 // indirect
	github.com/xeipuuv/gojsonpointer v0.0.0-20190905194746-02993c407bfb // indirect
	github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
	github.com/xeipuuv/gojsonschema v1.2.0 // indirect
	github.com/xrash/smetrics v0.0.0-20201216005158-039620a65673 // indirect
	github.com/yalp/jsonpath v0.0.0-20180802001716-5cc68e5049a0 // indirect
	github.com/youmark/pkcs8 v0.0.0-20181117223130-1be2e3e5546d // indirect
	github.com/yudai/gojsondiff v1.0.0 // indirect
	github.com/yudai/golcs v0.0.0-20170316035057-ecda9a501e82 // indirect
	github.com/zitadel/logging v0.3.4 // indirect
	go.opencensus.io v0.24.0 // indirect
	go.opentelemetry.io/contrib v1.10.0 // indirect
	go.opentelemetry.io/otel/trace v1.15.0 // indirect
	go.uber.org/atomic v1.10.0 // indirect
	go.uber.org/multierr v1.8.0 // indirect
	go.uber.org/zap v1.21.0 // indirect
	golang.org/x/mod v0.10.0 // indirect
	golang.org/x/sync v0.1.0 // indirect
	golang.org/x/sys v0.7.0 // indirect
	golang.org/x/time v0.3.0 // indirect
	golang.org/x/xerrors v0.0.0-20220907171357-04be3eba64a2 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/genproto v0.0.0-20230410155749-daa745c078e1 // indirect
	google.golang.org/grpc v1.54.0 // indirect
	google.golang.org/protobuf v1.30.0 // indirect
	gopkg.in/alecthomas/kingpin.v2 v2.2.6 // indirect
	gopkg.in/fsnotify.v1 v1.4.7 // indirect
	gopkg.in/tomb.v1 v1.0.0-20141024135613-dd632973f1e7 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	moul.io/http2curl/v2 v2.3.0 // indirect
)

go 1.19
