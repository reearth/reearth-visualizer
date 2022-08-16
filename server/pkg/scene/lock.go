package scene

// LockMode はシーンのロック状態を表します。
type LockMode string

const (
	// LockModeFree はロックがかかっていない状態です。
	LockModeFree LockMode = ""
	// LockModePending は処理待ち中です。データの変更は無制限に変更はできます。
	LockModePending LockMode = "pending"
	// LockModePluginUpgrading はプラグインをアップグレード中です。シーンへの各種操作ができません。
	LockModePluginUpgrading LockMode = "plugin upgrading"
	// LockModeDatasetSyncing はデータセットを同期中です。シーンへの各種操作ができません。
	LockModeDatasetSyncing LockMode = "dataset syncing"
	// LockModePublishing はシーンを書き出し中です。シーンへの各種操作ができません。
	LockModePublishing LockMode = "publishing"
)

func (l LockMode) IsLocked() bool {
	switch l {
	case LockModeFree:
		return false
	case LockModePending:
		return false
	}
	return true
}

func (l LockMode) Validate() (LockMode, bool) {
	switch l {
	case LockModeFree:
		fallthrough
	case LockModePending:
		fallthrough
	case LockModePluginUpgrading:
		fallthrough
	case LockModeDatasetSyncing:
		fallthrough
	case LockModePublishing:
		return l, true
	}
	return l, false
}
