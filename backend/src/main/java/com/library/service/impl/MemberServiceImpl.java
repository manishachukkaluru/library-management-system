package com.library.service.impl;

import com.library.dto.request.MemberRequest;
import com.library.dto.response.MemberResponse;
import com.library.dto.response.PagedResponse;
import com.library.entity.Member;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.MemberRepository;
import com.library.service.MemberService;
import com.library.util.MembershipNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final MembershipNumberGenerator membershipNumberGenerator;

    @Override
    @Transactional
    public MemberResponse createMember(MemberRequest request) {
        log.info("Creating member with email: {}", request.getEmail());

        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Member with email " + request.getEmail() + " already exists");
        }

        Member member = mapToEntity(request);
        member.setMembershipNumber(membershipNumberGenerator.generate());
        member.setMembershipStartDate(LocalDate.now());
        member.setMembershipExpiryDate(LocalDate.now().plusYears(1));

        Member saved = memberRepository.save(member);
        log.info("Member created with id: {} and membership: {}", saved.getId(), saved.getMembershipNumber());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MemberResponse updateMember(Long id, MemberRequest request) {
        log.info("Updating member with id: {}", id);

        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));

        if (!member.getEmail().equals(request.getEmail()) && memberRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email " + request.getEmail() + " is already in use");
        }

        updateFields(member, request);
        Member updated = memberRepository.save(member);
        log.info("Member updated with id: {}", id);
        return mapToResponse(updated);
    }

    @Override
    public MemberResponse getMemberById(Long id) {
        log.debug("Fetching member with id: {}", id);
        return memberRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
    }

    @Override
    public MemberResponse getMemberByMembershipNumber(String membershipNumber) {
        return memberRepository.findByMembershipNumber(membershipNumber)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with membership number: " + membershipNumber));
    }

    @Override
    public PagedResponse<MemberResponse> getAllMembers(Pageable pageable) {
        return PagedResponse.of(memberRepository.findAll(pageable).map(this::mapToResponse));
    }

    @Override
    public PagedResponse<MemberResponse> searchMembers(String search, String status, String membershipType, Pageable pageable) {
        Member.MemberStatus memberStatus = status != null ? Member.MemberStatus.valueOf(status.toUpperCase()) : null;
        Member.MembershipType type = membershipType != null ? Member.MembershipType.valueOf(membershipType.toUpperCase()) : null;
        Page<Member> page = memberRepository.searchMembers(search, memberStatus, type, pageable);
        return PagedResponse.of(page.map(this::mapToResponse));
    }

    @Override
    @Transactional
    public void deleteMember(Long id) {
        log.info("Deleting member with id: {}", id);
        if (!memberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Member not found with id: " + id);
        }
        memberRepository.deleteById(id);
        log.info("Member deleted with id: {}", id);
    }

    @Override
    @Transactional
    public MemberResponse suspendMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
        member.setStatus(Member.MemberStatus.SUSPENDED);
        log.info("Member suspended with id: {}", id);
        return mapToResponse(memberRepository.save(member));
    }

    @Override
    @Transactional
    public MemberResponse activateMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
        member.setStatus(Member.MemberStatus.ACTIVE);
        log.info("Member activated with id: {}", id);
        return mapToResponse(memberRepository.save(member));
    }

    private Member mapToEntity(MemberRequest request) {
        return Member.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .membershipType(Member.MembershipType.valueOf(request.getMembershipType().toUpperCase()))
                .status(Member.MemberStatus.ACTIVE)
                .maxBorrowLimit(request.getMembershipType().equalsIgnoreCase("PREMIUM") ? 10 : 5)
                .build();
    }

    private void updateFields(Member member, MemberRequest request) {
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setMembershipType(Member.MembershipType.valueOf(request.getMembershipType().toUpperCase()));
    }

    private MemberResponse mapToResponse(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .membershipNumber(member.getMembershipNumber())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .address(member.getAddress())
                .dateOfBirth(member.getDateOfBirth())
                .membershipStartDate(member.getMembershipStartDate())
                .membershipExpiryDate(member.getMembershipExpiryDate())
                .membershipType(member.getMembershipType().name())
                .status(member.getStatus().name())
                .maxBorrowLimit(member.getMaxBorrowLimit())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
