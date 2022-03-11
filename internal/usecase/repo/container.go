package repo

type Container struct {
	Asset          Asset
	AuthRequest    AuthRequest
	Config         Config
	DatasetSchema  DatasetSchema
	Dataset        Dataset
	Layer          Layer
	Plugin         Plugin
	Project        Project
	PropertySchema PropertySchema
	Property       Property
	Scene          Scene
	Tag            Tag
	Team           Team
	User           User
	SceneLock      SceneLock
	Transaction    Transaction
	Lock           Lock
}
