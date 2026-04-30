package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TabunganChartDto {
    private List<String> labels;
    private List<BigDecimal> endingBalance;
    private List<BigDecimal> prevEndingBalance;
    private List<BigDecimal> avgBalance;
    private List<BigDecimal> prevAvgBalance;
}
