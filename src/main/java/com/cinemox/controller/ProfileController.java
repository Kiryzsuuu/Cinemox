package com.cinemox.controller;

import com.cinemox.model.User;
import com.cinemox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String UPLOAD_DIR = "src/main/resources/static/uploads/profiles/";

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("email", user.getEmail());
            profileData.put("fullName", user.getFullName());
            profileData.put("phoneNumber", user.getPhoneNumber());
            profileData.put("profilePicture", user.getProfilePicture());
            profileData.put("roles", user.getRoles());
            profileData.put("emailVerified", user.isEmailVerified());
            profileData.put("createdAt", user.getCreatedAt());

            response.put("success", true);
            response.put("data", profileData);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> updates,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (updates.containsKey("fullName")) {
                user.setFullName(updates.get("fullName"));
            }
            if (updates.containsKey("phoneNumber")) {
                user.setPhoneNumber(updates.get("phoneNumber"));
            }

            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Profile updated successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> passwordData,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                response.put("success", false);
                response.put("message", "Current password is incorrect");
                return ResponseEntity.ok(response);
            }

            if (newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "New password must be at least 6 characters");
                return ResponseEntity.ok(response);
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Password changed successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-picture")
    public ResponseEntity<Map<String, Object>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select a file to upload");
                return ResponseEntity.ok(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Only image files are allowed");
                return ResponseEntity.ok(response);
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size must not exceed 5MB");
                return ResponseEntity.ok(response);
            }

            // Create upload directory if not exists
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Delete old profile picture if exists
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                String oldFileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                Path oldFilePath = Paths.get(UPLOAD_DIR + oldFileName);
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    // Ignore if file doesn't exist
                }
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = Paths.get(UPLOAD_DIR + newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user profile
            String profilePictureUrl = "/uploads/profiles/" + newFilename;
            user.setProfilePicture(profilePictureUrl);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Profile picture uploaded successfully");
            response.put("profilePicture", profilePictureUrl);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-picture")
    public ResponseEntity<Map<String, Object>> deleteProfilePicture(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                String fileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.deleteIfExists(filePath);

                user.setProfilePicture(null);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }

            response.put("success", true);
            response.put("message", "Profile picture deleted successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
