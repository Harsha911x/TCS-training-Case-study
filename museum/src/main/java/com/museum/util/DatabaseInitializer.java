package com.museum.util;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.SQLException;

public class DatabaseInitializer extends HttpServlet {
    
    @Override
    public void init() throws ServletException {
        super.init();
        initializeDatabase();
    }
    
    private void initializeDatabase() {
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Create Users table
            String createUsersTable = "CREATE TABLE users (" +
                    "user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1), " +
                    "username VARCHAR(50) UNIQUE NOT NULL, " +
                    "password VARCHAR(255) NOT NULL, " +
                    "email VARCHAR(100) UNIQUE NOT NULL, " +
                    "full_name VARCHAR(100) NOT NULL, " +
                    "phone VARCHAR(20), " +
                    "address VARCHAR(255), " +
                    "role VARCHAR(20) DEFAULT 'USER', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")";
            
            // Create Artifacts table
            String createArtifactsTable = "CREATE TABLE artifacts (" +
                    "artifact_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1), " +
                    "artifact_name VARCHAR(200) NOT NULL, " +
                    "artifact_code VARCHAR(50) UNIQUE NOT NULL, " +
                    "category VARCHAR(100) NOT NULL, " +
                    "description VARCHAR(1000), " +
                    "period VARCHAR(100), " +
                    "origin VARCHAR(200), " +
                    "material VARCHAR(200), " +
                    "dimensions VARCHAR(100), " +
                    "condition_status VARCHAR(50), " +
                    "acquisition_date DATE, " +
                    "acquisition_method VARCHAR(100), " +
                    "location VARCHAR(200), " +
                    "value DECIMAL(15,2), " +
                    "created_by INT, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL" +
                    ")";
            
            try {
                stmt.execute(createUsersTable);
                System.out.println("Users table created successfully");
            } catch (SQLException e) {
                if (e.getSQLState().equals("X0Y32")) {
                    System.out.println("Users table already exists");
                } else {
                    throw e;
                }
            }
            
            try {
                stmt.execute(createArtifactsTable);
                System.out.println("Artifacts table created successfully");
            } catch (SQLException e) {
                if (e.getSQLState().equals("X0Y32")) {
                    System.out.println("Artifacts table already exists");
                } else {
                    throw e;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Database initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

