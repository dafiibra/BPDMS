package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DanaDetailDto {

    private List<DetailItem> items;

    @Data
    public static class DetailItem {
        private String code;
        private String name;
        private BigDecimal avgBalance;
        private BigDecimal endingBalance;
        private BigDecimal target;
        private BigDecimal achievementPct;
        private BigDecimal cof;
    }
}
