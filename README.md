# RideLanka — Vehicle Rental & Tour Mobility Platform

A full-stack, enterprise-grade vehicle rental management system designed for modern fleet operations across Sri Lanka's Southern Province (Matara, Galle, Mirissa, Tangalle, Weligama).

---

## Architecture Overview

```
vehicle_rental_system/
├── backend/          # Spring Boot 3 + Java 21 + Spring Security (JWT) + PostgreSQL
│   ├── src/
│   │   ├── main/java/com/ridelanka/
│   │   │   ├── controller/   # REST Controllers (Auth, Vehicles, Bookings, Stats)
│   │   │   ├── model/        # Entities (User, Vehicle, Booking)
│   │   │   ├── repository/   # Spring Data JPA Repositories
│   │   │   ├── service/      # Business Logic & Validation
│   │   │   └── security/     # JWT Auth Filters & Providers
│   │   └── resources/        # application.properties & migrations
│   └── pom.xml
└── frontend/         # Next.js 15 (Turbopack) + TypeScript + Vanilla CSS Design System
    ├── src/
    │   ├── app/              # App Router pages (Home, Vehicles, Bookings, Dashboard)
    │   ├── components/       # UI Components (VehicleCard, SearchForm, Navbar, Sidebar)
    │   └── lib/              # API Client & Auth Context
    └── package.json
```

---

## Features

### Customer Experience
- **Dynamic Fleet Catalog**: Filter by category (Cars, Scooters, Vans), location/branch, transmission, price range, and date availability.
- **Instant Booking**: Real-time rate calculation, pickup/return date conflict validation, and instant confirmation.
- **Customer Portal**: View active and historical bookings, statuses (`CONFIRMED`, `COMPLETED`, `CANCELLED`).
- **Responsive Design**: Tailored luxury dark theme optimized for mobile phones, tablets, laptops, and ultra-wide displays.

### Fleet & Operations Dashboard (Admin)
- **Fleet Management**: Add, edit, update status (`AVAILABLE`, `RENTED`, `MAINTENANCE`), or delete vehicles.
- **Booking Management**: Track reservations, update statuses, view customer contact and trip details.
- **Analytics & Stats**: Live fleet utilization counters, total reservations, and active rentals.

---

## Tech Stack

- **Backend**: Java 21, Spring Boot 3, Spring Data JPA, Hibernate, Spring Security, JWT (JSON Web Tokens), PostgreSQL, Maven
- **Frontend**: Next.js 15, React 19, TypeScript, Vanilla CSS Design System with dark mode tokens
- **Security**: Stateless JWT authentication, role-based access control (`ROLE_CUSTOMER`, `ROLE_ADMIN`), BCrypt password hashing

---

## Getting Started

### Prerequisites
- Java 21+ & Maven
- Node.js 18+ & npm
- PostgreSQL database

### Backend Setup
1. Configure database in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/vehicle_rental_db
   spring.datasource.username=postgres
   spring.datasource.password=yourpassword
   ```
2. Run the Spring Boot application:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   Backend will run on `http://localhost:8080`.

### Frontend Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`.

---

## License
MIT License.
