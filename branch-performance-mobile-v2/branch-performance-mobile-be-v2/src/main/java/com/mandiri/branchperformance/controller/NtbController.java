package com.mandiri.branchperformance.controller;

import com.mandiri.branchperformance.model.dto.ApiResponseDto;
import com.mandiri.branchperformance.model.dto.NtbSummaryDto;
import com.mandiri.branchperformance.service.NtbService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ntb")
@RequiredArgsConstructor
@Slf4j
public class NtbController {

    private final NtbService ntbService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<NtbSummaryDto>> getSummary(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "MTD") String periodType) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                ntbService.getSummary(level, levelId, snapshotDate, periodCode, segmentCode, periodType)));
    }
}
