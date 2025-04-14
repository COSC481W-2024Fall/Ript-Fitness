package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Calendar;
import com.riptFitness.Ript_Fitness_Backend.domain.model.CalendarWorkoutLink;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;

public interface CalendarWorkoutLinkRepository extends JpaRepository<CalendarWorkoutLink, Long> {

    List<CalendarWorkoutLink> findByCalendarEntry(Calendar calendarEntry);

    @Query("""
    	    SELECT w FROM CalendarWorkoutLink l
    	    JOIN l.calendarEntry ce
    	    JOIN l.workout w
    	    WHERE ce.account.id = :accountId
    	      AND ce.date BETWEEN :startOfDay AND :endOfDay
    	      AND w.isDeleted = false
    	""")
    	List<Workouts> findWorkoutsByDateRange(@Param("accountId") Long accountId,
    	                                                 @Param("startOfDay") LocalDateTime startOfDay,
    	                                                 @Param("endOfDay") LocalDateTime endOfDay);
}

