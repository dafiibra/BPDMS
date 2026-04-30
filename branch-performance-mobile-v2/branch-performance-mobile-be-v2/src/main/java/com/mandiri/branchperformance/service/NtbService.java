package com.mandiri.branchperformance.service;

import com.mandiri.branchperformance.model.dto.NtbSummaryDto;
import com.mandiri.branchperformance.model.entity.FactNtbDaily;
import com.mandiri.branchperformance.repository.NtbRepository;
import com.mandiri.branchperformance.repository.NtbTargetRepository;
import com.mandiri.branchperformance.util.DateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NtbService {

    private final NtbRepository ntbRepository;
    private final NtbTargetRepository ntbTargetRepository;

    public NtbSummaryDto getSummary(String level, String levelId, String snapshotDate,
                                    String periodCode, String segmentCode, String periodType) {
        log.debug("ntb getSummary level={} levelId={} periodType={}", level, levelId, periodType);

        LocalDate endDate = resolveEndDate(snapshotDate, level, levelId);
        LocalDate startDate = "YTD".equalsIgnoreCase(periodType)
            ? DateUtil.startOfYear(endDate)
            : DateUtil.startOfMonth(endDate);

        // Fetch aggregated per-segment actuals
        List<Object[]> segmentRows = fetchSegmentSumByLevel(level, levelId, startDate, endDate);

        // Fetch targets per segment
        String resolvedPeriod = resolvePeriodCode(periodCode, endDate);
        List<Object[]> targetRows = fetchTargetsByLevel(level, levelId, resolvedPeriod);
        // Map from segmentCode -> target row
        Map<String, Object[]> targetMap = targetRows.stream()
            .filter(r -> r[0] != null)
            .collect(Collectors.toMap(r -> r[0].toString().toUpperCase(), r -> r, (a, b) -> a));

        // Build segment items
        List<NtbSummaryDto.NtbSegmentItem> segments = new ArrayList<>();
        long totalActual = 0L;
        long totalNew = 0L;
        long totalTarget = 0L;
        long totalLive = 0L;
        long totalChurn = 0L;
        long totalNet = 0L;

        for (Object[] row : segmentRows) {
            String segCode = row[0] != null ? row[0].toString() : "—";
            String segName = row[1] != null ? row[1].toString() : segCode;
            long total = toLong(row[2]);
            long newAccount = toLong(row[3]);
            long live = toLong(row[4]);
            long churn = toLong(row[5]);
            long net = toLong(row[6]);

            // Get target for this segment
            Object[] tRow = targetMap.get(segCode.toUpperCase());
            long target = tRow != null ? toLong(tRow[2]) : 0L;

            double achievementPct = target > 0 ? (total * 100.0 / target) : 0.0;

            NtbSummaryDto.NtbSegmentItem item = new NtbSummaryDto.NtbSegmentItem();
            item.setSegmentCode(segCode);
            item.setSegmentName(segName);
            item.setTotal(total);
            item.setNewAccount(newAccount);
            item.setTarget(target);
            item.setLive(live);
            item.setChurn(churn);
            item.setNet(net);
            item.setAchievementPct(achievementPct);
            segments.add(item);

            totalActual += total;
            totalNew += newAccount;
            totalTarget += target;
            totalLive += live;
            totalChurn += churn;
            totalNet += net;
        }

        NtbSummaryDto.NtbTotalItem totalItem = new NtbSummaryDto.NtbTotalItem();
        totalItem.setTotal(totalActual);
        totalItem.setNewAccount(totalNew);
        totalItem.setTarget(totalTarget);
        totalItem.setLive(totalLive);
        totalItem.setChurn(totalChurn);
        totalItem.setNet(totalNet);

        NtbSummaryDto dto = new NtbSummaryDto();
        dto.setPeriodType(periodType != null ? periodType.toUpperCase() : "MTD");
        dto.setTotal(totalItem);
        dto.setSegments(segments);
        return dto;
    }

    // ── Snapshot resolution ───────────────────────────────────────────────────

    private LocalDate resolveEndDate(String snapshotDate, String level, String levelId) {
        if (snapshotDate != null && !snapshotDate.isBlank()) {
            LocalDate parsed = DateUtil.parseOrNull(snapshotDate);
            if (parsed != null) return parsed;
        }
        Timestamp latest = switch (level.toUpperCase()) {
            case "AREA"   -> ntbRepository.findLatestSnapshotByArea(levelId);
            case "REGION" -> ntbRepository.findLatestSnapshotByRegion(levelId);
            default       -> ntbRepository.findLatestSnapshotByBranch(levelId);
        };
        return latest != null ? latest.toLocalDateTime().toLocalDate() : LocalDate.now();
    }

    // ── Data fetchers ─────────────────────────────────────────────────────────

    private List<Object[]> fetchSegmentSumByLevel(String level, String levelId,
                                                   LocalDate startDate, LocalDate endDate) {
        return switch (level.toUpperCase()) {
            case "AREA"   -> ntbRepository.findSegmentSumByAreaAndPeriod(levelId, startDate, endDate);
            case "REGION" -> ntbRepository.findSegmentSumByRegionAndPeriod(levelId, startDate, endDate);
            default       -> ntbRepository.findSegmentSumByBranchAndPeriod(levelId, startDate, endDate);
        };
    }

    private List<Object[]> fetchTargetsByLevel(String level, String levelId, String periodCode) {
        if (periodCode == null || periodCode.isBlank() || levelId == null || levelId.isBlank()) {
            return List.of();
        }
        try {
            return switch (level.toUpperCase()) {
                case "AREA"   -> ntbTargetRepository.sumByAreaAndPeriodCodePerSegment(levelId, periodCode);
                case "REGION" -> ntbTargetRepository.sumByRegionAndPeriodCodePerSegment(levelId, periodCode);
                default       -> ntbTargetRepository.sumByBranchAndPeriodCodePerSegment(levelId, periodCode);
            };
        } catch (Exception e) {
            log.warn("ntb fetchTargets failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String resolvePeriodCode(String periodCode, LocalDate snapshot) {
        if (periodCode != null && !periodCode.isBlank()) return periodCode;
        return snapshot.getYear() + "-" + String.format("%02d", snapshot.getMonthValue());
    }

    private long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number n) return n.longValue();
        try { return Long.parseLong(obj.toString().trim()); }
        catch (NumberFormatException e) { return 0L; }
    }
}
