package com.mandiri.branchperformance.repository;

import com.mandiri.branchperformance.model.entity.MstPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MstPeriodRepository extends JpaRepository<MstPeriod, UUID> {

    @Query(value = "SELECT * FROM MST_PERIODS WHERE PERIOD_TYPE = :type ORDER BY YEAR DESC, MONTH DESC NULLS LAST",
           nativeQuery = true)
    List<MstPeriod> findByType(@Param("type") String type);

    @Query(value = "SELECT * FROM MST_PERIODS ORDER BY YEAR DESC, MONTH DESC NULLS LAST",
           nativeQuery = true)
    List<MstPeriod> findAllOrdered();
}
