FROM maven:3.9.11-eclipse-temurin-25 AS build

WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY openapi.yml openapi.yml

RUN mvn -B -f backend/pom.xml -DskipTests package \
    && cp backend/target/backend-*.jar /workspace/app.jar

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /workspace/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
