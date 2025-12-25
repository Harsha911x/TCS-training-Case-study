package com.example.ecart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve product images from frontend assets folder
        String uploadPath = Paths.get("frontend/src/assets/products").toAbsolutePath().toString();
        registry.addResourceHandler("/assets/products/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}

