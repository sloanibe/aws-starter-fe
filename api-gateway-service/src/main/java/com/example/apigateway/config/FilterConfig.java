package com.example.apigateway.config;

import com.example.apigateway.filter.RequestLoggingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to explicitly register filters with Spring Cloud Gateway
 */
@Configuration
public class FilterConfig {

    /**
     * Explicitly register the RequestLoggingFilter as a bean
     * This ensures it's properly detected by Spring Cloud Gateway
     */
    @Bean
    public RequestLoggingFilter requestLoggingFilter() {
        System.out.println("Registering RequestLoggingFilter bean");
        return new RequestLoggingFilter();
    }
}
