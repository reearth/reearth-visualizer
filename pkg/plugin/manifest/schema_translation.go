package manifest

type TranslationExtension struct {
	Description    *string                   `json:"description,omitempty"`
	Title          *string                   `json:"title,omitempty"`
	PropertySchema TranslationPropertySchema `json:"propertySchema,omitempty"`
}

type TranslationPropertySchema map[string]TranslationPropertySchemaGroup

type TranslationPropertySchemaField struct {
	Choices     map[string]string `json:"choices,omitempty"`
	Description *string           `json:"description,omitempty"`
	Title       *string           `json:"title,omitempty"`
}

type TranslationPropertySchemaGroup struct {
	Description *string                                   `json:"description,omitempty"`
	Fields      map[string]TranslationPropertySchemaField `json:"fields,omitempty"`
	Title       *string                                   `json:"title,omitempty"`
}

type TranslationRoot struct {
	Description *string                         `json:"description,omitempty"`
	Extensions  map[string]TranslationExtension `json:"extensions,omitempty"`
	Title       *string                         `json:"title,omitempty"`
	Schema      TranslationPropertySchema       `json:"schema,omitempty"`
}
