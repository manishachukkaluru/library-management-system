package com.library.service;

import com.library.dto.request.BorrowRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.BorrowingResponse;
import com.library.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface BorrowingService {

    BorrowingResponse borrowBook(BorrowRequest request);

    BorrowingResponse returnBook(Long borrowingId, ReturnRequest request);

    BorrowingResponse renewBook(Long borrowingId);

    BorrowingResponse getBorrowingById(Long id);

    PagedResponse<BorrowingResponse> getAllBorrowings(Pageable pageable);

    PagedResponse<BorrowingResponse> getBorrowingsByMember(Long memberId, Pageable pageable);

    PagedResponse<BorrowingResponse> getBorrowingsByBook(Long bookId, Pageable pageable);

    PagedResponse<BorrowingResponse> getOverdueBorrowings(Pageable pageable);

    void processOverdueFines();
}
