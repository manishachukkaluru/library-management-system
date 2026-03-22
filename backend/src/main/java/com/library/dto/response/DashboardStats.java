package com.library.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStats {
    private long totalBooks;
    private long availableBooks;
    private long booksWithNoCopies;
    private long totalMembers;
    private long activeMembers;
    private long expiredMemberships;
    private long activeBorrowings;
    private long overdueBorrowings;
}
