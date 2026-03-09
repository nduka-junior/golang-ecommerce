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
func AuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get Authorization header
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
            c.Abort()
            return
        }

        // Check Bearer scheme
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
            c.Abort()
            return
        }

        tokenString := parts[1]

        // Parse and validate token
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            // Validate signing method
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return jwtSecret, nil
        })

        if err != nil {
            if err == jwt.ErrSignatureInvalid {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token signature"})
            } else {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
            }
            c.Abort()
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

userID := uint(userIDFloat)  // Convert float64 → uint here

c.Set("user_id", userID)     // Store as uint, not float64
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