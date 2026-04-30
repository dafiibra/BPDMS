package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TabunganMetricsDto {
    private BigDecimal delta5Days;
    private BigDecimal retailProportion;
    private BigDecimal retailProportionDelta;
}
