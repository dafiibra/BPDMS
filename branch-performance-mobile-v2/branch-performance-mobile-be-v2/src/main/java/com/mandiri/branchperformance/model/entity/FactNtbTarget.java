package com.mandiri.branchperformance.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "FACT_NTB_TARGET")
public class FactNtbTarget {

    @Id
    @Column(name = "ID", columnDefinition = "RAW(16)")
    private UUID id;

    @Column(name = "BRANCH_ID", columnDefinition = "RAW(16)")
    private UUID branchId;

    @Column(name = "SEGMENT_ID", columnDefinition = "RAW(16)")
    private UUID segmentId;

    @Column(name = "PERIOD_ID", columnDefinition = "RAW(16)")
    private UUID periodId;

    @Column(name = "TARGET_TOTAL")
    private Long targetTotal;

    @Column(name = "TARGET_NEW_ACCOUNT")
    private Long targetNewAccount;

    @Column(name = "TARGET_LIVE")
    private Long targetLive;

    @Column(name = "TARGET_CHURN")
    private Long targetChurn;

    @Column(name = "TARGET_NET")
    private Long targetNet;
}
