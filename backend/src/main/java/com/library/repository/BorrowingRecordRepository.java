package com.library.repository;

import com.library.entity.BorrowingRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowingRecordRepository extends JpaRepository<BorrowingRecord, Long> {

    Page<BorrowingRecord> findByMemberId(Long memberId, Pageable pageable);

    Page<BorrowingRecord> findByBookId(Long bookId, Pageable pageable);

    Page<BorrowingRecord> findByStatus(BorrowingRecord.BorrowStatus status, Pageable pageable);

    Optional<BorrowingRecord> findByMemberIdAndBookIdAndStatus(
            Long memberId, Long bookId, BorrowingRecord.BorrowStatus status);

    @Query("SELECT br FROM BorrowingRecord br WHERE br.dueDate < :today AND br.status = 'BORROWED'")
    List<BorrowingRecord> findOverdueRecords(@Param("today") LocalDate today);

    @Query("SELECT COUNT(br) FROM BorrowingRecord br WHERE br.member.id = :memberId AND br.status = 'BORROWED'")
    long countActiveBorrowsByMember(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(br) FROM BorrowingRecord br WHERE br.status = 'BORROWED'")
    long countActiveBorrowings();

    @Query("SELECT COUNT(br) FROM BorrowingRecord br WHERE br.status = 'OVERDUE'")
    long countOverdueBorrowings();

    @Query("SELECT br FROM BorrowingRecord br " +
           "JOIN FETCH br.member m " +
           "JOIN FETCH br.book b " +
           "WHERE (:memberId IS NULL OR m.id = :memberId) " +
           "AND (:bookId IS NULL OR b.id = :bookId) " +
           "AND (:status IS NULL OR br.status = :status)")
    Page<BorrowingRecord> searchBorrowings(
            @Param("memberId") Long memberId,
            @Param("bookId") Long bookId,
            @Param("status") BorrowingRecord.BorrowStatus status,
            Pageable pageable);
}
