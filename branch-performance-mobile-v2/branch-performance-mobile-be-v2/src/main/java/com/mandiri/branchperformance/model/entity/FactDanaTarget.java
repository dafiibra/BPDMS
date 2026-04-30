package com.mandiri.branchperformance.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "FACT_DANA_TARGET")
public class FactDanaTarget {

    @Id
    @Column(name = "ID", columnDefinition = "RAW(16)")
    private UUID id;

    @Column(name = "BRANCH_ID", columnDefinition = "RAW(16)")
    private UUID branchId;

    @Column(name = "SEGMENT_ID", columnDefinition = "RAW(16)")
    private UUID segmentId;

    @Column(name = "PERIOD_ID", columnDefinition = "RAW(16)")
    private UUID periodId;

    @Column(name = "TARGET_AVG_BALANCE")
    private BigDecimal targetAvgBalance;

    @Column(name = "TARGET_ENDING_BALANCE")
    private BigDecimal targetEndingBalance;

    @Column(name = "TARGET_COF")
    private BigDecimal targetCof;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;

    @Column(name = "CREATED_BY")
    private String createdBy;
}
