package canned

import (
	"context"
	"embed"
	"encoding/json"

	"github.com/influxdata/chronograf"
)

//go:embed *.json
var content embed.FS

// BinLayoutsStore represents a embedded layout store
type BinLayoutsStore struct {
	Logger chronograf.Logger
}

// All returns the set of all layouts
func (s *BinLayoutsStore) All(ctx context.Context) ([]chronograf.Layout, error) {
	dirEntries, _ := content.ReadDir(".")
	layouts := make([]chronograf.Layout, len(dirEntries))
	for i, dirEntry := range dirEntries {
		name := dirEntry.Name()
		octets, err := content.ReadFile(name)
		if err != nil {
			s.Logger.
				WithField("component", "apps").
				WithField("name", name).
				Error("Invalid Layout: ", err)
			return nil, chronograf.ErrLayoutInvalid
		}

		var layout chronograf.Layout
		if err = json.Unmarshal(octets, &layout); err != nil {
			s.Logger.
				WithField("component", "apps").
				WithField("name", name).
				Error("Unable to read layout:", err)
			return nil, chronograf.ErrLayoutInvalid
		}
		layouts[i] = layout
	}

	return layouts, nil
}

// Get retrieves Layout if `ID` exists.
func (s *BinLayoutsStore) Get(ctx context.Context, ID string) (chronograf.Layout, error) {
	layouts, err := s.All(ctx)
	if err != nil {
		s.Logger.
			WithField("component", "apps").
			WithField("name", ID).
			Error("Invalid Layout: ", err)
		return chronograf.Layout{}, chronograf.ErrLayoutInvalid
	}

	for _, layout := range layouts {
		if layout.ID == ID {
			return layout, nil
		}
	}

	s.Logger.
		WithField("component", "apps").
		WithField("name", ID).
		Error("Layout not found")
	return chronograf.Layout{}, chronograf.ErrLayoutNotFound
}
