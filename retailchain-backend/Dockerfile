# backend/Dockerfile

# ========== BUILD STAGE (Maven with Eclipse Temurin JDK 21) ==========
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom and download dependencies to leverage layer caching
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline

# Copy source & build
COPY src ./src
RUN mvn -B -q -DskipTests package

# ========== RUN STAGE (runtime JRE 21) ==========
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
