package com.vehiclerental.dto.vehicle;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VehicleStatusUpdate {

    @NotBlank(message = "Status is required")
    private String status; // "AVAILABLE", "RENTED", "MAINTENANCE"
}
