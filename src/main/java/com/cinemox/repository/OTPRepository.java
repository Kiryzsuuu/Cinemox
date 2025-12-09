package com.cinemox.repository;

import com.cinemox.model.OTP;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends MongoRepository<OTP, String> {
    Optional<OTP> findByEmailAndOtpAndUsedFalse(String email, String otp);

    void deleteByEmail(String email);
}
