package feed

import "time"

type Feed struct {
	Id        int64
	Title     string
	Url       string
	CreatedAt time.Time
}

type FeedArticle struct {
	Id              int64
	Title           string
	Url             string
	PublicationDate time.Time
	Description     string
	FeedId          int64
	Read            bool
}
