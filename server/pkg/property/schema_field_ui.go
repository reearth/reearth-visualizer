package property

type SchemaFieldUI string

const (
	SchemaFieldUIMultiline  SchemaFieldUI = "multiline"
	SchemaFieldUISelection  SchemaFieldUI = "selection"
	SchemaFieldUIColor      SchemaFieldUI = "color"
	SchemaFieldUIRange      SchemaFieldUI = "range"
	SchemaFieldUISlider     SchemaFieldUI = "slider"
	SchemaFieldUIImage      SchemaFieldUI = "image"
	SchemaFieldUIVideo      SchemaFieldUI = "video"
	SchemaFieldUIFile       SchemaFieldUI = "file"
	SchemaFieldUILayer      SchemaFieldUI = "layer"
	SchemaFieldUICameraPose SchemaFieldUI = "camera_pose"
	SchemaFieldUIDateTime   SchemaFieldUI = "datetime"
	SchemaFieldUIMargin     SchemaFieldUI = "margin"
	SchemaFieldUIPadding    SchemaFieldUI = "padding"
	// DON'T FORGET ADDING A NEW UI TO schemaFieldUIs ALSO!
)

var (
	schemaFieldUIs = []SchemaFieldUI{
		SchemaFieldUIMultiline,
		SchemaFieldUISelection,
		SchemaFieldUIColor,
		SchemaFieldUIRange,
		SchemaFieldUISlider,
		SchemaFieldUIImage,
		SchemaFieldUIVideo,
		SchemaFieldUIFile,
		SchemaFieldUILayer,
		SchemaFieldUICameraPose,
		SchemaFieldUIDateTime,
		SchemaFieldUIMargin,
		SchemaFieldUIPadding,
		// DON'T FORGET ADDING A NEW UI HERE ALSO!
	}
)

func SchemaFieldUIFrom(ui string) SchemaFieldUI {
	psfui := SchemaFieldUI(ui)
	for _, u := range schemaFieldUIs {
		if u == psfui {
			return u
		}
	}
	return ""
}

func SchemaFieldUIFromRef(ui *string) *SchemaFieldUI {
	if ui == nil {
		return nil
	}
	ui2 := SchemaFieldUIFrom(*ui)
	return &ui2
}

func (p SchemaFieldUI) String() string {
	return string(p)
}

func (p *SchemaFieldUI) StringRef() *string {
	if p == nil {
		return nil
	}
	p2 := string(*p)
	return &p2
}
