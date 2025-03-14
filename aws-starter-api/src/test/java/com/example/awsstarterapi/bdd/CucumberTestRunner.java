package com.example.awsstarterapi.bdd;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.example.awsstarterapi.bdd.steps", "com.example.awsstarterapi.bdd.config"},
    plugin = {"pretty", "html:target/cucumber-reports"},
    objectFactory = io.cucumber.spring.SpringFactory.class
)
public class CucumberTestRunner {
    // This class is the entry point for running Cucumber tests with Serenity
}
