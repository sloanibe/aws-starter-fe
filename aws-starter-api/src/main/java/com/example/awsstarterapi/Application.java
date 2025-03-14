package com.example.awsstarterapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.example.awsstarterapi.repository")
@ComponentScan(basePackages = "com.example.awsstarterapi")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
