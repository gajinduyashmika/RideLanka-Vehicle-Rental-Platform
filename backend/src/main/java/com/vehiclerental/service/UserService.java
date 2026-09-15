package com.vehiclerental.service;

import com.vehiclerental.dto.user.ChangePasswordRequest;
import com.vehiclerental.dto.user.UpdateProfileRequest;
import com.vehiclerental.dto.user.UserProfileResponse;
import com.vehiclerental.entity.User;
import com.vehiclerental.enums.Role;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(User user) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileResponse(freshUser);
    }

    @Transactional
    public UserProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        freshUser.setFullName(request.getFullName().trim());
        freshUser.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        freshUser.setDrivingLicenseNumber(request.getDrivingLicenseNumber() != null ? request.getDrivingLicenseNumber().trim() : null);
        freshUser.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        freshUser.setCity(request.getCity() != null ? request.getCity().trim() : null);

        freshUser = userRepository.save(freshUser);
        return mapToProfileResponse(freshUser);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), freshUser.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        freshUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(freshUser);
    }

    public List<UserProfileResponse> getAllUsers(String search, Role role) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRoleOrderByCreatedAtDesc(role);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            users = users.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                                 (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                                 (u.getPhoneNumber() != null && u.getPhoneNumber().toLowerCase().contains(q)) ||
                                 (u.getDrivingLicenseNumber() != null && u.getDrivingLicenseNumber().toLowerCase().contains(q)) ||
                                 (u.getCity() != null && u.getCity().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return users.stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateUserRole(UUID userId, Role newRole, User currentUser) {
        if (currentUser.getId().equals(userId) && newRole != currentUser.getRole()) {
            throw new IllegalArgumentException("Admins cannot change their own role");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        targetUser.setRole(newRole);
        targetUser = userRepository.save(targetUser);
        return mapToProfileResponse(targetUser);
    }

    @Transactional
    public UserProfileResponse updateUserStatus(UUID userId, boolean enabled, User currentUser) {
        if (currentUser.getId().equals(userId) && !enabled) {
            throw new IllegalArgumentException("Admins cannot disable their own account");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        targetUser.setEnabled(enabled);
        targetUser = userRepository.save(targetUser);
        return mapToProfileResponse(targetUser);
    }

    @Transactional
    public void deleteUser(UUID userId, User currentUser) {
        if (currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Admins cannot delete their own account");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        userRepository.delete(targetUser);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        long bookingCount = bookingRepository.countByCustomerId(user.getId());
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .drivingLicenseNumber(user.getDrivingLicenseNumber())
                .address(user.getAddress())
                .city(user.getCity())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .totalBookings(bookingCount)
                .build();
    }
}
