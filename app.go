package main

import (
	"context"
	"fmt"

	"github.com/augustofrade/jerssmy/feed"
)

// App struct
type App struct {
	ctx         context.Context
	feedService *feed.Service
}

// NewApp creates a new App application struct
func NewApp() (*App, error) {
	db, err := initDB()
	if err != nil {
		return nil, err
	}

	feedRepo := feed.NewRepository(db)
	feedService := feed.NewService(feedRepo)

	return &App{
		feedService: feedService,
	}, nil
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) CreateFeed(title, url string) (*feed.Feed, error) {
	return a.feedService.CreateFeed(title, url)
}

func (a *App) ListFeeds() ([]feed.Feed, error) {
	return a.feedService.ListFeeds()
}

func (a *App) GetFeedById(id int) (*feed.Feed, error) {
	return a.feedService.GetFeedByID(id)
}
