package feed

import "time"

type Feed struct {
	Id        int64
	Title     string
	Url       string
	CreatedAt time.Time
}

type FeedArticle struct {
	Title           string
	Url             string
	PublicationDate string
	Description     string
}
