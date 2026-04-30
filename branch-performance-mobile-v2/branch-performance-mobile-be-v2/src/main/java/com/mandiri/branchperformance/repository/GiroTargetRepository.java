package com.mandiri.branchperformance.repository;

import com.mandiri.branchperformance.model.entity.FactGiroTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GiroTargetRepository extends JpaRepository<FactGiroTarget, UUID> {

    @Query(value = """
        SELECT SUM(t.TARGET_AVG_BALANCE) AS TARGET_AVG_BAL,
               SUM(t.TARGET_ENDING_BALANCE) AS TARGET_END_BAL,
               AVG(t.TARGET_COF) AS TARGET_COF,
               SUM(t.TARGET_NEW_CIF) AS TARGET_NEW_CIF
        FROM FACT_GIRO_TARGET t
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE t.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        """, nativeQuery = true)
    Object[] sumByBranchAndPeriodCode(@Param("branchId") String branchId,
                                      @Param("periodCode") String periodCode);

    @Query(value = """
        SELECT SUM(t.TARGET_AVG_BALANCE) AS TARGET_AVG_BAL,
               SUM(t.TARGET_ENDING_BALANCE) AS TARGET_END_BAL,
               AVG(t.TARGET_COF) AS TARGET_COF,
               SUM(t.TARGET_NEW_CIF) AS TARGET_NEW_CIF
        FROM FACT_GIRO_TARGET t
        JOIN ORG_BRANCHES b ON t.BRANCH_ID = b.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        """, nativeQuery = true)
    Object[] sumByAreaAndPeriodCode(@Param("areaId") String areaId,
                                    @Param("periodCode") String periodCode);

    @Query(value = """
        SELECT SUM(t.TARGET_AVG_BALANCE) AS TARGET_AVG_BAL,
               SUM(t.TARGET_ENDING_BALANCE) AS TARGET_END_BAL,
               AVG(t.TARGET_COF) AS TARGET_COF,
               SUM(t.TARGET_NEW_CIF) AS TARGET_NEW_CIF
        FROM FACT_GIRO_TARGET t
        JOIN ORG_BRANCHES b ON t.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        """, nativeQuery = true)
    Object[] sumByRegionAndPeriodCode(@Param("regionId") String regionId,
                                      @Param("periodCode") String periodCode);
}
