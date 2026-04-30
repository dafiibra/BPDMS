package com.mandiri.branchperformance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ApiResponseDto<T> {

    private boolean success;
    private T data;
    private String message;
    private LocalDateTime timestamp;

    public static <T> ApiResponseDto<T> ok(T data) {
        return new ApiResponseDto<T>(true, data, "OK", LocalDateTime.now());
    }

    public static <T> ApiResponseDto<T> error(String message) {
        return new ApiResponseDto<T>(false, null, message, LocalDateTime.now());
    }
}
