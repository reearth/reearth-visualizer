package graphql

import (
	"context"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/99designs/gqlgen/graphql"
)

type tracerKeyStruct struct{}

var tracerKey = tracerKeyStruct{}

type Tracer struct {
	Spans sync.Map
}

type span struct {
	Name      string
	StartedAt int64
	EndedAt   int64
}

func (t *Tracer) AddSpan(s *span) {
	if t == nil {
		return
	}

	var spans []*span
	if ss, ok := t.Spans.Load(s.Name); ok {
		if ss, ok := ss.([]*span); ok {
			spans = append(ss, s)
		} else {
			spans = []*span{s}
		}
	} else {
		spans = []*span{s}
	}

	t.Spans.Store(s.Name, spans)
}

func (t *Tracer) Print() {
	if t == nil {
		return
	}

	type result struct {
		Name  string
		Max   int64
		Min   int64
		Avr   float64
		Count int
	}
	var results []result

	t.Spans.Range(func(key, value interface{}) bool {
		name := key.(string)
		ss := value.([]*span)

		var max, min, sum int64
		for i, s := range ss {
			d := s.Duration()
			sum += d
			if i == 0 {
				max = d
				min = d
			} else {
				if max < d {
					max = d
				}
				if min > d {
					min = d
				}
			}
		}

		results = append(results, result{
			Name:  name,
			Max:   max,
			Min:   min,
			Avr:   float64(sum) / float64(len(ss)),
			Count: len(ss),
		})
		return true
	})

	sort.Slice(results, func(i, j int) bool {
		return results[i].Avr > results[j].Avr
	})

	println("\nGraphQL tracing --------------------------------")
	for _, r := range results {
		if r.Count == 1 {
			fmt.Printf("%s: %.2fms\n", r.Name, float64(r.Min)/1000000.0)
		} else {
			fmt.Printf("%s: %.2f~%.2fms (avr:%.2fms) (%d)\n", r.Name, float64(r.Min)/1000000.0, float64(r.Max)/1000000.0, r.Avr/1000000.0, r.Count)
		}
	}
	println("------------------------------------------------\n")
}

func (s *span) Start() {
	s.StartedAt = time.Now().UnixNano()
}

func (s *span) End() {
	s.EndedAt = time.Now().UnixNano()
}

func (s *span) Duration() int64 {
	return s.EndedAt - s.StartedAt
}

func AttachTracer(ctx context.Context, t *Tracer) context.Context {
	return context.WithValue(ctx, tracerKey, t)
}

func ExitTracer(ctx context.Context) {
	getTracer(ctx).Print()
}

func getTracer(ctx context.Context) *Tracer {
	if t, ok := ctx.Value(tracerKey).(*Tracer); ok {
		return t
	}
	return nil
}

func trace(ctx context.Context) func() {
	t := getTracer(ctx)
	fc := graphql.GetFieldContext(ctx)

	name := fc.Field.Name
	if object := fc.Field.ObjectDefinition; object != nil {
		name = object.Name + "." + name
	}

	s := &span{
		Name: name,
	}
	s.Start()
	t.AddSpan(s)

	return func() {
		s.End()
	}
}
