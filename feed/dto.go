package feed

import "time"

type FeedArticleListItemDto struct {
	Title           string
	Url             string
	PublicationDate time.Time
	Author          string
	Thumbnail       string
	Description     string
	IsNew           bool
	Read            bool
}
