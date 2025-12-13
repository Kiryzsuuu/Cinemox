package com.cinemox.service;

import com.cinemox.dto.*;
import com.cinemox.model.OTP;
import com.cinemox.model.User;
import com.cinemox.repository.OTPRepository;
import com.cinemox.repository.UserRepository;
import com.cinemox.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

        public Map<String, Object> getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRoles().contains("ADMIN") ? "ADMIN" : "USER";

        return Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", role,
            "phoneNumber", user.getPhoneNumber(),
            "active", user.isActive(),
            "emailVerified", user.isEmailVerified()
        );
        }

    @Transactional
    public ApiResponse register(RegisterRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                return new ApiResponse(false, "Email already exists", null);
            }

            // Create user (not verified yet)
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setEmailVerified(false);

            Set<String> roles = new HashSet<>();
            roles.add("USER");
            user.setRoles(roles);

            userRepository.save(user);

            // Send OTP after user is created
            try {
                emailService.sendOTP(request.getEmail(), "REGISTRATION");
            } catch (Exception e) {
                System.err.println("Failed to send OTP email: " + e.getMessage());
                e.printStackTrace();
                // Continue with registration even if email fails
            }

            return new ApiResponse(true,
                    "Registration successful. Please verify your email with OTP sent to " + request.getEmail(), null);
        } catch (Exception e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse verifyEmail(VerifyOTPRequest request) {
        OTP otp = otpRepository.findByEmailAndOtpAndUsedFalse(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            return new ApiResponse(false, "OTP has expired", null);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        return new ApiResponse(true, "Email verified successfully. You can now login.", null);
    }

    public ApiResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new ApiResponse(false, "Invalid credentials", null);
        }

        if (!user.isEmailVerified()) {
            return new ApiResponse(false, "Please verify your email first", null);
        }

        if (!user.isActive()) {
            return new ApiResponse(false, "Your account has been deactivated", null);
        }

        String role = user.getRoles().contains("ADMIN") ? "ADMIN" : "USER";
        String token = jwtUtil.generateToken(user.getEmail(), role);

        AuthResponse authResponse = new AuthResponse(token, user.getEmail(), user.getFullName(), role);
        return new ApiResponse(true, "Login successful", authResponse);
    }

    public ApiResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        emailService.sendOTP(email, "FORGOT_PASSWORD");

        return new ApiResponse(true, "OTP sent to your email", null);
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        OTP otp = otpRepository.findByEmailAndOtpAndUsedFalse(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            return new ApiResponse(false, "OTP has expired", null);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        return new ApiResponse(true, "Password reset successful", null);
    }

    public ApiResponse resendOTP(String email, String type) {
        try {
            // Check if user exists
            userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Send new OTP
            emailService.sendOTP(email, type);

            return new ApiResponse(true, "OTP sent to " + email, null);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP: " + e.getMessage());
        }
    }
}
