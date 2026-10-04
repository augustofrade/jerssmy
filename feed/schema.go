package feed

import "database/sql"

func InitSchema(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS feeds (
			id INTEGER PRIMARY KEY,
			title TEXT NOT NULL,
			url TEXT NOT NULL UNIQUE,
			created_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS feed_articles (
			id INTEGER PRIMARY KEY,
			title TEXT NOT NULL,
			url TEXT NOT NULL UNIQUE,
			publication_date TEXT NOT NULL,
			description TEXT NOT NULL,
			author TEXT,
			thumbnail TEXT,
			read INTEGER NOT NULL DEFAULT 0,
			feed_id INTEGER NOT NULL,

			CONSTRAINT fk_feeds
			FOREIGN KEY (feed_id)
			REFERENCES feeds(id)
			ON DELETE CASCADE
		);
	`)

	return err
}
