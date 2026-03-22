package com.library.service;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.entity.Book;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.service.impl.BookServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookService Unit Tests")
class BookServiceTest {

    @Mock private BookRepository bookRepository;
    @InjectMocks private BookServiceImpl bookService;

    private Book testBook;
    private BookRequest testRequest;

    @BeforeEach
    void setUp() {
        testBook = Book.builder()
                .id(1L).isbn("978-0-06-112008-4").title("Test Book")
                .author("Test Author").totalCopies(5).availableCopies(5)
                .status(Book.BookStatus.AVAILABLE).build();

        testRequest = new BookRequest();
        testRequest.setIsbn("978-0-06-112008-4");
        testRequest.setTitle("Test Book");
        testRequest.setAuthor("Test Author");
        testRequest.setTotalCopies(5);
    }

    @Test
    @DisplayName("createBook – success path")
    void createBook_ShouldReturnBookResponse_WhenIsbnUnique() {
        when(bookRepository.existsByIsbn(anyString())).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);

        BookResponse response = bookService.createBook(testRequest);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Book");
        assertThat(response.getIsbn()).isEqualTo("978-0-06-112008-4");
        verify(bookRepository, times(1)).save(any(Book.class));
    }

    @Test
    @DisplayName("createBook – throws DuplicateResourceException when ISBN exists")
    void createBook_ShouldThrow_WhenIsbnAlreadyExists() {
        when(bookRepository.existsByIsbn(anyString())).thenReturn(true);

        assertThatThrownBy(() -> bookService.createBook(testRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("getBookById – returns book when found")
    void getBookById_ShouldReturnBook_WhenExists() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));

        BookResponse response = bookService.getBookById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Test Book");
    }

    @Test
    @DisplayName("getBookById – throws ResourceNotFoundException when not found")
    void getBookById_ShouldThrow_WhenNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBookById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("getAllBooks – returns paged response")
    void getAllBooks_ShouldReturnPagedResponse() {
        Page<Book> page = new PageImpl<>(List.of(testBook));
        when(bookRepository.findAll(any(PageRequest.class))).thenReturn(page);

        var result = bookService.getAllBooks(PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("deleteBook – succeeds when book exists")
    void deleteBook_ShouldDelete_WhenExists() {
        when(bookRepository.existsById(1L)).thenReturn(true);

        bookService.deleteBook(1L);

        verify(bookRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("softDeleteBook – sets status to DISCONTINUED")
    void softDeleteBook_ShouldSetStatusDiscontinued() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);

        bookService.softDeleteBook(1L);

        assertThat(testBook.getStatus()).isEqualTo(Book.BookStatus.DISCONTINUED);
        verify(bookRepository, times(1)).save(testBook);
    }
}
