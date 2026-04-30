package com.mandiri.branchperformance.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class NtbSummaryDto {

    private String periodType;
    private NtbTotalItem total;
    private List<NtbSegmentItem> segments;

    @Data
    public static class NtbTotalItem {
        private Long total;
        private Long newAccount;
        private Long target;
        private Long live;
        private Long churn;
        private Long net;
    }

    @Data
    public static class NtbSegmentItem {
        private String segmentCode;
        private String segmentName;
        private Double achievementPct;
        private Long total;
        private Long newAccount;
        private Long target;
        private Long live;
        private Long churn;
        private Long net;
    }
}
