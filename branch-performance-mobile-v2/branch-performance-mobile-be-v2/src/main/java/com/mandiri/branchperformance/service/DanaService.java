package com.mandiri.branchperformance.service;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.model.entity.FactDanaDaily;
import com.mandiri.branchperformance.repository.DanaRepository;
import com.mandiri.branchperformance.repository.DanaTargetRepository;
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
public class DanaService {

    private final DanaRepository danaRepository;
    private final DanaTargetRepository danaTargetRepository;

    private static final String[] MONTH_SHORT = {
        "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"
    };

    public DanaSummaryDto getSummary(String level, String levelId, String snapshotDate,
                                     String periodCode, String segmentCode) {
        log.debug("getSummary level={} levelId={} snapshotDate={}", level, levelId, snapshotDate);
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<FactDanaDaily> rows = fetchByLevel(level, levelId, snapshot);

        BigDecimal avgBalance = sum(rows, FactDanaDaily::getAvgBalance);
        BigDecimal endingBalance = sum(rows, FactDanaDaily::getEndingBalance);
        BigDecimal cof = avg(rows, FactDanaDaily::getCof);

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
        List<FactDanaDaily> rows = fetchByLevel(level, levelId, snapshot);

        DanaGrowthDto dto = new DanaGrowthDto();
        dto.setGrowthMtd(avg(rows, FactDanaDaily::getGrowthMtd));
        dto.setGrowthYtd(avg(rows, FactDanaDaily::getGrowthYtd));
        dto.setGrowthYoy(avg(rows, FactDanaDaily::getGrowthYoy));

        // MoM: compare ending balance with snapshot ~30 days prior
        LocalDate prevRef = snapshot.minusDays(30);
        LocalDate prevSnapshot = findSnapshotBefore(level, levelId, prevRef);
        if (prevSnapshot != null) {
            List<FactDanaDaily> prevRows = fetchByLevel(level, levelId, prevSnapshot);
            BigDecimal currentEndBal = sum(rows, FactDanaDaily::getEndingBalance);
            BigDecimal prevEndBal = sum(prevRows, FactDanaDaily::getEndingBalance);
            dto.setGrowthMom(computeGrowthPct(currentEndBal, prevEndBal));
        } else {
            dto.setGrowthMom(BigDecimal.ZERO);
        }
        return dto;
    }

    public DanaChartDto getChart(String level, String levelId, String snapshotDate,
                                 String periodCode, String segmentCode, String groupBy) {
        List<Object[]> historyRows = fetchHistoryByLevel(level, levelId);
        Collections.reverse(historyRows); // ascending by date

        List<String> labels = new ArrayList<>();
        List<BigDecimal> endBals = new ArrayList<>();
        List<BigDecimal> avgBals = new ArrayList<>();

        for (Object[] row : historyRows) {
            LocalDate date = toLocalDate(row[0]);
            if (date == null) continue;
            labels.add(formatChartLabel(date, groupBy));
            endBals.add(toBd(row[1]));
            avgBals.add(toBd(row[2]));
        }

        DanaChartDto dto = new DanaChartDto();
        dto.setLabels(labels);
        dto.setEndingBalance(endBals);
        dto.setAvgBalance(avgBals);
        return dto;
    }

    public DanaCompositionDto getComposition(String level, String levelId, String snapshotDate,
                                             String periodCode, String segmentCode, String displayMode) {
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

    // ── Snapshot resolution ───────────────────────────────────────────────────

    private LocalDate resolveSnapshot(String snapshotDate, String level, String levelId) {
        if (snapshotDate != null && !snapshotDate.isBlank()) {
            LocalDate parsed = DateUtil.parseOrNull(snapshotDate);
            if (parsed != null) return parsed;
        }
        Timestamp latest = switch (level.toUpperCase()) {
            case "AREA"   -> danaRepository.findLatestSnapshotByArea(levelId);
            case "REGION" -> danaRepository.findLatestSnapshotByRegion(levelId);
            default       -> danaRepository.findLatestSnapshotByBranch(levelId);
        };
        return latest != null ? latest.toLocalDateTime().toLocalDate() : LocalDate.now();
    }

    private LocalDate findSnapshotBefore(String level, String levelId, LocalDate refDate) {
        Timestamp ref = Timestamp.valueOf(refDate.atStartOfDay());
        Timestamp result = switch (level.toUpperCase()) {
            case "AREA"   -> danaRepository.findLatestSnapshotBeforeByArea(levelId, ref);
            case "REGION" -> danaRepository.findLatestSnapshotBeforeByRegion(levelId, ref);
            default       -> danaRepository.findLatestSnapshotBeforeByBranch(levelId, ref);
        };
        return result != null ? result.toLocalDateTime().toLocalDate() : null;
    }

    // ── Data fetchers by level ────────────────────────────────────────────────

    private List<FactDanaDaily> fetchByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> danaRepository.findByAreaAndSnapshot(levelId, snapshot);
            case "REGION" -> danaRepository.findByRegionAndSnapshot(levelId, snapshot);
            default       -> danaRepository.findByBranchAndSnapshot(levelId, snapshot);
        };
    }

    private List<Object[]> fetchHistoryByLevel(String level, String levelId) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> danaRepository.findHistoryByArea(levelId);
            case "REGION" -> danaRepository.findHistoryByRegion(levelId);
            default       -> danaRepository.findHistoryByBranch(levelId);
        };
    }

    private List<Object[]> fetchCompositionByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> danaRepository.findCompositionByArea(levelId, snapshot);
            case "REGION" -> danaRepository.findCompositionByRegion(levelId, snapshot);
            default       -> danaRepository.findCompositionByBranch(levelId, snapshot);
        };
    }

    private List<Object[]> fetchDetailByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "REGION" -> danaRepository.findDetailByRegion(levelId, snapshot);
            case "AREA"   -> danaRepository.findDetailByArea(levelId, snapshot);
            default       -> List.of();
        };
    }

    private Object[] fetchTargetByLevel(String level, String levelId, String periodCode) {
        if (periodCode == null || periodCode.isBlank() || levelId == null || levelId.isBlank()) return null;
        try {
            return switch (level.toUpperCase()) {
                case "AREA"   -> danaTargetRepository.sumByAreaAndPeriodCode(levelId, periodCode);
                case "REGION" -> danaTargetRepository.sumByRegionAndPeriodCode(levelId, periodCode);
                default       -> danaTargetRepository.sumByBranchAndPeriodCode(levelId, periodCode);
            };
        } catch (Exception e) {
            log.warn("fetchTarget failed level={} period={}: {}", level, periodCode, e.getMessage());
            return null;
        }
    }

    // ── Math helpers ──────────────────────────────────────────────────────────

    private BigDecimal sum(List<FactDanaDaily> rows, Function<FactDanaDaily, BigDecimal> getter) {
        return rows.stream().map(getter).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal avg(List<FactDanaDaily> rows, Function<FactDanaDaily, BigDecimal> getter) {
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

    private String formatChartLabel(LocalDate date, String groupBy) {
        return switch (groupBy.toUpperCase()) {
            case "YEARLY"    -> String.valueOf(date.getYear());
            case "QUARTERLY" -> "Q" + ((date.getMonthValue() - 1) / 3 + 1) + "'"
                                + String.format("%02d", date.getYear() % 100);
            default -> MONTH_SHORT[date.getMonthValue() - 1] + "'"
                       + String.format("%02d", date.getYear() % 100);
        };
    }

    // ── Type helpers ──────────────────────────────────────────────────────────

    private BigDecimal extractBd(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) return BigDecimal.ZERO;
        Object v = row[index];
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return new BigDecimal(n.toString());
        try {
            return new BigDecimal(v.toString().trim());
        } catch (NumberFormatException e) {
            log.warn("extractBd: cannot parse '{}' as BigDecimal", v);
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal toBd(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return new BigDecimal(n.toString());
        try {
            return new BigDecimal(obj.toString().trim());
        } catch (NumberFormatException e) {
            log.warn("toBd: cannot parse '{}' as BigDecimal", obj);
            return BigDecimal.ZERO;
        }
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof LocalDate ld) return ld;
        if (obj instanceof Timestamp ts) return ts.toLocalDateTime().toLocalDate();
        if (obj instanceof java.sql.Date sd) return sd.toLocalDate();
        return DateUtil.parseOrNull(obj.toString());
    }
}
