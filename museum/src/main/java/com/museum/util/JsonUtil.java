package com.museum.util;

import com.museum.model.Artifact;
import com.museum.model.User;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.List;

public class JsonUtil {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    public static void sendJsonResponse(HttpServletResponse response, String json) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
    
    public static void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        String json = "{\"success\":true,\"message\":\"" + escapeJson(message) + "\"}";
        sendJsonResponse(response, json);
    }
    
    public static void sendErrorResponse(HttpServletResponse response, String error) throws IOException {
        String json = "{\"success\":false,\"error\":\"" + escapeJson(error) + "\"}";
        sendJsonResponse(response, json);
    }
    
    public static void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        String json = "{\"success\":true,\"data\":" + toJson(data) + "}";
        sendJsonResponse(response, json);
    }
    
    public static String toJson(Object obj) {
        if (obj == null) return "null";
        
        if (obj instanceof List) return listToJson((List<?>) obj);
        if (obj instanceof Artifact) return artifactToJson((Artifact) obj);
        if (obj instanceof User) return userToJson((User) obj);
        if (obj instanceof String) return "\"" + escapeJson((String) obj) + "\"";
        if (obj instanceof Number || obj instanceof Boolean) return obj.toString();
        
        return "\"" + escapeJson(obj.toString()) + "\"";
    }
    
    private static String listToJson(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }
    
    private static String artifactToJson(Artifact artifact) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"artifactId\":").append(artifact.getArtifactId()).append(",");
        sb.append("\"artifactName\":\"").append(escapeJson(artifact.getArtifactName())).append("\",");
        sb.append("\"artifactCode\":\"").append(escapeJson(artifact.getArtifactCode())).append("\",");
        sb.append("\"category\":\"").append(escapeJson(artifact.getCategory())).append("\",");
        sb.append("\"description\":").append(artifact.getDescription() != null ? "\"" + escapeJson(artifact.getDescription()) + "\"" : "null").append(",");
        sb.append("\"period\":").append(artifact.getPeriod() != null ? "\"" + escapeJson(artifact.getPeriod()) + "\"" : "null").append(",");
        sb.append("\"origin\":").append(artifact.getOrigin() != null ? "\"" + escapeJson(artifact.getOrigin()) + "\"" : "null").append(",");
        sb.append("\"material\":").append(artifact.getMaterial() != null ? "\"" + escapeJson(artifact.getMaterial()) + "\"" : "null").append(",");
        sb.append("\"dimensions\":").append(artifact.getDimensions() != null ? "\"" + escapeJson(artifact.getDimensions()) + "\"" : "null").append(",");
        sb.append("\"conditionStatus\":").append(artifact.getConditionStatus() != null ? "\"" + escapeJson(artifact.getConditionStatus()) + "\"" : "null").append(",");
        sb.append("\"acquisitionDate\":").append(artifact.getAcquisitionDate() != null ? "\"" + artifact.getAcquisitionDate().toString() + "\"" : "null").append(",");
        sb.append("\"acquisitionMethod\":").append(artifact.getAcquisitionMethod() != null ? "\"" + escapeJson(artifact.getAcquisitionMethod()) + "\"" : "null").append(",");
        sb.append("\"location\":").append(artifact.getLocation() != null ? "\"" + escapeJson(artifact.getLocation()) + "\"" : "null").append(",");
        sb.append("\"value\":").append(artifact.getValue() != null ? artifact.getValue() : "null").append(",");
        sb.append("\"createdBy\":").append(artifact.getCreatedBy() != null ? artifact.getCreatedBy() : "null").append(",");
        sb.append("\"createdAt\":\"").append(formatDate(artifact.getCreatedAt())).append("\",");
        sb.append("\"updatedAt\":\"").append(formatDate(artifact.getUpdatedAt())).append("\"");
        sb.append("}");
        return sb.toString();
    }
    
    private static String userToJson(User user) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"userId\":").append(user.getUserId()).append(",");
        sb.append("\"username\":\"").append(escapeJson(user.getUsername())).append("\",");
        sb.append("\"email\":\"").append(escapeJson(user.getEmail())).append("\",");
        sb.append("\"fullName\":\"").append(escapeJson(user.getFullName())).append("\",");
        sb.append("\"phone\":").append(user.getPhone() != null ? "\"" + escapeJson(user.getPhone()) + "\"" : "null").append(",");
        sb.append("\"address\":").append(user.getAddress() != null ? "\"" + escapeJson(user.getAddress()) + "\"" : "null").append(",");
        sb.append("\"role\":\"").append(escapeJson(user.getRole())).append("\",");
        sb.append("\"createdAt\":\"").append(formatDate(user.getCreatedAt())).append("\"");
        sb.append("}");
        return sb.toString();
    }
    
    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
    
    private static String formatDate(Timestamp timestamp) {
        if (timestamp == null) return "";
        return dateFormat.format(timestamp);
    }
}