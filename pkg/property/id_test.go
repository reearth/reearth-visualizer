package property

func mockNewItemID(id ItemID) func() {
	original := NewItemID
	NewItemID = func() ItemID { return id }
	return func() {
		NewItemID = original
	}
}
