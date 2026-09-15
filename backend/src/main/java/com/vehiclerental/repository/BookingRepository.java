package com.vehiclerental.repository;

import com.vehiclerental.entity.Booking;
import com.vehiclerental.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    /**
     * Find overlapping bookings for a vehicle using pessimistic write lock
     * to prevent double-booking under concurrent access (FR-3.3).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status <> :excludedStatus " +
           "AND b.startDate < :endDate AND b.endDate > :startDate")
    List<Booking> findOverlappingBookings(
            @Param("vehicleId") UUID vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludedStatus") BookingStatus excludedStatus);

    /**
     * Find all bookings for a specific customer, ordered by most recent first.
     */
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    /**
     * Find all bookings ordered by most recent first (admin view).
     */
    List<Booking> findAllByOrderByCreatedAtDesc();

    /**
     * Find bookings by status.
     */
    List<Booking> findByStatusOrderByStartDateAsc(BookingStatus status);
}
