package com.mandiri.branchperformance.repository;

import com.mandiri.branchperformance.model.entity.FactGiroDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GiroRepository extends JpaRepository<FactGiroDaily, UUID> {

    // ── Latest snapshot ───────────────────────────────────────────────────────

    @Query(value = """
        SELECT MAX(SNAPSHOT_DATE) FROM FACT_GIRO_DAILY
        WHERE BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
        """, nativeQuery = true)
    Timestamp findLatestSnapshotByBranch(@Param("branchId") String branchId);

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
        """, nativeQuery = true)
    Timestamp findLatestSnapshotByArea(@Param("areaId") String areaId);

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
        """, nativeQuery = true)
    Timestamp findLatestSnapshotByRegion(@Param("regionId") String regionId);

    // ── Snapshot before reference date (MoM) ─────────────────────────────────

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_GIRO_DAILY d
        WHERE d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND d.SNAPSHOT_DATE <= :refDate
        """, nativeQuery = true)
    Timestamp findLatestSnapshotBeforeByBranch(@Param("branchId") String branchId,
                                               @Param("refDate") Timestamp refDate);

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND d.SNAPSHOT_DATE <= :refDate
        """, nativeQuery = true)
    Timestamp findLatestSnapshotBeforeByArea(@Param("areaId") String areaId,
                                             @Param("refDate") Timestamp refDate);

    @Query(value = """
        SELECT MAX(d.SNAPSHOT_DATE) FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND d.SNAPSHOT_DATE <= :refDate
        """, nativeQuery = true)
    Timestamp findLatestSnapshotBeforeByRegion(@Param("regionId") String regionId,
                                               @Param("refDate") Timestamp refDate);

    // ── Current snapshot rows ─────────────────────────────────────────────────

    @Query(value = """
        SELECT d.* FROM FACT_GIRO_DAILY d
        WHERE d.SNAPSHOT_DATE = :snapshotDate
          AND d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
        """, nativeQuery = true)
    List<FactGiroDaily> findByBranchAndSnapshot(@Param("branchId") String branchId,
                                                 @Param("snapshotDate") LocalDate snapshotDate);

    @Query(value = """
        SELECT d.* FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE d.SNAPSHOT_DATE = :snapshotDate
          AND b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
        """, nativeQuery = true)
    List<FactGiroDaily> findByAreaAndSnapshot(@Param("areaId") String areaId,
                                               @Param("snapshotDate") LocalDate snapshotDate);

    @Query(value = """
        SELECT d.* FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE d.SNAPSHOT_DATE = :snapshotDate
          AND a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
        """, nativeQuery = true)
    List<FactGiroDaily> findByRegionAndSnapshot(@Param("regionId") String regionId,
                                                 @Param("snapshotDate") LocalDate snapshotDate);

    // ── History for chart (last 12 snapshots, DESC) ───────────────────────────

    @Query(value = """
        SELECT * FROM (
            SELECT d.SNAPSHOT_DATE, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE, SUM(d.AVG_BALANCE) AS AVG_BALANCE
            FROM FACT_GIRO_DAILY d
            WHERE d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
            GROUP BY d.SNAPSHOT_DATE
            ORDER BY d.SNAPSHOT_DATE DESC
        ) WHERE ROWNUM <= 12
        """, nativeQuery = true)
    List<Object[]> findHistoryByBranch(@Param("branchId") String branchId);

    @Query(value = """
        SELECT * FROM (
            SELECT d.SNAPSHOT_DATE, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE, SUM(d.AVG_BALANCE) AS AVG_BALANCE
            FROM FACT_GIRO_DAILY d
            JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
            WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
            GROUP BY d.SNAPSHOT_DATE
            ORDER BY d.SNAPSHOT_DATE DESC
        ) WHERE ROWNUM <= 12
        """, nativeQuery = true)
    List<Object[]> findHistoryByArea(@Param("areaId") String areaId);

    @Query(value = """
        SELECT * FROM (
            SELECT d.SNAPSHOT_DATE, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE, SUM(d.AVG_BALANCE) AS AVG_BALANCE
            FROM FACT_GIRO_DAILY d
            JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
            JOIN ORG_AREAS a ON b.AREA_ID = a.ID
            WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
            GROUP BY d.SNAPSHOT_DATE
            ORDER BY d.SNAPSHOT_DATE DESC
        ) WHERE ROWNUM <= 12
        """, nativeQuery = true)
    List<Object[]> findHistoryByRegion(@Param("regionId") String regionId);

    // ── Composition by segment ────────────────────────────────────────────────

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE
        FROM FACT_GIRO_DAILY d
        JOIN MST_SEGMENTS m ON d.SEGMENT_ID = m.ID
        WHERE d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND d.SNAPSHOT_DATE = :snapshotDate
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        ORDER BY SUM(d.ENDING_BALANCE) DESC
        """, nativeQuery = true)
    List<Object[]> findCompositionByBranch(@Param("branchId") String branchId,
                                           @Param("snapshotDate") LocalDate snapshotDate);

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE
        FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN MST_SEGMENTS m ON d.SEGMENT_ID = m.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND d.SNAPSHOT_DATE = :snapshotDate
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        ORDER BY SUM(d.ENDING_BALANCE) DESC
        """, nativeQuery = true)
    List<Object[]> findCompositionByArea(@Param("areaId") String areaId,
                                         @Param("snapshotDate") LocalDate snapshotDate);

    @Query(value = """
        SELECT m.SEGMENT_CODE, m.SEGMENT_NAME, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE
        FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        JOIN MST_SEGMENTS m ON d.SEGMENT_ID = m.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND d.SNAPSHOT_DATE = :snapshotDate
        GROUP BY m.SEGMENT_CODE, m.SEGMENT_NAME
        ORDER BY SUM(d.ENDING_BALANCE) DESC
        """, nativeQuery = true)
    List<Object[]> findCompositionByRegion(@Param("regionId") String regionId,
                                           @Param("snapshotDate") LocalDate snapshotDate);

    // ── Detail drill-down ─────────────────────────────────────────────────────

    @Query(value = """
        SELECT b.BRANCH_CODE, b.BRANCH_NAME,
               SUM(d.AVG_BALANCE) AS AVG_BALANCE, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE,
               AVG(d.COF) AS COF
        FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND d.SNAPSHOT_DATE = :snapshotDate
        GROUP BY b.BRANCH_CODE, b.BRANCH_NAME
        ORDER BY SUM(d.ENDING_BALANCE) DESC
        """, nativeQuery = true)
    List<Object[]> findDetailByArea(@Param("areaId") String areaId,
                                    @Param("snapshotDate") LocalDate snapshotDate);

    @Query(value = """
        SELECT a.AREA_CODE, a.AREA_NAME,
               SUM(d.AVG_BALANCE) AS AVG_BALANCE, SUM(d.ENDING_BALANCE) AS ENDING_BALANCE,
               AVG(d.COF) AS COF
        FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND d.SNAPSHOT_DATE = :snapshotDate
        GROUP BY a.AREA_CODE, a.AREA_NAME
        ORDER BY SUM(d.ENDING_BALANCE) DESC
        """, nativeQuery = true)
    List<Object[]> findDetailByRegion(@Param("regionId") String regionId,
                                      @Param("snapshotDate") LocalDate snapshotDate);

    // ── Acquisition: MTD/YTD aggregations ────────────────────────────────────

    @Query(value = """
        SELECT SUM(d.NEW_CIF) AS NEW_CIF, SUM(d.CHURN) AS CHURN, SUM(d.NET_CIF) AS NET_CIF,
               SUM(d.ENDING_BALANCE) AS ENDING_BALANCE
        FROM FACT_GIRO_DAILY d
        WHERE d.BRANCH_ID = HEXTORAW(REPLACE(:branchId, '-', ''))
          AND d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
        """, nativeQuery = true)
    Object[] findAcquisitionByBranchAndPeriod(@Param("branchId") String branchId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT SUM(d.NEW_CIF) AS NEW_CIF, SUM(d.CHURN) AS CHURN, SUM(d.NET_CIF) AS NET_CIF,
               SUM(d.ENDING_BALANCE) AS ENDING_BALANCE
        FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        WHERE b.AREA_ID = HEXTORAW(REPLACE(:areaId, '-', ''))
          AND d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
        """, nativeQuery = true)
    Object[] findAcquisitionByAreaAndPeriod(@Param("areaId") String areaId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT SUM(d.NEW_CIF) AS NEW_CIF, SUM(d.CHURN) AS CHURN, SUM(d.NET_CIF) AS NET_CIF,
               SUM(d.ENDING_BALANCE) AS ENDING_BALANCE
        FROM FACT_GIRO_DAILY d
        JOIN ORG_BRANCHES b ON d.BRANCH_ID = b.ID
        JOIN ORG_AREAS a ON b.AREA_ID = a.ID
        WHERE a.REGION_ID = HEXTORAW(REPLACE(:regionId, '-', ''))
          AND d.SNAPSHOT_DATE BETWEEN :startDate AND :endDate
        """, nativeQuery = true)
    Object[] findAcquisitionByRegionAndPeriod(@Param("regionId") String regionId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
}
