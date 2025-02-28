package property

type PhotoOverlay struct {
	Enabled        *bool `json:"enabled"        mapstructure:"enabled"`
	CameraDuration *int  `json:"cameraDuration" mapstructure:"cameraDuration"`
}
