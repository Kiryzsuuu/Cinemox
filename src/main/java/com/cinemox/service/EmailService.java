package com.cinemox.service;

import com.cinemox.model.OTP;
import com.cinemox.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private OTPRepository otpRepository;

    public void sendOTP(String email, String type) {
        try {
            String otp = generateOTP();

            // Delete existing OTPs for this email
            otpRepository.deleteByEmail(email);

            // Save new OTP
            OTP otpEntity = new OTP();
            otpEntity.setEmail(email);
            otpEntity.setOtp(otp);
            otpEntity.setType(type);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(10));
            otpRepository.save(otpEntity);

            System.out.println("OTP generated for " + email + ": " + otp);

            // Send email
            String subject = type.equals("REGISTRATION") ? "Verify Your Email - Cinemox"
                    : "Reset Your Password - Cinemox";
            String body = buildOTPEmailBody(otp, type);

            sendHtmlEmail(email, subject, body);

            System.out.println("OTP email sent successfully to " + email);
        } catch (Exception e) {
            System.err.println("Error sending OTP: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    public void sendBookingConfirmation(String email, String bookingCode, String movieTitle,
            String showDate, String showTime, String theater,
            String seats, Double totalPrice, String barcodeUrl) {
        String subject = "Booking Confirmation - Cinemox";
        String body = buildBookingEmailBody(bookingCode, movieTitle, showDate, showTime,
                theater, seats, totalPrice, barcodeUrl);

        sendHtmlEmail(email, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            System.out.println("Attempting to send email to: " + to);
            System.out.println("Subject: " + subject);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("maskiryz23@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);

            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String buildOTPEmailBody(String otp, String type) {
        String purpose = type.equals("REGISTRATION") ? "verify your email" : "reset your password";

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #F4F4F4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #005461 0%, #018790 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .otp-box {
                            background-color: #00B7B5;
                            color: white;
                            font-size: 32px;
                            font-weight: bold;
                            padding: 20px;
                            border-radius: 10px;
                            letter-spacing: 8px;
                            margin: 30px 0;
                        }
                        .footer {
                            background-color: #005461;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cinemox</h1>
                        </div>
                        <div class="content">
                            <h2>OTP Verification</h2>
                            <p>Use the following OTP to """ + purpose + """
                :</p>
                                        <div class="otp-box">""" + otp + """
                </div>
                                        <p>This OTP will expire in 10 minutes.</p>
                                        <p>If you didn't request this, please ignore this email.</p>
                                    </div>
                                    <div class="footer">
                                        <p>&copy; 2024 Cinemox. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            """;
    }

    private String buildBookingEmailBody(String bookingCode, String movieTitle, String showDate,
            String showTime, String theater, String seats,
            Double totalPrice, String barcodeUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #F4F4F4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #005461 0%, #018790 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .booking-info {
                            background-color: #F4F4F4;
                            padding: 20px;
                            border-radius: 10px;
                            margin: 20px 0;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 10px 0;
                            padding: 10px 0;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #005461;
                        }
                        .barcode {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .barcode img {
                            max-width: 300px;
                            height: auto;
                        }
                        .booking-code {
                            background-color: #00B7B5;
                            color: white;
                            font-size: 24px;
                            font-weight: bold;
                            padding: 15px;
                            border-radius: 10px;
                            text-align: center;
                            margin: 20px 0;
                            letter-spacing: 2px;
                        }
                        .footer {
                            background-color: #005461;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Booking Confirmed</h1>
                        </div>
                        <div class="content">
                            <h2>Your Ticket is Ready</h2>
                            <div class="booking-code">""" + bookingCode + """
                </div>
                                        <div class="booking-info">
                                            <div class="info-row">
                                                <span class="info-label">Movie:</span>
                                                <span>""" + movieTitle + """
                </span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Date:</span>
                                                <span>""" + showDate + """
                </span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Time:</span>
                                                <span>""" + showTime + """
                </span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Theater:</span>
                                                <span>""" + theater + """
                </span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Seats:</span>
                                                <span>""" + seats + """
                </span>
                                            </div>
                                            <div class="info-row">
                                                <span class="info-label">Total Price:</span>
                                                <span>Rp """ + String.format("%,.0f", totalPrice) + """
                </span>
                                            </div>
                                        </div>
                                        <div class="barcode">
                                            <p>Scan this barcode at the cinema:</p>
                                            <img src="cid:barcode" alt="Barcode"/>
                                        </div>
                                        <p style="text-align: center; color: #666;">
                                            Please present this ticket at the cinema entrance.
                                        </p>
                                    </div>
                                    <div class="footer">
                                        <p>&copy; 2024 Cinemox. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            """;
    }
}
