package com.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Library Management System - Main Application Entry Point
 *
 * <p>This application provides a comprehensive library management solution with:
 * <ul>
 *   <li>JWT-based authentication and authorization</li>
 *   <li>RESTful APIs for books, members, and borrowings</li>
 *   <li>Oracle database persistence</li>
 *   <li>Swagger/OpenAPI documentation</li>
 * </ul>
 *
 * @author Library Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class LibraryManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibraryManagementApplication.class, args);
    }
}
