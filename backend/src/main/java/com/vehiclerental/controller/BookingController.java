package com.vehiclerental.controller;

import com.vehiclerental.dto.booking.BookingRequest;
import com.vehiclerental.dto.booking.BookingResponse;
import com.vehiclerental.entity.User;
import com.vehiclerental.enums.Role;
import com.vehiclerental.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking. Authenticated customers only.
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        BookingResponse booking = bookingService.createBooking(request, user);
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    /**
     * Get bookings. Customers see their own; Admins see all.
     */
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(@AuthenticationPrincipal User user) {
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(bookingService.getAllBookings());
        }
        return ResponseEntity.ok(bookingService.getCustomerBookings(user.getId()));
    }

    /**
     * Get a specific booking by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * Cancel a booking.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, user));
    }
}
