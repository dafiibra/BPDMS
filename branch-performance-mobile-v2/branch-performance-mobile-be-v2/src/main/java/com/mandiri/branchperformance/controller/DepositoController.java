package com.mandiri.branchperformance.controller;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.service.DepositoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/deposito")
@RequiredArgsConstructor
@Slf4j
public class DepositoController {

    private final DepositoService depositoService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<DepositoSummaryDto>> getSummary(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                depositoService.getSummary(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/growth")
    public ResponseEntity<ApiResponseDto<DanaGrowthDto>> getGrowth(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                depositoService.getGrowth(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/composition")
    public ResponseEntity<ApiResponseDto<DanaCompositionDto>> getComposition(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                depositoService.getComposition(level, levelId, snapshotDate, periodCode, segmentCode)));
    }

    @GetMapping("/detail")
    public ResponseEntity<ApiResponseDto<DanaDetailDto>> getDetail(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode,
            @RequestParam(required = false, defaultValue = "AREA") String detailLevel,
            @RequestParam(required = false, defaultValue = "AVG_BAL") String metric) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                depositoService.getDetail(level, levelId, snapshotDate, periodCode, segmentCode, detailLevel, metric)));
    }

    @GetMapping("/currency")
    public ResponseEntity<ApiResponseDto<DepositoCurrencyDto>> getCurrency(
            @RequestParam String level,
            @RequestParam String levelId,
            @RequestParam(required = false) String snapshotDate,
            @RequestParam(required = false) String periodCode,
            @RequestParam(required = false, defaultValue = "ALL") String segmentCode) {
        return ResponseEntity.ok(ApiResponseDto.ok(
                depositoService.getCurrency(level, levelId, snapshotDate, periodCode, segmentCode)));
    }
}
