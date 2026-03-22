package com.library.service;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for Book operations.
 * Follows Interface Segregation Principle (ISP) - SOLID.
 */
public interface BookService {

    BookResponse createBook(BookRequest request);

    BookResponse updateBook(Long id, BookRequest request);

    BookResponse getBookById(Long id);

    BookResponse getBookByIsbn(String isbn);

    PagedResponse<BookResponse> getAllBooks(Pageable pageable);

    PagedResponse<BookResponse> searchBooks(String search, String genre, String status, Pageable pageable);

    PagedResponse<BookResponse> getAvailableBooks(Pageable pageable);

    void deleteBook(Long id);

    void softDeleteBook(Long id);
}
