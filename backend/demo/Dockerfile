# Etapa 1: Construcción
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copiamos el pom y descargamos dependencias para aprovechar la caché de Docker
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiamos el código fuente y compilamos el .jar
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Crear un usuario de sistema para no ejecutar como root (buenas prácticas DevOps)
RUN useradd -m legalyze
COPY --from=build /app/target/*.jar app.jar
RUN chown legalyze:legalyze app.jar

USER legalyze

# Puerto por defecto de Spring Boot
EXPOSE 8080

# Parámetros de optimización de memoria para entornos limitados
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]