package com.library.repository;

import com.library.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {

    Optional<Member> findByEmail(String email);

    Optional<Member> findByMembershipNumber(String membershipNumber);

    boolean existsByEmail(String email);

    boolean existsByMembershipNumber(String membershipNumber);

    @Query("SELECT m FROM Member m WHERE " +
           "(:search IS NULL OR LOWER(m.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.membershipNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR m.status = :status) " +
           "AND (:membershipType IS NULL OR m.membershipType = :membershipType)")
    Page<Member> searchMembers(
            @Param("search") String search,
            @Param("status") Member.MemberStatus status,
            @Param("membershipType") Member.MembershipType membershipType,
            Pageable pageable);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.status = 'ACTIVE'")
    long countActiveMembers();

    @Query("SELECT COUNT(m) FROM Member m WHERE m.membershipExpiryDate < CURRENT_DATE AND m.status = 'ACTIVE'")
    long countExpiredMemberships();
}
