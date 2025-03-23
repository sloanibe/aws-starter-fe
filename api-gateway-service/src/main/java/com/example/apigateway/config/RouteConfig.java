package com.example.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // API Service routes
            .route("api-service-route", r -> r
                .path("/api/**")
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
