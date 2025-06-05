# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-22 AS build

WORKDIR /app
# Copy Maven configuration and download dependencies (faster builds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the actual source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:22-jdk-alpine

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/server-0.0.1-SNAPSHOT.jar app.jar
ENV DATABASE_NAME=taskflow
ENV FRONTEND_URL=http://localhost:5173
ENV AI_URL=http://localhost:8000/schedule
ENV DATABASE_URL=mongodb+srv://halimchoukani3:Ako2wyG75dhERG33@taskflow.sawkq6l.mongodb.net/?retryWrites=true&w=majority&appName=taskflow
EXPOSE 8089

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
