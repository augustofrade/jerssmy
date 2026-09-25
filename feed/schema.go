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
	`)

	return err
}
