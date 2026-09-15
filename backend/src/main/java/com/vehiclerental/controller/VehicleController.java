package com.vehiclerental.controller;

import com.vehiclerental.dto.vehicle.VehicleRequest;
import com.vehiclerental.dto.vehicle.VehicleResponse;
import com.vehiclerental.dto.vehicle.VehicleStatusUpdate;
import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * Search available vehicles by date range, category, and branch.
     * Public endpoint — no authentication required.
     */
    @GetMapping
    public ResponseEntity<List<VehicleResponse>> searchVehicles(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String branch) {

        if (startDate != null && endDate != null) {
            List<VehicleResponse> vehicles = vehicleService.searchAvailable(startDate, endDate, category, branch);
            return ResponseEntity.ok(vehicles);
        }

        // If no dates provided, return all vehicles
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    /**
     * Get a single vehicle by ID. Public endpoint.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getById(id));
    }

    /**
     * Add a new vehicle. Admin only.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.create(request);
        return new ResponseEntity<>(vehicle, HttpStatus.CREATED);
    }

    /**
     * Update an existing vehicle. Admin only.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.update(id, request));
    }

    /**
     * Update vehicle status (Available, Rented, Maintenance). Admin only.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleResponse> updateVehicleStatus(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleStatusUpdate statusUpdate) {
        VehicleStatus status = VehicleStatus.valueOf(statusUpdate.getStatus().toUpperCase());
        return ResponseEntity.ok(vehicleService.updateStatus(id, status));
    }

    /**
     * Delete a vehicle. Admin only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
