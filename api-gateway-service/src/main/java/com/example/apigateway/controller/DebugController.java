package com.example.apigateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DebugController {

    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugGet(ServerHttpRequest request) {
        return getDebugInfo(request, null);
    }

    @PostMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugPost(ServerHttpRequest request, @RequestBody(required = false) String body) {
        return getDebugInfo(request, body);
    }

    private ResponseEntity<Map<String, Object>> getDebugInfo(ServerHttpRequest request, String body) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        // Request path info
        debugInfo.put("path", request.getPath().toString());
        debugInfo.put("uri", request.getURI().toString());
        debugInfo.put("method", request.getMethod().toString());
        
        // Headers
        Map<String, String> headers = new HashMap<>();
        request.getHeaders().forEach((key, value) -> headers.put(key, value.toString()));
        debugInfo.put("headers", headers);
        
        // Request parameters
        Map<String, String> queryParams = new HashMap<>();
        request.getQueryParams().forEach((key, value) -> queryParams.put(key, value.toString()));
        debugInfo.put("queryParams", queryParams);
        
        // Body (if provided)
        if (body != null) {
            debugInfo.put("body", body);
        }
        
        // Log the debug info
        System.out.println("DEBUG REQUEST INFO: " + debugInfo);
        
        return ResponseEntity.ok(debugInfo);
    }
}
