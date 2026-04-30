package com.mandiri.branchperformance.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name = "FACT_NTB_DAILY")
public class FactNtbDaily {

    @Id
    @Column(name = "ID", columnDefinition = "RAW(16)")
    private UUID id;

    @Column(name = "BRANCH_ID", columnDefinition = "RAW(16)")
    private UUID branchId;

    @Column(name = "SEGMENT_ID", columnDefinition = "RAW(16)")
    private UUID segmentId;

    @Column(name = "SNAPSHOT_DATE")
    private LocalDate snapshotDate;

    @Column(name = "TOTAL")
    private Long total;

    @Column(name = "NEW_ACCOUNT")
    private Long newAccount;

    @Column(name = "LIVE")
    private Long live;

    @Column(name = "CHURN")
    private Long churn;

    @Column(name = "NET")
    private Long net;
}
