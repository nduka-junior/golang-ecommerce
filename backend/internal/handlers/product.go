package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"

	"github.com/nduka-junior/ecommerce-api/internal/config"
	"github.com/nduka-junior/ecommerce-api/internal/database"
	"github.com/nduka-junior/ecommerce-api/internal/models"
	"gorm.io/gorm"
)

// ProductHandler holds dependencies
type ProductHandler struct {
	db *database.Database
}

// NewProductHandler creates a new handler instance
func NewProductHandler(db *database.Database) *ProductHandler {
	return &ProductHandler{db: db}
}



// ViewProducts handles GET /api/v1/products/:id
func (h *ProductHandler) ListProducts(c *gin.Context){
	var products []models.Product 
	if err := h.db.DB.Preload("Images").Find(&products).Error; err != nil {
		log.Printf("Failed to retrieve products: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})


}
// GetProduct handles GET /api/v1/products/:id

func (h *ProductHandler) GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product

	// Fetch product and preload images
	err = h.db.DB.Preload("Images").First(&product, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		log.Printf("Failed to fetch product %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch product",
			"details": err.Error(), // remove in production
		})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		"product": product,
	})
}
// CreateProduct handles POST /api/v1/products
// Requires admin JWT token
func (h *ProductHandler) CreateProduct(c *gin.Context) {
    // Optional: admin check
    // role, _ := c.Get("role")
    // if role != "admin" {
    //     c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
    //     return
    // }

    // Parse multipart form (max 10MB total)


    if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
        return
    }

    // Get text fields
    name := c.PostForm("name")
    slug := c.PostForm("slug")
    description := c.PostForm("description")
    shortDescription := c.PostForm("short_description")
    priceStr := c.PostForm("price")

    if name == "" || slug == "" || description == "" || priceStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
        return
    }

    price, err := strconv.ParseFloat(priceStr, 64)
    if err != nil || price <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price"})
        return
    }

    // Optional: slug uniqueness check
    var slugCount int64
    h.db.DB.Model(&models.Product{}).Where("slug = ?", slug).Count(&slugCount)
    if slugCount > 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "Slug already in use"})
        return
    }

    // Start transaction
    tx := h.db.DB.Begin()
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }

    // Create product
    product := models.Product{
        Name:             name,
        Slug:             slug,
        Description:      description,
        ShortDescription: shortDescription,
        Price:            price,
        CompareAtPrice:   0, // add field if needed
    }

    if err := tx.Create(&product).Error; err != nil {
        tx.Rollback()
        log.Printf("Failed to create product: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
        return
    }

    // Handle image uploads
    files := c.Request.MultipartForm.File["images"]
	log.Printf("Received %d image files", len(files))
    if len(files) > 0 {
        // Initialize Cloudinary
        cld, err := cloudinary.NewFromParams(
           config.Cfg.Cloudinary.CloudName,
            config.Cfg.Cloudinary.APIKey,
            config.Cfg.Cloudinary.APISecret,
        )
        if err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary setup failed"})
            return
        }

        ctx := context.Background()

        for i, fileHeader := range files {
            file, err := fileHeader.Open()
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to open image file"})
                return
            }

            // Upload to Cloudinary
            uploadParams := uploader.UploadParams{
                Folder:     "ecommerce/products",
                PublicID:   fmt.Sprintf("%d-%s", product.ID, strconv.Itoa(i)),
                ResourceType: "image",
            }

            result, err := cld.Upload.Upload(ctx, file, uploadParams)
            file.Close()

            if err != nil {
                tx.Rollback()
                log.Printf("Cloudinary upload failed: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image"})
                return
            }

            // Save image record
            image := models.ProductImage{
                ProductID: product.ID,
                URL:       result.SecureURL,
                AltText:   fileHeader.Filename, // or extract from form if sent
                IsMain:    i == 0,               // first image is main
                SortOrder: i,
            }

            if err := tx.Create(&image).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image record"})
                return
            }
        }
    }

    // Commit
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save product"})
        return
    }

    // Reload full product with images
    var createdProduct models.Product
    h.db.DB.Preload("Images").First(&createdProduct, product.ID)

    c.JSON(http.StatusCreated, gin.H{
        "message": "Product created successfully",
        "product": createdProduct,
    })
}

// DeleteProduct handles DELETE /api/v1/products/:id
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	// Optional: enforce admin access (uncomment when ready)
	// role, _ := c.Get("role")
	// if role != "admin" {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
	// 	return
	// }

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	// Start transaction (delete product + images atomically)
	tx := h.db.DB.Begin()
	if tx.Error != nil {
		log.Printf("Transaction begin failed: %v", tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Find product (with images preloaded)
	var product models.Product
	if err := tx.Preload("Images").First(&product, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		log.Printf("Failed to find product %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	// Delete associated images first
	if len(product.Images) > 0 {
		if err := tx.Delete(&product.Images).Error; err != nil {
			tx.Rollback()
			log.Printf("Failed to delete product images: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete images"})
			return
		}
	}

	// Delete the product
	if err := tx.Delete(&product).Error; err != nil {
		tx.Rollback()
		log.Printf("Failed to delete product %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete product",
			"details": err.Error(), // dev only – remove in production
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		log.Printf("Transaction commit failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete deletion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product deleted successfully",
		"product_id": id,
	})
}



// SearchProducts handles GET /api/v1/products/search
// Search products by keyword, with sorting and filters — returns ALL matching results (no pagination)
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	// Query parameters
	query := c.Query("q") // search keyword
	sort := c.DefaultQuery("sort", "created_at desc") // default: newest first

	// Base query – only active products
	dbQuery := h.db.DB.Model(&models.Product{}).
		Preload("Images")

	// Keyword search (in name, description, or short_description)
	if query != "" {
		searchTerm := "%" + query + "%"
		dbQuery = dbQuery.Where(
			h.db.DB.Where("name ILIKE ?", searchTerm).
				Or("description ILIKE ?", searchTerm).
				Or("short_description ILIKE ?", searchTerm),
		)
	}

	

	// Sorting options
	switch sort {
	case "price_asc":
		dbQuery = dbQuery.Order("price ASC")
	case "price_desc":
		dbQuery = dbQuery.Order("price DESC")
	case "name_asc":
		dbQuery = dbQuery.Order("name ASC")
	case "name_desc":
		dbQuery = dbQuery.Order("name DESC")
	default:
		dbQuery = dbQuery.Order("created_at DESC")
	}

	// Fetch ALL matching products (no limit/offset)
	var products []models.Product
	if err := dbQuery.Find(&products).Error; err != nil {
		log.Printf("Search products failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"total":    len(products),
		"query":    query,
		"filters": gin.H{
			"sort":         sort,
			"min_price":    c.Query("min_price"),
			"max_price":    c.Query("max_price"),
			"category_id":  c.Query("category_id"),
			"in_stock":     c.Query("in_stock"),
		},
	})
}