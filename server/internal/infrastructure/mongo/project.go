package mongo

import (
	"context"
	"fmt"
	"regexp"
	"slices"
	"strings"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter/internalapi/internalapimodel"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	projectIndexes       = []string{"alias", "alias,publishmentstatus", "workspace"}
	projectUniqueIndexes = []string{"id"}
)

type Project struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
	s      repo.SceneFilter
}

func NewProject(client *mongox.Client) *Project {
	return &Project{
		client: client.WithCollection("project"),
	}
}

func (r *Project) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, projectIndexes, projectUniqueIndexes)
}

func (r *Project) Filtered(f repo.WorkspaceFilter) repo.Project {
	return &Project{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Project) FindByID(ctx context.Context, pid id.ProjectID) (*project.Project, error) {
	prj, err := r.findOne(ctx, bson.M{
		"id": pid.String(),
	}, false)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindByScene(ctx context.Context, id id.SceneID) (*project.Project, error) {
	if !r.s.CanRead(id) {
		return nil, nil
	}

	prj, err := r.findOne(ctx, bson.M{
		"scene": id.String(),
	}, false)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindByIDs(ctx context.Context, ids id.ProjectIDList) ([]*project.Project, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterProjects(ids, res), nil
}

func decodeProjectCursor(cursor usecasex.Cursor) (id string, key string) {

	parts := strings.SplitN(string(cursor), ":", 2)
	id = parts[0]
	if len(parts) > 1 {
		key = parts[1]
	}
	return
}

func encodeProjectCursor(p *project.Project, sort *project.SortType) (cursor usecasex.Cursor) {

	var suffix string

	if sort == nil {
		suffix = ":" + p.UpdatedAt().Format(time.RFC3339Nano)
	} else {
		// Convert sort key to lowercase for case-insensitive comparison
		sortKey := strings.ToLower(sort.Key)

		switch sortKey {
		case "id":
			suffix = ""
		case "name":
			suffix = ":" + p.Name()
		case "updatedat":
			suffix = ":" + p.UpdatedAt().Format(time.RFC3339Nano)
		case "starcount":
			starCount := int64(0)
			if p.Metadata() != nil && p.Metadata().StarCount() != nil {
				starCount = *p.Metadata().StarCount()
			}
			suffix = fmt.Sprintf(":%d", starCount)
		default:
			suffix = ":" + p.UpdatedAt().Format(time.RFC3339Nano)
		}
	}

	cursor = usecasex.Cursor(p.ID().String() + suffix)
	return
}

func (r *Project) ProjectAbsoluteFilter(authenticated bool, keyword *string, ownedWorkspaces []string, memberWorkspaces []string, targetWsList []string) bson.M {

	matchOwnedWorkspaces := []string{}
	matchMemberWorkspaces := []string{}
	for _, wsID := range targetWsList {
		if slices.Contains(ownedWorkspaces, wsID) {
			matchOwnedWorkspaces = append(matchOwnedWorkspaces, wsID)
		} else if slices.Contains(memberWorkspaces, wsID) {
			matchMemberWorkspaces = append(matchMemberWorkspaces, wsID)
		}
	}

	var filter bson.M

	// Not authenticated, or neither an owner nor a member
	if !authenticated || (len(matchOwnedWorkspaces) == 0 && len(matchMemberWorkspaces) == 0) {
		filter = bson.M{
			"workspace": bson.M{
				"$in": targetWsList,
			},
			"deleted":    false,
			"visibility": "public", // public only
		}
		if keyword != nil {
			keywordRegex := primitive.Regex{
				Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*keyword)),
				Options: "i",
			}
			filter["name"] = bson.M{"$regex": keywordRegex}
		}
		return filter
	}

	var conditions []bson.M

	// OwnedWorkspaces
	if len(matchOwnedWorkspaces) > 0 {
		conditions = append(conditions, bson.M{
			"workspace": bson.M{
				"$in": matchOwnedWorkspaces,
			},
			"deleted": false,
		})
	}

	// MemberWorkspaces
	if len(matchMemberWorkspaces) > 0 {
		conditions = append(conditions, bson.M{
			"workspace": bson.M{
				"$in": matchMemberWorkspaces,
			},
			"deleted": false,
		})
	}

	if len(conditions) > 0 {
		if len(conditions) == 1 {
			filter = conditions[0]
		} else {
			filter = bson.M{
				"$or": conditions,
			}
		}
	} else {
		filter = bson.M{
			"_id": bson.M{
				"$exists": false,
			},
		}
	}

	if keyword != nil {
		keywordRegex := primitive.Regex{
			Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*keyword)),
			Options: "i",
		}
		filter["name"] = bson.M{"$regex": keywordRegex}
	}

	return filter
}

func (r *Project) ProjectPaginationFilter(absoluteFilter bson.M, sort *project.SortType, cursor *usecasex.CursorPagination, offset *int64, limit *int64) (bson.M, *options.FindOptions, int64, int) {
	sortOrder := -1 // DESC
	sortKey := internalapimodel.ProjectSortField_UPDATEDAT

	if sort != nil {
		if !sort.Desc {
			sortOrder = 1
		}
		sortKey = sort.Key
	}

	// Prioritize offset-based pagination when offset is provided
	if offset != nil && limit != nil && *limit > 0 {
		// Use provided limit for offset pagination
	} else if cursor != nil && cursor.First != nil {
		if limit == nil {
			limit = new(int64)
		}
		*limit = *cursor.First
	} else if cursor != nil && cursor.Last != nil {
		if limit == nil {
			limit = new(int64)
		}
		*limit = *cursor.Last
	} else {
		// default
		if limit == nil {
			limit = new(int64)
			*limit = 10
		}
	}

	*limit = *limit + 1

	sortConfig := bson.D{
		{Key: sortKey, Value: sortOrder},
		{Key: "id", Value: sortOrder},
	}

	findOptions := options.Find().
		SetSort(sortConfig).
		SetLimit(*limit)

	if offset != nil {
		findOptions = findOptions.SetSkip(*offset)
	} else {
		if cursor != nil && cursor.After != nil {
			cursor := *cursor.After
			afterID, afterKey := decodeProjectCursor(cursor)

			var keyValue any = afterKey
			if t, err := time.Parse(time.RFC3339Nano, afterKey); err == nil {
				keyValue = t
			}

			if sortKey == internalapimodel.ProjectSortField_UPDATEDAT {
				if t, err := time.Parse(time.RFC3339Nano, afterKey); err == nil {
					keyValue = t
				}
			}

			absoluteFilter["$or"] = bson.A{
				bson.M{sortKey: bson.M{"$gt": keyValue}},
				bson.M{
					sortKey: keyValue,
					"id":    bson.M{"$gt": afterID},
				},
			}

		} else if cursor != nil && cursor.Before != nil {

			cursor := *cursor.Before
			beforeID, beforeKey := decodeProjectCursor(cursor)

			var keyValue any = beforeKey
			if t, err := time.Parse(time.RFC3339Nano, beforeKey); err == nil {
				keyValue = t
			}

			if sortKey == internalapimodel.ProjectSortField_UPDATEDAT {
				if t, err := time.Parse(time.RFC3339Nano, beforeKey); err == nil {
					keyValue = t
				}
			}

			absoluteFilter["$or"] = bson.A{
				bson.M{sortKey: bson.M{"$lt": keyValue}},
				bson.M{
					sortKey: keyValue,
					"id":    bson.M{"$lt": beforeID},
				},
			}
		}
	}

	return absoluteFilter, findOptions, *limit, sortOrder
}

func (r *Project) FindByWorkspaces(ctx context.Context, authenticated bool, pFilter repo.ProjectFilter, ownedWorkspaces []string, memberWorkspaces []string, targetWsList []string) ([]*project.Project, *usecasex.PageInfo, error) {

	absoluteFilter := r.ProjectAbsoluteFilter(authenticated, pFilter.Keyword, ownedWorkspaces, memberWorkspaces, targetWsList)

	// --- Find Query (absoluteFilter for totalCount)
	totalCount, err := r.client.Client().CountDocuments(ctx, absoluteFilter)
	if err != nil {
		return nil, nil, err
	}

	var paginationSortilter bson.M
	var findOptions *options.FindOptions
	var limit int64
	var sortOrder int

	if pFilter.Pagination != nil && pFilter.Pagination.Cursor != nil {
		paginationSortilter, findOptions, limit, sortOrder = r.ProjectPaginationFilter(absoluteFilter, pFilter.Sort, pFilter.Pagination.Cursor, pFilter.Offset, pFilter.Limit)
	} else {
		paginationSortilter, findOptions, limit, sortOrder = r.ProjectPaginationFilter(absoluteFilter, pFilter.Sort, nil, pFilter.Offset, pFilter.Limit)
	}

	// if text, err := json.MarshalIndent(paginationSortilter, "", "  "); err == nil {
	// 	fmt.Println(string(text))
	// }

	// --- Find Query (paginationSortilter)
	cursor, err := r.client.Client().Find(ctx, paginationSortilter, findOptions)
	if err != nil {
		return nil, nil, err
	}

	defer func() {
		if cerr := cursor.Close(ctx); cerr != nil {
			log.Printf("failed to close cursor: %v", cerr)
		}
	}()

	consumer := mongodoc.NewProjectConsumer(nil)
	for cursor.Next(ctx) {
		raw := cursor.Current
		if err := consumer.Consume(raw); err != nil {
			return nil, nil, err
		}
	}
	if err := cursor.Err(); err != nil {
		return nil, nil, err
	}

	items := consumer.Result
	resultCount := int64(len(items))

	hasNextPage := false
	hasPreviousPage := false

	// Handle offset-based pagination differently
	if pFilter.Offset != nil {
		// For offset pagination, calculate based on totalCount and offset
		currentOffset := *pFilter.Offset
		currentLimit := int64(10) // default limit
		if pFilter.Limit != nil {
			currentLimit = *pFilter.Limit
		}

		hasNextPage = totalCount > currentOffset+currentLimit
		hasPreviousPage = currentOffset > 0

		if resultCount == limit && len(items) > 0 {
			items = items[:len(items)-1]
		}
	} else {
		if resultCount == limit {
			switch sortOrder {
			case 1:
				hasNextPage = true
			case -1:
				hasPreviousPage = true
			}
			if len(items) > 0 {
				items = items[:len(items)-1]
			}
		}
	}

	var startCursor, endCursor *usecasex.Cursor
	if len(items) > 0 {
		start := encodeProjectCursor(items[0], pFilter.Sort)
		end := encodeProjectCursor(items[len(items)-1], pFilter.Sort)
		startCursor = &start
		endCursor = &end
	}

	pageInfo := usecasex.NewPageInfo(totalCount, startCursor, endCursor, hasNextPage, hasPreviousPage)

	return items, pageInfo, nil

}

func (r *Project) FindByWorkspace(ctx context.Context, id accountsID.WorkspaceID, uFilter repo.ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	filter := bson.M{
		"workspace": id.String(),
		"$or": []bson.M{
			{"deleted": false},
			{"deleted": bson.M{"$exists": false}},
		},
		"coresupport": true,
	}

	if uFilter.Keyword != nil {
		keywordFilter := bson.M{
			"name": bson.M{
				"$regex": primitive.Regex{
					Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*uFilter.Keyword)),
					Options: "i",
				},
			},
		}
		filter = bson.M{"$and": []bson.M{filter, keywordFilter}}
	}

	return r.paginate(ctx, filter, uFilter.Sort, uFilter.Pagination)
}

func (r *Project) FindStarredByWorkspace(ctx context.Context, id accountsID.WorkspaceID) ([]*project.Project, error) {
	if !r.f.CanRead(id) {
		return nil, repo.ErrOperationDenied
	}

	filter := bson.M{
		"workspace": id.String(),
		"starred":   true,
		"$or": []bson.M{
			{"deleted": false},
			{"deleted": bson.M{"$exists": false}},
		},
		"coresupport": true,
	}

	return r.find(ctx, filter)
}

func (r *Project) FindDeletedByWorkspace(ctx context.Context, id accountsID.WorkspaceID) ([]*project.Project, error) {
	if !r.f.CanRead(id) {
		return nil, repo.ErrOperationDenied
	}

	filter := bson.M{
		"workspace":   id.String(),
		"deleted":     true,
		"coresupport": true,
	}

	return r.find(ctx, filter)
}

func (r *Project) FindActiveById(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	prj, err := r.findOne(ctx, bson.M{
		"id":      id.String(),
		"deleted": false,
	}, false)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindActiveByAlias(ctx context.Context, alias string) (*project.Project, error) {
	prj, err := r.findOne(ctx, bson.M{
		"alias":   alias,
		"deleted": false,
	}, false)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindByWorkspaceIDAndProjectAlias(ctx context.Context, workspaceID accountsID.WorkspaceID, projectAlias string, excludeDeleted bool) (*project.Project, error) {
	filter := bson.M{
		"projectalias": projectAlias,
		"workspace":    workspaceID.String(),
	}
	if excludeDeleted {
		filter["deleted"] = false
	}

	prj, err := r.findOne(ctx, filter, false)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, repo.ErrResourceNotFound
		}
		return nil, err
	}

	return prj, nil
}

func (r *Project) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}

	f := bson.D{
		{
			Key: "$or",
			Value: []bson.D{
				{{Key: "alias", Value: name}, {Key: "publishmentstatus", Value: bson.D{{Key: "$in", Value: []string{"public", "limited"}}}}},
				{{Key: "domains.domain", Value: name}, {Key: "publishmentstatus", Value: "public"}},
			},
		},
	}

	return r.findOne(ctx, f, false)
}

func (r *Project) FindAll(ctx context.Context, pFilter repo.ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error) {
	// Default visibility is public
	visibility := "public"
	if pFilter.Visibility != nil {
		visibility = *pFilter.Visibility
	}

	filter := bson.M{
		"visibility": visibility,
		"deleted":    false,
	}

	if pFilter.Keyword != nil {
		filter["name"] = bson.M{
			"$regex": primitive.Regex{
				Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*pFilter.Keyword)),
				Options: "i",
			},
		}
	}

	// Topics filter or starcount sort needs to join projectmetadata. The
	// topics path keeps the join entirely server-side via a pipeline-form
	// $lookup that filters on the projectmetadata.topics index, which avoids
	// transferring potentially large ID sets through the client.
	if len(pFilter.Topics) > 0 {
		return r.findAllWithTopicsFilter(ctx, pFilter, filter)
	}
	if pFilter.Sort != nil && pFilter.Sort.Key == "starcount" {
		return r.findAllWithStarcountSort(ctx, pFilter, filter)
	}

	return r.findAllWithFilter(ctx, pFilter, filter)
}

func (r *Project) findAllWithFilter(ctx context.Context, pFilter repo.ProjectFilter, filter bson.M) ([]*project.Project, *usecasex.PageInfo, error) {
	if pFilter.Limit != nil && pFilter.Offset != nil {
		totalCount, err := r.client.Count(ctx, filter)
		if err != nil {
			return nil, nil, visualizer.ErrorWithCallerLogging(ctx, "FindAll: Count error:", err)
		}
		if totalCount == 0 {
			return []*project.Project{}, usecasex.EmptyPageInfo(), nil
		}

		var sortDoc bson.D
		if pFilter.Sort != nil {
			sortKey := pFilter.Sort.Key
			sortOrder := 1
			if pFilter.Sort.Desc {
				sortOrder = -1
			}
			sortDoc = bson.D{{Key: sortKey, Value: sortOrder}, {Key: "_id", Value: sortOrder}}
		} else {
			sortDoc = bson.D{{Key: "starcount", Value: -1}, {Key: "_id", Value: -1}}
		}

		collation := options.Collation{
			Locale:    "en",
			Strength:  3,
			CaseLevel: true,
			Alternate: "shifted",
		}

		findOptions := options.Find().
			SetCollation(&collation).
			SetSkip(*pFilter.Offset).
			SetLimit(*pFilter.Limit)

		if len(sortDoc) > 0 {
			findOptions.SetSort(sortDoc)
		}

		c := mongodoc.NewProjectConsumer(nil)
		if err := r.client.Find(ctx, filter, c, findOptions); err != nil {
			return nil, nil, visualizer.ErrorWithCallerLogging(ctx, "FindAll: Find error:", err)
		}

		pageInfo := &usecasex.PageInfo{
			TotalCount:      totalCount,
			HasNextPage:     *pFilter.Offset+*pFilter.Limit < totalCount,
			HasPreviousPage: *pFilter.Offset > 0,
		}

		return c.Result, pageInfo, nil
	}

	if pFilter.Pagination == nil {
		visualizer.WarnWithCallerLogging(ctx, "FindAll: No pagination provided, returning all results")
	}

	projects, pageInfo, err := r.paginateWithoutWorkspaceFilter(ctx, filter, pFilter.Sort, pFilter.Pagination)
	if err != nil {
		return nil, nil, visualizer.ErrorWithCallerLogging(ctx, "FindAll: pagination error", err)
	}
	return projects, pageInfo, nil
}

// aggregationFacetCap is the hard upper bound on documents materialized into
// the $facet "data" sub-pipeline. The cap prevents a single facet result from
// approaching MongoDB's 16MB document limit when callers provide no
// pagination (or request more than the cap). When the cap actually
// truncates results, warnFacetTruncation surfaces the event in logs so
// operators can spot the case and ask the caller to paginate explicitly.
const aggregationFacetCap int64 = 1000

// warnFacetTruncation emits a warning when the aggregation $facet path
// returned fewer documents than the total match count strictly because the
// hard cap kicked in. The caller-provided skip/lim are reported so it is
// clear whether the truncation came from an explicit large limit or from
// the fallback default.
func warnFacetTruncation(ctx context.Context, path string, skip, lim, totalCount int64) {
	if lim != aggregationFacetCap {
		return
	}
	if skip+lim >= totalCount {
		return
	}
	log.Warnfc(ctx, "FindAll: %s truncated to aggregationFacetCap=%d (skip=%d, totalCount=%d); caller should paginate", path, aggregationFacetCap, skip, totalCount)
}

// effectiveSkipLimit derives an effective ($skip, $limit) pair for the
// aggregation paths. Precedence: explicit pFilter.Limit/Offset → Pagination
// Offset → Pagination Cursor First/Last → the hard cap. The returned limit
// is always clamped to (0, aggregationFacetCap] regardless of caller input,
// since unauthenticated GetAllProjects reaches these paths and the $facet
// "data" array must stay well below MongoDB's 16MB document limit.
func effectiveSkipLimit(pFilter repo.ProjectFilter) (skip, lim int64) {
	switch {
	case pFilter.Limit != nil && pFilter.Offset != nil:
		skip, lim = *pFilter.Offset, *pFilter.Limit
	case pFilter.Pagination != nil && pFilter.Pagination.Offset != nil:
		skip, lim = pFilter.Pagination.Offset.Offset, pFilter.Pagination.Offset.Limit
	case pFilter.Pagination != nil && pFilter.Pagination.Cursor != nil && pFilter.Pagination.Cursor.First != nil:
		lim = *pFilter.Pagination.Cursor.First
	case pFilter.Pagination != nil && pFilter.Pagination.Cursor != nil && pFilter.Pagination.Cursor.Last != nil:
		lim = *pFilter.Pagination.Cursor.Last
	default:
		lim = aggregationFacetCap
	}
	if skip < 0 {
		skip = 0
	}
	if lim <= 0 || lim > aggregationFacetCap {
		lim = aggregationFacetCap
	}
	return skip, lim
}

// findAllWithTopicsFilter runs the FindAll aggregation when a topics filter is
// active. The topics match is pushed into the $lookup sub-pipeline so only
// metadata matching the requested topics is joined (predicate pushdown,
// exercising both the projectmetadata.project and projectmetadata.topics
// indexes). The lookup itself still runs per input project document — the
// improvement is reduced joined payload and an early non-empty-array check
// in place of the previous post-lookup `metadata.topics: $all` scan.
//
// When no explicit sort is given, ordering defaults to metadata.starcount
// descending, matching the previous topics path's behavior.
func (r *Project) findAllWithTopicsFilter(ctx context.Context, pFilter repo.ProjectFilter, filter bson.M) ([]*project.Project, *usecasex.PageInfo, error) {
	matchStage := bson.M{"$match": filter}

	lookupStage := bson.M{
		"$lookup": bson.M{
			"from": "projectmetadata",
			"let":  bson.M{"pid": "$id"},
			"pipeline": []bson.M{
				{"$match": bson.M{
					"$expr":  bson.M{"$eq": bson.A{"$project", "$$pid"}},
					"topics": bson.M{"$all": pFilter.Topics},
				}},
			},
			"as": "metadata",
		},
	}

	matchHasMetadata := bson.M{
		"$match": bson.M{"metadata.0": bson.M{"$exists": true}},
	}

	sortKey := "metadata.starcount"
	sortOrder := -1
	if pFilter.Sort != nil {
		if pFilter.Sort.Key == "starcount" {
			sortKey = "metadata.starcount"
		} else {
			sortKey = pFilter.Sort.Key
		}
		if pFilter.Sort.Desc {
			sortOrder = -1
		} else {
			sortOrder = 1
		}
	}
	sortStage := bson.M{
		"$sort": bson.D{
			{Key: sortKey, Value: sortOrder},
			{Key: "_id", Value: sortOrder},
		},
	}

	skip, lim := effectiveSkipLimit(pFilter)
	dataPipeline := []bson.M{sortStage}
	if skip > 0 {
		dataPipeline = append(dataPipeline, bson.M{"$skip": skip})
	}
	// Drop the joined metadata array before materializing into the facet.
	// The project consumer ignores it, and keeping it would bloat the single
	// facet result document toward MongoDB's 16MB limit.
	dataPipeline = append(dataPipeline, bson.M{"$limit": lim}, bson.M{"$unset": "metadata"})

	facetStage := bson.M{
		"$facet": bson.M{
			"data":  dataPipeline,
			"count": []bson.M{{"$count": "total"}},
		},
	}

	pipeline := []bson.M{matchStage, lookupStage, matchHasMetadata, facetStage}

	cursor, err := r.client.Client().Aggregate(ctx, pipeline)
	if err != nil {
		return nil, nil, err
	}
	defer cursor.Close(ctx)

	var totalCount int64 = 0
	consumer := mongodoc.NewProjectConsumer(nil)
	if cursor.Next(ctx) {
		var result struct {
			Data  []bson.Raw `bson:"data"`
			Count []struct {
				Total int64 `bson:"total"`
			} `bson:"count"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, nil, err
		}
		if len(result.Count) > 0 {
			totalCount = result.Count[0].Total
		}
		for _, raw := range result.Data {
			if err := consumer.Consume(raw); err != nil {
				return nil, nil, err
			}
		}
	}
	if err := cursor.Err(); err != nil {
		return nil, nil, err
	}

	if totalCount == 0 {
		return []*project.Project{}, usecasex.EmptyPageInfo(), nil
	}

	warnFacetTruncation(ctx, "topics", skip, lim, totalCount)

	pageInfo := &usecasex.PageInfo{
		TotalCount:      totalCount,
		HasNextPage:     skip+lim < totalCount,
		HasPreviousPage: skip > 0,
	}

	return consumer.Result, pageInfo, nil
}

func (r *Project) CheckProjectAliasUnique(ctx context.Context, ws accountsID.WorkspaceID, newAlias string, excludeSelfProjectID *id.ProjectID) error {
	if !r.f.CanRead(ws) {
		return repo.ErrOperationDenied
	}

	filter := bson.M{
		"workspace":    ws.String(),
		"projectalias": newAlias,
	}

	if excludeSelfProjectID != nil {
		filter["id"] = bson.M{"$ne": excludeSelfProjectID.String()}
	}

	count, err := r.client.Count(ctx, filter)
	if err != nil {
		return err
	}

	if count > 0 {
		return alias.ErrExistsProjectAliasAlreadyExists
	}

	return nil
}

func (r *Project) CheckSceneAliasUnique(ctx context.Context, newAlias string) error {
	sceneId := newAlias
	if strings.HasPrefix(newAlias, alias.ReservedReearthPrefixScene) {
		sceneId = newAlias[2:]
	}

	pipeline := []bson.M{
		{
			"$limit": 1,
		},
		{
			"$facet": bson.M{
				"projectMatch": []bson.M{
					{
						"$lookup": bson.M{
							"from":     "project",
							"pipeline": []bson.M{{"$match": bson.M{"alias": newAlias}}},
							"as":       "projects",
						},
					},
					{
						"$project": bson.M{
							"count": bson.M{"$size": "$projects"},
						},
					},
				},
				"sceneMatch": []bson.M{
					{
						"$lookup": bson.M{
							"from":     "scene",
							"pipeline": []bson.M{{"$match": bson.M{"id": sceneId}}},
							"as":       "scenes",
						},
					},
					{
						"$project": bson.M{
							"count": bson.M{"$size": "$scenes"},
						},
					},
				},
			},
		},
		{
			"$project": bson.M{
				"exists": bson.M{
					"$gt": []any{
						bson.M{
							"$add": []any{
								bson.M{"$arrayElemAt": []any{"$projectMatch.count", 0}},
								bson.M{"$arrayElemAt": []any{"$sceneMatch.count", 0}},
							},
						},
						0,
					},
				},
			},
		},
	}

	cursor, err := r.client.Client().Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	if cursor.Next(ctx) {
		var result struct {
			Exists bool `bson:"exists"`
		}
		if err := cursor.Decode(&result); err != nil {
			return err
		}
		if result.Exists {
			return alias.ErrExistsProjectAlias
		}
	}

	return nil
}

func (r *Project) CountByWorkspace(ctx context.Context, ws accountsID.WorkspaceID) (int, error) {
	if !r.f.CanRead(ws) {
		return 0, repo.ErrOperationDenied
	}

	count, err := r.client.Count(ctx, bson.M{
		"workspace": ws.String(),
	})
	return int(count), err
}

func (r *Project) CountPublicByWorkspace(ctx context.Context, ws accountsID.WorkspaceID) (int, error) {
	if !r.f.CanRead(ws) {
		return 0, repo.ErrOperationDenied
	}

	count, err := r.client.Count(ctx, bson.M{
		"workspace": ws.String(),
		"publishmentstatus": bson.M{
			"$in": []string{"public", "limited"},
		},
	})
	return int(count), err
}

func (r *Project) Save(ctx context.Context, project *project.Project) error {
	if !r.f.CanWrite(project.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProject(project)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Project) Remove(ctx context.Context, id id.ProjectID) error {
	writeFilter := applyWorkspaceFilter(bson.M{
		"id": id.String(),
	}, r.f.Writable)

	return r.client.RemoveOne(ctx, writeFilter)
}

func (r *Project) count(ctx context.Context, filter interface{}) (int64, error) {
	return r.client.Count(ctx, filter)
}

func (r *Project) find(ctx context.Context, filter interface{}) ([]*project.Project, error) {
	c := mongodoc.NewProjectConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Project) findOne(ctx context.Context, filter any, filterByWorkspaces bool) (*project.Project, error) {
	var f []accountsID.WorkspaceID
	if filterByWorkspaces {
		f = r.f.Readable
	}
	c := mongodoc.NewProjectConsumer(f)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *Project) paginate(ctx context.Context, filter any, sort *project.SortType, pagination *usecasex.Pagination) ([]*project.Project, *usecasex.PageInfo, error) {
	var usort *usecasex.Sort
	if sort != nil {
		usort = &usecasex.Sort{
			Key:      sort.Key,
			Reverted: sort.Desc,
		}
	}

	collation := options.Collation{
		Locale:    "en",
		Strength:  3,
		CaseLevel: true,
		Alternate: "shifted",
	}

	findOptions := options.Find().SetCollation(&collation)

	c := mongodoc.NewProjectConsumer(r.f.Readable)
	pageInfo, err := r.client.PaginateProject(ctx, filter, usort, pagination, c, findOptions)
	if err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	return c.Result, pageInfo, nil
}

func (r *Project) paginateWithoutWorkspaceFilter(ctx context.Context, filter any, sort *project.SortType, pagination *usecasex.Pagination) ([]*project.Project, *usecasex.PageInfo, error) {
	log.Infof("paginateWithoutWorkspaceFilter: Using pagination approach with filter: %v", filter)

	// Map sort key from external API format to MongoDB field name
	mappedSort := sort
	if sort != nil && sort.Key == "starcount" {
		mappedSort = &project.SortType{
			Key:  "starcount", // Map to MongoDB field name
			Desc: sort.Desc,
		}
	}

	// Convert sort to usecasex.Sort format
	var usort *usecasex.Sort
	if mappedSort != nil {
		usort = &usecasex.Sort{
			Key:      mappedSort.Key,
			Reverted: mappedSort.Desc,
		}
	}

	collation := options.Collation{
		Locale:    "en",
		Strength:  3,
		CaseLevel: true,
		Alternate: "shifted",
	}

	findOptions := options.Find().SetCollation(&collation)

	// Create a consumer that doesn't filter by readable workspaces (use nil)
	c := mongodoc.NewProjectConsumer(nil)
	pageInfo, err := r.client.Paginate(ctx, filter, usort, pagination, c, findOptions)
	if err != nil {
		log.Errorf("paginateWithoutWorkspaceFilter: Paginate error: %v", err)
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	log.Infof("paginateWithoutWorkspaceFilter: Successfully paginated %d projects, pageInfo: %+v", len(c.Result), pageInfo)
	return c.Result, pageInfo, nil
}

func filterProjects(ids []id.ProjectID, rows []*project.Project) []*project.Project {
	res := make([]*project.Project, 0, len(ids))
	for _, id := range ids {
		var r2 *project.Project
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (r *Project) findAllWithStarcountSort(ctx context.Context, pFilter repo.ProjectFilter, filter bson.M) ([]*project.Project, *usecasex.PageInfo, error) {
	matchStage := bson.M{"$match": filter}

	lookupStage := bson.M{
		"$lookup": bson.M{
			"from":         "projectmetadata",
			"localField":   "id",
			"foreignField": "project",
			"as":           "metadata",
		},
	}

	// Project-side sort key derived from metadata.starcount, defaulting to 0
	// when no metadata exists. Missing-metadata projects therefore sort to
	// the bottom for DESC and to the top for ASC, matching the semantics of
	// treating an absent star count as zero.
	addFieldsStage := bson.M{
		"$addFields": bson.M{
			"sort_star_count": bson.M{
				"$cond": bson.M{
					"if": bson.M{"$gt": bson.A{bson.M{"$size": "$metadata"}, 0}},
					"then": bson.M{
						"$toInt": bson.M{
							"$ifNull": bson.A{
								bson.M{"$arrayElemAt": bson.A{"$metadata.starcount", 0}},
								0,
							},
						},
					},
					"else": 0,
				},
			},
		},
	}

	sortOrder := 1
	if pFilter.Sort.Desc {
		sortOrder = -1
	}
	sortStage := bson.M{
		"$sort": bson.D{
			{Key: "sort_star_count", Value: sortOrder},
			{Key: "_id", Value: sortOrder},
		},
	}

	skip, lim := effectiveSkipLimit(pFilter)
	dataPipeline := []bson.M{lookupStage, addFieldsStage, sortStage}
	if skip > 0 {
		dataPipeline = append(dataPipeline, bson.M{"$skip": skip})
	}
	// Drop the joined metadata array and the temporary sort key before
	// materializing into the facet. Neither field is consumed downstream and
	// keeping them would bloat the single facet result document toward
	// MongoDB's 16MB limit.
	dataPipeline = append(dataPipeline, bson.M{"$limit": lim}, bson.M{"$unset": []string{"metadata", "sort_star_count"}})

	// $facet runs count and paginated data in a single pipeline pass. The
	// total count for this path is determined solely by the project filter,
	// so $lookup/$addFields/$sort/$skip/$limit live only in the `data`
	// sub-pipeline; the `count` sub-pipeline reads the post-$match stream
	// directly to avoid materializing metadata it does not need.
	facetStage := bson.M{
		"$facet": bson.M{
			"data":  dataPipeline,
			"count": []bson.M{{"$count": "total"}},
		},
	}

	pipeline := []bson.M{matchStage, facetStage}

	cursor, err := r.client.Client().Aggregate(ctx, pipeline)
	if err != nil {
		return nil, nil, err
	}
	defer cursor.Close(ctx)

	var totalCount int64 = 0
	consumer := mongodoc.NewProjectConsumer(nil)
	if cursor.Next(ctx) {
		var result struct {
			Data  []bson.Raw `bson:"data"`
			Count []struct {
				Total int64 `bson:"total"`
			} `bson:"count"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, nil, err
		}
		if len(result.Count) > 0 {
			totalCount = result.Count[0].Total
		}
		for _, raw := range result.Data {
			if err := consumer.Consume(raw); err != nil {
				return nil, nil, err
			}
		}
	}
	if err := cursor.Err(); err != nil {
		return nil, nil, err
	}

	if totalCount == 0 {
		return []*project.Project{}, usecasex.EmptyPageInfo(), nil
	}

	warnFacetTruncation(ctx, "starcount", skip, lim, totalCount)

	pageInfo := &usecasex.PageInfo{
		TotalCount:      totalCount,
		HasNextPage:     skip+lim < totalCount,
		HasPreviousPage: skip > 0,
	}

	return consumer.Result, pageInfo, nil
}
