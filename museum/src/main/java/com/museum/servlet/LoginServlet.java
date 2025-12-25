package com.museum.servlet;

import com.museum.dao.UserDAO;
import com.museum.model.User;
import com.museum.util.JsonUtil;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class LoginServlet extends HttpServlet {
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
        String password = request.getParameter("password");
        
        // Validation
        if (username == null || username.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Username is required");
            return;
        }
        
        if (password == null || password.isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Password is required");
            return;
        }
        
        User user = userDAO.loginUser(username, password);
        
        if (user != null) {
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("role", user.getRole());
            JsonUtil.sendSuccessResponse(response, "Login successful");
        } else {
            JsonUtil.sendErrorResponse(response, "Invalid username or password");
        }
    }
}

