package com.museum.servlet;

import com.museum.dao.ArtifactDAO;
import com.museum.util.JsonUtil;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ViewArtifactServlet extends HttpServlet {
    private ArtifactDAO artifactDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        artifactDAO = new ArtifactDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String artifactIdStr = request.getParameter("artifactId");
        
        if (artifactIdStr == null || artifactIdStr.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Artifact ID is required");
            return;
        }
        
        try {
            int artifactId = Integer.parseInt(artifactIdStr);
            var artifact = artifactDAO.getArtifactById(artifactId);
            
            if (artifact != null) {
                JsonUtil.sendJsonResponse(response, artifact);
            } else {
                JsonUtil.sendErrorResponse(response, "Artifact not found");
            }
        } catch (NumberFormatException e) {
            JsonUtil.sendErrorResponse(response, "Invalid artifact ID");
        } catch (Exception e) {
            JsonUtil.sendErrorResponse(response, "Error retrieving artifact: " + e.getMessage());
        }
    }
}

