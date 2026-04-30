package com.mandiri.branchperformance.model.dto;

import lombok.Data;

@Data
public class MstPeriodDto {
    private String id;
    private String periodCode;
    private String periodType;
    private Integer year;
    private Integer month;
}
