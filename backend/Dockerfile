FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew .
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q 2>/dev/null || true
COPY src ./src
RUN ./gradlew bootJar --no-daemon -q

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
