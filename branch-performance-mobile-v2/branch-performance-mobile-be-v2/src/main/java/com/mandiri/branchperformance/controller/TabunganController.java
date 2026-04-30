package com.mandiri.branchperformance.controller;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.service.TabunganService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tabungan")
@RequiredArgsConstructor
@Slf4j
public class TabunganController {

    private final TabunganService tabunganService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<DanaSummaryDto>> getSummary(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                tabunganService.getSummary(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/growth")
    public ResponseEntity<ApiResponseDto<DanaGrowthDto>> getGrowth(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                tabunganService.getGrowth(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/chart")
    public ResponseEntity<ApiResponseDto<TabunganChartDto>> getChart(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "MONTHLY") String groupBy) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                tabunganService.getChart(level, levelId, snapshotDate, periodCode, segmentCode, groupBy)));
    }

    @GetMapping("/composition")
    public ResponseEntity<ApiResponseDto<DanaCompositionDto>> getComposition(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "MTD") String growthPeriod) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                tabunganService.getComposition(level, levelId, snapshotDate, periodCode, segmentCode, growthPeriod)));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponseDto<TabunganMetricsDto>> getMetrics(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                tabunganService.getMetrics(level, levelId, snapshotDate, periodCode, segmentCode)));
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
                tabunganService.getDetail(level, levelId, snapshotDate, periodCode, segmentCode, detailLevel, metric)));
    }
}
