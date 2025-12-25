package com.museum.servlet;

import com.museum.dao.UserDAO;
import com.museum.model.User;
import com.museum.util.JsonUtil;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class RegisterServlet extends HttpServlet {
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        userDAO = new UserDAO();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String fullName = request.getParameter("fullName");
        String phone = request.getParameter("phone");
        String address = request.getParameter("address");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");
        
        // Validation
        if (username == null || username.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Username is required");
            return;
        }
        
        if (username.trim().length() < 3) {
            JsonUtil.sendErrorResponse(response, "Username must be at least 3 characters long");
            return;
        }
        
        if (email == null || email.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Email is required");
            return;
        }
        
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            JsonUtil.sendErrorResponse(response, "Invalid email format");
            return;
        }
        
        if (fullName == null || fullName.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Full name is required");
            return;
        }
        
        if (password == null || password.isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Password is required");
            return;
        }
        
        if (password.length() < 6) {
            JsonUtil.sendErrorResponse(response, "Password must be at least 6 characters long");
            return;
        }
        
        if (!password.equals(confirmPassword)) {
            JsonUtil.sendErrorResponse(response, "Passwords do not match");
            return;
        }
        
        if (userDAO.usernameExists(username)) {
            JsonUtil.sendErrorResponse(response, "Username already exists");
            return;
        }
        
        if (userDAO.emailExists(email)) {
            JsonUtil.sendErrorResponse(response, "Email already exists");
            return;
        }
        
        User user = new User(username, password, email, fullName, phone, address, "USER");
        
        if (userDAO.registerUser(user)) {
            JsonUtil.sendSuccessResponse(response, "Registration successful! Please login.");
        } else {
            JsonUtil.sendErrorResponse(response, "Registration failed. Please try again.");
        }
    }
}

