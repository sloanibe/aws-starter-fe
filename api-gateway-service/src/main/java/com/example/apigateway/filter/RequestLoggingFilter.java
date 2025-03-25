package com.example.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;

@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {
    // This static initialization block will help verify if the class is loaded
    static {
        System.out.println("RequestLoggingFilter initialized");
    }

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Log to both system out and logger to ensure visibility
        System.out.println("=== DETAILED REQUEST INFORMATION ===");
        logger.info("=== DETAILED REQUEST INFORMATION ===");
        
        System.out.println("Request ID: " + request.getId());
        logger.info("Request ID: {}", request.getId());
        
        System.out.println("Method: " + request.getMethod());
        logger.info("Method: {}", request.getMethod());
        
        System.out.println("Path: " + request.getPath());
        logger.info("Path: {}", request.getPath());
        
        System.out.println("URI: " + request.getURI());
        logger.info("URI: {}", request.getURI());
        
        try {
            System.out.println("URL: " + request.getURI().toURL());
            logger.info("URL: {}", request.getURI().toURL());
        } catch (java.net.MalformedURLException e) {
            System.out.println("Error converting URI to URL: " + e.getMessage());
            logger.error("Error converting URI to URL: {}", e.getMessage());
        }
        
        System.out.println("Query Parameters: " + request.getQueryParams());
        logger.info("Query Parameters: {}", request.getQueryParams());
        
        // Log headers
        System.out.println("=== REQUEST HEADERS ===");
        logger.info("=== REQUEST HEADERS ===");
        request.getHeaders().forEach((name, values) -> {
            System.out.println("Header '" + name + "': " + values);
            logger.info("Header '{}': {}", name, values);
        });
        
        // Log request attributes
        System.out.println("=== REQUEST ATTRIBUTES ===");
        logger.info("=== REQUEST ATTRIBUTES ===");
        for (Map.Entry<String, Object> entry : exchange.getAttributes().entrySet()) {
            System.out.println("Attribute '" + entry.getKey() + "': " + entry.getValue());
            logger.info("Attribute '{}': {}", entry.getKey(), entry.getValue());
        }
        
        // Log the request body if it exists
        return DataBufferUtils.join(exchange.getRequest().getBody())
            .flatMap(dataBuffer -> {
                byte[] bytes = new byte[dataBuffer.readableByteCount()];
                dataBuffer.read(bytes);
                DataBufferUtils.release(dataBuffer);
                
                String bodyContent = new String(bytes, StandardCharsets.UTF_8);
                System.out.println("=== REQUEST BODY ===");
                System.out.println(bodyContent);
                logger.info("=== REQUEST BODY ===");
                logger.info(bodyContent);
                
                // Re-create the request with the body
                ServerHttpRequest mutatedRequest = new ServerHttpRequestDecorator(exchange.getRequest()) {
                    @Override
                    public reactor.core.publisher.Flux<DataBuffer> getBody() {
                        return reactor.core.publisher.Flux.just(exchange.getResponse().bufferFactory().wrap(bytes));
                    }
                };
                
                // Continue the filter chain with the new exchange
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            })
            .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        // Set a high precedence to ensure this filter runs first
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
