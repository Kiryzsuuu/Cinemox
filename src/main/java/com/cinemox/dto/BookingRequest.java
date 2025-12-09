package com.cinemox.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Data
public class BookingRequest {
    @NotBlank(message = "Schedule ID is required")
    private String scheduleId;

    @NotEmpty(message = "At least one seat must be selected")
    private List<String> seats;

    @NotNull(message = "Total price is required")
    private Double totalPrice;
}
