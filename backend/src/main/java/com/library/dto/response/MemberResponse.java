package com.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class MemberResponse {
    private Long id;
    private String membershipNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private LocalDate membershipStartDate;
    private LocalDate membershipExpiryDate;
    private String membershipType;
    private String status;
    private Integer maxBorrowLimit;
    private LocalDateTime createdAt;
}
