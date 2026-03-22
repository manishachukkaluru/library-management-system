package com.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class BorrowingResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private String membershipNumber;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;
    private BigDecimal fineAmount;
    private Boolean finePaid;
    private Integer renewalCount;
    private String notes;
    private boolean overdue;
    private LocalDateTime createdAt;
}
