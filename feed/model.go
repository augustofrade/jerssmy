package feed

import "time"

type Feed struct {
	Id        int64
	Title     string
	Url       string
	Articles  []FeedArticle
	CreatedAt time.Time
}

type FeedArticle struct {
	Title       string
	Url         string
	PubDate     string
	Description string
}
