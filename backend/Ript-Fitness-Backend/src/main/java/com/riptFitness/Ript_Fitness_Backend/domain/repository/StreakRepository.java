package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;


public interface StreakRepository extends JpaRepository <Streak, Long> {
	
	//Looks in the Streak table for a record with the inputed ID. If it is found Return the row. If not return an empty Optional object.
	@Query("SELECT s FROM Streak s WHERE s.id = :id")
	Optional<Streak> findById(@Param("id") Long id);
	
	// Saves inputted Streak object to the streak table.
	@Modifying
	@Query(value = "INSERT INTO streak (streak) VALUES (:streak)", nativeQuery = true)
	void saveStreak(@Param("streak") Streak streak);

}
