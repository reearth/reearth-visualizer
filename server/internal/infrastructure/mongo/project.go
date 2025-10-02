package mongo

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/adapter/internalapi/internalapimodel"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
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
		// Default suffix for unknown sort keys
		suffix = ":" + p.UpdatedAt().Format(time.RFC3339Nano)
		
		// Convert sort key to lowercase for case-insensitive comparison
		sortKey := strings.ToLower(sort.Key)
		
		if sortKey == "id" {
			suffix = ""
		} else if sortKey == "name" {
			suffix = ":" + p.Name()
		} else if sortKey == "updatedat" {
			suffix = ":" + p.UpdatedAt().Format(time.RFC3339Nano)
		} else if sortKey == "starcount" {
			suffix = fmt.Sprintf(":%d", p.StarCount())
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
			// "deleted":    false,
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
		})
	}

	// MemberWorkspaces
	if len(matchMemberWorkspaces) > 0 {
		conditions = append(conditions, bson.M{
			"workspace": bson.M{
				"$in": matchMemberWorkspaces,
			},
			// "deleted":    false,
			// "visibility": "public",
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
		}
		*limit = 10
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

func (r *Project) FindByWorkspace(ctx context.Context, id accountdomain.WorkspaceID, uFilter repo.ProjectFilter) ([]*project.Project, *usecasex.PageInfo, error) {
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

func (r *Project) FindStarredByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
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

func (r *Project) FindDeletedByWorkspace(ctx context.Context, id accountdomain.WorkspaceID) ([]*project.Project, error) {
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

func (r *Project) FindByProjectAlias(ctx context.Context, alias string) (*project.Project, error) {

	prj, err := r.findOne(ctx, bson.M{
		"projectalias": alias,
	}, false)

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
		// Check if we should search in topics
		if pFilter.SearchField != nil && *pFilter.SearchField == "topics" {
			keyword := strings.ToLower(*pFilter.Keyword)
			
			// Split by comma to support multiple topics
			topicKeywords := strings.Split(keyword, ",")
			
			// Trim whitespace from each topic
			for i := range topicKeywords {
				topicKeywords[i] = strings.TrimSpace(topicKeywords[i])
			}
			
			// If multiple topics, use $in operator to match any of them
			if len(topicKeywords) > 1 {
				log.Infof("FindAll: Using multiple topics search: %v", topicKeywords)
				// Add the topics condition to the existing filter
				filter["topics"] = bson.M{"$in": topicKeywords}
			} else {
				log.Infof("FindAll: Using single topic search: %s", keyword)
				// Add the single topic condition to the existing filter
				filter["topics"] = keyword
			}
			
			filterJSON, _ := json.Marshal(filter)
			log.Infof("FindAll: Final filter: %s", string(filterJSON))
		} else {
			// Add name regex search directly to the filter
			filter["name"] = bson.M{
				"$regex": primitive.Regex{
					Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(*pFilter.Keyword)),
					Options: "i",
				},
			}
		}
	}

	
	count, err := r.client.Count(ctx, filter)
	if err != nil {
		log.Errorf("FindAll: Error counting public projects: %v", err)
	} else {	
		// If count is 0, do a broader search just to verify projects exist
		if count == 0 {
			// Check if there are any projects at all
			totalCount, err := r.client.Count(ctx, bson.M{})
			if err != nil {
				log.Errorf("FindAll: Error counting all projects: %v", err)
			} else {
				log.Infof("FindAll: Total projects in MongoDB: %d", totalCount)
			}
			
			// If no public projects found, return empty list rather than potentially causing errors
			if count == 0 {
				log.Warnf("FindAll: No public projects found, returning empty list")
				return []*project.Project{}, usecasex.EmptyPageInfo(), nil
			}
		}
	}

	// Set a reasonable default limit for offset pagination
	if pFilter.Pagination == nil {
		log.Warnf("FindAll: Pagination is nil, not using pagination")
	}
	
	projects, pageInfo, err := r.paginateWithoutWorkspaceFilter(ctx, filter, pFilter.Sort, pFilter.Pagination)
	if err == nil {
		log.Infof("FindAll: Filter succeeded, found %d projects", len(projects))
		return projects, pageInfo, nil
	} else {
		log.Warnf("FindAll: Error in pagination: %v, trying simplified query", err)
		return []*project.Project{}, usecasex.EmptyPageInfo(), nil
	}
}

func (r *Project) CheckProjectAliasUnique(ctx context.Context, ws accountdomain.WorkspaceID, newAlias string, excludeSelfProjectID *id.ProjectID) error {
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

func (r *Project) CountByWorkspace(ctx context.Context, ws accountdomain.WorkspaceID) (int, error) {
	if !r.f.CanRead(ws) {
		return 0, repo.ErrOperationDenied
	}

	count, err := r.client.Count(ctx, bson.M{
		"workspace": ws.String(),
	})
	return int(count), err
}

func (r *Project) CountPublicByWorkspace(ctx context.Context, ws accountdomain.WorkspaceID) (int, error) {
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
	var f []accountdomain.WorkspaceID
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

func (r *Project) paginateWithoutWorkspaceFilter(ctx context.Context, filter any, sort *project.SortType, _ *usecasex.Pagination) ([]*project.Project, *usecasex.PageInfo, error) {
	log.Infof("paginateWithoutWorkspaceFilter: Using simplified approach with filter: %v", filter)
	
	findOptions := options.Find()
	
	limit := int64(100) // Default to 100
	findOptions.SetLimit(limit)
	log.Infof("paginateWithoutWorkspaceFilter: Setting limit to %d", limit)
	
	if sort != nil {
		sortKey := sort.Key
		if sortKey == "" {
			sortKey = "updatedat"
		}
		
		mongoSortKey := sortKey
		if sortKey == "starcount" {
			mongoSortKey = "star_count"
		}
		
		sortDirection := 1
		if sort.Desc {
			sortDirection = -1
		}
		findOptions.SetSort(bson.D{{Key: mongoSortKey, Value: sortDirection}})
		log.Infof("paginateWithoutWorkspaceFilter: Setting sort to %s:%d (mapped from %s)", mongoSortKey, sortDirection, sortKey)
	}
	
	cursor, err := r.client.Client().Find(ctx, filter, findOptions)
	if err != nil {
		log.Errorf("paginateWithoutWorkspaceFilter: Find error: %v", err)
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	defer cursor.Close(ctx)
	
	var results []*project.Project
	
	for cursor.Next(ctx) {
		var projectDoc mongodoc.ProjectDocument
		if err := cursor.Decode(&projectDoc); err != nil {
			log.Errorf("paginateWithoutWorkspaceFilter: Decode error: %v", err)
			continue 
		}
		
		p, err := projectDoc.Model()
		if err != nil {
			log.Errorf("paginateWithoutWorkspaceFilter: Error converting document to project: %v", err)
			continue
		}
		
		results = append(results, p)
	}
	
	if err := cursor.Err(); err != nil {
		log.Errorf("paginateWithoutWorkspaceFilter: Cursor error: %v", err)
	}
	
	log.Infof("paginateWithoutWorkspaceFilter: Successfully processed %d projects", len(results))
	
	return results, usecasex.EmptyPageInfo(), nil
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
