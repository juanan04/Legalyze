# Legalyze

Legalyze es una herramienta avanzada de análisis de documentos legales impulsada por Inteligencia Artificial. Diseñada para facilitar la revisión y comprensión de textos jurídicos complejos, Legalyze combina una interfaz moderna con un potente backend para extraer, resumir y analizar información clave de documentos PDF.

## Tecnologías Utilizadas

Este proyecto está construido con un stack tecnológico moderno y robusto:

### Frontend

- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Cliente HTTP**: Axios
- **Enrutamiento**: React Router DOM

### Backend

- **Framework**: [Spring Boot](https://spring.io/projects/spring-boot) (v3.x / v4.0.0 milestone)
- **Lenguaje**: Java 21
- **Base de Datos**: MariaDB
- **ORM**: Hibernate / Spring Data JPA
- **Seguridad**: Spring Security + JWT
- **IA**: OpenAI API (integración nativa y cliente oficial)
- **Procesamiento de PDF**: Apache PDFBox
- **Emails**: Resend

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (v18 o superior) y npm
- **Java JDK 21**
- **MariaDB** (o un servidor MySQL compatible)
- Una cuenta y API Key de **OpenAI**
- Una cuenta y API Key de **Resend** (para notificaciones por correo)

## Configuración e Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Legalyze
```

### 2. Configuración del Backend

El backend se encuentra en la carpeta `backend/demo`.

1.  Navega al directorio del backend:

    ```bash
    cd backend/demo
    ```

2.  Configura las variables de entorno. Puedes crear un archivo `.env` en la raíz de `backend/demo` o configurar las variables en tu entorno de sistema. El archivo `application.yml` espera las siguientes variables:

    | Variable            | Descripción                              | Ejemplo                                     |
    | :------------------ | :--------------------------------------- | :------------------------------------------ |
    | `DB_URL`            | URL de conexión JDBC a MariaDB           | `jdbc:mariadb://localhost:3306/legalyze_db` |
    | `DB_USERNAME`       | Usuario de la base de datos              | `root`                                      |
    | `DB_PASSWORD`       | Contraseña de la base de datos           | `password`                                  |
    | `JWT_SECRET`        | Clave secreta para firmar tokens JWT     | `una_clave_muy_secreta_y_larga_para_jwt`    |
    | `JWT_EXPIRATION_MS` | Tiempo de expiración del token (ms)      | `86400000` (1 día)                          |
    | `OPENAI_API_KEY`    | Tu API Key de OpenAI                     | `sk-...`                                    |
    | `RESEND_API_KEY`    | Tu API Key de Resend                     | `re_...`                                    |
    | `RESEND_FROM_EMAIL` | Remitente de correo verificado en Resend | `onboarding@resend.dev`                     |

3.  Ejecuta la aplicación usando Maven Wrapper:
    - **Windows**:
      ```powershell
      ./mvnw spring-boot:run
      ```
    - **Linux/Mac**:
      ```bash
      ./mvnw spring-boot:run
      ```

El backend iniciará en el puerto `8080`.

### 3. Configuración del Frontend

El frontend se encuentra en la carpeta `frontend`.

1.  Navega al directorio del frontend (desde la raíz del proyecto):

    ```bash
    cd frontend
    ```

2.  Instala las dependencias:

    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

La aplicación estará disponible generalmente en `http://localhost:5173`.

## Estructura del Proyecto

- `/backend`: Contiene el código fuente de la API Java/Spring Boot.
  - `/demo`: Proyecto principal de Spring Boot.
- `/frontend`: Contiene el código fuente de la aplicación React.

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para mejoras y correcciones.
