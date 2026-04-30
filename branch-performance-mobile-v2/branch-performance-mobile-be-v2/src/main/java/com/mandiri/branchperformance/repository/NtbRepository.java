package com.mandiri.branchperformance.repository;

import com.mandiri.branchperformance.model.entity.FactNtbDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface NtbRepository extends JpaRepository<FactNtbDaily, UUID> {

    // ── Per branch ────────────────────────────────────────────────────────────

    @Query(value = """
        SELECT d.* FROM FACT_NTB_DAILY d
        WHERE d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
          AND d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
        """, nativeQuery = true)
    List<FactNtbDaily> findByBranchAndPeriod(@Param("branchId") String branchId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT d.* FROM FACT_NTB_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
          AND b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
        """, nativeQuery = true)
    List<FactNtbDaily> findByAreaAndPeriod(@Param("areaId") String areaId,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT d.* FROM FACT_NTB_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
          AND a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
        """, nativeQuery = true)
    List<FactNtbDaily> findByRegionAndPeriod(@Param("regionId") String regionId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    // ── Aggregated per segment ────────────────────────────────────────────────

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME,
               SUM(d.TOTAL) AS TOTAL, SUM(d.NEW_ACCOUNT) AS NEW_ACCOUNT,
               SUM(d.LIVE) AS LIVE, SUM(d.CHURN) AS CHURN, SUM(d.NET) AS NET
        FROM FACT_NTB_DAILY d
        JOIN MST_SEGMENTS m ON d.SEGMENT_ID = m.ID
        WHERE d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        ORDER BY SUM(d.TOTAL) DESC
        """, nativeQuery = true)
    List<Object[]> findSegmentSumByBranchAndPeriod(@Param("branchId") String branchId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME,
               SUM(d.TOTAL) AS TOTAL, SUM(d.NEW_ACCOUNT) AS NEW_ACCOUNT,
               SUM(d.LIVE) AS LIVE, SUM(d.CHURN) AS CHURN, SUM(d.NET) AS NET
        FROM FACT_NTB_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN MST_SEGMENTS m ON d.SEGMENT_ID = m.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        ORDER BY SUM(d.TOTAL) DESC
        """, nativeQuery = true)
    List<Object[]> findSegmentSumByAreaAndPeriod(@Param("areaId") String areaId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME,
               SUM(d.TOTAL) AS TOTAL, SUM(d.NEW_ACCOUNT) AS NEW_ACCOUNT,
               SUM(d.LIVE) AS LIVE, SUM(d.CHURN) AS CHURN, SUM(d.NET) AS NET
        FROM FACT_NTB_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        JOIN MST_SEGMENTS m ON d.SEGMENT_ID = m.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        ORDER BY SUM(d.TOTAL) DESC
        """, nativeQuery = true)
    List<Object[]> findSegmentSumByRegionAndPeriod(@Param("regionId") String regionId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    // ── Latest snapshot per level ─────────────────────────────────────────────

    @Query(value = """
        SELECT MAX(SNAPSHOT_DATE) FROM FACT_NTB_DAILY
        WHERE BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
        """, nativeQuery = true)
    java.sql.Timestamp findLatestSnapshotByBranch(@Param("branchId") String branchId);

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_NTB_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
        """, nativeQuery = true)
    java.sql.Timestamp findLatestSnapshotByArea(@Param("areaId") String areaId);

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_NTB_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
        """, nativeQuery = true)
    java.sql.Timestamp findLatestSnapshotByRegion(@Param("regionId") String regionId);
}
