package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nduka-junior/ecommerce-api/internal/database"
	"github.com/nduka-junior/ecommerce-api/internal/models"
	"gorm.io/gorm"
)

// CartHandler handles cart operations
type CartHandler struct {
	db *database.Database
}

// NewCartHandler creates a new cart handler
func NewCartHandler(db *database.Database) *CartHandler {
	return &CartHandler{db: db}
}

// GetCart handles GET /api/v1/cart
// Returns the authenticated user's cart with items and total
func (h *CartHandler) GetCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var cart models.Cart
	err := h.db.DB.Preload("Items.Product").Preload("Items.Product.Images").
		Where("user_id = ?", userID).
		First(&cart).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create empty cart if none exists
			cart = models.Cart{UserID: userID.(uint)}
			h.db.DB.Create(&cart)
		} else {
			log.Printf("Failed to fetch cart: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
			return
		}
	}

	// Recalculate total (in case prices changed)
	cart.CalculateTotal()
	h.db.DB.Save(&cart)

	c.JSON(http.StatusOK, gin.H{
		"cart": cart,
	})
}

// AddToCart handles POST /api/v1/cart/items
// Adds or updates a product in the cart
func (h *CartHandler) AddToCart(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	// Safe conversion from float64 (common in jwt.MapClaims) to uint
var userID uint
switch v := userIDRaw.(type) {
case float64:
    userID = uint(v)
case int:
    userID = uint(v)
case uint:
    userID = v
default:
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
    return
}

	var input struct {
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required,gte=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input",
			"details": err.Error(),
		})
		return
	}

	// Get or create user's cart
	var cart models.Cart
	h.db.DB.Where("user_id = ?", userID).FirstOrCreate(&cart, models.Cart{UserID: userID})

	// Check if product exists and is active
	var product models.Product
	if err := h.db.DB.Where("id = ? ", input.ProductID, ).First(&product).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product not found or unavailable"})
		return
	}

	// // Check stock
	// if product.StockQuantity < input.Quantity {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough stock available"})
	// 	return
	// }

	// Find existing cart item or create new
	var item models.CartItem
	err := h.db.DB.Where("cart_id = ? AND product_id = ?", cart.ID, input.ProductID).First(&item).Error
	switch err {
case gorm.ErrRecordNotFound:
		// New item
		item = models.CartItem{
			CartID:    cart.ID,
			ProductID: input.ProductID,
			Quantity:  input.Quantity,
			Price:     product.Price, // Freeze current price
		}
		h.db.DB.Create(&item)
	case nil:
		// Update quantity
		item.Quantity += input.Quantity
		h.db.DB.Save(&item)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
		return
	}

	// Recalculate total
	cart.CalculateTotal()
	h.db.DB.Save(&cart)

	c.JSON(http.StatusOK, gin.H{
		"message": "Item added to cart",
		"cart":    cart,
	})
}

// UpdateCartItem handles PUT /api/v1/cart/items/:item_id
// Updates quantity of a specific cart item
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	itemIDStr := c.Param("item_id")
	itemID, err := strconv.Atoi(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var input struct {
		Quantity int `json:"quantity" binding:"required,gte=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var item models.CartItem
	if err := h.db.DB.Where("id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)", itemID, userID).
		First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	// Check stock
	var product models.Product
	h.db.DB.First(&product, item.ProductID)
	// if product.StockQuantity < input.Quantity {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough stock"})
	// 	return
	// }

	item.Quantity = input.Quantity
	h.db.DB.Save(&item)

	// Update cart total
	var cart models.Cart
	h.db.DB.First(&cart, item.CartID)
	cart.CalculateTotal()
	h.db.DB.Save(&cart)

	c.JSON(http.StatusOK, gin.H{
		"message": "Cart item updated",
		"cart":    cart,
	})
}

// RemoveCartItem handles DELETE /api/v1/cart/items/:item_id
func (h *CartHandler) RemoveCartItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	itemIDStr := c.Param("item_id")
	itemID, err := strconv.Atoi(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var item models.CartItem
	if err := h.db.DB.Where("id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)", itemID, userID).
		First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	h.db.DB.Delete(&item)

	// Update cart total
	var cart models.Cart
	h.db.DB.First(&cart, item.CartID)
	cart.CalculateTotal()
	h.db.DB.Save(&cart)

	c.JSON(http.StatusOK, gin.H{
		"message": "Item removed from cart",
		"cart":    cart,
	})
}

// ClearCart handles DELETE /api/v1/cart
// Removes all items from user's cart
func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var cart models.Cart
	if err := h.db.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}

	h.db.DB.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{})
	cart.TotalPrice = 0
	h.db.DB.Save(&cart)

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
}