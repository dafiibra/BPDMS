package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DanaGrowthDto {
    private BigDecimal growthMtd;
    private BigDecimal growthMom;
    private BigDecimal growthYtd;
    private BigDecimal growthYoy;
}
