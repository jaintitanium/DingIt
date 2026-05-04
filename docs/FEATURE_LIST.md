# DingIt Platform - Feature Documentation

**Prepared by:** Rupesh Jain
**Organization:** Uniworld Technologies
**Date:** January 20, 2026
**Version:** 1.0

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Authentication & User Management](#2-authentication--user-management)
3. [Home & Discovery](#3-home--discovery)
4. [Service Provider Features](#4-service-provider-features)
5. [Search Functionality](#5-search-functionality)
6. [Reviews & Ratings](#6-reviews--ratings)
7. [Financial Management](#7-financial-management)
8. [Settings & Administration](#8-settings--administration)
9. [Mobile Application](#9-mobile-application)
10. [Feature Summary Matrix](#10-feature-summary-matrix)

---

## 1. Application Overview

DingIt is a comprehensive service marketplace platform that connects customers with local service providers. The platform enables users to discover businesses, view menus/products, read and write reviews, and tip service team members.

### Key Highlights
- Cross-platform support (Web, iOS, Android)
- Real-time location-based discovery
- Integrated payment processing via Stripe
- Comprehensive review and rating system
- Service provider management tools

### Application Screenshots

#### Login Screen
![Login Screen](screenshots/01-login.png)

*The login screen features the DINGit branding with username/password authentication, password visibility toggle, forgot password link, and create account option.*

#### Sign Up Screen
![Sign Up Screen](screenshots/02-signup.png)

*New user registration with email, password, and password confirmation fields.*

---

## 2. Authentication & User Management

### 2.1 User Registration
- **Email Registration**: Users can create accounts using email and password
- **Password Requirements**: Minimum 6 characters
- **Password Confirmation**: Double-entry validation prevents typos
- **Email Verification**: Optional email confirmation flow

### 2.2 User Login
- **Email/Password Login**: Standard authentication
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Remember Me**: Persistent session capability
- **Forgot Password**: Email-based password reset

### 2.3 Profile Management
- **Profile Completion**: Required after initial signup
- **Profile Photo**: Upload and manage avatar images
- **Name Management**: Edit display name
- **Account Deletion**: Soft delete with data anonymization

### 2.4 User Roles
| Role | Description | Capabilities |
|------|-------------|--------------|
| **Customer** | Regular app user | Browse, search, review, tip |
| **Service Provider Owner** | Business owner | Manage providers, products, team |
| **Service Member** | Team employee | Receive tips, view earnings |

---

## 3. Home & Discovery

### 3.1 Home Page
![Home Page](screenshots/03-home.png)

*The home page displays the Monthly Spotlight featured business, search bar, horizontally scrollable Businesses carousel, and Top-rated Providers list.*

#### Features:
- **Monthly Spotlight**: Featured service provider with promotional banner
- **Search Bar**: Quick access to search functionality
- **Businesses Carousel**: Horizontally scrollable cards showing:
  - Business thumbnail/header image
  - Business name
  - Description/subtitle
  - Distance from user
  - Star rating
- **Top-rated Providers**: Vertical list of highest-rated businesses
- **Bottom Navigation Bar**: Quick access to Home, Money, Settings, Profile

### 3.2 Location Services
- **Geolocation Detection**: Automatic user location detection
- **Distance Calculation**: Shows distance to each service provider in miles
- **Location Fallback**: Saves last known location for offline use
- **Hotspot Detection**: Identifies nearby popular providers

---

## 4. Service Provider Features

### 4.1 Service Provider Detail Page
![Service Provider Detail](screenshots/04-provider-detail.png)

*Detailed view of a service provider showing header image, business name, ratings, quick actions, and featured products.*

#### Header Section:
- Large header/promotional image
- Business name and subtitle
- Star rating display
- Quick action buttons:
  - **Call**: Direct phone call
  - **Website**: Open business website
  - **Share**: Copy link to clipboard

#### Featured Product:
- "Most Popular" product highlight
- Product image and name
- "See Full Menu" button

#### Active Promotions:
- Promotional banner display
- Direct link to promotional content

### 4.2 Location & Navigation
![Location Map](screenshots/05-location-map.png)

*Google Maps integration showing business location with navigation options.*

#### Features:
- Interactive Google Maps display
- Business location marker
- **Navigate Button**: Opens directions in maps app
- Distance display (e.g., "335.6 mi away")
- Full address display

### 4.3 Team Members
![Team Members](screenshots/06-team-members.png)

*Top Rated Employees section showing team member photos and individual ratings.*

#### Features:
- Team member photos (square avatars)
- Individual names with links to profiles
- Star ratings per member
- Top 3 members displayed on provider page
- Full team list available via "Team" tab

### 4.4 Product Menu
![Product Menu](screenshots/07-menu.png)

*Menu page showing products with photos, descriptions, and pricing.*

#### Features:
- Product photo thumbnails
- Product name and description
- Price display (supports multiple price points)
- Organized table layout
- Back navigation

### 4.5 Operating Hours
![Operating Hours](screenshots/08-hours.png)

*Hours section showing weekly schedule.*

#### Features:
- Day-by-day schedule display
- Support for multiple time slots per day
- Clear open/close time format

---

## 5. Search Functionality

### 5.1 Search Page
![Search Page](screenshots/09-search.png)

*Search interface with results showing provider name, description, distance, and location.*

#### Search Capabilities:
- **Full-text Search**: Searches across:
  - Provider name
  - Subtitle/description
  - Address
  - City and State
- **Real-time Results**: Results update as user types
- **Location-aware**: Results include distance from user

#### Search Results Display:
- Provider thumbnail image
- Provider name
- Description/subtitle
- Distance in miles
- City, State location

---

## 6. Reviews & Ratings

### 6.1 Reviews Section
![Reviews](screenshots/10-reviews.png)

*Reviews section on provider page showing customer reviews with ratings and comments.*

#### Review Display:
- Customer avatar/photo
- Customer name
- Star rating (1-5)
- Review text/comment
- "See All" link for full review list
- "Leave a review" button

### 6.2 Review Creation
#### Features:
- Overall provider rating (1-5 stars)
- Individual team member ratings
- Individual product ratings
- Written description/comments
- Required description for low ratings (below 2 stars)

### 6.3 Tipping System
- Add tips during review submission
- Per-team-member tip amounts
- Stripe checkout for tip collection
- Tips only available for onboarded team members

### 6.4 Rating Calculations
- **Provider Rating**: Aggregated from all reviews
- **Member Rating**: Individual team member average
- **Product Rating**: Per-product average rating

---

## 7. Financial Management

### 7.1 Subscription Management
#### For Service Provider Owners:
- Subscription plans via Stripe
- Free trial period (configurable)
- Billing portal access
- Subscription quantity based on number of providers

### 7.2 Service Member Payments
#### For Team Members:
- Stripe Express account onboarding
- Tip collection and transfers
- Transfer history with amounts and dates
- Earnings dashboard

### 7.3 Payment Processing
- **Stripe Integration**: Full payment processing
- **Fee Structure**: Platform fees on tips
- **Transfer System**: Automated payouts to team members

---

## 8. Settings & Administration

### 8.1 User Settings
- Profile management
- Password changes
- Account deletion
- Privacy policy access

### 8.2 Service Provider Management
#### For Owners:
- Create new service providers
- Edit provider details:
  - Display name and subtitle
  - Phone number
  - Address (street, city, state, postal code)
  - Website URL
- Upload/manage images:
  - Header image
  - Promotional image
  - Product images
- Manage operating hours
- Team member management:
  - Invite new members
  - Remove members
  - View member ratings

### 8.3 Product Management
- Add/edit/delete products
- Product details:
  - Display name
  - Description
  - Image upload
  - Pricing (multiple price points)
- Featured product selection
- Drag-and-drop reordering

---

## 9. Mobile Application

### 9.1 Platform Support
| Platform | Technology | Status |
|----------|------------|--------|
| **Web** | Angular SPA | Production |
| **iOS** | Capacitor Native | Production |
| **Android** | Capacitor Native | Production |

### 9.2 Native Features
- **Geolocation**: Native GPS access
- **Camera**: Photo capture for uploads
- **File System**: Image storage and caching
- **Clipboard**: Share links
- **Deep Linking**: Open app from URLs

### 9.3 Bottom Navigation
The mobile-optimized bottom navigation bar provides quick access to:
1. **Home** (House icon): Main discovery page
2. **Money** (Dollar icon): Financial features
3. **Settings** (Gear icon): App settings
4. **Profile** (Person icon): User profile

---

## 10. Feature Summary Matrix

### Customer Features

| Feature | Status | Description |
|---------|--------|-------------|
| User Registration | Implemented | Email/password signup |
| User Login | Implemented | Email/password authentication |
| Password Reset | Implemented | Email-based recovery |
| Profile Management | Implemented | Edit name, photo |
| Browse Providers | Implemented | Home page discovery |
| Search Providers | Implemented | Full-text search |
| View Provider Details | Implemented | Full business information |
| View Products/Menu | Implemented | Product catalog |
| View Team Members | Implemented | Employee profiles |
| View Reviews | Implemented | Customer feedback |
| Write Reviews | Implemented | Rating and comments |
| Tip Team Members | Implemented | Stripe checkout |
| Location Services | Implemented | Distance calculation |
| Map Navigation | Implemented | Google Maps integration |

### Service Provider Features

| Feature | Status | Description |
|---------|--------|-------------|
| Create Provider | Implemented | Business registration |
| Edit Provider | Implemented | Update business details |
| Manage Images | Implemented | Header, promo, product images |
| Operating Hours | Implemented | Weekly schedule |
| Product Management | Implemented | Add/edit/delete products |
| Team Management | Implemented | Invite/remove members |
| View Reviews | Implemented | Customer feedback |
| Subscription | Implemented | Stripe billing |

### Service Member Features

| Feature | Status | Description |
|---------|--------|-------------|
| Stripe Onboarding | Implemented | Express account setup |
| Receive Tips | Implemented | Payment transfers |
| View Earnings | Implemented | Transfer history |
| Profile Display | Implemented | Rating and photo |

### Platform Features

| Feature | Status | Description |
|---------|--------|-------------|
| Web Application | Production | Full-featured SPA |
| iOS Application | Production | Capacitor native |
| Android Application | Production | Capacitor native |
| Real-time Updates | Implemented | Supabase realtime |
| Push Notifications | Planned | Future feature |
| Messaging | Placeholder | Future feature |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | Rupesh Jain, Uniworld Technologies | Initial documentation |

---

*This document is confidential and intended solely for the use of the individual or entity to whom it is addressed.*
