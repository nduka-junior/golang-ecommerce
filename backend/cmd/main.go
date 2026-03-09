package main

import (
	"log"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/nduka-junior/ecommerce-api/internal/config"
	"github.com/nduka-junior/ecommerce-api/internal/database"
	"github.com/nduka-junior/ecommerce-api/internal/handlers"
	"github.com/nduka-junior/ecommerce-api/internal/middleware"
	"github.com/nduka-junior/ecommerce-api/internal/models"
)

func main() {
    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatal("Failed to load config:", err)
    }
db, err := database.NewDatabase(cfg.DatabaseURL)
if err != nil {
    log.Fatalf("Database connection failed: %v", err)
}
defer func() {
    sqlDB, _ := db.DB.DB()
    sqlDB.Close()
}()

// // Auto-create tables
// db.DB.AutoMigrate(&models.User{},&models.Product{}, &models.ProductImage{}, &models.Cart{}, &models.CartItem{})

if cfg.Environment == "development" {
    // Only migrate in local dev (fast on local Postgres)
    db.DB.AutoMigrate(&models.User{}, &models.Product{}, &models.Cart{}, &models.CartItem{})
    log.Println("Auto-migrated schema (development only)")
} else {
    log.Println("Skipping AutoMigrate (production / Neon)")
}
log.Println("Database schema migrated (GORM)")

    // Set Gin mode
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    // Initialize router with middleware
    r := gin.New()
	// Register custom "slug" validator
if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
    v.RegisterValidation("slug", func(fl validator.FieldLevel) bool {
        value := fl.Field().String()
        // Allow: lowercase letters, numbers, hyphen, underscore
        // You can make it more permissive later
        return regexp.MustCompile(`^[a-z0-9_-]+$`).MatchString(value)
    })
}
    r.Use(gin.Recovery())
    r.Use(gin.Logger())

    // CORS middleware
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    // Initialize handlers with JWT configuration
    authHandler := handlers.NewAuthHandler(db, []byte(cfg.JWT.Secret))
	productHandler := handlers.NewProductHandler(db)
	cartHandler := handlers.NewCartHandler(db)

    // Public routes
    public := r.Group("/api/v1")
    {
        public.POST("/register", authHandler.Register)
        public.POST("/login", authHandler.Login)
        		public.GET("/products", productHandler.ListProducts)
		public.GET("/products/:id", productHandler.GetProduct)
    }

    // Protected routes with JWT middleware
    protected := r.Group("/api/v1")
    protected.Use(middleware.AuthMiddleware([]byte(cfg.JWT.Secret)))
    {
        protected.POST("/refresh-token", authHandler.RefreshToken)
        protected.POST("/logout", authHandler.Logout)
        protected.GET("/profile", getUserProfile)
		protected.POST("/product", productHandler.CreateProduct)

		protected.DELETE("/products/:id", productHandler.DeleteProduct)
		protected.GET("/products/search", productHandler.SearchProducts)
		// Cart routes (all require authentication)
    protected.GET("/cart", cartHandler.GetCart)
    protected.POST("/cart/items", cartHandler.AddToCart)
    protected.PUT("/cart/items/:item_id", cartHandler.UpdateCartItem)
    protected.DELETE("/cart/items/:item_id", cartHandler.RemoveCartItem)
    protected.DELETE("/cart", cartHandler.ClearCart)
    }

    // Start server with configured host and port
    serverAddr := cfg.Server.Host + ":" + cfg.Server.Port
    log.Printf("Server starting on %s", serverAddr)

    srv := &http.Server{
        Addr:         serverAddr,
        Handler:      r,
        ReadTimeout:  cfg.Server.ReadTimeout,
        WriteTimeout: cfg.Server.WriteTimeout,
    }

    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatal("Server failed to start:", err)
    }
}


func getUserProfile(c *gin.Context) {
    userID, _ := c.Get("user_id")
    email, _ := c.Get("email")
    
    c.JSON(200, gin.H{
        "user_id": userID,
        "email":   email,
    })
}
