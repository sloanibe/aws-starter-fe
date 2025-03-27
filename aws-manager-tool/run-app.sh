#!/bin/bash

# Simple script to run the AWS Manager Tool

echo "Building the application..."
mvn clean package

echo "Running the AWS Manager Tool..."
java \
  --module-path $(mvn dependency:build-classpath -Dmdep.outputFile=/dev/stdout -q | tr ":" ";"):/opt/javafx-sdk-21/lib \
  --add-modules javafx.controls,javafx.fxml \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  --add-exports javafx.graphics/com.sun.javafx.application=ALL-UNNAMED \
  -cp target/aws-manager-tool-0.1.0-jar-with-dependencies.jar \
  com.example.awsmanager.AwsManagerApplication
