package com.cinemox.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "otps")
public class OTP {
    @Id
    private String id;

    private String email;

    private String otp;

    private String type; // REGISTRATION, FORGOT_PASSWORD

    private LocalDateTime expiryTime;

    private boolean used = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
