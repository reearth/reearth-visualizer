package workspace

type Metadata struct {
	description  string
	website      string
	location     string
	billingEmail string
	photoURL     string
}

func (m Metadata) Description() string {
	return m.description
}

func (m Metadata) Website() string {
	return m.website
}

func (m Metadata) Location() string {
	return m.location
}

func (m Metadata) BillingEmail() string {
	return m.billingEmail
}

func (m Metadata) PhotoURL() string {
	return m.photoURL
}
