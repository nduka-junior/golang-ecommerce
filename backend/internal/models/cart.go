package models

import (
	"time"

	"gorm.io/gorm"
)

// Cart represents a user's shopping cart
type Cart struct {
	gorm.Model

	UserID    uint      `gorm:"uniqueIndex;not null"` // Each user has exactly one cart
	User      User      `gorm:"foreignKey:UserID"`    // Optional: preload user info

	Items     []CartItem `gorm:"foreignKey:CartID"`    // One-to-many with cart items

	TotalPrice float64   `gorm:"type:decimal(12,2);default:0.00"` // Computed total (updated on add/remove)

	CreatedAt time.Time
	UpdatedAt time.Time
}

// CartItem represents one product in the cart
type CartItem struct {
	gorm.Model

	CartID    uint   `gorm:"index;not null"`           // Foreign key to Cart
	Cart      Cart   `gorm:"foreignKey:CartID"`

	ProductID uint   `gorm:"index;not null"`           // Foreign key to Product
	Product   Product `gorm:"foreignKey:ProductID"`    // Optional: preload product

	Quantity  int    `gorm:"not null;default:1"`       // How many of this product
	Price     float64 `gorm:"type:decimal(10,2);not null"` // Price at time of addition (frozen)

	CreatedAt time.Time
	UpdatedAt time.Time
}

// Optional: Add these helper methods if needed

// CalculateTotal recalculates cart total (call after add/remove items)
func (c *Cart) CalculateTotal() float64 {
	var total float64
	for _, item := range c.Items {
		total += item.Price * float64(item.Quantity)
	}
	c.TotalPrice = total
	return total
}

// BeforeSave hook (optional) — auto-update total before saving
func (c *Cart) BeforeSave(tx *gorm.DB) error {
	c.CalculateTotal()
	return nil
}