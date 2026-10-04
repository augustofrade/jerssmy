package feed

import (
	"errors"
	"log"
	"strings"
	"time"

	"github.com/augustofrade/jerssmy/syndication"
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

func (s *Service) GetFeedByID(id int) (*Feed, error) {
	return s.repo.GetFeedByID(int64(id))
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

	err = s.repo.InsertFeed(&f)
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

func (s *Service) GetStoredArticles(feedId int) ([]FeedArticleListItemDto, error) {
	as := []FeedArticleListItemDto{}

	articles, err := s.repo.GetArticles(feedId)
	if err != nil {
		return as, err
	}

	for _, a := range articles {
		as = append(as, FeedArticleListItemDto{
			Title:           a.Title,
			Url:             a.Url,
			PublicationDate: a.PublicationDate,
			Description:     a.Description,
			IsNew:           false,
			Read:            a.Read,
		})
	}

	return as, nil
}

func (s *Service) FetchRemoteFeedData(url string) (*syndication.Feed, error) {
	feedXml, err := syndication.Fetch(url)
	if err != nil {
		return nil, err
	}

	return syndication.DecodeFeed(feedXml)
}

// Fetches remote articles from a saved Feed, filters the new ones, save them on the database
// and returns them
func (s *Service) FetchRemoteArticles(feedId int) ([]FeedArticleListItemDto, error) {
	f, err := s.repo.GetFeedByID(int64(feedId))
	as := []FeedArticleListItemDto{}

	if err != nil {
		return as, err
	}

	feedXml, err := syndication.Fetch(f.Url)
	if err != nil {
		return as, err
	}

	articleItr, err := syndication.DecodeArticles(feedXml)
	if err != nil {
		return as, err
	}

	remoteUrls := []string{}
	remoteArticles := map[string]FeedArticle{}

	for a := range articleItr {
		remoteUrls = append(remoteUrls, a.Url)
		remoteArticles[a.Url] = FeedArticle{
			Title:           a.Title,
			Url:             a.Url,
			Description:     a.Description,
			PublicationDate: a.PublicationDate,
			Author:          a.Author,
			Thumbnail:       a.Thumbnail,
			FeedId:          f.Id,
		}
	}

	newUrls, err := s.repo.GetMissingArticleUrls(feedId, remoteUrls)
	if err != nil {
		return as, nil
	}

	if len(newUrls) == 0 {
		return as, nil
	}

	log.Println("New URLs found from remote Feed XML")

	newArticles := []FeedArticle{}

	for _, url := range newUrls {
		a, ok := remoteArticles[url]
		if !ok {
			// just to be sure
			continue
		}

		newArticles = append(newArticles, a)
		as = append(as, FeedArticleListItemDto{
			Title:           a.Title,
			Description:     a.Description,
			Url:             a.Url,
			PublicationDate: a.PublicationDate,
			IsNew:           true,
			Read:            false,
		})
	}

	err = s.repo.InsertArticlesBatch(newArticles)
	if err != nil {
		return nil, err
	}

	return as, nil
}

func (s *Service) MarkArticleAsRead(url string) error {
	return s.repo.MarkArticleAsRead(url)
}

type UpdateFeedOptions struct {
	Title string
}
