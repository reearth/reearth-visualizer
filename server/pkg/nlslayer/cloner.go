package nlslayer

type Cloner interface {
	Clone() Cloner
}
