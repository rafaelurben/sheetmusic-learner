FROM eclipse-temurin:25.0.3_9-jre

WORKDIR /app
COPY backend/target/backend-*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
