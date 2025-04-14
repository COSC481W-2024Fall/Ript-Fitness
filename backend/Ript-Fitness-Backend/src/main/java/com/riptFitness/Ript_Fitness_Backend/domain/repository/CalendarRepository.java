package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Calendar;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;

public interface CalendarRepository extends JpaRepository<Calendar, Long> {

	@Query("SELECT c FROM Calendar c WHERE c.account.id = :accountId AND c.date BETWEEN :startDate AND :endDate")
	List<Calendar> findByAccountIdAndDateBetween(@Param("accountId") Long accountId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	@Query("SELECT c FROM Calendar c WHERE c.account.id = :accountId AND c.date = :date")
	Optional<Calendar> findByAccountIdAndDate( // Changed to Optional<Calendar>
			@Param("accountId") Long accountId, @Param("date") LocalDateTime date);

	Optional<Calendar> findTopByAccountIdOrderByDateDesc(Long accountId);
	
	@Query("SELECT w FROM Workouts w WHERE w.account.id = :accountId AND w.workoutDate = :date AND w.isDeleted = false")
	List<Workouts> findWorkoutsByDate(@Param("accountId") Long accountId, @Param("date") LocalDate date);

}
