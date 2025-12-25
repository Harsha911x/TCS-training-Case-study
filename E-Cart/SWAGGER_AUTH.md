# Swagger UI Authentication Guide

## Accessing Swagger UI

1. Start the backend server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Open Swagger UI in your browser:
   ```
   http://localhost:8080/api/swagger-ui.html
   ```

## Viewing Database Tables

### Option 1: Using H2 Console

1. Access H2 Console:
   ```
   http://localhost:8080/api/h2-console
   ```

2. Connection Settings:
   - JDBC URL: `jdbc:h2:file:./data/ecartdb`
   - Username: `sa`
   - Password: (leave empty)
   - Click "Connect"

3. View Tables:
   - You can now run SQL queries to view all tables
   - Example: `SELECT * FROM customers;`

### Option 2: Using Swagger UI with Authentication

1. **Get JWT Token:**
   - In Swagger UI, find the `/api/auth/customer/login` endpoint
   - Click "Try it out"
   - Use demo credentials:
     - Customer ID: `CUST-20240101-0001`
     - Password: `Demo123456`
   - Click "Execute"
   - Copy the `token` from the response

2. **Authenticate in Swagger:**
   - Click the "Authorize" button (lock icon) at the top of Swagger UI
   - Enter: `Bearer <your-token-here>`
   - Click "Authorize"
   - Click "Close"

3. **Access Protected Endpoints:**
   - Now you can test all protected endpoints
   - All requests will include the JWT token automatically

## Default Credentials

### Customer
- Customer ID: `CUST-20240101-0001`
- Password: `Demo123456`

### Admin
- Username: `admin`
- Password: `admin123`

## Testing API Endpoints

After authentication, you can:
- View all products
- View customer details
- View orders
- Test all CRUD operations

## Notes

- JWT tokens expire after 24 hours (configurable in `application.yml`)
- To refresh, simply login again to get a new token
- The H2 database file is stored at `./data/ecartdb.mv.db` in the backend directory

