#!/bin/bash

# Script to run Kotlin scripts with dependencies
# This uses the kotlin-main-kts.jar which supports @file:DependsOn annotations

KOTLIN_MAIN_KTS_JAR=~/.kotlin/scripts/kotlin-main-kts.jar
SCRIPT_PATH=$1

if [ -z "$SCRIPT_PATH" ]; then
  echo "Usage: $0 <script-path>"
  exit 1
fi

if [ ! -f "$KOTLIN_MAIN_KTS_JAR" ]; then
  echo "kotlin-main-kts.jar not found at $KOTLIN_MAIN_KTS_JAR"
  echo "Downloading it now..."
  mkdir -p ~/.kotlin/scripts
  curl -L -o "$KOTLIN_MAIN_KTS_JAR" https://repo1.maven.org/maven2/org/jetbrains/kotlin/kotlin-main-kts/1.9.20/kotlin-main-kts-1.9.20.jar
fi

echo "Running Kotlin script with dependencies: $SCRIPT_PATH"
kotlin -cp "$KOTLIN_MAIN_KTS_JAR" "$SCRIPT_PATH"
