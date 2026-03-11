# E-Commerce Platform

A full-stack e-commerce application built as part of my **roadmap.sh Backend Developer** learning path.

This project was **cooked from scratch** with Go on the backend and Next.js on the frontend. It demonstrates clean architecture, proper authentication, role-based access, image uploads, and a responsive shopping experience.

---

## Project Overview

This is a complete e-commerce system featuring user authentication, product management, shopping cart, and an admin panel. The goal was to build a production-ready application while following modern best practices.

**Live Demo**: (Add link when deployed)  
**Backend**: Go + Gin + GORM  
**Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui

---

## Features

- User registration and login with JWT
- Role-based access control (`user` and `admin`)
- Product CRUD with Cloudinary image upload
- Search and filter products
- Fully functional shopping cart (add, update, remove items)
- Admin dashboard for product management
- Responsive design with shadcn/ui components
- Toast notifications and loading states
- Secure API with proper validation and CORS

---

## Database Models & Relationships

### Models

| Model          | Description                              | Key Fields |
|----------------|------------------------------------------|----------|
| **User**       | Represents registered users              | ID, Email, PasswordHash, Role (`user`/`admin`), CreatedAt, UpdatedAt |
| **Product**    | Main product entity                      | ID, Name, Slug, Description, ShortDescription, Price, CompareAtPrice |
| **ProductImage**| Images associated with a product         | ID, ProductID, URL, AltText, IsMain, SortOrder |
| **Cart**       | User's shopping cart (one per user)      | ID, UserID, TotalPrice |
| **CartItem**   | Individual items inside a cart           | ID, CartID, ProductID, Quantity, Price |

### Relationships

- **User → Cart**: One-to-One (Each user has exactly one cart)
- **Cart → CartItem**: One-to-Many (One cart can have many items)
- **Product → CartItem**: One-to-Many (One product can be in many carts)
- **Product → ProductImage**: One-to-Many (One product can have multiple images)
- **CartItem → Product**: Many-to-One (Many cart items reference one product)

All relationships use proper foreign keys and GORM tags for automatic handling.

---

## Tech Stack

### Backend
- **Language**: Go (Gin framework)
- **ORM**: GORM (with PostgreSQL)
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: JWT
- **Image Storage**: Cloudinary
- **Validation**: Gin binding + custom validators

### Frontend
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Notifications**: Sonner
- **State Management**: React hooks + server components
- **Image Optimization**: Next.js Image component

---

## Project Structure
