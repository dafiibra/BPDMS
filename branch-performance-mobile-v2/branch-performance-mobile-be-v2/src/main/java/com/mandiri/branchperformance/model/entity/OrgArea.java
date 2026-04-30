package com.mandiri.branchperformance.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "ORG_AREAS")
public class OrgArea {

    @Id
    @Column(name = "ID", columnDefinition = "RAW(16)")
    private UUID id;

    @Column(name = "REGION_ID", columnDefinition = "RAW(16)")
    private UUID regionId;

    @Column(name = "AREA_CODE")
    private String areaCode;

    @Column(name = "AREA_NAME")
    private String areaName;

    @Column(name = "FLAG")
    private Integer flag;
}
