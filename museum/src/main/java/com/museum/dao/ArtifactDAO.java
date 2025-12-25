package com.museum.dao;

import com.museum.model.Artifact;
import com.museum.util.DatabaseConnection;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ArtifactDAO {
    
    public boolean createArtifact(Artifact artifact) {
        String sql = "INSERT INTO artifacts (artifact_name, artifact_code, category, description, " +
                     "period, origin, material, dimensions, condition_status, acquisition_date, " +
                     "acquisition_method, location, value, created_by) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, artifact.getArtifactName());
            pstmt.setString(2, artifact.getArtifactCode());
            pstmt.setString(3, artifact.getCategory());
            pstmt.setString(4, artifact.getDescription());
            pstmt.setString(5, artifact.getPeriod());
            pstmt.setString(6, artifact.getOrigin());
            pstmt.setString(7, artifact.getMaterial());
            pstmt.setString(8, artifact.getDimensions());
            pstmt.setString(9, artifact.getConditionStatus());
            if (artifact.getAcquisitionDate() != null) {
                pstmt.setDate(10, artifact.getAcquisitionDate());
            } else {
                pstmt.setNull(10, Types.DATE);
            }
            pstmt.setString(11, artifact.getAcquisitionMethod());
            pstmt.setString(12, artifact.getLocation());
            if (artifact.getValue() != null) {
                pstmt.setBigDecimal(13, artifact.getValue());
            } else {
                pstmt.setNull(13, Types.DECIMAL);
            }
            if (artifact.getCreatedBy() != null) {
                pstmt.setInt(14, artifact.getCreatedBy());
            } else {
                pstmt.setNull(14, Types.INTEGER);
            }
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error creating artifact: " + e.getMessage());
            return false;
        }
    }
    
    public Artifact getArtifactById(int artifactId) {
        String sql = "SELECT * FROM artifacts WHERE artifact_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, artifactId);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToArtifact(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting artifact: " + e.getMessage());
        }
        
        return null;
    }
    
    public Artifact getArtifactByCode(String artifactCode) {
        String sql = "SELECT * FROM artifacts WHERE artifact_code = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, artifactCode);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToArtifact(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting artifact by code: " + e.getMessage());
        }
        
        return null;
    }
    
    public List<Artifact> searchArtifacts(String searchTerm) {
        List<Artifact> artifacts = new ArrayList<>();
        String sql = "SELECT * FROM artifacts WHERE " +
                     "LOWER(artifact_name) LIKE ? OR " +
                     "LOWER(artifact_code) LIKE ? OR " +
                     "LOWER(category) LIKE ? OR " +
                     "LOWER(description) LIKE ? OR " +
                     "LOWER(period) LIKE ? OR " +
                     "LOWER(origin) LIKE ? OR " +
                     "LOWER(material) LIKE ? OR " +
                     "LOWER(location) LIKE ? " +
                     "ORDER BY artifact_name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            String searchPattern = "%" + searchTerm.toLowerCase() + "%";
            for (int i = 1; i <= 8; i++) {
                pstmt.setString(i, searchPattern);
            }
            
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                artifacts.add(mapResultSetToArtifact(rs));
            }
            
        } catch (SQLException e) {
            System.err.println("Error searching artifacts: " + e.getMessage());
        }
        
        return artifacts;
    }
    
    public List<Artifact> getAllArtifacts() {
        List<Artifact> artifacts = new ArrayList<>();
        String sql = "SELECT * FROM artifacts ORDER BY artifact_name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                artifacts.add(mapResultSetToArtifact(rs));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting all artifacts: " + e.getMessage());
        }
        
        return artifacts;
    }
    
    public boolean updateArtifact(Artifact artifact) {
        String sql = "UPDATE artifacts SET artifact_name = ?, category = ?, description = ?, " +
                     "period = ?, origin = ?, material = ?, dimensions = ?, condition_status = ?, " +
                     "acquisition_date = ?, acquisition_method = ?, location = ?, value = ?, " +
                     "updated_at = CURRENT_TIMESTAMP WHERE artifact_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, artifact.getArtifactName());
            pstmt.setString(2, artifact.getCategory());
            pstmt.setString(3, artifact.getDescription());
            pstmt.setString(4, artifact.getPeriod());
            pstmt.setString(5, artifact.getOrigin());
            pstmt.setString(6, artifact.getMaterial());
            pstmt.setString(7, artifact.getDimensions());
            pstmt.setString(8, artifact.getConditionStatus());
            if (artifact.getAcquisitionDate() != null) {
                pstmt.setDate(9, artifact.getAcquisitionDate());
            } else {
                pstmt.setNull(9, Types.DATE);
            }
            pstmt.setString(10, artifact.getAcquisitionMethod());
            pstmt.setString(11, artifact.getLocation());
            if (artifact.getValue() != null) {
                pstmt.setBigDecimal(12, artifact.getValue());
            } else {
                pstmt.setNull(12, Types.DECIMAL);
            }
            pstmt.setInt(13, artifact.getArtifactId());
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error updating artifact: " + e.getMessage());
            return false;
        }
    }
    
    public boolean deleteArtifact(int artifactId) {
        String sql = "DELETE FROM artifacts WHERE artifact_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, artifactId);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error deleting artifact: " + e.getMessage());
            return false;
        }
    }
    
    public boolean artifactCodeExists(String artifactCode) {
        String sql = "SELECT COUNT(*) FROM artifacts WHERE artifact_code = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, artifactCode);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error checking artifact code: " + e.getMessage());
        }
        
        return false;
    }
    
    private Artifact mapResultSetToArtifact(ResultSet rs) throws SQLException {
        Artifact artifact = new Artifact();
        artifact.setArtifactId(rs.getInt("artifact_id"));
        artifact.setArtifactName(rs.getString("artifact_name"));
        artifact.setArtifactCode(rs.getString("artifact_code"));
        artifact.setCategory(rs.getString("category"));
        artifact.setDescription(rs.getString("description"));
        artifact.setPeriod(rs.getString("period"));
        artifact.setOrigin(rs.getString("origin"));
        artifact.setMaterial(rs.getString("material"));
        artifact.setDimensions(rs.getString("dimensions"));
        artifact.setConditionStatus(rs.getString("condition_status"));
        artifact.setAcquisitionDate(rs.getDate("acquisition_date"));
        artifact.setAcquisitionMethod(rs.getString("acquisition_method"));
        artifact.setLocation(rs.getString("location"));
        BigDecimal value = rs.getBigDecimal("value");
        if (value != null) {
            artifact.setValue(value);
        }
        int createdBy = rs.getInt("created_by");
        if (!rs.wasNull()) {
            artifact.setCreatedBy(createdBy);
        }
        artifact.setCreatedAt(rs.getTimestamp("created_at"));
        artifact.setUpdatedAt(rs.getTimestamp("updated_at"));
        return artifact;
    }
}

