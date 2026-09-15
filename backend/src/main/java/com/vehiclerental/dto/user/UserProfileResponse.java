package com.vehiclerental.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String drivingLicenseNumber;
    private String address;
    private String city;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;
    private long totalBookings;
}
