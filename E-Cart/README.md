# E-Cart - Full-Stack E-Commerce Application

A production-ready, scalable e-commerce web application built with Angular 17 and Spring Boot 3.x.

## Tech Stack

- **Frontend**: Angular 17 (standalone components, Angular Router, HttpClient, Reactive Forms, RxJS)
- **Backend**: Java 17, Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, Validation, Jackson)
- **Database**: H2 (file mode for development; designed for easy migration to PostgreSQL)
- **Authentication**: JWT-based authentication with RBAC (CUSTOMER, ADMIN roles)
- **Password Hashing**: BCrypt
- **Build Tools**: Maven (backend), npm / Angular CLI (frontend)
- **Documentation**: OpenAPI/Swagger-UI
- **Testing**: JUnit + Spring Boot Test + Mockito (backend); Karma/Jasmine (frontend)

## Features

### Customer Features
- User registration and authentication
- Product catalog browsing with search and filters
- Shopping cart management
- Order placement and tracking
- Payment processing (Credit Card & UPI)
- Invoice generation and download
- Order cancellation
- Product feedback for delivered orders
- Profile management

### Admin Features
- Admin authentication
- Product CRUD operations
- Bulk product upload
- Customer management
- Order management
- Feedback viewing
- Export functionality

## Project Structure

```
.
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/ecart/
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── service/       # Business logic
│   │   │   │   ├── repository/    # Data access
│   │   │   │   ├── domain/entity/ # JPA entities
│   │   │   │   ├── dto/           # Data transfer objects
│   │   │   │   ├── security/      # Security configuration
│   │   │   │   ├── config/        # Configuration classes
│   │   │   │   ├── util/          # Utility classes
│   │   │   │   └── exception/     # Exception handling
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/                  # Test files
│   └── pom.xml
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Core services, guards, interceptors
│   │   │   ├── features/          # Feature modules
│   │   │   │   ├── public/        # Public pages
│   │   │   │   ├── customer/      # Customer area
│   │   │   │   └── admin/         # Admin area
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts
│   │   ├── index.html
│   │   └── styles.css
│   ├── package.json
│   └── angular.json
└── README.md
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- Angular CLI 17

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The frontend will start on `http://localhost:4200`

## API Documentation

Once the backend is running, access Swagger UI at:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **API Docs**: http://localhost:8080/api/v3/api-docs

## Default Credentials

### Admin
- **Username**: `admin`
- **Password**: `admin123`

### Demo Customer
- **Customer ID**: `CUST-20240101-0001`
- **Password**: `Demo123456`

## API Endpoints

### Authentication
- `POST /api/auth/customer/register` - Customer registration
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/admin/login` - Admin login

### Customer Endpoints (Requires CUSTOMER role)
- `GET /api/customers/me` - Get current customer profile
- `PUT /api/customers/me` - Update customer profile
- `GET /api/customers/me/orders` - Get customer orders
- `GET /api/customers/me/orders/{orderId}` - Get order details
- `POST /api/customers/me/cart/checkout` - Checkout cart
- `POST /api/customers/me/payments` - Process payment
- `GET /api/customers/me/invoices/{orderId}/download` - Download invoice
- `POST /api/customers/me/orders/{orderId}/cancel` - Cancel order
- `POST /api/customers/me/feedback` - Submit feedback

### Product Endpoints (Public)
- `GET /api/products` - Get products (filtered, paginated)
- `GET /api/products/{productId}` - Get product by ID

### Admin Endpoints (Requires ADMIN role)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{productId}` - Update product
- `DELETE /api/admin/products/{productId}` - Delete product (soft delete)
- `POST /api/admin/products/bulk-upload` - Bulk upload products
- `GET /api/admin/products/all` - Get all products (including soft-deleted)
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{orderId}` - Update order
- `POST /api/admin/orders/{orderId}/cancel` - Cancel order
- `GET /api/admin/feedback` - Get all feedback

## User Cases Implementation Mapping

| UC | Description | Implementation |
|----|-------------|----------------|
| UC1 | Customer Registration | `/register` page with validation, encrypted password, auto-generated Customer ID |
| UC2 | Customer Login | `/login` page using Customer ID + password |
| UC3 | Customer Home & Product Catalog | `/customer/home` with product listing, search, filters, Add to Cart |
| UC4 | Shopping Cart | `/customer/cart` with update, delete, remove, checkout functionality |
| UC5 | Payment Processing | `/customer/payment` with Credit Card & UPI, invoice generation |
| UC6 | My Orders | `/customer/orders` with order listing and status filtering |
| UC7 | Cancel Order | Cancel functionality for CONFIRMED orders with refund message |
| UC8 | Profile Update | `/customer/profile` with editable fields and password change |
| UC9 | Feedback | Feedback submission for DELIVERED orders |
| UC10 | Admin Home | `/admin/home` with admin navigation and role-based view |
| UC11 | Add Product | `/admin/products/new` with validations and auto-generated Product ID |
| UC12 | Admin Login | `/admin/login` page |
| UC13 | View All Products | `/admin/products/all` with filters, pagination, export |
| UC14 | View All Customers | `/admin/customers` with filters, pagination, export |
| UC15 | Admin Order Management | `/admin/orders` with status-based actions |
| UC16 | Product Search | Search by Product ID or Name in admin panel |
| UC17 | Delete Product | Soft-delete with confirmation and messaging |
| UC18 | Update Product | Update form with read-only ID and confirmation |
| UC19 | Admin Cancel Order | Cancel order by Order ID with confirmation |
| UC20 | View Feedback | `/admin/feedback` listing all feedbacks for delivered orders |

## Database Configuration

The application uses H2 database in file mode by default. The database file is stored at `./data/ecartdb.mv.db`.

To switch to PostgreSQL:

1. Update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecart
    username: your_username
    password: your_password
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

2. Add PostgreSQL dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Security

- JWT tokens are stored in localStorage (for development)
- Passwords are hashed using BCrypt
- Role-based access control (RBAC) with CUSTOMER and ADMIN roles
- Password policy: minimum 10 characters, at least one number, one uppercase letter, and one alphanumeric character
- Phone number validation: must not start with 0 and must include country code

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## Seed Data

The application automatically seeds the following data on startup:

- **Admin User**: username `admin`, password `admin123`
- **Demo Customer**: Customer ID `CUST-20240101-0001`, password `Demo123456`
- **Sample Products**: 5 products across different categories

## Notes

- Payment gateway is simulated for development purposes
- Invoice PDFs are generated using OpenPDF
- Cart is stored in-memory (consider Redis for production)
- All business validations are enforced both client-side and server-side

## License

This project is for educational/demonstration purposes.

