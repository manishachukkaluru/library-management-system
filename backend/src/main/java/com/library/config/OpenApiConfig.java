package com.library.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger / OpenAPI 3 configuration.
 * Provides JWT Bearer token authentication in Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url("http://localhost:8080/api").description("Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token below. Obtain it from POST /auth/login")
                        )
                );
    }

    private Info apiInfo() {
        return new Info()
                .title("Library Management System API")
                .description("""
                        ## Library Management System REST API
                        
                        Comprehensive API for managing library operations:
                        - **Books** - CRUD for book catalog with search and filtering
                        - **Members** - Member registration, suspension, activation
                        - **Borrowings** - Borrow, return, renew books with automatic fine calculation
                        - **Auth** - JWT-based login with token refresh
                        
                        ### Authentication
                        1. POST `/auth/login` with credentials to obtain a JWT token
                        2. Click the **Authorize** button above and enter: `Bearer <your-token>`
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("Library Admin")
                        .email("admin@library.com"))
                .license(new License().name("MIT"));
    }
}
