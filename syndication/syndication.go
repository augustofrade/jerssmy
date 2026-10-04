package syndication

import (
	"fmt"
	"io"
	"iter"
	"net/http"
	"strings"
	"time"
)

type Feed struct {
	Title string
	Url   string
}

type FeedArticle struct {
	Title           string
	Url             string
	PublicationDate time.Time
	Description     string
}

// Fetches the XML at url and returns it as []byte
func Fetch(url string) ([]byte, error) {
	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	contentType := res.Header.Get("content-type")
	if !strings.Contains(contentType, "xml") {
		return nil, fmt.Errorf("invalid content type: %s", contentType)
	}

	return body, nil
}

// Decodes a []byte feed into a usable Feed object
func DecodeFeed(data []byte) (*Feed, error) {
	if isAtom(data) {
		f, err := decodeAtom(data)
		if err != nil {
			return nil, err
		}

		return &Feed{
			Title: f.Title,
			Url:   f.Link.Href,
		}, nil
	}

	f, err := decodeRss(data)
	if err != nil {
		return nil, err
	}

	return &Feed{
		Title: f.Channel.Title,
		Url:   f.Channel.Link,
	}, nil
}

// Decodes a []byte feed into an iterator of usable FeedArticle objects
// regardless of the feed type
func DecodeArticles(data []byte) (iter.Seq[FeedArticle], error) {
	if isAtom(data) {
		return getAtomArticles(data)
	}
	return getRssArticles(data)
}

// Returns an iterator of FeedArticle for RSS feeds
func getRssArticles(data []byte) (iter.Seq[FeedArticle], error) {
	root, err := decodeRss(data)
	if err != nil {
		return nil, err
	}

	return func(yield func(FeedArticle) bool) {
		for _, item := range root.Channel.Articles {
			pubDate, _ := time.Parse(item.PublicationDate, "Mon, 02 Jan 2006 15:04:05 -0700")

			fa := FeedArticle{
				Title:           item.Title,
				Url:             item.Link,
				PublicationDate: pubDate,
				Description:     item.Description,
			}

			if !yield(fa) {
				return
			}
		}
	}, nil
}

// Returns an iterator of FeedArticle for Atom feeds
func getAtomArticles(data []byte) (iter.Seq[FeedArticle], error) {
	root, err := decodeAtom(data)
	if err != nil {
		return nil, err
	}

	return func(yield func(FeedArticle) bool) {
		for _, item := range root.Entries {
			pubDate, _ := time.Parse(item.Published, "2006-01-02T15:04:05-07:00")

			fa := FeedArticle{
				Title:           item.Title,
				Url:             item.Link.Href,
				PublicationDate: pubDate,
				Description:     item.Summary,
			}

			if !yield(fa) {
				return
			}
		}
	}, nil
}
