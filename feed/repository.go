package feed

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
)

var (
	ErrFeedNotFound    error = errors.New("Feed not found")
	ErrArticleNotFound error = errors.New("Article not found")
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (s *Repository) InsertFeed(f *Feed) error {
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
	rows, err := s.db.Query("SELECT id, title, url, created_at FROM feeds")
	feeds := []Feed{}

	if err != nil {
		return feeds, err
	}

	defer rows.Close()

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

func (s *Repository) GetFeedIDByUrl(url string) (int, error) {
	var id int

	err := s.db.QueryRow("SELECT id FROM feeds WHERE url = ?", url).Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, ErrFeedNotFound
		}
		return 0, err
	}

	return id, nil

}

func (s *Repository) GetArticles(feedId int) ([]FeedArticle, error) {
	rows, err := s.db.Query("SELECT title, url, publication_date, description, read FROM feed_articles WHERE feed_id = ?", feedId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []FeedArticle{}

	for rows.Next() {
		var a FeedArticle
		var publicationDateRaw string

		if err := rows.Scan(&a.Title, &a.Url, &publicationDateRaw, &a.Description, &a.Read); err != nil {
			return nil, err
		}

		publicationDate, err := parsePublicationDate(publicationDateRaw)
		if err != nil {
			return nil, err
		}

		a.PublicationDate = publicationDate
		articles = append(articles, a)
	}

	if err = rows.Err(); err != nil {
		return articles, err
	}

	return articles, nil
}

func parsePublicationDate(value string) (time.Time, error) {
	const layout = "2006-01-02 15:04:05-07:00"

	parsed, err := time.Parse(layout, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid publication date %q: %w", value, err)
	}

	return parsed, nil
}

func (s *Repository) GetMissingArticleUrls(feedId int, urls []string) ([]string, error) {
	if len(urls) == 0 {
		return nil, nil
	}

	vals := make([]any, 0, len(urls)+1)
	placeholders := make([]string, len(urls))
	for i, url := range urls {
		placeholders[i] = "(?)"
		vals = append(vals, url)
	}
	vals = append(vals, feedId)

	query := fmt.Sprintf(`
		WITH input(url) AS (
			VALUES %s
		)
		SELECT input.url
		FROM input
		WHERE NOT EXISTS (
			SELECT 1
			FROM feed_articles fa
			WHERE fa.feed_id = ?
			AND fa.url = input.url
		)
	`, strings.Join(placeholders, ","))

	rows, err := s.db.Query(query, vals...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var missing []string

	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			return nil, err
		}

		missing = append(missing, url)
	}

	return missing, rows.Err()

}

func (s *Repository) InsertArticlesBatch(fas []FeedArticle) error {
	if len(fas) == 0 {
		return nil
	}

	var b strings.Builder
	b.WriteString("INSERT INTO feed_articles (title, url, publication_date, description, feed_id) VALUES ")

	args := make([]any, 0, len(fas)*5)

	for i, a := range fas {
		if i > 0 {
			b.WriteByte(',')
		}
		b.WriteString("(?, ?, ?, ?, ?)")
		args = append(args, a.Title, a.Url, a.PublicationDate, a.Description, a.FeedId)
	}

	_, err := s.db.Exec(b.String(), args...)
	return err
}

func (s *Repository) MarkArticleAsRead(url string) error {
	rows, err := s.db.Exec("UPDATE feed_articles SET read = 1 WHERE url = ?", url)
	if err != nil {
		return err
	}
	affected, err := rows.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrArticleNotFound
	}

	return nil
}
