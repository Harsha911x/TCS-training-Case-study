package com.museum.model;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

public class Artifact {
    private int artifactId;
    private String artifactName;
    private String artifactCode;
    private String category;
    private String description;
    private String period;
    private String origin;
    private String material;
    private String dimensions;
    private String conditionStatus;
    private Date acquisitionDate;
    private String acquisitionMethod;
    private String location;
    private BigDecimal value;
    private Integer createdBy;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    public Artifact() {}
    
    // Getters and Setters
    public int getArtifactId() {
        return artifactId;
    }
    
    public void setArtifactId(int artifactId) {
        this.artifactId = artifactId;
    }
    
    public String getArtifactName() {
        return artifactName;
    }
    
    public void setArtifactName(String artifactName) {
        this.artifactName = artifactName;
    }
    
    public String getArtifactCode() {
        return artifactCode;
    }
    
    public void setArtifactCode(String artifactCode) {
        this.artifactCode = artifactCode;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public String getOrigin() {
        return origin;
    }
    
    public void setOrigin(String origin) {
        this.origin = origin;
    }
    
    public String getMaterial() {
        return material;
    }
    
    public void setMaterial(String material) {
        this.material = material;
    }
    
    public String getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }
    
    public String getConditionStatus() {
        return conditionStatus;
    }
    
    public void setConditionStatus(String conditionStatus) {
        this.conditionStatus = conditionStatus;
    }
    
    public Date getAcquisitionDate() {
        return acquisitionDate;
    }
    
    public void setAcquisitionDate(Date acquisitionDate) {
        this.acquisitionDate = acquisitionDate;
    }
    
    public String getAcquisitionMethod() {
        return acquisitionMethod;
    }
    
    public void setAcquisitionMethod(String acquisitionMethod) {
        this.acquisitionMethod = acquisitionMethod;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public BigDecimal getValue() {
        return value;
    }
    
    public void setValue(BigDecimal value) {
        this.value = value;
    }
    
    public Integer getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}

