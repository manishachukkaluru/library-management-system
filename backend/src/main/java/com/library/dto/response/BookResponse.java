package com.library.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookResponse {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private LocalDate publishDate;
    private String genre;
    private String description;
    private Integer totalCopies;
    private Integer availableCopies;
    private String coverImageUrl;
    private BigDecimal price;
    private Integer pages;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
