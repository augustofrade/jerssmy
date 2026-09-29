package feed

import (
	"errors"
	"strings"
	"time"
)

var (
	ErrFeedTitleIsEmpty error = errors.New("The title of a feed can't be empty")
	ErrFeedUrlIsEmpty   error = errors.New("The URL of a feed can't be empty")
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) CreateFeed(title string, url string) (*Feed, error) {
	title = strings.Trim(title, "")

	if len(title) == 0 {
		return nil, ErrFeedTitleIsEmpty
	}
	url = strings.Trim(url, "")
	if len(url) == 0 {
		return nil, ErrFeedUrlIsEmpty
	}

	f := Feed{
		Title:     title,
		Url:       url,
		CreatedAt: time.Now().UTC(),
	}

	err := s.repo.CreateFeed(&f)
	return &f, err
}

func (s *Service) UpdateFeed(id int, options UpdateFeedOptions) error {
	options.Title = strings.Trim(options.Title, "")

	if len(options.Title) == 0 {
		return ErrFeedTitleIsEmpty
	}

	return s.repo.UpdateFeed(id, options)
}

func (s *Service) RemoveFeed(id int) error {
	return s.repo.RemoveFeed(id)
}

func (s *Service) ListFeeds() ([]Feed, error) {
	return s.repo.GetFeeds()
}

type UpdateFeedOptions struct {
	Title string
}
