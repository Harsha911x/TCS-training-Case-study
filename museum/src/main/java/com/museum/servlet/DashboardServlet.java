package com.museum.servlet;

import com.museum.dao.ArtifactDAO;
import com.museum.util.JsonUtil;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class DashboardServlet extends HttpServlet {
    private ArtifactDAO artifactDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        artifactDAO = new ArtifactDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect("login.html");
            return;
        }
        
        try {
            var artifacts = artifactDAO.getAllArtifacts();
            JsonUtil.sendJsonResponse(response, artifacts);
        } catch (Exception e) {
            JsonUtil.sendErrorResponse(response, "Error loading artifacts: " + e.getMessage());
        }
    }
}

