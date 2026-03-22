package com.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MemberRequest {
    @NotBlank @Size(max = 75)
    private String firstName;
    @NotBlank @Size(max = 75)
    private String lastName;
    @NotBlank @Email
    private String email;
    @Pattern(regexp = "^[+]?[0-9]{10,15}$")
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    @NotBlank
    private String membershipType; // STANDARD, PREMIUM, STUDENT, SENIOR
}
