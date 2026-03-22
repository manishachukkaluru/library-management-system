package com.library.service;

import com.library.dto.request.MemberRequest;
import com.library.dto.response.MemberResponse;
import com.library.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface MemberService {

    MemberResponse createMember(MemberRequest request);

    MemberResponse updateMember(Long id, MemberRequest request);

    MemberResponse getMemberById(Long id);

    MemberResponse getMemberByMembershipNumber(String membershipNumber);

    PagedResponse<MemberResponse> getAllMembers(Pageable pageable);

    PagedResponse<MemberResponse> searchMembers(String search, String status, String membershipType, Pageable pageable);

    void deleteMember(Long id);

    MemberResponse suspendMember(Long id);

    MemberResponse activateMember(Long id);
}
