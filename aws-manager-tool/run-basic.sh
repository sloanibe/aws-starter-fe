#!/bin/bash

# Basic approach to run the JavaFX application with only essential modules

echo "Running the AWS Manager Tool with basic configuration..."
java \
  --module-path /opt/javafx-sdk-21/lib \
  --add-modules javafx.controls,javafx.fxml \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  -jar target/aws-manager-tool-0.1.0-jar-with-dependencies.jar
