package feed

import (
	"errors"
	"strings"
	"time"
)

var (
	ErrFeedTitleIsEmpty error = errors.New("The title of a feed can't be empty")
	ErrFeedUrlIsEmpty   error = errors.New("The URL of a feed can't be empty")
	ErrFeedExists       error = errors.New("The feed URL was already registred")
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
	title = strings.TrimSpace(title)

	if len(title) == 0 {
		return nil, ErrFeedTitleIsEmpty
	}
	url = strings.TrimSpace(url)
	if len(url) == 0 {
		return nil, ErrFeedUrlIsEmpty
	}

	urlInUse, err := s.FeedExists(url)
	if err != nil {
		return nil, err
	}
	if urlInUse {
		return nil, ErrFeedExists
	}

	f := Feed{
		Title:     title,
		Url:       url,
		CreatedAt: time.Now().UTC(),
	}

	err = s.repo.CreateFeed(&f)
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

func (s *Service) FeedExists(url string) (bool, error) {
	_, err := s.repo.GetFeedIDByUrl(url)

	if err != nil {
		if errors.Is(err, ErrFeedNotFound) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

type UpdateFeedOptions struct {
	Title string
}
