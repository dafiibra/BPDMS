package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DanaChartDto {
    private List<String> labels;
    private List<BigDecimal> endingBalance;
    private List<BigDecimal> avgBalance;
}
