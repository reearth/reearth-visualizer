module github.com/reearth/reearth-backend

require (
	cloud.google.com/go/profiler v0.2.0
	cloud.google.com/go/storage v1.21.0
	github.com/99designs/gqlgen v0.17.1
	github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace v1.3.0
	github.com/auth0/go-jwt-middleware/v2 v2.0.0
	github.com/blang/semver v3.5.1+incompatible
	github.com/caos/oidc v1.0.0
	github.com/goccy/go-yaml v1.9.5
	github.com/golang/gddo v0.0.0-20210115222349-20d68f94ee1f
	github.com/google/uuid v1.3.0
	github.com/gorilla/mux v1.8.0
	github.com/iancoleman/strcase v0.2.0
	github.com/idubinskiy/schematyper v0.0.0-20190118213059-f71b40dac30d
	github.com/jarcoal/httpmock v1.1.0
	github.com/joho/godotenv v1.4.0
	github.com/jonas-p/go-shp v0.1.1
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/kennygrant/sanitize v1.2.4
	github.com/labstack/echo/v4 v4.7.0
	github.com/labstack/gommon v0.3.1
	github.com/mitchellh/mapstructure v1.4.3
	github.com/oklog/ulid v1.3.1
	github.com/paulmach/go.geojson v1.4.0
	github.com/pkg/errors v0.9.1
	github.com/ravilushqa/otelgqlgen v0.5.1
	github.com/sendgrid/sendgrid-go v3.11.1+incompatible
	github.com/sirupsen/logrus v1.8.1
	github.com/spf13/afero v1.8.1
	github.com/square/mongo-lock v0.0.0-20201208161834-4db518ed7fb2
	github.com/stretchr/testify v1.7.0
	github.com/twpayne/go-kml v1.5.2
	github.com/uber/jaeger-client-go v2.30.0+incompatible
	github.com/uber/jaeger-lib v2.4.1+incompatible
	github.com/vektah/dataloaden v0.3.0
	github.com/vektah/gqlparser/v2 v2.4.1
	go.mongodb.org/mongo-driver v1.8.4
	go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho v0.29.0
	go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo v0.29.0
	go.opentelemetry.io/otel v1.4.1
	go.opentelemetry.io/otel/sdk v1.4.1
	golang.org/x/crypto v0.0.0-20220112180741-5e0467b6c7ce
	golang.org/x/text v0.3.7
	golang.org/x/tools v0.1.9
	google.golang.org/api v0.70.0
	gopkg.in/go-playground/colors.v1 v1.2.0
	gopkg.in/h2non/gock.v1 v1.1.2
	gopkg.in/square/go-jose.v2 v2.6.0
)

require (
	cloud.google.com/go v0.100.2 // indirect
	cloud.google.com/go/compute v1.3.0 // indirect
	cloud.google.com/go/iam v0.1.1 // indirect
	cloud.google.com/go/trace v1.0.0 // indirect
	github.com/HdrHistogram/hdrhistogram-go v1.0.1 // indirect
	github.com/agnivade/levenshtein v1.1.1 // indirect
	github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751 // indirect
	github.com/alecthomas/units v0.0.0-20210927113745-59d0afb8317a // indirect
	github.com/caos/logging v0.0.2 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.1 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/dgryski/trifles v0.0.0-20200705224438-cafc02a1ee2b // indirect
	github.com/fatih/color v1.12.0 // indirect
	github.com/felixge/httpsnoop v1.0.2 // indirect
	github.com/gedex/inflector v0.0.0-20170307190818-16278e9db813 // indirect
	github.com/go-logr/logr v1.2.2 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-stack/stack v1.8.0 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/golang/snappy v0.0.3 // indirect
	github.com/google/go-cmp v0.5.7 // indirect
	github.com/google/pprof v0.0.0-20220113144219-d25a53d42d00 // indirect
	github.com/googleapis/gax-go/v2 v2.1.1 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20200217142428-fce0ec30dd00 // indirect
	github.com/gorilla/handlers v1.5.1 // indirect
	github.com/gorilla/schema v1.2.0 // indirect
	github.com/gorilla/securecookie v1.1.1 // indirect
	github.com/gorilla/websocket v1.4.2 // indirect
	github.com/h2non/parth v0.0.0-20190131123155-b4df798d6542 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/klauspost/compress v1.13.6 // indirect
	github.com/matryer/moq v0.2.3 // indirect
	github.com/mattn/go-colorable v0.1.11 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/sendgrid/rest v2.6.6+incompatible // indirect
	github.com/smartystreets/assertions v1.1.1 // indirect
	github.com/smartystreets/goconvey v1.6.4 // indirect
	github.com/stretchr/objx v0.2.0 // indirect
	github.com/tidwall/pretty v1.0.1 // indirect
	github.com/urfave/cli/v2 v2.3.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.1 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.0.2 // indirect
	github.com/xdg-go/stringprep v1.0.2 // indirect
	github.com/youmark/pkcs8 v0.0.0-20181117223130-1be2e3e5546d // indirect
	go.opencensus.io v0.23.0 // indirect
	go.opentelemetry.io/contrib v1.4.0 // indirect
	go.opentelemetry.io/otel/trace v1.4.1 // indirect
	go.uber.org/atomic v1.7.0 // indirect
	golang.org/x/mod v0.5.1 // indirect
	golang.org/x/net v0.0.0-20220127200216-cd36cc0744dd // indirect
	golang.org/x/oauth2 v0.0.0-20211104180415-d3ed0bb246c8 // indirect
	golang.org/x/sync v0.0.0-20210220032951-036812b2e83c // indirect
	golang.org/x/sys v0.0.0-20220209214540-3681064d5158 // indirect
	golang.org/x/time v0.0.0-20210220033141-f8bda1e9f3ba // indirect
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/genproto v0.0.0-20220218161850-94dd64e39d7c // indirect
	google.golang.org/grpc v1.44.0 // indirect
	google.golang.org/protobuf v1.27.1 // indirect
	gopkg.in/alecthomas/kingpin.v2 v2.2.6 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.0-20210107192922-496545a6307b // indirect
)

go 1.17
