package com.example.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Login Service routes - using Eureka service discovery
            .route("login-service-route", r -> r
                .path("/api/login")
                .filters(f -> f
                    .rewritePath("/api/login", "/login")
                    .addResponseHeader("X-Gateway-Source", "spring-cloud-gateway"))
                .uri("lb://LOGIN-SERVICE"))
                
            // Test endpoint route - using Eureka service discovery
            .route("test-endpoint-route", r -> r
                .path("/api/test")
                .filters(f -> f
                    .rewritePath("/api/test", "/test")
                    .addResponseHeader("X-Gateway-Source", "spring-cloud-gateway"))
                .uri("lb://LOGIN-SERVICE"))
                
            // API Service routes - exclude login path
            .route("api-service-route", r -> r
                .path("/api/**")
                .and()
                .not(p -> p.path("/api/login"))
                .filters(f -> f
                    .rewritePath("/api/(?<segment>.*)", "/${segment}")
                    .addResponseHeader("X-Gateway-Source", "spring-cloud-gateway"))
                .uri("lb://api-service"))
                
            // Future Auth Service routes
            .route("auth-service-route", r -> r
                .path("/auth/**")
                .filters(f -> f
                    .rewritePath("/auth/(?<segment>.*)", "/${segment}")
                    .addResponseHeader("X-Gateway-Source", "spring-cloud-gateway"))
                .uri("lb://auth-service"))
                
            // Future Dashboard Service routes
            .route("dashboard-service-route", r -> r
                .path("/dashboard/**")
                .filters(f -> f
                    .rewritePath("/dashboard/(?<segment>.*)", "/${segment}")
                    .addResponseHeader("X-Gateway-Source", "spring-cloud-gateway"))
                .uri("lb://dashboard-service"))
                
            // Fallback route for undefined paths
            .route("fallback-route", r -> r
                .path("/**")
                .filters(f -> f
                    .setStatus(404)
                    .setResponseHeader("Content-Type", "application/json"))
                .uri("no://op"))
            .build();
    }
}
