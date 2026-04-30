package com.mandiri.branchperformance.controller;

import com.mandiri.branchperformance.model.dto.*;
import com.mandiri.branchperformance.model.entity.*;
import com.mandiri.branchperformance.repository.MstPeriodRepository;
import com.mandiri.branchperformance.repository.OrgRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class OrgController {

    private final OrgRepository orgRepository;
    private final MstPeriodRepository periodRepository;

    @GetMapping("/org/regions")
    public ResponseEntity<ApiResponseDto<List<OrgRegionDto>>> getRegions() {
        List<OrgRegion> regions = orgRepository.findAllActiveRegions();
        List<OrgRegionDto> result = regions.stream().map(r -> {
            OrgRegionDto dto = new OrgRegionDto();
            dto.setId(r.getId().toString().replace("-", ""));
            dto.setRegionCode(r.getRegionCode());
            dto.setRegionName(r.getRegionName());
            return dto;
        }).toList();
        return ResponseEntity.ok(ApiResponseDto.ok(result));
    }

    @GetMapping("/org/areas")
    public ResponseEntity<ApiResponseDto<List<OrgAreaDto>>> getAreas(@RequestParam String regionId) {
        List<OrgArea> areas = orgRepository.findAreasByRegion(regionId);
        List<OrgAreaDto> result = areas.stream().map(a -> {
            OrgAreaDto dto = new OrgAreaDto();
            dto.setId(a.getId().toString().replace("-", ""));
            dto.setAreaCode(a.getAreaCode());
            dto.setAreaName(a.getAreaName());
            return dto;
        }).toList();
        return ResponseEntity.ok(ApiResponseDto.ok(result));
    }

    @GetMapping("/org/branches")
    public ResponseEntity<ApiResponseDto<List<OrgBranchDto>>> getBranches(@RequestParam String areaId) {
        List<OrgBranch> branches = orgRepository.findBranchesByArea(areaId);
        List<OrgBranchDto> result = branches.stream().map(b -> {
            OrgBranchDto dto = new OrgBranchDto();
            dto.setId(b.getId().toString().replace("-", ""));
            dto.setBranchCode(b.getBranchCode());
            dto.setBranchName(b.getBranchName());
            return dto;
        }).toList();
        return ResponseEntity.ok(ApiResponseDto.ok(result));
    }

    @GetMapping("/segments")
    public ResponseEntity<ApiResponseDto<List<MstSegmentDto>>> getSegments() {
        return ResponseEntity.ok(ApiResponseDto.ok(List.of()));
    }

    @GetMapping("/periods")
    public ResponseEntity<ApiResponseDto<List<MstPeriodDto>>> getPeriods(
            @RequestParam(required = false) String type) {
        List<MstPeriod> periods = (type != null && !type.isBlank())
            ? periodRepository.findByType(type.toUpperCase())
            : periodRepository.findAllOrdered();
        List<MstPeriodDto> result = periods.stream().map(p -> {
            MstPeriodDto dto = new MstPeriodDto();
            dto.setId(p.getId() != null ? p.getId().toString().replace("-", "") : null);
            dto.setPeriodCode(p.getPeriodCode());
            dto.setPeriodType(p.getPeriodType());
            dto.setYear(p.getYear());
            dto.setMonth(p.getMonth());
            return dto;
        }).toList();
        return ResponseEntity.ok(ApiResponseDto.ok(result));
    }
}
