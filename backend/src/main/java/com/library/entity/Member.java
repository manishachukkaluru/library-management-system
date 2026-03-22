package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a library member.
 */
@Entity
@Table(name = "MEMBERS", indexes = {
    @Index(name = "IDX_MEMBERS_EMAIL", columnList = "email", unique = true),
    @Index(name = "IDX_MEMBERS_MEMBERSHIP_NO", columnList = "membership_number", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "members_seq")
    @SequenceGenerator(name = "members_seq", sequenceName = "MEMBERS_SEQ", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "Membership number is required")
    @Column(name = "membership_number", nullable = false, unique = true, length = 20)
    private String membershipNumber;

    @NotBlank(message = "First name is required")
    @Size(max = 75, message = "First name must not exceed 75 characters")
    @Column(name = "first_name", nullable = false, length = 75)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 75, message = "Last name must not exceed 75 characters")
    @Column(name = "last_name", nullable = false, length = 75)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number")
    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "membership_start_date")
    private LocalDate membershipStartDate;

    @Column(name = "membership_expiry_date")
    private LocalDate membershipExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_type", length = 20, nullable = false)
    @Builder.Default
    private MembershipType membershipType = MembershipType.STANDARD;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column(name = "max_borrow_limit", nullable = false)
    @Builder.Default
    private Integer maxBorrowLimit = 5;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<BorrowingRecord> borrowingRecords = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MemberStatus {
        ACTIVE, SUSPENDED, EXPIRED, CANCELLED
    }

    public enum MembershipType {
        STANDARD, PREMIUM, STUDENT, SENIOR
    }

    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
