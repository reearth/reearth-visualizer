package nlslayer

import "net/url"

type Events struct {
	selectEvent *SelectEvent
}

type SelectEvent struct {
	openUrl *OpenUrlEvent
}

type OpenUrlEvent struct {
	url    *url.URL
	urlKey *string
}

func (e *Events) SelectEvent() *SelectEvent {
	return e.selectEvent
}

func (e *Events) SetSelectEvent(selectEvent *SelectEvent) {
	e.selectEvent = selectEvent
}

func (s *SelectEvent) OpenUrl() *OpenUrlEvent {
	return s.openUrl
}

func (s *SelectEvent) SetOpenUrl(openUrl *OpenUrlEvent) {
	s.openUrl = openUrl
}

func (o *OpenUrlEvent) Url() *url.URL {
	return o.url
}

func (o *OpenUrlEvent) SetUrl(url *url.URL) {
	o.url = url
}

func (o *OpenUrlEvent) UrlKey() *string {
	return o.urlKey
}

func (o *OpenUrlEvent) SetUrlKey(urlKey *string) {
	o.urlKey = urlKey
}

func (o *OpenUrlEvent) Update(url *url.URL, urlKey *string) {
	o.url = url
	o.urlKey = urlKey
}

func (s *SelectEvent) Update(openUrl *OpenUrlEvent) {
	s.openUrl = openUrl
}

func (e *Events) Update(selectEvent *SelectEvent) {
	e.selectEvent = selectEvent
}
