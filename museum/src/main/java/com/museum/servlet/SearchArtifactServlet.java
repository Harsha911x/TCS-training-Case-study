package com.museum.servlet;

import com.museum.dao.ArtifactDAO;
import com.museum.util.JsonUtil;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class SearchArtifactServlet extends HttpServlet {
    private ArtifactDAO artifactDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        artifactDAO = new ArtifactDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String searchTerm = request.getParameter("searchTerm");
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Search term is required");
            return;
        }
        
        try {
            var artifacts = artifactDAO.searchArtifacts(searchTerm.trim());
            JsonUtil.sendJsonResponse(response, artifacts);
        } catch (Exception e) {
            JsonUtil.sendErrorResponse(response, "Error searching artifacts: " + e.getMessage());
        }
    }
}

