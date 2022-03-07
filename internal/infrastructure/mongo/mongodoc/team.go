package mongodoc

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
	"go.mongodb.org/mongo-driver/bson"
)

type TeamMemberDocument struct {
	Role string
}

type TeamDocument struct {
	ID       string
	Name     string
	Members  map[string]TeamMemberDocument
	Personal bool
}

type TeamConsumer struct {
	Rows user.TeamList
}

func (c *TeamConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc TeamDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	project, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, project)
	return nil
}

func NewTeam(team *user.Team) (*TeamDocument, string) {
	membersDoc := map[string]TeamMemberDocument{}
	for user, r := range team.Members().Members() {
		membersDoc[user.String()] = TeamMemberDocument{
			Role: string(r),
		}
	}
	id := team.ID().String()
	return &TeamDocument{
		ID:       id,
		Name:     team.Name(),
		Members:  membersDoc,
		Personal: team.IsPersonal(),
	}, id
}

func (d *TeamDocument) Model() (*user.Team, error) {
	tid, err := id.TeamIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	members := map[id.UserID]user.Role{}
	if d.Members != nil {
		for uid, member := range d.Members {
			uid, err := id.UserIDFrom(uid)
			if err != nil {
				return nil, err
			}
			members[uid] = user.Role(member.Role)
		}
	}
	return user.NewTeam().
		ID(tid).
		Name(d.Name).
		Members(members).
		Personal(d.Personal).
		Build()
}

func NewTeams(teams []*user.Team) ([]*TeamDocument, []string) {
	res := make([]*TeamDocument, 0, len(teams))
	ids := make([]string, 0, len(teams))
	for _, d := range teams {
		if d == nil {
			continue
		}
		r, id := NewTeam(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}
