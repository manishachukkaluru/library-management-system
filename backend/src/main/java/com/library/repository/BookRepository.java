package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Book entity with custom JPQL queries.
 * Follows Repository pattern (SOLID - Single Responsibility).
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    Page<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title, String author, Pageable pageable);

    Page<Book> findByGenreIgnoreCase(String genre, Pageable pageable);

    Page<Book> findByStatus(Book.BookStatus status, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0 AND b.status = 'AVAILABLE'")
    Page<Book> findAvailableBooks(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
           "(:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:genre IS NULL OR LOWER(b.genre) = LOWER(:genre)) " +
           "AND (:status IS NULL OR b.status = :status)")
    Page<Book> searchBooks(
            @Param("search") String search,
            @Param("genre") String genre,
            @Param("status") Book.BookStatus status,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Book b SET b.availableCopies = b.availableCopies - 1 WHERE b.id = :id AND b.availableCopies > 0")
    int decrementAvailableCopies(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Book b SET b.availableCopies = b.availableCopies + 1 WHERE b.id = :id AND b.availableCopies < b.totalCopies")
    int incrementAvailableCopies(@Param("id") Long id);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = 'AVAILABLE'")
    long countAvailableBooks();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.availableCopies = 0")
    long countBooksWithNoCopies();
}
