package appdir

import (
	"os"
	"path/filepath"
)

const app_dir = ".jerssmy"

const db_file = "database.sqlite"

var userHomeDir string

func DB() (string, error) {
	paths, err := getPaths()
	if err != nil {
		return "", err
	}

	paths = append(paths, db_file)

	return filepath.Join(paths...), nil
}

func BasePath() (string, error) {
	paths, err := getPaths()
	if err != nil {
		return "", err
	}

	return filepath.Join(paths...), nil
}

func EnsureBaseExists() error {
	base, err := BasePath()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(base, 0700); err != nil {
		return err
	}

	return nil
}

func getPaths() ([]string, error) {
	homeDir, err := getUserHomeDir()
	if err != nil {
		return []string{}, err
	}

	return []string{homeDir, app_dir}, nil
}

func getUserHomeDir() (string, error) {
	if userHomeDir != "" {
		return userHomeDir, nil
	}

	dir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	userHomeDir = dir

	return dir, nil
}
