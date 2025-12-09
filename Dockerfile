FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/cinemox-1.0.0.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
