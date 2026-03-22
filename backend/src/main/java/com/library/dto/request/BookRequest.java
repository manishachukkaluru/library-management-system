// ─── BookRequest.java ────────────────────────────────────────────────────────
package com.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookRequest {
    @NotBlank @Size(max = 20)
    private String isbn;
    @NotBlank @Size(max = 255)
    private String title;
    @NotBlank @Size(max = 150)
    private String author;
    @Size(max = 100)
    private String publisher;
    private LocalDate publishDate;
    @Size(max = 50)
    private String genre;
    @Size(max = 2000)
    private String description;
    @NotNull @Positive
    private Integer totalCopies;
    private String coverImageUrl;
    @DecimalMin("0.0")
    private BigDecimal price;
    @Positive
    private Integer pages;
}
