package project

type ProjectImportStatus string

const (
	ProjectImportStatusNone       ProjectImportStatus = "NONE"
	ProjectImportStatusUploading  ProjectImportStatus = "UPLOADING"
	ProjectImportStatusProcessing ProjectImportStatus = "PROCESSING"
	ProjectImportStatusFailed     ProjectImportStatus = "FAILED"
	ProjectImportStatusSuccess    ProjectImportStatus = "SUCCESS"
)

// ImportClaim is the outcome of Project.ClaimImport. A caller on a retryable
// transport (Pub/Sub) must not permanently ack an InProgress result: the
// PROCESSING claim behind it may be a crashed worker's leftover, so the import
// must be redelivered rather than dropped (REL-08). The zero value is the safe,
// retryable one.
type ImportClaim int

const (
	ImportClaimInProgress ImportClaim = iota
	ImportClaimGranted
	ImportClaimAlreadySucceeded
)
