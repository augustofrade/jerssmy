package syndication

import (
	"bytes"
	"encoding/xml"
)

type atom struct {
	XMLName xml.Name    `xml:"feed"`
	Title   string      `xml:"title"`
	Link    atomLink    `xml:"link"`
	Entries []atomEntry `xml:"entry"`
}

type atomLink struct {
	Href string `xml:"href,attr"`
}

type atomEntryThumbnail struct {
	Url string `xml:"url,attr"`
}

type atomEntryAuthor struct {
	Name string `xml:"name"`
}

type atomEntry struct {
	XMLName   xml.Name           `xml:"entry"`
	Title     string             `xml:"title"`
	Published string             `xml:"published"`
	Summary   string             `xml:"summary"`
	Author    atomEntryAuthor    `xml:"author"`
	Thumbnail atomEntryThumbnail `xml:"thumbnail"`
	Link      atomLink           `xml:"link"`
}

type rss struct {
	XMLName xml.Name   `xml:"rss"`
	Channel rssChannel `xml:"channel"`
}

type rssChannel struct {
	XMLName  xml.Name  `xml:"channel"`
	Title    string    `xml:"title"`
	Link     string    `xml:"link"`
	Articles []rssItem `xml:"item"`
}

type rssItemThumbnail struct {
	Url string `xml:"url,attr"`
}

type rssItem struct {
	XMLName         xml.Name         `xml:"item"`
	Title           string           `xml:"title"`
	Link            string           `xml:"link"`
	PublicationDate string           `xml:"pubDate"`
	Description     string           `xml:"description"`
	Author          string           `xml:"creator"`
	Thumbnail       rssItemThumbnail `xml:"content"`
}

func decodeRss(data []byte) (*rss, error) {
	var root rss
	err := xml.Unmarshal(data, &root)
	if err != nil {
		return nil, err
	}

	return &root, nil
}

func decodeAtom(data []byte) (*atom, error) {
	var root atom
	err := xml.Unmarshal(data, &root)
	if err != nil {
		return nil, err
	}

	return &root, nil
}

func isAtom(data []byte) bool {
	decoder := xml.NewDecoder(bytes.NewReader(data))
	for {
		t, _ := decoder.Token()
		if t == nil {
			return false
		}
		if se, ok := t.(xml.StartElement); ok {
			switch se.Name.Local {
			case "feed":
				return true
			case "rss":
				return false
			}
		}
	}
}
