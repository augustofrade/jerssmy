package feed

import "time"

type FeedArticleListItemDto struct {
	Title           string
	Url             string
	PublicationDate time.Time
	Description     string
	IsNew           bool
	Read            bool
}
