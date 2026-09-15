package com.vehiclerental.service;

import com.vehiclerental.dto.vehicle.VehicleRequest;
import com.vehiclerental.dto.vehicle.VehicleResponse;
import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.enums.Transmission;
import com.vehiclerental.enums.VehicleCategory;
import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.exception.ResourceNotFoundException;
import com.vehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<VehicleResponse> searchAvailable(LocalDate startDate, LocalDate endDate,
                                                  String category, String branch) {
        VehicleCategory vehicleCategory = null;
        if (category != null && !category.isBlank()) {
            vehicleCategory = VehicleCategory.valueOf(category.toUpperCase());
        }
        String branchFilter = (branch != null && !branch.isBlank()) ? branch : null;

        List<Vehicle> vehicles = vehicleRepository.findAvailableVehicles(
                startDate, endDate, vehicleCategory, branchFilter, VehicleStatus.AVAILABLE);

        return vehicles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse getById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return toResponse(vehicle);
    }

    public VehicleResponse create(VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new RuntimeException("Vehicle with this registration number already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .make(request.getMake())
                .model(request.getModel())
                .year(request.getYear())
                .registrationNumber(request.getRegistrationNumber())
                .category(VehicleCategory.valueOf(request.getCategory().toUpperCase()))
                .transmission(Transmission.valueOf(request.getTransmission().toUpperCase()))
                .dailyRate(request.getDailyRate())
                .imageUrl(request.getImageUrl())
                .status(VehicleStatus.AVAILABLE)
                .branch(request.getBranch())
                .build();

        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    public VehicleResponse update(UUID id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setCategory(VehicleCategory.valueOf(request.getCategory().toUpperCase()));
        vehicle.setTransmission(Transmission.valueOf(request.getTransmission().toUpperCase()));
        vehicle.setDailyRate(request.getDailyRate());
        vehicle.setImageUrl(request.getImageUrl());
        vehicle.setBranch(request.getBranch());

        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    public VehicleResponse updateStatus(UUID id, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setStatus(status);
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    public void delete(UUID id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .registrationNumber(vehicle.getRegistrationNumber())
                .category(vehicle.getCategory().name())
                .transmission(vehicle.getTransmission().name())
                .dailyRate(vehicle.getDailyRate())
                .imageUrl(vehicle.getImageUrl())
                .status(vehicle.getStatus().name())
                .branch(vehicle.getBranch())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }
}
