package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/augustofrade/jerssmy/feed"
)

// App struct
type App struct {
	ctx         context.Context
	feedService *feed.Service
	logger      *slog.Logger
}

// NewApp creates a new App application struct
func NewApp() (*App, error) {
	db, err := initDB()
	if err != nil {
		return nil, err
	}

	lvl := new(slog.LevelVar)
	lvl.Set(slog.LevelDebug)

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: lvl,
	}))

	feedRepo := feed.NewRepository(db, logger.With("component", "FeedRepository"))
	feedService := feed.NewService(feedRepo, logger.With("component", "FeedService"))

	return &App{
		feedService: feedService,
		logger:      logger.With("component", "App"),
	}, nil
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) CreateFeed(title, url string) (*feed.Feed, error) {
	a.logger.Info("Creating feed",
		slog.String("title", title),
		slog.String("url", url),
	)
	return a.feedService.CreateFeed(title, url)
}

func (a *App) ListFeeds() ([]feed.Feed, error) {
	a.logger.Info("Listing feeds")
	return a.feedService.ListFeeds()
}

func (a *App) GetFeedById(id int) (*feed.Feed, error) {
	a.logger.Info("Getting feed data", slog.Int("id", id))
	return a.feedService.GetFeedByID(id)
}

func (a *App) GetStoredArticles(feedId int) ([]feed.FeedArticleListItemDto, error) {
	a.logger.Info("Getting stored articles", slog.Int("feedId", feedId))
	return a.feedService.GetStoredArticles(feedId)
}

func (a *App) FetchRemoteArticles(feedId int) ([]feed.FeedArticleListItemDto, error) {
	a.logger.Info("Fetching remote articles", slog.Int("feedId", feedId))
	return a.feedService.FetchRemoteArticles(feedId)
}

func (a *App) MarkArticleAsRead(articleUrl string) error {
	a.logger.Info("Marking article as read", slog.String("articleUrl", articleUrl))
	return a.feedService.MarkArticleAsRead(articleUrl)
}
