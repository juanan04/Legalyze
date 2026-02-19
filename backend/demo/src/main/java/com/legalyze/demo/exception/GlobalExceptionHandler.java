package com.legalyze.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

import com.legalyze.demo.dto.ErrorResponse;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(new ErrorResponse("Credenciales incorrectas", "AUTH_ERROR"));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse(ex.getMessage(), "BAD_REQUEST"));
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
                if ("INSUFFICIENT_CREDITS".equals(ex.getMessage())) {
                        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                                        .body(new ErrorResponse("No tienes créditos suficientes",
                                                        "INSUFFICIENT_CREDITS"));
                }
                if ("GONE".equals(ex.getMessage())) {
                        return ResponseEntity.status(HttpStatus.GONE)
                                        .body(new ErrorResponse("El contrato ha expirado y ha sido eliminado",
                                                        "CONTRACT_EXPIRED"));
                }
                if ("User is suspended".equals(ex.getMessage())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(new ErrorResponse("Tu cuenta está suspendida", "USER_SUSPENDED"));
                }
                ex.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(new ErrorResponse("Ha ocurrido un error inesperado: " + ex.getMessage(),
                                                "INTERNAL_ERROR"));
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
                if ("NO_CREDITS".equals(ex.getMessage())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(new ErrorResponse(
                                                        "No tienes créditos suficientes para realizar esta acción",
                                                        "NO_CREDITS"));
                }
                if ("EMAIL_NOT_VERIFIED".equals(ex.getMessage())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(new ErrorResponse(
                                                        "Debes verificar tu correo electrónico para realizar esta acción",
                                                        "EMAIL_NOT_VERIFIED"));
                }
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse(ex.getMessage(), "BAD_REQUEST"));
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
                if (ex.getMessage().contains("users_email_key") || ex.getMessage().contains("constraint")) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(new ErrorResponse("El correo electrónico ya está registrado",
                                                        "EMAIL_EXISTS"));
                }
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse("Error de integridad de datos", "DATA_INTEGRITY"));
        }

        @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationExceptions(
                        org.springframework.web.bind.MethodArgumentNotValidException ex) {
                String errorMessage = ex.getBindingResult().getAllErrors().stream()
                                .findFirst()
                                .map(error -> error.getDefaultMessage())
                                .orElse("Error de validación");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse(errorMessage, "VALIDATION_ERROR"));
        }

        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<ErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException exc) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse("El archivo es demasiado grande. El límite máximo es 15MB.",
                                                "FILE_TOO_LARGE"));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
                ex.printStackTrace(); // Log for debugging
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(new ErrorResponse("Ha ocurrido un error inesperado", "INTERNAL_ERROR"));
        }
}
