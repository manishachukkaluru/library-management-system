package com.library.controller;

import com.library.dto.request.BorrowRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.BorrowingResponse;
import com.library.dto.response.PagedResponse;
import com.library.service.BorrowingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/borrowings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Borrowings", description = "Book borrowing, return, and renewal operations")
@SecurityRequirement(name = "bearerAuth")
public class BorrowingController {

    private final BorrowingService borrowingService;

    @PostMapping("/borrow")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Borrow a book")
    public ResponseEntity<BorrowingResponse> borrowBook(@Valid @RequestBody BorrowRequest request) {
        log.info("POST /borrowings/borrow - member: {} book: {}", request.getMemberId(), request.getBookId());
        return ResponseEntity.status(HttpStatus.CREATED).body(borrowingService.borrowBook(request));
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Return a book")
    public ResponseEntity<BorrowingResponse> returnBook(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnRequest request) {
        log.info("PUT /borrowings/{}/return", id);
        return ResponseEntity.ok(borrowingService.returnBook(id, request != null ? request : new ReturnRequest()));
    }

    @PutMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @Operation(summary = "Renew a borrowing")
    public ResponseEntity<BorrowingResponse> renewBook(@PathVariable Long id) {
        log.info("PUT /borrowings/{}/renew", id);
        return ResponseEntity.ok(borrowingService.renewBook(id));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get borrowing by ID")
    public ResponseEntity<BorrowingResponse> getBorrowingById(@PathVariable Long id) {
        return ResponseEntity.ok(borrowingService.getBorrowingById(id));
    }

    @GetMapping
    @Operation(summary = "Get all borrowings")
    public ResponseEntity<PagedResponse<BorrowingResponse>> getAllBorrowings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(borrowingService.getAllBorrowings(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/member/{memberId}")
    @Operation(summary = "Get borrowings by member")
    public ResponseEntity<PagedResponse<BorrowingResponse>> getByMember(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(borrowingService.getBorrowingsByMember(memberId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/book/{bookId}")
    @Operation(summary = "Get borrowings by book")
    public ResponseEntity<PagedResponse<BorrowingResponse>> getByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(borrowingService.getBorrowingsByBook(bookId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue borrowings")
    public ResponseEntity<PagedResponse<BorrowingResponse>> getOverdue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(borrowingService.getOverdueBorrowings(
                PageRequest.of(page, size, Sort.by("dueDate").ascending())));
    }
}
