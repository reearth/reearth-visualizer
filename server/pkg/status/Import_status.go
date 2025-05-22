package status

type ProjectImportStatus string

const (
	ProjectImportStatusNone       ProjectImportStatus = "NONE"
	ProjectImportStatusProcessing ProjectImportStatus = "PROCESSING"
	ProjectImportStatusFaile      ProjectImportStatus = "FAILE"
	ProjectImportStatusSuccess    ProjectImportStatus = "SUCCESS"
)
