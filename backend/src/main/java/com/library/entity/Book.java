package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a book in the library catalog.
 */
@Entity
@Table(name = "BOOKS", indexes = {
    @Index(name = "IDX_BOOKS_ISBN", columnList = "isbn", unique = true),
    @Index(name = "IDX_BOOKS_TITLE", columnList = "title"),
    @Index(name = "IDX_BOOKS_AUTHOR", columnList = "author")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "books_seq")
    @SequenceGenerator(name = "books_seq", sequenceName = "BOOKS_SEQ", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "ISBN is required")
    @Size(max = 20, message = "ISBN must not exceed 20 characters")
    @Column(name = "isbn", nullable = false, unique = true, length = 20)
    private String isbn;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 150, message = "Author must not exceed 150 characters")
    @Column(name = "author", nullable = false, length = 150)
    private String author;

    @Size(max = 100, message = "Publisher must not exceed 100 characters")
    @Column(name = "publisher", length = 100)
    private String publisher;

    @Column(name = "publish_date")
    private LocalDate publishDate;

    @Size(max = 50, message = "Genre must not exceed 50 characters")
    @Column(name = "genre", length = 50)
    private String genre;

    @Column(name = "description", length = 2000)
    private String description;

    @NotNull(message = "Total copies is required")
    @Positive(message = "Total copies must be positive")
    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "pages")
    private Integer pages;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private BookStatus status = BookStatus.AVAILABLE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BookStatus {
        AVAILABLE, UNAVAILABLE, DISCONTINUED
    }

    @PrePersist
    public void prePersist() {
        if (availableCopies == null) {
            availableCopies = totalCopies;
        }
    }
}
