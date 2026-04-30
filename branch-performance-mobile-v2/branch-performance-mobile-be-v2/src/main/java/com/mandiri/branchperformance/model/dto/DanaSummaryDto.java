package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DanaSummaryDto {
    private BigDecimal avgBalance;
    private BigDecimal endingBalance;
    private BigDecimal cof;
    private BigDecimal avgBalanceTarget;
    private BigDecimal endingBalanceTarget;
    private BigDecimal avgBalanceAchievementPct;
    private BigDecimal endingBalanceAchievementPct;
    private LocalDate snapshotDate;
}
