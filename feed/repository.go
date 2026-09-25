package feed

import (
	"database/sql"
	"time"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (s *Repository) CreateFeed(title string, url string) (*Feed, error) {
	f := Feed{
		Title:     title,
		Url:       url,
		CreatedAt: time.Now().UTC(),
	}

	createdAtStr := f.CreatedAt.Format(time.RFC3339)

	res, err := s.db.Exec("INSERT INTO feeds (title, url, created_at) VALUES (?, ?, ?)", title, url, createdAtStr)
	if err != nil {
		return nil, err
	}

	f.Id, err = res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &f, nil
}

func (s *Repository) RemoveFeed(id int) error {
	_, err := s.db.Exec("DELETE FROM feeds WHERE id = ?", id)
	return err
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
			Articles:  []FeedArticle{},
			CreatedAt: createdAt,
		})

	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return feeds, nil
}
