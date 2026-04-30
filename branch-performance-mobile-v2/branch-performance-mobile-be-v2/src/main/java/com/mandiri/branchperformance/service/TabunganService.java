package com.mandiri.branchperformance.service;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.model.entity.FactTabunganDaily;
import com.mandiri.branchperformance.repository.TabunganRepository;
import com.mandiri.branchperformance.repository.TabunganTargetRepository;
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
public class TabunganService {

    private final TabunganRepository tabunganRepository;
    private final TabunganTargetRepository tabunganTargetRepository;

    private static final String[] MONTH_SHORT = {
        "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"
    };

    public DanaSummaryDto getSummary(String level, String levelId, String snapshotDate,
                                     String periodCode, String segmentCode) {
        log.debug("tabungan getSummary level={} levelId={}", level, levelId);
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<FactTabunganDaily> rows = fetchByLevel(level, levelId, snapshot);

        BigDecimal avgBalance = sum(rows, FactTabunganDaily::getAvgBalance);
        BigDecimal endingBalance = sum(rows, FactTabunganDaily::getEndingBalance);
        BigDecimal cof = avg(rows, FactTabunganDaily::getCof);

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
        List<FactTabunganDaily> rows = fetchByLevel(level, levelId, snapshot);

        DanaGrowthDto dto = new DanaGrowthDto();
        dto.setGrowthMtd(avg(rows, FactTabunganDaily::getGrowthMtd));
        dto.setGrowthYtd(avg(rows, FactTabunganDaily::getGrowthYtd));
        dto.setGrowthYoy(avg(rows, FactTabunganDaily::getGrowthYoy));

        LocalDate prevRef = snapshot.minusDays(30);
        LocalDate prevSnapshot = findSnapshotBefore(level, levelId, prevRef);
        if (prevSnapshot != null) {
            List<FactTabunganDaily> prevRows = fetchByLevel(level, levelId, prevSnapshot);
            BigDecimal currentEndBal = sum(rows, FactTabunganDaily::getEndingBalance);
            BigDecimal prevEndBal = sum(prevRows, FactTabunganDaily::getEndingBalance);
            dto.setGrowthMom(computeGrowthPct(currentEndBal, prevEndBal));
        } else {
            dto.setGrowthMom(BigDecimal.ZERO);
        }
        return dto;
    }

    public TabunganChartDto getChart(String level, String levelId, String snapshotDate,
                                      String periodCode, String segmentCode, String groupBy) {
        // Current year history
        List<Object[]> historyRows = fetchHistoryByLevel(level, levelId);
        Collections.reverse(historyRows); // ascending

        // Prev year history
        List<Object[]> prevHistoryRows = fetchPrevYearHistoryByLevel(level, levelId);
        Collections.reverse(prevHistoryRows); // ascending

        // Build current year series
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

        // Build prev year series (align by label count)
        List<BigDecimal> prevEndBals = new ArrayList<>();
        List<BigDecimal> prevAvgBals = new ArrayList<>();
        for (Object[] row : prevHistoryRows) {
            prevEndBals.add(toBd(row[1]));
            prevAvgBals.add(toBd(row[2]));
        }
        // Pad or trim prev year to match current year length
        while (prevEndBals.size() < labels.size()) {
            prevEndBals.add(BigDecimal.ZERO);
            prevAvgBals.add(BigDecimal.ZERO);
        }

        TabunganChartDto dto = new TabunganChartDto();
        dto.setLabels(labels);
        dto.setEndingBalance(endBals);
        dto.setPrevEndingBalance(prevEndBals.subList(0, Math.min(prevEndBals.size(), labels.size())));
        dto.setAvgBalance(avgBals);
        dto.setPrevAvgBalance(prevAvgBals.subList(0, Math.min(prevAvgBals.size(), labels.size())));
        return dto;
    }

    public DanaCompositionDto getComposition(String level, String levelId, String snapshotDate,
                                             String periodCode, String segmentCode, String growthPeriod) {
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

    public TabunganMetricsDto getMetrics(String level, String levelId, String snapshotDate,
                                         String periodCode, String segmentCode) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);

        // 5-day delta: compare ending balance with snapshot 5 days prior
        LocalDate prevRef = snapshot.minusDays(5);
        LocalDate prevSnapshot = findSnapshotBefore(level, levelId, prevRef);

        BigDecimal delta5Days = BigDecimal.ZERO;
        if (prevSnapshot != null) {
            List<FactTabunganDaily> current = fetchByLevel(level, levelId, snapshot);
            List<FactTabunganDaily> prev = fetchByLevel(level, levelId, prevSnapshot);
            BigDecimal currentEndBal = sum(current, FactTabunganDaily::getEndingBalance);
            BigDecimal prevEndBal = sum(prev, FactTabunganDaily::getEndingBalance);
            delta5Days = computeGrowthPct(currentEndBal, prevEndBal);
        }

        // Retail proportion
        BigDecimal retailEndBal = fetchRetailEndBal(level, levelId, snapshot);
        List<FactTabunganDaily> allRows = fetchByLevel(level, levelId, snapshot);
        BigDecimal totalEndBal = sum(allRows, FactTabunganDaily::getEndingBalance);
        BigDecimal retailPct = totalEndBal.compareTo(BigDecimal.ZERO) > 0
            ? retailEndBal.divide(totalEndBal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        // Retail proportion delta vs prev month
        BigDecimal retailProportionDelta = BigDecimal.ZERO;
        if (prevSnapshot != null) {
            BigDecimal prevRetailEndBal = fetchRetailEndBal(level, levelId, prevSnapshot);
            List<FactTabunganDaily> prevAllRows = fetchByLevel(level, levelId, prevSnapshot);
            BigDecimal prevTotalEndBal = sum(prevAllRows, FactTabunganDaily::getEndingBalance);
            BigDecimal prevRetailPct = prevTotalEndBal.compareTo(BigDecimal.ZERO) > 0
                ? prevRetailEndBal.divide(prevTotalEndBal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
            retailProportionDelta = retailPct.subtract(prevRetailPct);
        }

        TabunganMetricsDto dto = new TabunganMetricsDto();
        dto.setDelta5Days(delta5Days);
        dto.setRetailProportion(retailPct);
        dto.setRetailProportionDelta(retailProportionDelta);
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
            case "AREA"   -> tabunganRepository.findLatestSnapshotByArea(levelId);
            case "REGION" -> tabunganRepository.findLatestSnapshotByRegion(levelId);
            default       -> tabunganRepository.findLatestSnapshotByBranch(levelId);
        };
        return latest != null ? latest.toLocalDateTime().toLocalDate() : LocalDate.now();
    }

    private LocalDate findSnapshotBefore(String level, String levelId, LocalDate refDate) {
        Timestamp ref = Timestamp.valueOf(refDate.atStartOfDay());
        Timestamp result = switch (level.toUpperCase()) {
            case "AREA"   -> tabunganRepository.findLatestSnapshotBeforeByArea(levelId, ref);
            case "REGION" -> tabunganRepository.findLatestSnapshotBeforeByRegion(levelId, ref);
            default       -> tabunganRepository.findLatestSnapshotBeforeByBranch(levelId, ref);
        };
        return result != null ? result.toLocalDateTime().toLocalDate() : null;
    }

    // ── Data fetchers by level ────────────────────────────────────────────────

    private List<FactTabunganDaily> fetchByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> tabunganRepository.findByAreaAndSnapshot(levelId, snapshot);
            case "REGION" -> tabunganRepository.findByRegionAndSnapshot(levelId, snapshot);
            default       -> tabunganRepository.findByBranchAndSnapshot(levelId, snapshot);
        };
    }

    private List<Object[]> fetchHistoryByLevel(String level, String levelId) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> tabunganRepository.findHistoryByArea(levelId);
            case "REGION" -> tabunganRepository.findHistoryByRegion(levelId);
            default       -> tabunganRepository.findHistoryByBranch(levelId);
        };
    }

    private List<Object[]> fetchPrevYearHistoryByLevel(String level, String levelId) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> tabunganRepository.findPrevYearHistoryByArea(levelId);
            case "REGION" -> tabunganRepository.findPrevYearHistoryByRegion(levelId);
            default       -> tabunganRepository.findPrevYearHistoryByBranch(levelId);
        };
    }

    private List<Object[]> fetchCompositionByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> tabunganRepository.findCompositionByArea(levelId, snapshot);
            case "REGION" -> tabunganRepository.findCompositionByRegion(levelId, snapshot);
            default       -> tabunganRepository.findCompositionByBranch(levelId, snapshot);
        };
    }

    private List<Object[]> fetchDetailByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "REGION" -> tabunganRepository.findDetailByRegion(levelId, snapshot);
            case "AREA"   -> tabunganRepository.findDetailByArea(levelId, snapshot);
            default       -> List.of();
        };
    }

    private Object[] fetchTargetByLevel(String level, String levelId, String periodCode) {
        if (periodCode == null || periodCode.isBlank() || levelId == null || levelId.isBlank()) return null;
        try {
            return switch (level.toUpperCase()) {
                case "AREA"   -> tabunganTargetRepository.sumByAreaAndPeriodCode(levelId, periodCode);
                case "REGION" -> tabunganTargetRepository.sumByRegionAndPeriodCode(levelId, periodCode);
                default       -> tabunganTargetRepository.sumByBranchAndPeriodCode(levelId, periodCode);
            };
        } catch (Exception e) {
            log.warn("tabungan fetchTarget failed level={} period={}: {}", level, periodCode, e.getMessage());
            return null;
        }
    }

    private BigDecimal fetchRetailEndBal(String level, String levelId, LocalDate snapshot) {
        try {
            Object raw = switch (level.toUpperCase()) {
                case "AREA"   -> tabunganRepository.findRetailEndBalByAreaAndSnapshot(levelId, snapshot);
                case "REGION" -> tabunganRepository.findRetailEndBalByRegionAndSnapshot(levelId, snapshot);
                default       -> tabunganRepository.findRetailEndBalByBranchAndSnapshot(levelId, snapshot);
            };
            return toBd(raw);
        } catch (Exception e) {
            log.warn("fetchRetailEndBal failed: {}", e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    // ── Math helpers ──────────────────────────────────────────────────────────

    private BigDecimal sum(List<FactTabunganDaily> rows, Function<FactTabunganDaily, BigDecimal> getter) {
        return rows.stream().map(getter).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal avg(List<FactTabunganDaily> rows, Function<FactTabunganDaily, BigDecimal> getter) {
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
        try { return new BigDecimal(v.toString().trim()); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private BigDecimal toBd(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return new BigDecimal(n.toString());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof LocalDate ld) return ld;
        if (obj instanceof Timestamp ts) return ts.toLocalDateTime().toLocalDate();
        if (obj instanceof java.sql.Date sd) return sd.toLocalDate();
        return DateUtil.parseOrNull(obj.toString());
    }
}
