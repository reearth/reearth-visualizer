module github.com/reearth/reearth/server

require (
	cloud.google.com/go/profiler v0.3.0
	cloud.google.com/go/storage v1.36.0
	github.com/99designs/gqlgen v0.17.43
	github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace v1.21.0
	github.com/alicebob/miniredis/v2 v2.32.1
	github.com/avast/retry-go/v4 v4.0.4
	github.com/aws/aws-sdk-go-v2 v1.25.3
	github.com/aws/aws-sdk-go-v2/config v1.27.7
	github.com/aws/aws-sdk-go-v2/service/s3 v1.52.0
	github.com/blang/semver v3.5.1+incompatible
	github.com/gavv/httpexpect/v2 v2.3.1
	github.com/go-redis/redis/v8 v8.11.5
	github.com/goccy/go-yaml v1.11.3
	github.com/google/uuid v1.6.0
	github.com/iancoleman/strcase v0.3.0
	github.com/idubinskiy/schematyper v0.0.0-20190118213059-f71b40dac30d
	github.com/jarcoal/httpmock v1.3.1
	github.com/joho/godotenv v1.4.0
	github.com/jonas-p/go-shp v0.1.1
	github.com/k0kubun/pp/v3 v3.2.0
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/kennygrant/sanitize v1.2.4
	github.com/labstack/echo/v4 v4.11.4
	github.com/mitchellh/mapstructure v1.5.0
	github.com/paulmach/go.geojson v1.4.0
	github.com/pkg/errors v0.9.1
	github.com/ravilushqa/otelgqlgen v0.15.0
	github.com/reearth/reearthx v0.0.0-20240403021819-5cbc45bf18eb
	github.com/samber/lo v1.39.0
	github.com/spf13/afero v1.11.0
	github.com/square/mongo-lock v0.0.0-20201208161834-4db518ed7fb2
	github.com/stretchr/testify v1.8.4
	github.com/twpayne/go-kml v1.5.2
	github.com/uber/jaeger-client-go v2.30.0+incompatible
	github.com/uber/jaeger-lib v2.4.1+incompatible
	github.com/uptrace/uptrace-go v1.24.0
	github.com/vektah/dataloaden v0.3.0
	github.com/vektah/gqlparser/v2 v2.5.11
	github.com/vmihailenco/msgpack/v5 v5.4.1
	github.com/zitadel/oidc v1.13.5
	go.mongodb.org/mongo-driver v1.13.1
	go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho v0.32.0
	go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo v0.32.0
	go.opentelemetry.io/otel v1.24.0
	go.opentelemetry.io/otel/sdk v1.24.0
	golang.org/x/exp v0.0.0-20240119083558-1b970713d09a
	golang.org/x/net v0.22.0
	golang.org/x/oauth2 v0.16.0
	golang.org/x/text v0.14.0
	golang.org/x/tools v0.17.0
	google.golang.org/api v0.161.0
	gopkg.in/go-playground/colors.v1 v1.2.0
	gopkg.in/h2non/gock.v1 v1.1.2
	gopkg.in/square/go-jose.v2 v2.6.0
)

require (
	cloud.google.com/go v0.112.0 // indirect
	cloud.google.com/go/compute v1.23.4 // indirect
	cloud.google.com/go/compute/metadata v0.2.3 // indirect
	cloud.google.com/go/iam v1.1.5 // indirect
	cloud.google.com/go/trace v1.10.5 // indirect
	github.com/GoogleCloudPlatform/opentelemetry-operations-go/internal/resourcemapping v0.45.0 // indirect
	github.com/agnivade/levenshtein v1.1.1 // indirect
	github.com/ajg/form v1.5.1 // indirect
	github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751 // indirect
	github.com/alecthomas/units v0.0.0-20210927113745-59d0afb8317a // indirect
	github.com/alicebob/gopher-json v0.0.0-20200520072559-a9ecdc9d1d3a // indirect
	github.com/andybalholm/brotli v1.0.2 // indirect
	github.com/auth0/go-jwt-middleware/v2 v2.2.1 // indirect
	github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream v1.6.1 // indirect
	github.com/aws/aws-sdk-go-v2/credentials v1.17.7 // indirect
	github.com/aws/aws-sdk-go-v2/feature/ec2/imds v1.15.3 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.3.3 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.6.3 // indirect
	github.com/aws/aws-sdk-go-v2/internal/ini v1.8.0 // indirect
	github.com/aws/aws-sdk-go-v2/internal/v4a v1.3.3 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.11.1 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/checksum v1.3.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.11.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/s3shared v1.17.3 // indirect
	github.com/aws/aws-sdk-go-v2/service/ses v1.19.6 // indirect
	github.com/aws/aws-sdk-go-v2/service/sso v1.20.2 // indirect
	github.com/aws/aws-sdk-go-v2/service/ssooidc v1.23.2 // indirect
	github.com/aws/aws-sdk-go-v2/service/sts v1.28.4 // indirect
	github.com/aws/smithy-go v1.20.1 // indirect
	github.com/cenkalti/backoff/v4 v4.2.1 // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.3 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/fatih/color v1.16.0 // indirect
	github.com/fatih/structs v1.0.0 // indirect
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/gedex/inflector v0.0.0-20170307190818-16278e9db813 // indirect
	github.com/go-logr/logr v1.4.1 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/golang/gddo v0.0.0-20210115222349-20d68f94ee1f // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/protobuf v1.5.4 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/google/pprof v0.0.0-20220412212628-83db2b799d1f // indirect
	github.com/google/s2a-go v0.1.7 // indirect
	github.com/googleapis/enterprise-certificate-proxy v0.3.2 // indirect
	github.com/googleapis/gax-go/v2 v2.12.0 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20200217142428-fce0ec30dd00 // indirect
	github.com/gorilla/mux v1.8.1 // indirect
	github.com/gorilla/schema v1.2.0 // indirect
	github.com/gorilla/securecookie v1.1.1 // indirect
	github.com/gorilla/websocket v1.5.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.19.1 // indirect
	github.com/h2non/parth v0.0.0-20190131123155-b4df798d6542 // indirect
	github.com/hashicorp/golang-lru/v2 v2.0.3 // indirect
	github.com/imkira/go-interpol v1.0.0 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/klauspost/compress v1.13.6 // indirect
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/maruel/panicparse/v2 v2.3.1 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/montanaflynn/stats v0.0.0-20171201202039-1bf9dbcd8cbe // indirect
	github.com/nicksnyder/go-i18n/v2 v2.4.0 // indirect
	github.com/oklog/ulid v1.3.1 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/rs/cors v1.10.1 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/sendgrid/rest v2.6.9+incompatible // indirect
	github.com/sendgrid/sendgrid-go v3.14.0+incompatible // indirect
	github.com/sergi/go-diff v1.3.1 // indirect
	github.com/sirupsen/logrus v1.9.3 // indirect
	github.com/smartystreets/assertions v1.1.1 // indirect
	github.com/smartystreets/goconvey v1.6.4 // indirect
	github.com/sosodev/duration v1.2.0 // indirect
	github.com/urfave/cli/v2 v2.27.1 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.27.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/vmihailenco/tagparser/v2 v2.0.0 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.2 // indirect
	github.com/xdg-go/stringprep v1.0.4 // indirect
	github.com/xeipuuv/gojsonpointer v0.0.0-20180127040702-4e3ac2762d5f // indirect
	github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
	github.com/xeipuuv/gojsonschema v1.1.0 // indirect
	github.com/xrash/smetrics v0.0.0-20231213231151-1d8dd44e695e // indirect
	github.com/yalp/jsonpath v0.0.0-20180802001716-5cc68e5049a0 // indirect
	github.com/youmark/pkcs8 v0.0.0-20181117223130-1be2e3e5546d // indirect
	github.com/yudai/gojsondiff v1.0.0 // indirect
	github.com/yudai/golcs v0.0.0-20170316035057-ecda9a501e82 // indirect
	github.com/yuin/gopher-lua v1.1.1 // indirect
	github.com/zitadel/logging v0.3.4 // indirect
	go.opencensus.io v0.24.0 // indirect
	go.opentelemetry.io/contrib v1.22.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.47.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.47.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/runtime v0.49.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc v1.24.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.24.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.24.0 // indirect
	go.opentelemetry.io/otel/exporters/stdout/stdouttrace v1.24.0 // indirect
	go.opentelemetry.io/otel/metric v1.24.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v1.24.0 // indirect
	go.opentelemetry.io/otel/trace v1.24.0 // indirect
	go.opentelemetry.io/proto/otlp v1.1.0 // indirect
	go.uber.org/atomic v1.11.0 // indirect
	go.uber.org/multierr v1.11.0 // indirect
	go.uber.org/zap v1.26.0 // indirect
	golang.org/x/crypto v0.21.0 // indirect
	golang.org/x/mod v0.14.0 // indirect
	golang.org/x/sync v0.6.0 // indirect
	golang.org/x/sys v0.18.0 // indirect
	golang.org/x/time v0.5.0 // indirect
	golang.org/x/xerrors v0.0.0-20231012003039-104605ab7028 // indirect
	google.golang.org/appengine v1.6.8 // indirect
	google.golang.org/genproto v0.0.0-20240125205218-1f4bbc51befe // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20240318140521-94a12d6c2237 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240318140521-94a12d6c2237 // indirect
	google.golang.org/grpc v1.62.1 // indirect
	google.golang.org/protobuf v1.33.0 // indirect
	gopkg.in/alecthomas/kingpin.v2 v2.2.6 // indirect
	gopkg.in/go-jose/go-jose.v2 v2.6.2 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	moul.io/http2curl v1.0.1-0.20190925090545-5cd742060b0e // indirect
)

go 1.21

toolchain go1.21.0
