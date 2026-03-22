package com.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a book borrowing transaction.
 */
@Entity
@Table(name = "BORROWING_RECORDS", indexes = {
    @Index(name = "IDX_BORROW_MEMBER", columnList = "member_id"),
    @Index(name = "IDX_BORROW_BOOK", columnList = "book_id"),
    @Index(name = "IDX_BORROW_STATUS", columnList = "status"),
    @Index(name = "IDX_BORROW_DUE_DATE", columnList = "due_date")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class BorrowingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "borrowing_seq")
    @SequenceGenerator(name = "borrowing_seq", sequenceName = "BORROWING_SEQ", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @ToString.Exclude
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @ToString.Exclude
    private Book book;

    @Column(name = "borrow_date", nullable = false)
    private LocalDate borrowDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private BorrowStatus status = BorrowStatus.BORROWED;

    @Column(name = "fine_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "fine_paid")
    @Builder.Default
    private Boolean finePaid = false;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "renewal_count")
    @Builder.Default
    private Integer renewalCount = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BorrowStatus {
        BORROWED, RETURNED, OVERDUE, RENEWED, LOST
    }

    @Transient
    public boolean isOverdue() {
        return status == BorrowStatus.BORROWED && LocalDate.now().isAfter(dueDate);
    }
}
