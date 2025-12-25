package com.museum.servlet;

import com.museum.dao.ArtifactDAO;
import com.museum.model.Artifact;
import com.museum.util.JsonUtil;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class DeleteArtifactServlet extends HttpServlet {
    private ArtifactDAO artifactDAO;
    
    @Override
    public void init() throws ServletException {
        super.init();
        artifactDAO = new ArtifactDAO();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            JsonUtil.sendErrorResponse(response, "Please login first");
            return;
        }
        
        String artifactIdStr = request.getParameter("artifactId");
        
        if (artifactIdStr == null || artifactIdStr.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Artifact ID is required");
            return;
        }
        
        try {
            int artifactId = Integer.parseInt(artifactIdStr);
            
            Artifact artifact = artifactDAO.getArtifactById(artifactId);
            if (artifact == null) {
                JsonUtil.sendErrorResponse(response, "Artifact not found");
                return;
            }
            
            if (artifactDAO.deleteArtifact(artifactId)) {
                JsonUtil.sendSuccessResponse(response, "Artifact deleted successfully");
            } else {
                JsonUtil.sendErrorResponse(response, "Failed to delete artifact");
            }
        } catch (NumberFormatException e) {
            JsonUtil.sendErrorResponse(response, "Invalid artifact ID");
        } catch (Exception e) {
            JsonUtil.sendErrorResponse(response, "Error deleting artifact: " + e.getMessage());
        }
    }
}

