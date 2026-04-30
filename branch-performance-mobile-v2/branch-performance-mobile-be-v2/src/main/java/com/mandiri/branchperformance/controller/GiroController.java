package com.mandiri.branchperformance.controller;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.service.GiroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/giro")
@RequiredArgsConstructor
@Slf4j
public class GiroController {

    private final GiroService giroService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<DanaSummaryDto>> getSummary(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                giroService.getSummary(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/growth")
    public ResponseEntity<ApiResponseDto<DanaGrowthDto>> getGrowth(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                giroService.getGrowth(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/composition")
    public ResponseEntity<ApiResponseDto<DanaCompositionDto>> getComposition(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                giroService.getComposition(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/detail")
    public ResponseEntity<ApiResponseDto<DanaDetailDto>> getDetail(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "AREA") String detailLevel,
            @RequestParam(required = false, defaultValue = "END_BAL") String metric) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                giroService.getDetail(level, levelId, snapshotDate, periodCode, segmentCode, detailLevel, metric)));
    }

    @GetMapping("/acquisition")
    public ResponseEntity<ApiResponseDto<GiroAcquisitionDto>> getAcquisition(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "MTD") String periodType) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                giroService.getAcquisition(level, levelId, snapshotDate, periodCode, segmentCode, periodType)));
    }
}
