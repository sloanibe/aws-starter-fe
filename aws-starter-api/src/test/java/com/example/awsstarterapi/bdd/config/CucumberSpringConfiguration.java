package com.example.awsstarterapi.bdd.config;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Configuration class for Cucumber tests with Spring Boot.
 * This class integrates Cucumber with Spring Boot for testing with the local MongoDB Docker container.
 */
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class CucumberSpringConfiguration {
    // This class configures the Spring context for Cucumber tests
}
