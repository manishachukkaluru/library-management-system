package com.library.service.impl;

import com.library.dto.request.BorrowRequest;
import com.library.dto.request.ReturnRequest;
import com.library.dto.response.BorrowingResponse;
import com.library.dto.response.PagedResponse;
import com.library.entity.Book;
import com.library.entity.BorrowingRecord;
import com.library.entity.Member;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowingRecordRepository;
import com.library.repository.MemberRepository;
import com.library.service.BorrowingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BorrowingServiceImpl implements BorrowingService {

    private static final BigDecimal DAILY_FINE_RATE = new BigDecimal("5.00");
    private static final int DEFAULT_BORROW_DAYS = 14;
    private static final int MAX_RENEWALS = 2;

    private final BorrowingRecordRepository borrowingRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public BorrowingResponse borrowBook(BorrowRequest request) {
        log.info("Processing borrow request for member: {} book: {}", request.getMemberId(), request.getBookId());

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + request.getMemberId()));

        if (member.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new BusinessException("Member account is not active. Status: " + member.getStatus());
        }

        long activeBorrows = borrowingRepository.countActiveBorrowsByMember(member.getId());
        if (activeBorrows >= member.getMaxBorrowLimit()) {
            throw new BusinessException("Member has reached the maximum borrow limit of " + member.getMaxBorrowLimit());
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BusinessException("No copies available for book: " + book.getTitle());
        }

        int updated = bookRepository.decrementAvailableCopies(book.getId());
        if (updated == 0) {
            throw new BusinessException("No copies available for book: " + book.getTitle());
        }

        BorrowingRecord record = BorrowingRecord.builder()
                .member(member)
                .book(book)
                .borrowDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(DEFAULT_BORROW_DAYS))
                .status(BorrowingRecord.BorrowStatus.BORROWED)
                .build();

        BorrowingRecord saved = borrowingRepository.save(record);
        log.info("Book borrowed successfully. Record id: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BorrowingResponse returnBook(Long borrowingId, ReturnRequest request) {
        log.info("Processing return for borrowing record: {}", borrowingId);

        BorrowingRecord record = borrowingRepository.findById(borrowingId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found: " + borrowingId));

        if (record.getStatus() == BorrowingRecord.BorrowStatus.RETURNED) {
            throw new BusinessException("Book has already been returned");
        }

        record.setReturnDate(LocalDate.now());
        record.setStatus(BorrowingRecord.BorrowStatus.RETURNED);

        if (LocalDate.now().isAfter(record.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now());
            BigDecimal fine = DAILY_FINE_RATE.multiply(BigDecimal.valueOf(daysOverdue));
            record.setFineAmount(fine);
            log.info("Fine calculated: {} for {} overdue days", fine, daysOverdue);
        }

        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }

        bookRepository.incrementAvailableCopies(record.getBook().getId());
        BorrowingRecord updated = borrowingRepository.save(record);
        log.info("Book returned successfully. Record id: {}", borrowingId);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public BorrowingResponse renewBook(Long borrowingId) {
        log.info("Processing renewal for borrowing record: {}", borrowingId);

        BorrowingRecord record = borrowingRepository.findById(borrowingId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found: " + borrowingId));

        if (record.getStatus() != BorrowingRecord.BorrowStatus.BORROWED) {
            throw new BusinessException("Cannot renew. Current status: " + record.getStatus());
        }

        if (record.getRenewalCount() >= MAX_RENEWALS) {
            throw new BusinessException("Maximum renewals (" + MAX_RENEWALS + ") reached");
        }

        record.setDueDate(record.getDueDate().plusDays(DEFAULT_BORROW_DAYS));
        record.setRenewalCount(record.getRenewalCount() + 1);
        record.setStatus(BorrowingRecord.BorrowStatus.RENEWED);

        BorrowingRecord updated = borrowingRepository.save(record);
        log.info("Book renewed. New due date: {}", updated.getDueDate());
        return mapToResponse(updated);
    }

    @Override
    public BorrowingResponse getBorrowingById(Long id) {
        return borrowingRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found: " + id));
    }

    @Override
    public PagedResponse<BorrowingResponse> getAllBorrowings(Pageable pageable) {
        return PagedResponse.of(borrowingRepository.findAll(pageable).map(this::mapToResponse));
    }

    @Override
    public PagedResponse<BorrowingResponse> getBorrowingsByMember(Long memberId, Pageable pageable) {
        return PagedResponse.of(borrowingRepository.findByMemberId(memberId, pageable).map(this::mapToResponse));
    }

    @Override
    public PagedResponse<BorrowingResponse> getBorrowingsByBook(Long bookId, Pageable pageable) {
        return PagedResponse.of(borrowingRepository.findByBookId(bookId, pageable).map(this::mapToResponse));
    }

    @Override
    public PagedResponse<BorrowingResponse> getOverdueBorrowings(Pageable pageable) {
        return PagedResponse.of(borrowingRepository.findByStatus(BorrowingRecord.BorrowStatus.OVERDUE, pageable).map(this::mapToResponse));
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 1 * * *") // Run daily at 1AM
    public void processOverdueFines() {
        log.info("Running scheduled overdue fine processing...");
        List<BorrowingRecord> overdueRecords = borrowingRepository.findOverdueRecords(LocalDate.now());
        int count = 0;
        for (BorrowingRecord record : overdueRecords) {
            record.setStatus(BorrowingRecord.BorrowStatus.OVERDUE);
            long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now());
            record.setFineAmount(DAILY_FINE_RATE.multiply(BigDecimal.valueOf(daysOverdue)));
            borrowingRepository.save(record);
            count++;
        }
        log.info("Processed {} overdue records", count);
    }

    private BorrowingResponse mapToResponse(BorrowingRecord record) {
        return BorrowingResponse.builder()
                .id(record.getId())
                .memberId(record.getMember().getId())
                .memberName(record.getMember().getFullName())
                .membershipNumber(record.getMember().getMembershipNumber())
                .bookId(record.getBook().getId())
                .bookTitle(record.getBook().getTitle())
                .bookIsbn(record.getBook().getIsbn())
                .borrowDate(record.getBorrowDate())
                .dueDate(record.getDueDate())
                .returnDate(record.getReturnDate())
                .status(record.getStatus().name())
                .fineAmount(record.getFineAmount())
                .finePaid(record.getFinePaid())
                .renewalCount(record.getRenewalCount())
                .notes(record.getNotes())
                .overdue(record.isOverdue())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
