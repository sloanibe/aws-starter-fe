import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.9.0"
    application
}

group = "com.example"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("software.amazon.awscdk:aws-cdk-lib:2.89.0")
    implementation("software.constructs:constructs:10.2.70")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "17"
}

application {
    mainClass.set("com.example.infra.AwsStarterAppKt")
}

tasks.register<Exec>("cdk") {
    dependsOn("build")
    commandLine("npx", "cdk", *args.toList().toTypedArray())
    workingDir("${projectDir}")
}
