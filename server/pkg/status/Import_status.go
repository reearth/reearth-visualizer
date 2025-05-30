package status

type ProjectImportStatus string

const (
	ProjectImportStatusNone       ProjectImportStatus = "NONE"
	ProjectImportStatusProcessing ProjectImportStatus = "PROCESSING"
	ProjectImportStatusFailed     ProjectImportStatus = "FAILED"
	ProjectImportStatusSuccess    ProjectImportStatus = "SUCCESS"
)
