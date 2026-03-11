package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/time/rate"
)

// AuthMiddleware verifies JWT tokens in incoming requests
// middleware/auth.go
func AuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
            return
        }

        tokenString := parts[1]

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        })

        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
            return
        }

        userIDFloat, ok := claims["user_id"].(float64)
        if !ok {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id in token"})
            return
        }

        role, _ := claims["role"].(string) // role may be missing → default to ""

        userID := uint(userIDFloat)

        c.Set("user_id", userID)
        c.Set("email" , claims["email"]) // store email in context for profile endpoint
        c.Set("role", role) // ← store role in gin context
        c.Next()
    }
}

// middleware/auth.go (add this function)
func RequireRole(requiredRole string) gin.HandlerFunc {
    return func(c *gin.Context) {
        role, exists := c.Get("role")
        if !exists || role != requiredRole {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "error": "Access denied: insufficient permissions",
            })
            return
        }
        c.Next()
    }
}

// RateLimiter middleware to prevent brute force attacks
func RateLimiter() gin.HandlerFunc {
    limiter := rate.NewLimiter(rate.Every(time.Second), 10)
    return func(c *gin.Context) {
        if !limiter.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests"})
            c.Abort()
            return
        }
        c.Next()
    }
}