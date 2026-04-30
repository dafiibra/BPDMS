package com.mandiri.branchperformance.service;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.model.entity.FactDepositoDaily;
import com.mandiri.branchperformance.repository.DepositoRepository;
import com.mandiri.branchperformance.repository.DepositoTargetRepository;
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
public class DepositoService {

    private final DepositoRepository depositoRepository;
    private final DepositoTargetRepository depositoTargetRepository;

    private static final String[] MONTH_SHORT = {
        "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"
    };

    public DepositoSummaryDto getSummary(String level, String levelId, String snapshotDate,
                                         String periodCode, String segmentCode) {
        log.debug("deposito getSummary level={} levelId={}", level, levelId);
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<FactDepositoDaily> rows = fetchByLevel(level, levelId, snapshot);

        // Deposito aggregates AVG_BALANCE; ENDING_BALANCE is secondary (IDR+USD)
        BigDecimal avgBalance = sum(rows, FactDepositoDaily::getAvgBalance);
        BigDecimal cof = avg(rows, FactDepositoDaily::getCof);

        String resolvedPeriod = resolvePeriodCode(periodCode, snapshot);
        Object[] target = fetchTargetByLevel(level, levelId, resolvedPeriod);
        BigDecimal avgBalTarget = extractBd(target, 0);

        DepositoSummaryDto dto = new DepositoSummaryDto();
        dto.setAvgBalance(avgBalance);
        dto.setAvgBalanceTarget(avgBalTarget);
        dto.setAvgBalanceAchievementPct(computeAchievement(avgBalance, avgBalTarget));
        dto.setCof(cof);
        return dto;
    }

    public DanaGrowthDto getGrowth(String level, String levelId, String snapshotDate,
                                   String periodCode, String segmentCode) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<FactDepositoDaily> rows = fetchByLevel(level, levelId, snapshot);

        DanaGrowthDto dto = new DanaGrowthDto();
        dto.setGrowthMtd(avg(rows, FactDepositoDaily::getGrowthMtd));
        dto.setGrowthYtd(avg(rows, FactDepositoDaily::getGrowthYtd));
        dto.setGrowthYoy(avg(rows, FactDepositoDaily::getGrowthYoy));

        LocalDate prevRef = snapshot.minusDays(30);
        LocalDate prevSnapshot = findSnapshotBefore(level, levelId, prevRef);
        if (prevSnapshot != null) {
            List<FactDepositoDaily> prevRows = fetchByLevel(level, levelId, prevSnapshot);
            BigDecimal currentAvgBal = sum(rows, FactDepositoDaily::getAvgBalance);
            BigDecimal prevAvgBal = sum(prevRows, FactDepositoDaily::getAvgBalance);
            dto.setGrowthMom(computeGrowthPct(currentAvgBal, prevAvgBal));
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

    public DepositoCurrencyDto getCurrency(String level, String levelId, String snapshotDate,
                                           String periodCode, String segmentCode) {
        LocalDate snapshot = resolveSnapshot(snapshotDate, level, levelId);
        List<Object[]> rows = fetchCurrencyByLevel(level, levelId, snapshot);

        BigDecimal total = rows.stream().map(r -> toBd(r[1])).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DepositoCurrencyDto.CurrencyItem> currencies = rows.stream().map(r -> {
            DepositoCurrencyDto.CurrencyItem item = new DepositoCurrencyDto.CurrencyItem();
            String currencyCode = r[0] != null ? r[0].toString() : "IDR";
            item.setCurrencyCode(currencyCode);
            item.setLabel("IDR".equalsIgnoreCase(currencyCode) ? "Rupiah" : "US Dollar");
            BigDecimal endBal = toBd(r[1]);
            item.setEndingBalance(endBal);
            item.setProportion(total.compareTo(BigDecimal.ZERO) > 0
                ? endBal.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO);
            return item;
        }).collect(Collectors.toList());

        DepositoCurrencyDto dto = new DepositoCurrencyDto();
        dto.setCurrencies(currencies);
        return dto;
    }

    // ── Snapshot resolution ───────────────────────────────────────────────────

    private LocalDate resolveSnapshot(String snapshotDate, String level, String levelId) {
        if (snapshotDate != null && !snapshotDate.isBlank()) {
            LocalDate parsed = DateUtil.parseOrNull(snapshotDate);
            if (parsed != null) return parsed;
        }
        Timestamp latest = switch (level.toUpperCase()) {
            case "AREA"   -> depositoRepository.findLatestSnapshotByArea(levelId);
            case "REGION" -> depositoRepository.findLatestSnapshotByRegion(levelId);
            default       -> depositoRepository.findLatestSnapshotByBranch(levelId);
        };
        return latest != null ? latest.toLocalDateTime().toLocalDate() : LocalDate.now();
    }

    private LocalDate findSnapshotBefore(String level, String levelId, LocalDate refDate) {
        Timestamp ref = Timestamp.valueOf(refDate.atStartOfDay());
        Timestamp result = switch (level.toUpperCase()) {
            case "AREA"   -> depositoRepository.findLatestSnapshotBeforeByArea(levelId, ref);
            case "REGION" -> depositoRepository.findLatestSnapshotBeforeByRegion(levelId, ref);
            default       -> depositoRepository.findLatestSnapshotBeforeByBranch(levelId, ref);
        };
        return result != null ? result.toLocalDateTime().toLocalDate() : null;
    }

    // ── Data fetchers by level ────────────────────────────────────────────────

    private List<FactDepositoDaily> fetchByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> depositoRepository.findByAreaAndSnapshot(levelId, snapshot);
            case "REGION" -> depositoRepository.findByRegionAndSnapshot(levelId, snapshot);
            default       -> depositoRepository.findByBranchAndSnapshot(levelId, snapshot);
        };
    }

    private List<Object[]> fetchCompositionByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> depositoRepository.findCompositionByArea(levelId, snapshot);
            case "REGION" -> depositoRepository.findCompositionByRegion(levelId, snapshot);
            default       -> depositoRepository.findCompositionByBranch(levelId, snapshot);
        };
    }

    private List<Object[]> fetchDetailByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "REGION" -> depositoRepository.findDetailByRegion(levelId, snapshot);
            case "AREA"   -> depositoRepository.findDetailByArea(levelId, snapshot);
            default       -> List.of();
        };
    }

    private List<Object[]> fetchCurrencyByLevel(String level, String levelId, LocalDate snapshot) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> depositoRepository.findCurrencyByArea(levelId, snapshot);
            case "REGION" -> depositoRepository.findCurrencyByRegion(levelId, snapshot);
            default       -> depositoRepository.findCurrencyByBranch(levelId, snapshot);
        };
    }

    private Object[] fetchTargetByLevel(String level, String levelId, String periodCode) {
        if (periodCode == null || periodCode.isBlank() || levelId == null || levelId.isBlank()) return null;
        try {
            return switch (level.toUpperCase()) {
                case "AREA"   -> depositoTargetRepository.sumByAreaAndPeriodCode(levelId, periodCode);
                case "REGION" -> depositoTargetRepository.sumByRegionAndPeriodCode(levelId, periodCode);
                default       -> depositoTargetRepository.sumByBranchAndPeriodCode(levelId, periodCode);
            };
        } catch (Exception e) {
            log.warn("deposito fetchTarget failed level={} period={}: {}", level, periodCode, e.getMessage());
            return null;
        }
    }

    // ── Math helpers ──────────────────────────────────────────────────────────

    private BigDecimal sum(List<FactDepositoDaily> rows, Function<FactDepositoDaily, BigDecimal> getter) {
        return rows.stream().map(getter).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal avg(List<FactDepositoDaily> rows, Function<FactDepositoDaily, BigDecimal> getter) {
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

    private BigDecimal toBd(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return new BigDecimal(n.toString());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }
}
