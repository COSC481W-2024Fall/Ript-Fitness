package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;

public interface ExerciseRepository extends JpaRepository <ExerciseModel, Long> {
	
	// Query to retrieve exercises by account_id where isDeleted is false
    @Query("SELECT e FROM ExerciseModel e WHERE e.account.id = :accountId AND e.isDeleted = false")
    List<ExerciseModel> findByAccountIdAndNotDeleted(Long accountId);
    
}


