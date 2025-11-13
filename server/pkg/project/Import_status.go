package project

type ProjectImportStatus string

const (
	ProjectImportStatusNone       ProjectImportStatus = "NONE"
	ProjectImportStatusUploading  ProjectImportStatus = "UPLOADING"
	ProjectImportStatusProcessing ProjectImportStatus = "PROCESSING"
	ProjectImportStatusFailed     ProjectImportStatus = "FAILED"
	ProjectImportStatusSuccess    ProjectImportStatus = "SUCCESS"
)
