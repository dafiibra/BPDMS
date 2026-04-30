package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GiroAcquisitionDto {
    private Long newCif;
    private Long newCifTarget;
    private BigDecimal newCifAchievementPct;
    private Long churn;
    private Long netCif;
    private BigDecimal endingBalance;
}
