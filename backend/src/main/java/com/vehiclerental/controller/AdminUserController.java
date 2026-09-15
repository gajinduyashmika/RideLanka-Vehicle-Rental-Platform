package com.vehiclerental.controller;

import com.vehiclerental.dto.user.AdminUserUpdateRequest;
import com.vehiclerental.dto.user.UserProfileResponse;
import com.vehiclerental.entity.User;
import com.vehiclerental.enums.Role;
import com.vehiclerental.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User Management", description = "Endpoints for administrators to manage all users")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List all users with optional role and keyword search")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role) {
        return ResponseEntity.ok(userService.getAllUsers(search, role));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Update user role (promote to ADMIN or demote to CUSTOMER)")
    public ResponseEntity<UserProfileResponse> updateUserRole(
            @PathVariable UUID id,
            @RequestBody AdminUserUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required");
        }
        Role newRole = Role.valueOf(request.getRole().toUpperCase());
        return ResponseEntity.ok(userService.updateUserRole(id, newRole, currentUser));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle user active/suspended status")
    public ResponseEntity<UserProfileResponse> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody AdminUserUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (request.getEnabled() == null) {
            throw new IllegalArgumentException("Enabled status is required");
        }
        return ResponseEntity.ok(userService.updateUserStatus(id, request.getEnabled(), currentUser));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user account")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        userService.deleteUser(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
