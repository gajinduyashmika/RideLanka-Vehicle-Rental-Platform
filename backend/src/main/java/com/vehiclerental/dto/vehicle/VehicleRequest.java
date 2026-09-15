package com.vehiclerental.dto.vehicle;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleRequest {

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1990, message = "Year must be 1990 or later")
    private Integer year;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Category is required")
    private String category; // "SCOOTER", "CAR", "VAN"

    @NotBlank(message = "Transmission is required")
    private String transmission; // "MANUAL", "AUTOMATIC"

    @NotNull(message = "Daily rate is required")
    @DecimalMin(value = "0.01", message = "Daily rate must be positive")
    private BigDecimal dailyRate;

    private String imageUrl;

    @NotBlank(message = "Branch is required")
    private String branch;
}
