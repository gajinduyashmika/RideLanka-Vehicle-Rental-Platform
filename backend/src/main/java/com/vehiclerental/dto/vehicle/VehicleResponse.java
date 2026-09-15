package com.vehiclerental.dto.vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private UUID id;
    private String make;
    private String model;
    private Integer year;
    private String registrationNumber;
    private String category;
    private String transmission;
    private BigDecimal dailyRate;
    private String imageUrl;
    private String status;
    private String branch;
    private LocalDateTime createdAt;
}
