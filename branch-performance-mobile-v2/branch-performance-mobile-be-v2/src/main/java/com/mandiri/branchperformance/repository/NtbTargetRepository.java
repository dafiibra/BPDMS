package com.mandiri.branchperformance.repository;

import com.mandiri.branchperformance.model.entity.FactNtbTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NtbTargetRepository extends JpaRepository<FactNtbTarget, UUID> {

    @Query(value = """
        SELECT SUM(t.TARGET_TOTAL), SUM(t.TARGET_NEW_ACCOUNT),
               SUM(t.TARGET_LIVE), SUM(t.TARGET_CHURN), SUM(t.TARGET_NET)
        FROM FACT_NTB_TARGET t
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE t.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        """, nativeQuery = true)
    Object[] sumByBranchAndPeriodCode(@Param("branchId") String branchId,
                                      @Param("periodCode") String periodCode);

    @Query(value = """
        SELECT SUM(t.TARGET_TOTAL), SUM(t.TARGET_NEW_ACCOUNT),
               SUM(t.TARGET_LIVE), SUM(t.TARGET_CHURN), SUM(t.TARGET_NET)
        FROM FACT_NTB_TARGET t
        JOIN ORG_BRANCHES b ON t.BRANCH_ID = b.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        """, nativeQuery = true)
    Object[] sumByAreaAndPeriodCode(@Param("areaId") String areaId,
                                    @Param("periodCode") String periodCode);

    @Query(value = """
        SELECT SUM(t.TARGET_TOTAL), SUM(t.TARGET_NEW_ACCOUNT),
               SUM(t.TARGET_LIVE), SUM(t.TARGET_CHURN), SUM(t.TARGET_NET)
        FROM FACT_NTB_TARGET t
        JOIN ORG_BRANCHES b ON t.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        """, nativeQuery = true)
    Object[] sumByRegionAndPeriodCode(@Param("regionId") String regionId,
                                      @Param("periodCode") String periodCode);

    // Per segment targets
    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME,
               SUM(t.TARGET_TOTAL), SUM(t.TARGET_NEW_ACCOUNT),
               SUM(t.TARGET_LIVE), SUM(t.TARGET_CHURN), SUM(t.TARGET_NET)
        FROM FACT_NTB_TARGET t
        JOIN MST_SEGMENTS m ON t.SEGMENT_ID = m.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE t.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        """, nativeQuery = true)
    java.util.List<Object[]> sumByBranchAndPeriodCodePerSegment(@Param("branchId") String branchId,
                                                                  @Param("periodCode") String periodCode);

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME,
               SUM(t.TARGET_TOTAL), SUM(t.TARGET_NEW_ACCOUNT),
               SUM(t.TARGET_LIVE), SUM(t.TARGET_CHURN), SUM(t.TARGET_NET)
        FROM FACT_NTB_TARGET t
        JOIN ORG_BRANCHES b ON t.BRANCH_ID = b.ID
        JOIN MST_SEGMENTS m ON t.SEGMENT_ID = m.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        """, nativeQuery = true)
    java.util.List<Object[]> sumByAreaAndPeriodCodePerSegment(@Param("areaId") String areaId,
                                                               @Param("periodCode") String periodCode);

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME,
               SUM(t.TARGET_TOTAL), SUM(t.TARGET_NEW_ACCOUNT),
               SUM(t.TARGET_LIVE), SUM(t.TARGET_CHURN), SUM(t.TARGET_NET)
        FROM FACT_NTB_TARGET t
        JOIN ORG_BRANCHES b ON t.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        JOIN MST_SEGMENTS m ON t.SEGMENT_ID = m.ID
        JOIN MST_PERIODS p ON t.PERIOD_ID = p.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND p.PERIOD_CODE = :periodCode
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        """, nativeQuery = true)
    java.util.List<Object[]> sumByRegionAndPeriodCodePerSegment(@Param("regionId") String regionId,
                                                                  @Param("periodCode") String periodCode);
}
