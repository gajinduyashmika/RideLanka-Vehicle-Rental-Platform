package com.vehiclerental.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private UUID vehicleId;
    private String vehicleName;
    private String vehicleCategory;
    private String branch;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalCost;
    private String status;
    private LocalDateTime createdAt;
}
