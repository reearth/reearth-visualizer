package gqlmodel

import (
	"errors"
	"io"
	"reflect"
	"strconv"

	"github.com/99designs/gqlgen/graphql"
	"github.com/labstack/gommon/log"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/idx"
)

type ID string

func MarshalPropertyFieldID(t id.PropertyFieldID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.Quote(t.String()))
		if err != nil {
			log.Errorf("MarshalPropertyFieldID error: %s", err.Error())
		}
	})
}

func UnmarshalPropertyFieldID(v interface{}) (id.PropertyFieldID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertyFieldID(tmpStr), nil
	}
	err := errors.New("UnmarshalPropertyFieldID invalid ID")
	log.Errorf("UnmarshalPropertyFieldID error: %v", err)
	return id.PropertyFieldID(""), err
}

func MarshalPluginID(t id.PluginID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.Quote(t.String()))
		if err != nil {
			log.Errorf("MarshalPluginID error: %s", err.Error())
		}
	})
}

func UnmarshalPluginID(v interface{}) (id.PluginID, error) {
	if tmpStr, ok := v.(string); ok {
		pluginID, err := id.PluginIDFrom(tmpStr)
		if err != nil {
			log.Errorf("UnmarshalPluginID id.PluginIDFrom error: %s, input: %s", err.Error(), tmpStr)
		}
		return pluginID, err
	}
	err := errors.New("UnmarshalPluginID invalid ID")
	log.Errorf("UnmarshalPluginID error: %v", err)
	return id.PluginID{}, err
}

func MarshalPluginExtensionID(t id.PluginExtensionID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.Quote(t.String()))
		if err != nil {
			log.Errorf("MarshalPluginExtensionID error: %s", err.Error())
		}
	})
}

func UnmarshalPluginExtensionID(v interface{}) (id.PluginExtensionID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PluginExtensionID(tmpStr), nil
	}
	err := errors.New("UnmarshalPluginExtensionID invalid ID")
	log.Errorf("UnmarshalPluginExtensionID error: %v", err)
	return id.PluginExtensionID(""), err
}

func MarshalPropertySchemaID(t id.PropertySchemaID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.Quote(t.String()))
		if err != nil {
			log.Errorf("MarshalPropertySchemaID error: %s", err.Error())
		}
	})
}

func UnmarshalPropertySchemaID(v interface{}) (id.PropertySchemaID, error) {
	if tmpStr, ok := v.(string); ok {
		schemaID, err := id.PropertySchemaIDFrom(tmpStr)
		if err != nil {
			log.Errorf("UnmarshalPropertySchemaID id.PropertySchemaIDFrom error: %s, input: %s", err.Error(), tmpStr)
		}
		return schemaID, err
	}
	err := errors.New("UnmarshalPropertySchemaID invalid ID")
	log.Errorf("UnmarshalPropertySchemaID error: %v", err)
	return id.PropertySchemaID{}, err
}

func MarshalPropertySchemaGroupID(t id.PropertySchemaGroupID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.Quote(t.String()))
		if err != nil {
			log.Errorf("MarshalPropertySchemaGroupID error: %s", err.Error())
		}
	})
}

func UnmarshalPropertySchemaGroupID(v interface{}) (id.PropertySchemaGroupID, error) {
	if tmpStr, ok := v.(string); ok {
		return id.PropertySchemaGroupID(tmpStr), nil
	}
	err := errors.New("UnmarshalPropertySchemaGroupID invalid ID")
	log.Errorf("UnmarshalPropertySchemaGroupID error: %v", err)
	return id.PropertySchemaGroupID(""), err
}

func IDFrom[T idx.Type](i idx.ID[T]) ID {
	return ID(i.String())
}

func IDFromList[T idx.Type](i idx.List[T]) []ID {
	if i == nil {
		return nil
	}
	res := make([]ID, len(i))
	for i, v := range i {
		res[i] = IDFrom[T](v)
	}
	return res
}

func IDFromRef[T idx.Type](i *idx.ID[T]) *ID {
	return (*ID)(i.StringRef())
}

func IDFromString[T idx.Type](i idx.StringID[T]) ID {
	return (ID)(i)
}

func IDFromStringRef[T idx.Type](i *idx.StringID[T]) *ID {
	return (*ID)(i)
}

func IDFromPluginID(i id.PluginID) ID {
	return ID(i.String())
}

func IDFromPluginIDRef(i *id.PluginID) *ID {
	return (*ID)(i.StringRef())
}

func IDFromPropertySchemaID(i id.PropertySchemaID) ID {
	return ID(i.String())
}

func IDFromPropertySchemaIDRef(i *id.PropertySchemaID) *ID {
	return (*ID)(i.StringRef())
}

func ToID[A idx.Type](a ID) (idx.ID[A], error) {
	id, err := idx.From[A](string(a))
	if err != nil {
		var zero A
		typeName := reflect.TypeOf(zero).String()
		log.Errorf("ToID error: type=%s, input=%s, error=%s", typeName, string(a), err.Error())
	}
	return id, err
}

func ToIDs[A idx.Type](a []ID) (*[]idx.ID[A], error) {
	if a == nil {
		return nil, nil
	}
	res := make([]idx.ID[A], len(a))
	for i, v := range a {
		r, err := ToID[A](v)
		if err != nil {
			var zero A
			typeName := reflect.TypeOf(zero).String()
			log.Errorf("ToIDs error: type=%s, index=%d, input=%s, error=%s", typeName, i, string(v), err.Error())
			return nil, err
		}
		res[i] = r
	}
	return &res, nil
}

func ToID2[A, B idx.Type](a, b ID) (ai idx.ID[A], bi idx.ID[B], err error) {
	ai, err = ToID[A](a)
	if err != nil {
		return
	}
	bi, err = ToID[B](b)
	return
}

func ToID3[A, B, C idx.Type](a, b, c ID) (ai idx.ID[A], bi idx.ID[B], ci idx.ID[C], err error) {
	ai, bi, err = ToID2[A, B](a, b)
	if err != nil {
		return
	}
	ci, err = ToID[C](c)
	return
}

func ToID4[A, B, C, D idx.Type](a, b, c, d ID) (ai idx.ID[A], bi idx.ID[B], ci idx.ID[C], di idx.ID[D], err error) {
	ai, bi, err = ToID2[A, B](a, b)
	if err != nil {
		return
	}
	ci, di, err = ToID2[C, D](c, d)
	return
}

func ToIDRef[A idx.Type](a *ID) *idx.ID[A] {
	return idx.FromRef[A]((*string)(a))
}

func ToStringIDRef[T idx.Type](a *ID) *idx.StringID[T] {
	return idx.StringIDFromRef[T]((*string)(a))
}

func ToPropertySchemaID(a ID) (id.PropertySchemaID, error) {
	schemaID, err := id.PropertySchemaIDFrom((string)(a))
	if err != nil {
		log.Errorf("ToPropertySchemaID error: input=%s, error=%s", string(a), err.Error())
	}
	return schemaID, err
}

func ToPluginID(a ID) (id.PluginID, error) {
	pluginID, err := id.PluginIDFrom((string)(a))
	if err != nil {
		log.Errorf("ToPluginID error: input=%s, error=%s", string(a), err.Error())
	}
	return pluginID, err
}

func ToPluginID2(a, b ID) (ai id.PluginID, bi id.PluginID, err error) {
	ai, err = ToPluginID(a)
	if err != nil {
		return
	}
	bi, err = ToPluginID(b)
	return ai, bi, err
}

func ToPropertySchemaIDRef(a *ID) *id.PropertySchemaID {
	return id.PropertySchemaIDFromRef((*string)(a))
}

func ToPluginIDRef(a *ID) *id.PluginID {
	return id.PluginIDFromRef((*string)(a))
}
