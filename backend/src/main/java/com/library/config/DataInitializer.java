package com.library.config;

import com.library.entity.User;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes default users on application startup if they don't exist.
 * This ensures the admin and librarian accounts are always available.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists("admin",     "Admin@123",   "admin@library.com",     "System Administrator", User.Role.ADMIN);
        createUserIfNotExists("librarian", "Lib@12345",   "librarian@library.com", "Head Librarian",       User.Role.LIBRARIAN);
    }

    private void createUserIfNotExists(String username, String password, String email, String fullName, User.Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .email(email)
                    .fullName(fullName)
                    .role(role)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();
            userRepository.save(user);
            log.info("✅ Created default user: {} with role: {}", username, role);
        } else {
            log.info("ℹ️  User already exists: {}", username);
        }
    }
}