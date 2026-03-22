package com.library.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Generates unique membership numbers in format: LIB-YYYY-XXXXXX
 */
@Component
public class MembershipNumberGenerator {

    private final AtomicLong counter = new AtomicLong(System.currentTimeMillis() % 1000000);

    public String generate() {
        int year = LocalDate.now().getYear();
        long seq = counter.incrementAndGet() % 1000000;
        return String.format("LIB-%d-%06d", year, seq);
    }
}
