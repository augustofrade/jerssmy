package main

import (
	"database/sql"
	"embed"

	"github.com/augustofrade/jerrsmy/appdir"
	"github.com/augustofrade/jerrsmy/feed"
	_ "github.com/glebarez/go-sqlite"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	appdir.EnsureBaseExists()

	// Create an instance of the app structure
	app, err := NewApp()
	if err != nil {
		println("Error starting application up:", err.Error())
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "jerssmy",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func initDB() (*sql.DB, error) {
	dbPath, err := appdir.DB()
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	err = feed.InitSchema(db)
	if err != nil {
		db.Close()
		return nil, err
	}

	return db, err
}
