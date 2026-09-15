package com.vehiclerental.service;

import com.vehiclerental.dto.booking.BookingRequest;
import com.vehiclerental.dto.booking.BookingResponse;
import com.vehiclerental.entity.Booking;
import com.vehiclerental.entity.User;
import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.enums.BookingStatus;
import com.vehiclerental.exception.BookingConflictException;
import com.vehiclerental.exception.ResourceNotFoundException;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Create a new booking with pessimistic locking to prevent double-booking (FR-3.3).
     * Uses SERIALIZABLE isolation level for maximum concurrency safety.
     * Calculates total cost as dailyRate × numberOfDays (FR-3.2).
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponse createBooking(BookingRequest request, User customer) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // Check for overlapping bookings with pessimistic write lock
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                request.getVehicleId(),
                request.getStartDate(),
                request.getEndDate(),
                BookingStatus.CANCELLED
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Vehicle is already booked for the selected dates");
        }

        // Calculate total cost (daily rate × number of days)
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalCost = vehicle.getDailyRate().multiply(BigDecimal.valueOf(days));

        Booking booking = Booking.builder()
                .customer(customer)
                .vehicle(vehicle)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalCost(totalCost)
                .status(BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);
        return toResponse(booking);
    }

    public List<BookingResponse> getCustomerBookings(UUID customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Customers can only cancel their own bookings
        if (user.getRole().name().equals("CUSTOMER") && !booking.getCustomer().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getFullName())
                .vehicleId(booking.getVehicle().getId())
                .vehicleName(booking.getVehicle().getMake() + " " + booking.getVehicle().getModel())
                .vehicleCategory(booking.getVehicle().getCategory().name())
                .branch(booking.getVehicle().getBranch())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalCost(booking.getTotalCost())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
