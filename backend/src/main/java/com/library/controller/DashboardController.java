package com.library.controller;

import com.library.dto.response.DashboardStats;
import com.library.repository.BookRepository;
import com.library.repository.BorrowingRecordRepository;
import com.library.repository.MemberRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Library statistics and overview")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowingRecordRepository borrowingRepository;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardStats> getStats() {
        log.debug("Fetching dashboard statistics");

        DashboardStats stats = DashboardStats.builder()
                .totalBooks(bookRepository.count())
                .availableBooks(bookRepository.countAvailableBooks())
                .booksWithNoCopies(bookRepository.countBooksWithNoCopies())
                .totalMembers(memberRepository.count())
                .activeMembers(memberRepository.countActiveMembers())
                .expiredMemberships(memberRepository.countExpiredMemberships())
                .activeBorrowings(borrowingRepository.countActiveBorrowings())
                .overdueBorrowings(borrowingRepository.countOverdueBorrowings())
                .build();

        return ResponseEntity.ok(stats);
    }
}
