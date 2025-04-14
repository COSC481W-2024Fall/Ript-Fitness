package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Day;

public interface NutritionTrackerDayRepository extends JpaRepository<Day, Long> {
	@Override
	@Query("SELECT d FROM Day d WHERE d.id = :id AND d.isDeleted = false")
	Optional<Day> findById(@Param("id") Long id);

	@Query("SELECT d FROM Day d WHERE d.account.id = :accountId AND d.isDeleted = false")
	Optional<ArrayList<Day>> getDaysFromAccountId(@Param("accountId") Long accountId);

	@Query("SELECT d FROM Day d WHERE d.account.id = :accountId AND d.date >= :startDate AND d.isDeleted = false ORDER BY d.date ASC")
	List<Day> findLastXDays(@Param("accountId") Long accountId, @Param("startDate") LocalDate startDate);
	
	}
