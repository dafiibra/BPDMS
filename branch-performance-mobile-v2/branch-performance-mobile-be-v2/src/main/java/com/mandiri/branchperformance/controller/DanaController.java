package com.mandiri.branchperformance.controller;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.service.DanaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dana")
@RequiredArgsConstructor
@Slf4j
public class DanaController {

    private final DanaService danaService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<DanaSummaryDto>> getSummary(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                danaService.getSummary(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/growth")
    public ResponseEntity<ApiResponseDto<DanaGrowthDto>> getGrowth(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                danaService.getGrowth(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/chart")
    public ResponseEntity<ApiResponseDto<DanaChartDto>> getChart(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "MONTHLY") String groupBy) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                danaService.getChart(level, levelId, snapshotDate, periodCode, segmentCode, groupBy)));
    }

    @GetMapping("/composition")
    public ResponseEntity<ApiResponseDto<DanaCompositionDto>> getComposition(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "NOMINAL") String displayMode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                danaService.getComposition(level, levelId, snapshotDate, periodCode, segmentCode, displayMode)));
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
                danaService.getDetail(level, levelId, snapshotDate, periodCode, segmentCode, detailLevel, metric)));
    }
}
