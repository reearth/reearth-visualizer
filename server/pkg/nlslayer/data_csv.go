package nlslayer

type CSV struct {
	IDColumn              *string 
	LatColumn             *string 
	LngColumn             *string 
	HeightColumn          *string 
	NoHeader              *bool   
	DisableTypeConversion *bool  
}

func (c *CSV) SetIDColumn(IdColumn *string) {
	c.IDColumn = IdColumn
}

func (c *CSV) SetLatColumn(LatColumn *string) {
	c.LatColumn = LatColumn
}

func (c *CSV) SetLngColumn(LngColumn *string) {
	c.LngColumn = LngColumn
}

func (c *CSV) SetHeightColumn(HeightColumn *string) {
	c.HeightColumn = HeightColumn
}

func (c *CSV) SetNoHeader(NoHeader *bool) {
	c.NoHeader = NoHeader
}

func (c *CSV) SetDisableTypeConversion(DisableTypeConversion *bool) {
	c.DisableTypeConversion = DisableTypeConversion
}

func (c *CSV) UpdateIDColumn(IdColumn *string) {
	c.IDColumn = IdColumn
}

func (c *CSV) UpdateLatColumn(LatColumn *string) {
	c.LatColumn = LatColumn
}

func (c *CSV) UpdateLngColumn(LngColumn *string) {
	c.LngColumn = LngColumn
}

func (c *CSV) UpdateHeightColumn(HeightColumn *string) {
	c.HeightColumn = HeightColumn
}

func (c *CSV) UpdateNoHeader(NoHeader *bool) {
	c.NoHeader = NoHeader
}

func (c *CSV) UpdateDisableTypeConversion(DisableTypeConversion *bool) {
	c.DisableTypeConversion = DisableTypeConversion
}
