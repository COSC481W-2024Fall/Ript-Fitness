package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Calendar;

public interface CalendarRepository extends JpaRepository<Calendar, Long> {

    @Query("SELECT c FROM Calendar c WHERE c.account.id = :accountId AND c.date BETWEEN :startDate AND :endDate")
    List<Calendar> findByAccountIdAndDateBetween(
        @Param("accountId") Long accountId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT c FROM Calendar c WHERE c.account.id = :accountId AND c.date = :date")
    Calendar findByAccountIdAndDate(
        @Param("accountId") Long accountId,
        @Param("date") LocalDate date
    );
}
