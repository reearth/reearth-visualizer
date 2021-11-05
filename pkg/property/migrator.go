package property

type Migrator struct {
	NewSchema *Schema
	Plans     []MigrationPlan
}

type MigrationPlan struct {
	From *Pointer
	To   *Pointer
}

// func (m Migrator) Migrate(from *Property) *Property {

// }
