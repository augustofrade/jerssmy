package syndication

import (
	"errors"
	"fmt"
	"io"
	"iter"
	"net/http"
	"strings"
	"time"
)

var (
	ErrTooManyRequests error = errors.New("feed request failed: Too many requests")
)

var httpClient = &http.Client{
	Timeout: 15 * time.Second,
}

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
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1")
	req.Header.Set("User-Agent", "jerssmy/1.0 (+https://github.com/augustofrade/jerssmy)")

	res, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	if res.StatusCode == http.StatusTooManyRequests {
		return nil, ErrTooManyRequests
	}

	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("feed request failed: %s", res.Status)
	}

	contentType := res.Header.Get("content-type")
	if !strings.Contains(contentType, "xml") {
		return nil, fmt.Errorf("feed request failed: invalid content type '%s'", contentType)
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
			pubDate, _ := time.Parse(time.RFC1123Z, item.PublicationDate)

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
			pubDate, _ := time.Parse(time.RFC3339, item.Published)

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
