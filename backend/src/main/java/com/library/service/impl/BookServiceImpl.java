package com.library.service.impl;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.dto.response.PagedResponse;
import com.library.entity.Book;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of BookService.
 * Follows Single Responsibility Principle (SRP) - SOLID.
 * All book business logic is encapsulated here.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookServiceImpl implements BookService {

    private static final String BOOK_NOT_FOUND = "Book not found with id: ";

    private final BookRepository bookRepository;

    @Override
    @Transactional
    public BookResponse createBook(BookRequest request) {
        log.info("Creating book with ISBN: {}", request.getIsbn());

        if (bookRepository.existsByIsbn(request.getIsbn())) {
            log.warn("Duplicate ISBN detected: {}", request.getIsbn());
            throw new DuplicateResourceException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Book book = mapToEntity(request);
        Book savedBook = bookRepository.save(book);
        log.info("Book created successfully with id: {}", savedBook.getId());
        return mapToResponse(savedBook);
    }

    @Override
    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        log.info("Updating book with id: {}", id);

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Book not found with id: {}", id);
                    return new ResourceNotFoundException(BOOK_NOT_FOUND + id);
                });

        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        updateBookFields(book, request);
        Book updatedBook = bookRepository.save(book);
        log.info("Book updated successfully with id: {}", id);
        return mapToResponse(updatedBook);
    }

    @Override
    public BookResponse getBookById(Long id) {
        log.debug("Fetching book with id: {}", id);
        return bookRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException(BOOK_NOT_FOUND + id));
    }

    @Override
    public BookResponse getBookByIsbn(String isbn) {
        log.debug("Fetching book with ISBN: {}", isbn);
        return bookRepository.findByIsbn(isbn)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ISBN: " + isbn));
    }

    @Override
    public PagedResponse<BookResponse> getAllBooks(Pageable pageable) {
        log.debug("Fetching all books, page: {}", pageable.getPageNumber());
        Page<Book> page = bookRepository.findAll(pageable);
        return PagedResponse.of(page.map(this::mapToResponse));
    }

    @Override
    public PagedResponse<BookResponse> searchBooks(String search, String genre, String status, Pageable pageable) {
        log.debug("Searching books with search={}, genre={}, status={}", search, genre, status);
        Book.BookStatus bookStatus = status != null ? Book.BookStatus.valueOf(status.toUpperCase()) : null;
        Page<Book> page = bookRepository.searchBooks(search, genre, bookStatus, pageable);
        return PagedResponse.of(page.map(this::mapToResponse));
    }

    @Override
    public PagedResponse<BookResponse> getAvailableBooks(Pageable pageable) {
        log.debug("Fetching available books");
        Page<Book> page = bookRepository.findAvailableBooks(pageable);
        return PagedResponse.of(page.map(this::mapToResponse));
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        log.info("Deleting book with id: {}", id);
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException(BOOK_NOT_FOUND + id);
        }
        bookRepository.deleteById(id);
        log.info("Book deleted with id: {}", id);
    }

    @Override
    @Transactional
    public void softDeleteBook(Long id) {
        log.info("Soft deleting book with id: {}", id);
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(BOOK_NOT_FOUND + id));
        book.setStatus(Book.BookStatus.DISCONTINUED);
        bookRepository.save(book);
        log.info("Book soft deleted (status=DISCONTINUED) with id: {}", id);
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private Book mapToEntity(BookRequest request) {
        return Book.builder()
                .isbn(request.getIsbn())
                .title(request.getTitle())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .publishDate(request.getPublishDate())
                .genre(request.getGenre())
                .description(request.getDescription())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .coverImageUrl(request.getCoverImageUrl())
                .price(request.getPrice())
                .pages(request.getPages())
                .status(Book.BookStatus.AVAILABLE)
                .build();
    }

    private void updateBookFields(Book book, BookRequest request) {
        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setPublishDate(request.getPublishDate());
        book.setGenre(request.getGenre());
        book.setDescription(request.getDescription());
        int diff = request.getTotalCopies() - book.getTotalCopies();
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + diff));
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setPrice(request.getPrice());
        book.setPages(request.getPages());
    }

    private BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publishDate(book.getPublishDate())
                .genre(book.getGenre())
                .description(book.getDescription())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .coverImageUrl(book.getCoverImageUrl())
                .price(book.getPrice())
                .pages(book.getPages())
                .status(book.getStatus().name())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}
