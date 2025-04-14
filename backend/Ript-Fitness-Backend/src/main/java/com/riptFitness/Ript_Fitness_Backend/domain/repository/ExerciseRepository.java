package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;

public interface ExerciseRepository extends JpaRepository <ExerciseModel, Long> {
	
	// Query to retrieve a list of type exercises by account_id where isDeleted is false
	@Query("SELECT e FROM ExerciseModel e WHERE e.account.id = :accountId AND e.isDeleted = false")
	List<ExerciseModel> findByAccountIdAndNotDeleted(@Param("accountId") Long accountId);
	
	//Query to retrieve a list of exercises by type
	@Query("SELECT e FROM ExerciseModel e WHERE e.exerciseType = :exerciseType")
	List<ExerciseModel> findByExerciseType(@Param("exerciseType") int exerciseType);
	
    
}