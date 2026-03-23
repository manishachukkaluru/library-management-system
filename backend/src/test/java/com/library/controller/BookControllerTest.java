package com.library.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.dto.response.PagedResponse;
import com.library.security.JwtService;
import com.library.service.BookService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookController.class)
@AutoConfigureDataJpa
@DisplayName("BookController Integration Tests")
class BookControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private BookService bookService;
    @MockBean private JwtService jwtService;
    @MockBean private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "LIBRARIAN")
    @DisplayName("GET /books - returns 200 with paged content")
    void getAllBooks_ShouldReturn200() throws Exception {
        var book = BookResponse.builder().id(1L).title("Test Book").author("Author").isbn("123").build();
        var paged = PagedResponse.<BookResponse>builder()
                .content(List.of(book)).totalElements(1).pageNumber(0).pageSize(10).totalPages(1).build();

        when(bookService.getAllBooks(any(Pageable.class))).thenReturn(paged);

        mockMvc.perform(get("/books").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Book"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "LIBRARIAN")
    @DisplayName("POST /books - returns 201 on valid request")
    void createBook_ShouldReturn201() throws Exception {
        BookRequest req = new BookRequest();
        req.setTitle("New Book"); req.setAuthor("Author"); req.setIsbn("ISBN-001"); req.setTotalCopies(3);

        var response = BookResponse.builder().id(1L).title("New Book").author("Author").isbn("ISBN-001").build();
        when(bookService.createBook(any())).thenReturn(response);

        mockMvc.perform(post("/books").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "LIBRARIAN")
    @DisplayName("POST /books - returns 400 on missing required fields")
    void createBook_ShouldReturn400_WhenInvalid() throws Exception {
        mockMvc.perform(post("/books").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /books/{id} - returns 204 for admin")
    void deleteBook_ShouldReturn204_ForAdmin() throws Exception {
        mockMvc.perform(delete("/books/1").with(csrf()))
                .andExpect(status().isNoContent());
    }
}