package models

import (
	"gorm.io/gorm"
)

// Product represents a product in the store
type Product struct {
	gorm.Model                 // Adds ID, CreatedAt, UpdatedAt, DeletedAt fields

	Name             string     `gorm:"size:255;not null;index"`           // Product name (indexed for fast search)
	Slug             string     `gorm:"size:255;unique;not null"`          // SEO-friendly URL slug
	Description      string     `gorm:"type:text"`                         // Detailed description
	ShortDescription string     `gorm:"size:500"`                          // Short summary for listings
	Price            float64    `gorm:"type:decimal(10,2);not null"`       // Current price
	CompareAtPrice   float64    `gorm:"type:decimal(10,2)"`                // Original price (for discounts)
	// Images (one-to-many)
	Images           []ProductImage `gorm:"foreignKey:ProductID"`

}

// ProductImage represents images for a product
type ProductImage struct {
	gorm.Model
	ProductID   uint   `gorm:"index"`
	URL         string `gorm:"size:500;not null"`
	AltText     string `gorm:"size:255"`
	IsMain      bool   `gorm:"default:false"` // main/thumbnail image
	SortOrder   int    `gorm:"default:0"`
}

