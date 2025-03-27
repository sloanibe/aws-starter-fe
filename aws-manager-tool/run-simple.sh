#!/bin/bash

# Direct approach to run the JavaFX application

echo "Running the AWS Manager Tool..."
java \
  --module-path /opt/javafx-sdk-21/lib \
  --add-modules javafx.controls,javafx.fxml,javafx.web \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  --add-exports javafx.graphics/com.sun.javafx.application=ALL-UNNAMED \
  -jar target/aws-manager-tool-0.1.0-jar-with-dependencies.jar \
  --dev-mode
