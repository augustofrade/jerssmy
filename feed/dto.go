package feed

import "time"

type FeedArticleListItemDto struct {
	Title           string
	Url             string
	PublicationDate time.Time
	Author          string
	Thumbnail       string
	Summary         string
	Content         string
	IsNew           bool
	Read            bool
}
