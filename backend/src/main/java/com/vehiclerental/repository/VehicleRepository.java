package com.vehiclerental.repository;

import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.enums.VehicleCategory;
import com.vehiclerental.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    /**
     * Find available vehicles that are not booked during the requested date range.
     * Filters out vehicles with overlapping confirmed bookings and those under maintenance.
     * Supports optional category and branch filters.
     */
    @Query("SELECT v FROM Vehicle v WHERE v.status = :status " +
           "AND (:category IS NULL OR v.category = :category) " +
           "AND (:branch IS NULL OR v.branch = :branch) " +
           "AND v.id NOT IN (" +
           "  SELECT b.vehicle.id FROM Booking b " +
           "  WHERE b.status <> com.vehiclerental.enums.BookingStatus.CANCELLED " +
           "  AND b.startDate < :endDate AND b.endDate > :startDate" +
           ")")
    List<Vehicle> findAvailableVehicles(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("category") VehicleCategory category,
            @Param("branch") String branch,
            @Param("status") VehicleStatus status);

    List<Vehicle> findByStatus(VehicleStatus status);

    boolean existsByRegistrationNumber(String registrationNumber);
}
