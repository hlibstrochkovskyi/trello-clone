# --- STAGE 1: BUILD ---
# Use Maven image with Java 17 (as in your pom.xml) for compilation
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory inside the container
WORKDIR /app

# Copy pom.xml and download dependencies (this is cached)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the .jar file, skipping tests
RUN mvn clean package -DskipTests

# --- STAGE 2: RUN ---
# Use minimal Java 17 JRE image (for runtime only)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the .jar file built in STAGE 1
# (target/trello-clone-1.0-SNAPSHOT.jar)
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]