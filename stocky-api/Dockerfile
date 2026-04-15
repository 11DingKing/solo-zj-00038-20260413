FROM maven:3.9.6-eclipse-temurin-11 AS builder
WORKDIR /app
COPY pom.xml .
COPY stocky-api/pom.xml ./stocky-api/pom.xml
COPY stocky-web/pom.xml ./stocky-web/pom.xml
RUN mkdir -p /root/.m2 && echo '<settings><mirrors><mirror><id>aliyun</id><mirrorOf>central</mirrorOf><name>Aliyun Maven</name><url>https://maven.aliyun.com/repository/public</url></mirror></mirrors></settings>' > /root/.m2/settings.xml
RUN mvn dependency:go-offline -pl stocky-api
COPY stocky-api/src ./stocky-api/src
RUN mvn package -DskipTests -pl stocky-api

FROM eclipse-temurin:11-jre-jammy
WORKDIR /app
COPY --from=builder /app/stocky-api/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
