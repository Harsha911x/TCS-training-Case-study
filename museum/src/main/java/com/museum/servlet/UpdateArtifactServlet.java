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
import java.math.BigDecimal;
import java.sql.Date;

public class UpdateArtifactServlet extends HttpServlet {
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
        String artifactName = request.getParameter("artifactName");
        String category = request.getParameter("category");
        String description = request.getParameter("description");
        String period = request.getParameter("period");
        String origin = request.getParameter("origin");
        String material = request.getParameter("material");
        String dimensions = request.getParameter("dimensions");
        String conditionStatus = request.getParameter("conditionStatus");
        String acquisitionDateStr = request.getParameter("acquisitionDate");
        String acquisitionMethod = request.getParameter("acquisitionMethod");
        String location = request.getParameter("location");
        String valueStr = request.getParameter("value");
        
        // Validation
        if (artifactIdStr == null || artifactIdStr.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Artifact ID is required");
            return;
        }
        
        int artifactId;
        try {
            artifactId = Integer.parseInt(artifactIdStr);
        } catch (NumberFormatException e) {
            JsonUtil.sendErrorResponse(response, "Invalid artifact ID");
            return;
        }
        
        Artifact existingArtifact = artifactDAO.getArtifactById(artifactId);
        if (existingArtifact == null) {
            JsonUtil.sendErrorResponse(response, "Artifact not found");
            return;
        }
        
        if (artifactName == null || artifactName.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Artifact name is required");
            return;
        }
        
        if (category == null || category.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Category is required");
            return;
        }
        
        Artifact artifact = new Artifact();
        artifact.setArtifactId(artifactId);
        artifact.setArtifactName(artifactName.trim());
        artifact.setArtifactCode(existingArtifact.getArtifactCode()); // Code cannot be changed
        artifact.setCategory(category.trim());
        artifact.setDescription(description != null ? description.trim() : null);
        artifact.setPeriod(period != null ? period.trim() : null);
        artifact.setOrigin(origin != null ? origin.trim() : null);
        artifact.setMaterial(material != null ? material.trim() : null);
        artifact.setDimensions(dimensions != null ? dimensions.trim() : null);
        artifact.setConditionStatus(conditionStatus != null ? conditionStatus.trim() : null);
        
        if (acquisitionDateStr != null && !acquisitionDateStr.trim().isEmpty()) {
            try {
                artifact.setAcquisitionDate(Date.valueOf(acquisitionDateStr));
            } catch (IllegalArgumentException e) {
                JsonUtil.sendErrorResponse(response, "Invalid acquisition date format. Use YYYY-MM-DD");
                return;
            }
        }
        
        artifact.setAcquisitionMethod(acquisitionMethod != null ? acquisitionMethod.trim() : null);
        artifact.setLocation(location != null ? location.trim() : null);
        
        if (valueStr != null && !valueStr.trim().isEmpty()) {
            try {
                artifact.setValue(new BigDecimal(valueStr));
            } catch (NumberFormatException e) {
                JsonUtil.sendErrorResponse(response, "Invalid value format");
                return;
            }
        }
        
        if (artifactDAO.updateArtifact(artifact)) {
            JsonUtil.sendSuccessResponse(response, "Artifact updated successfully");
        } else {
            JsonUtil.sendErrorResponse(response, "Failed to update artifact");
        }
    }
}

