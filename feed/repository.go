package feed

import (
	"database/sql"
	"errors"
	"time"
)

var (
	ErrFeedNotFound error = errors.New("Feed not found")
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (s *Repository) CreateFeed(f *Feed) error {
	createdAtStr := f.CreatedAt.Format(time.RFC3339)

	res, err := s.db.Exec("INSERT INTO feeds (title, url, created_at) VALUES (?, ?, ?)",
		f.Title, f.Url, createdAtStr)

	if err != nil {
		return err
	}

	f.Id, err = res.LastInsertId()
	if err != nil {
		return err
	}

	return nil
}

func (s *Repository) UpdateFeed(id int, options UpdateFeedOptions) error {
	res, err := s.db.Exec(`UPDATE feeds SET title = ?
	WHERE id = ?`, options.Title, id)

	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrFeedNotFound
	}

	return nil
}

func (s *Repository) RemoveFeed(id int) error {
	_, err := s.db.Exec("DELETE FROM feeds WHERE id = ?", id)
	return err
}

func (s *Repository) GetFeedByID(id int64) (*Feed, error) {
	var feed Feed
	var createdAtRaw string

	err := s.db.QueryRow(
		"SELECT id, title, url, created_at FROM feeds WHERE id = ?",
		id,
	).Scan(&feed.Id, &feed.Title, &feed.Url, &createdAtRaw)
	if err != nil {
		return nil, err
	}

	createdAt, err := time.Parse(time.RFC3339, createdAtRaw)
	if err != nil {
		return nil, err
	}

	feed.CreatedAt = createdAt

	return &feed, nil
}
func (s *Repository) GetFeeds() ([]Feed, error) {
	rows, err := s.db.Query("SELECT (id, title, url, created_at) FROM feeds")
	feeds := []Feed{}

	if err != nil {
		return feeds, err
	}

	for rows.Next() {
		var id int64
		var title, url, createdAtRaw string

		if err := rows.Scan(&id, &title, &url, &createdAtRaw); err != nil {
			return nil, err
		}

		createdAt, err := time.Parse(time.RFC3339, createdAtRaw)
		if err != nil {
			return nil, err
		}

		feeds = append(feeds, Feed{
			Id:        id,
			Title:     title,
			Url:       url,
			CreatedAt: createdAt,
		})

	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return feeds, nil
}
