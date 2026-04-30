package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DepositoCurrencyDto {

    private List<CurrencyItem> currencies;

    @Data
    public static class CurrencyItem {
        private String currencyCode;
        private String label;
        private BigDecimal endingBalance;
        private BigDecimal proportion;
    }
}
