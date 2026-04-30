package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DanaCompositionDto {

    private List<SegmentItem> segments;

    @Data
    public static class SegmentItem {
        private String segmentCode;
        private String segmentName;
        private BigDecimal endingBalance;
        private BigDecimal proportion;
    }
}
