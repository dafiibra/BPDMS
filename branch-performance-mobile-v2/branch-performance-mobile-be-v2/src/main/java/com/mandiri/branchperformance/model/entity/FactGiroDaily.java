package com.mandiri.branchperformance.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "FACT_GIRO_DAILY")
public class FactGiroDaily {

    @Id
    @Column(name = "ID", columnDefinition = "RAW(16)")
    private UUID id;

    @Column(name = "BRANCH_ID", columnDefinition = "RAW(16)")
    private UUID branchId;

    @Column(name = "SEGMENT_ID", columnDefinition = "RAW(16)")
    private UUID segmentId;

    @Column(name = "SNAPSHOT_DATE")
    private LocalDate snapshotDate;

    @Column(name = "AVG_BALANCE")
    private BigDecimal avgBalance;

    @Column(name = "ENDING_BALANCE")
    private BigDecimal endingBalance;

    @Column(name = "COF")
    private BigDecimal cof;

    @Column(name = "GROWTH_MTD")
    private BigDecimal growthMtd;

    @Column(name = "GROWTH_YTD")
    private BigDecimal growthYtd;

    @Column(name = "GROWTH_YOY")
    private BigDecimal growthYoy;

    @Column(name = "NEW_CIF")
    private Long newCif;

    @Column(name = "CHURN")
    private Long churn;

    @Column(name = "NET_CIF")
    private Long netCif;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;
}
