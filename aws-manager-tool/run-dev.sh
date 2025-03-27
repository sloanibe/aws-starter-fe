#!/bin/bash

# Build the project first
mvn clean package

# Run the application in development mode
java \
  --module-path $(mvn dependency:build-classpath -Dmdep.outputFile=/dev/stdout -q):target/classes \
  --add-modules javafx.controls,javafx.fxml,javafx.web \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  -Dgroovy.grape.enable=true \
  -cp target/classes:target/aws-manager-tool-0.1.0-jar-with-dependencies.jar \
  com.example.awsmanager.AwsManagerApplication --dev-mode
