package com.example.awsstarterapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableMongoRepositories(basePackages = "com.example.awsstarterapi.repository")
public class AwsStarterApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AwsStarterApiApplication.class, args);
    }
}
