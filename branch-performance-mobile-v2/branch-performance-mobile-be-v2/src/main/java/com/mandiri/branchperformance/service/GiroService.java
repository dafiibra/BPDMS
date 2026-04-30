package com.mandiri.branchperformance.service;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.model.entity.FactGiroDaily;
import com.mandiri.branchperformance.repository.GiroRepository;
import com.mandiri.branchperformance.repository.GiroTargetRepository;
import com.mandiri.branchperformance.util.DateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GiroService {

    private final GiroRepository giroRepository;
    private final GiroTargetRepository giroTargetRepository;

    private static final String[] MONTH_SHORT = {
        "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"
    };

    public DanaSummaryDto getSummary(String level, String levelId, String snapshotDate,
                                     String periodCode, String segmentCode) {
        log.debug("giro getSummary level={} levelId={}", level, levelId);
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<FactGiroDaily> rows = fetchByLevel(level, levelId, snapshot);

        BigDecimal avgBalance = sum(rows, FactGiroDaily::getAvgBalance);
        BigDecimal endingBalance = sum(rows, FactGiroDaily::getEndingBalance);
        BigDecimal cof = avg(rows, FactGiroDaily::getCof);

        String resolvedPeriod = resolvePeriodCode(periodCode, snapshot);
        Object[] target = fetchTargetByLevel(level, levelId, resolvedPeriod);
        BigDecimal avgBalTarget = extractBd(target, 0);
        BigDecimal endBalTarget = extractBd(target, 1);

        DanaSummaryDto dto = new DanaSummaryDto();
        dto.setAvgBalance(avgBalance);
        dto.setEndingBalance(endingBalance);
        dto.setCof(cof);
        dto.setAvgBalanceTarget(avgBalTarget);
        dto.setEndingBalanceTarget(endBalTarget);
        dto.setAvgBalanceAchievementPct(computeAchievement(avgBalance, avgBalTarget));
        dto.setEndingBalanceAchievementPct(computeAchievement(endingBalance, endBalTarget));
        dto.setSnapshotDate(snapshot);
        return dto;
    }

    public DanaGrowthDto getGrowth(String level, String levelId, String snapshotDate,
                                   String periodCode, String segmentCode) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<FactGiroDaily> rows = fetchByLevel(level, levelId, snapshot);

        DanaGrowthDto dto = new DanaGrowthDto();
        dto.setGrowthMtd(avg(rows, FactGiroDaily::getGrowthMtd));
        dto.setGrowthYtd(avg(rows, FactGiroDaily::getGrowthYtd));
        dto.setGrowthYoy(avg(rows, FactGiroDaily::getGrowthYoy));

        LocalDate prevRef = snapshot.minusDays(30);
        LocalDate prevSnapshot = findSnapshotBefore(level, levelId, prevRef);
        if (prevSnapshot != null) {
            List<FactGiroDaily> prevRows = fetchByLevel(level, levelId, prevSnapshot);
            BigDecimal currentEndBal = sum(rows, FactGiroDaily::getEndingBalance);
            BigDecimal prevEndBal = sum(prevRows, FactGiroDaily::getEndingBalance);
            dto.setGrowthMom(computeGrowthPct(currentEndBal, prevEndBal));
        } else {
            dto.setGrowthMom(BigDecimal.ZERO);
        }
        return dto;
    }

    public DanaCompositionDto getComposition(String level, String levelId, String snapshotDate,
                                             String periodCode, String segmentCode) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<Object[]> rows = fetchCompositionByLevel(level, levelId, snapshot);

        BigDecimal total = rows.stream().map(r -> toBd(r[2])).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DanaCompositionDto.SegmentItem> segments = rows.stream().map(r -> {
            DanaCompositionDto.SegmentItem item = new DanaCompositionDto.SegmentItem();
            item.setSegmentCode((String) r[0]);
            item.setSegmentName((String) r[1]);
            BigDecimal endBal = toBd(r[2]);
            item.setEndingBalance(endBal);
            item.setProportion(total.compareTo(BigDecimal.ZERO) > 0
                ? endBal.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO);
            return item;
        }).collect(Collectors.toList());

        DanaCompositionDto dto = new DanaCompositionDto();
        dto.setSegments(segments);
        return dto;
    }

    public DanaDetailDto getDetail(String level, String levelId, String snapshotDate,
                                   String periodCode, String segmentCode, String detailLevel, String metric) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<Object[]> rows = fetchDetailByLevel(level, levelId, snapshot);

        List<DanaDetailDto.DetailItem> items = rows.stream().map(r -> {
            DanaDetailDto.DetailItem item = new DanaDetailDto.DetailItem();
            item.setCode((String) r[0]);
            item.setName((String) r[1]);
            item.setAvgBalance(toBd(r[2]));
            item.setEndingBalance(toBd(r[3]));
            item.setCof(toBd(r[4]));
            item.setTarget(BigDecimal.ZERO);
            item.setAchievementPct(BigDecimal.ZERO);
            return item;
        }).collect(Collectors.toList());

        DanaDetailDto dto = new DanaDetailDto();
        dto.setItems(items);
        return dto;
    }

    public GiroAcquisitionDto getAcquisition(String level, String levelId, String snapshotDate,
                                             String periodCode, String segmentCode, String periodType) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        LocalDate startDate = "YTD".equalsIgnoreCase(periodType)
            ? DateUtil.startOfYear(snapshot)
            : DateUtil.startOfMonth(snapshot);

        Object[] rows = fetchAcquisitionByLevel(level, levelId, startDate, snapshot);

        long newCif = toLong(rows, 0);
        long churn = toLong(rows, 1);
        long netCif = toLong(rows, 2);
        BigDecimal endingBalance = extractBd(rows, 3);

        // Target new CIF from giro target
        String resolvedPeriod = resolvePeriodCode(periodCode, snapshot);
        Object[] target = fetchTargetByLevel(level, levelId, resolvedPeriod);
        long newCifTarget = extractLong(target, 3);

        BigDecimal newCifAchievementPct = newCifTarget > 0
            ? BigDecimal.valueOf(newCif)
                .divide(BigDecimal.valueOf(newCifTarget), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        GiroAcquisitionDto dto = new GiroAcquisitionDto();
        dto.setNewCif(newCif);
        dto.setNewCifTarget(newCifTarget);
        dto.setNewCifAchievementPct(newCifAchievementPct);
        dto.setChurn(churn);
        dto.setNetCif(netCif);
        dto.setEndingBalance(endingBalance);
        return dto;
    }

    // ── Snapshot resolution ───────────────────────────────────────────────────

    private LocalDate resolveSnapshot(String snapshotDate, String level, String levelId) {
        if (snapshotDate != null && !snapshotDate.isBlank()) {
            LocalDate parsed = DateUtil.parseOrNull(snapshotDate);
            if (parsed != null) return parsed;
        }
        Timestamp latest = switch (level.toUpperCase()) {
            case "AREA"   -> giroRepository.findLatestSnapshotByArea(levelId);
            case "REGION" -> giroRepository.findLatestSnapshotByRegion(levelId);
            default       -> giroRepository.findLatestSnapshotByBranch(levelId);
        };
        return latest != null ? latest.toLocalDateTime().toLocalDate() : LocalDate.now();
    }

    private LocalDate findSnapshotBefore(String level, String levelId, LocalDate refDate) {
        Timestamp ref = Timestamp.valueOf(refDate.atStartOfDay());
        Timestamp result = switch (level.toUpperCase()) {
            case "AREA"   -> giroRepository.findLatestSnapshotBeforeByArea(levelId, ref);
            case "REGION" -> giroRepository.findLatestSnapshotBeforeByRegion(levelId, ref);
            default       -> giroRepository.findLatestSnapshotBeforeByBranch(levelId, ref);
        };
        return result != null ? result.toLocalDateTime().toLocalDate() : null;
    }

    // ── Data fetchers by level ────────────────────────────────────────────────

    private List<FactGiroDaily> fetchByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> giroRepository.findByAreaAndSnapshot(levelId, snapshot);
            case "REGION" -> giroRepository.findByRegionAndSnapshot(levelId, snapshot);
            default       -> giroRepository.findByBranchAndSnapshot(levelId, snapshot);
        };
    }

    private List<Object[]> fetchCompositionByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> giroRepository.findCompositionByArea(levelId, snapshot);
            case "REGION" -> giroRepository.findCompositionByRegion(levelId, snapshot);
            default       -> giroRepository.findCompositionByBranch(levelId, snapshot);
        };
    }

    private List<Object[]> fetchDetailByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "REGION" -> giroRepository.findDetailByRegion(levelId, snapshot);
            case "AREA"   -> giroRepository.findDetailByArea(levelId, snapshot);
            default       -> List.of();
        };
    }

    private Object[] fetchAcquisitionByLevel(String level, String levelId,
                                              LocalDate startDate, LocalDate endDate) {
        try {
            return switch (level.toUpperCase()) {
                case "AREA"   -> giroRepository.findAcquisitionByAreaAndPeriod(levelId, startDate, endDate);
                case "REGION" -> giroRepository.findAcquisitionByRegionAndPeriod(levelId, startDate, endDate);
                default       -> giroRepository.findAcquisitionByBranchAndPeriod(levelId, startDate, endDate);
            };
        } catch (Exception e) {
            log.warn("fetchAcquisition failed: {}", e.getMessage());
            return null;
        }
    }

    private Object[] fetchTargetByLevel(String level, String levelId, String periodCode) {
        if (periodCode == null || periodCode.isBlank() || levelId == null || levelId.isBlank()) return null;
        try {
            return switch (level.toUpperCase()) {
                case "AREA"   -> giroTargetRepository.sumByAreaAndPeriodCode(levelId, periodCode);
                case "REGION" -> giroTargetRepository.sumByRegionAndPeriodCode(levelId, periodCode);
                default       -> giroTargetRepository.sumByBranchAndPeriodCode(levelId, periodCode);
            };
        } catch (Exception e) {
            log.warn("giro fetchTarget failed level={} period={}: {}", level, periodCode, e.getMessage());
            return null;
        }
    }

    // ── Math helpers ──────────────────────────────────────────────────────────

    private BigDecimal sum(List<FactGiroDaily> rows, Function<FactGiroDaily, BigDecimal> getter) {
        return rows.stream().map(getter).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal avg(List<FactGiroDaily> rows, Function<FactGiroDaily, BigDecimal> getter) {
        if (rows.isEmpty()) return BigDecimal.ZERO;
        return sum(rows, getter).divide(BigDecimal.valueOf(rows.size()), 4, RoundingMode.HALF_UP);
    }

    private BigDecimal computeAchievement(BigDecimal actual, BigDecimal target) {
        if (target == null || target.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return actual.divide(target, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal computeGrowthPct(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return current.subtract(previous)
            .divide(previous.abs(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
    }

    private String resolvePeriodCode(String periodCode, LocalDate snapshot) {
        if (periodCode != null && !periodCode.isBlank()) return periodCode;
        return snapshot.getYear() + "-" + String.format("%02d", snapshot.getMonthValue());
    }

    // ── Type helpers ──────────────────────────────────────────────────────────

    private BigDecimal extractBd(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) return BigDecimal.ZERO;
        Object v = row[index];
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return new BigDecimal(n.toString());
        try { return new BigDecimal(v.toString().trim()); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private long toLong(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) return 0L;
        Object v = row[index];
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString().trim()); }
        catch (NumberFormatException e) { return 0L; }
    }

    private long extractLong(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) return 0L;
        Object v = row[index];
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString().trim()); }
        catch (NumberFormatException e) { return 0L; }
    }

    private BigDecimal toBd(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return new BigDecimal(n.toString());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }
}
