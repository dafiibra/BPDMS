package com.mandiri.branchperformance.repository;

import com.mandiri.branchperformance.model.entity.OrgArea;
import com.mandiri.branchperformance.model.entity.OrgBranch;
import com.mandiri.branchperformance.model.entity.OrgRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrgRepository extends JpaRepository<OrgRegion, UUID> {

    @Query(value = "SELECT * FROM ORG_REGIONS WHERE FLAG = 1", nativeQuery = true)
    List<OrgRegion> findAllActiveRegions();

    @Query(value = "SELECT * FROM ORG_AREAS WHERE REGION_ID = HEXTORAW(REPLACE(:regionId, '-', '')) AND FLAG = 1",
           nativeQuery = true)
    List<OrgArea> findAreasByRegion(@Param("regionId") String regionId);

    @Query(value = "SELECT * FROM ORG_BRANCHES WHERE AREA_ID = HEXTORAW(REPLACE(:areaId, '-', '')) AND FLAG = 1",
           nativeQuery = true)
    List<OrgBranch> findBranchesByArea(@Param("areaId") String areaId);
}
