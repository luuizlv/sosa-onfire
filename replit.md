# SOSA - Bet Tracking System

## Overview

SOSA is a comprehensive bet tracking and analytics platform designed for monitoring gambling activities and analyzing performance metrics. The application provides users with detailed statistics, profit/loss tracking, and betting insights through an intuitive dashboard interface. Built with modern web technologies, it offers real-time data visualization and secure user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom dark OLED theme with wine red and gold accent colors

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API endpoints with proper error handling
- **File Structure**: Monorepo structure with shared types between client and server

### Database Design
- **Primary Database**: PostgreSQL with structured schema
- **Tables**: Users, bets, and sessions tables
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Types**: Enums for bet types and status, decimal precision for monetary values
- **Relationships**: Foreign key relationships between users and bets

### Authentication System
- **Provider**: Supabase Auth for user management
- **Token Management**: JWT tokens stored in localStorage
- **Middleware**: Custom authentication middleware for API protection
- **Session Handling**: Persistent sessions with automatic token refresh

### Data Management
- **Bet Types**: Categorized betting activities (surebet, giros, superodd, etc.)
- **Status Tracking**: Pending, completed, and lost bet statuses
- **Financial Calculations**: Automatic profit/loss calculations and ROI metrics
- **Filtering System**: Advanced filtering by date, type, house, and custom periods

### UI/UX Features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark Theme**: OLED-optimized dark theme for better viewing experience
- **Data Visualization**: Charts and graphs using Recharts library
- **Real-time Updates**: Live data updates using React Query
- **Form Handling**: React Hook Form with Zod validation

## External Dependencies

### Core Services
- **Supabase**: Authentication, user management, and database hosting
- **Neon Database**: PostgreSQL database as a service (alternative to Supabase DB)

### Development Tools
- **Vite**: Development server and build tool with React plugin support
- **TypeScript**: Static type checking across the entire application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **PostCSS**: CSS processing with Autoprefixer

### UI Components
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization and charting library
- **React Hook Form**: Form state management and validation

### Backend Libraries
- **pg**: PostgreSQL client for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express
- **express-session**: Session middleware for user state persistence
- **nanoid**: URL-safe unique ID generator

### Additional Utilities
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional className utility
- **class-variance-authority**: Type-safe variant API for components
- **zod**: Schema validation for forms and API inputs