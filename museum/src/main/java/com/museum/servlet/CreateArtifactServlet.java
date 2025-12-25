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

public class CreateArtifactServlet extends HttpServlet {
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
        
        String artifactName = request.getParameter("artifactName");
        String artifactCode = request.getParameter("artifactCode");
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
        Integer userId = (Integer) session.getAttribute("userId");
        
        // Validation
        if (artifactName == null || artifactName.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Artifact name is required");
            return;
        }
        
        if (artifactCode == null || artifactCode.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Artifact code is required");
            return;
        }
        
        if (category == null || category.trim().isEmpty()) {
            JsonUtil.sendErrorResponse(response, "Category is required");
            return;
        }
        
        if (artifactDAO.artifactCodeExists(artifactCode)) {
            JsonUtil.sendErrorResponse(response, "Artifact code already exists");
            return;
        }
        
        Artifact artifact = new Artifact();
        artifact.setArtifactName(artifactName.trim());
        artifact.setArtifactCode(artifactCode.trim().toUpperCase());
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
        
        artifact.setCreatedBy(userId);
        
        if (artifactDAO.createArtifact(artifact)) {
            JsonUtil.sendSuccessResponse(response, "Artifact created successfully");
        } else {
            JsonUtil.sendErrorResponse(response, "Failed to create artifact");
        }
    }
}

