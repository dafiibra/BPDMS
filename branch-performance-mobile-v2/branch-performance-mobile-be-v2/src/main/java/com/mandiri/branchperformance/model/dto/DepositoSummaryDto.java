package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositoSummaryDto {
    private BigDecimal avgBalance;
    private BigDecimal avgBalanceTarget;
    private BigDecimal avgBalanceAchievementPct;
    private BigDecimal cof;
}
