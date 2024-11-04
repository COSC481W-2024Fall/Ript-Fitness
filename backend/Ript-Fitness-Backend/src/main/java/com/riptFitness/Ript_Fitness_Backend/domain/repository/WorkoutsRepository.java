package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Workouts;



public interface WorkoutsRepository extends JpaRepository <Workouts, Long> {

	//Looks in Workouts table for a record with the inputed ID and that is not deleted. If found, Return the row. If not return  empty Optional object
	@Override
	@Query("SELECT i FROM Workouts i WHERE i.workoutsId = :workoutsId AND i.isDeleted = false")
	Optional<Workouts> findById(@Param("workoutsId") Long workoutsId);

	
    //Looks for all workouts with the Id of the current user and returns a list of all that user's workouts
	@Query("SELECT i FROM Workouts i WHERE i.account.id = :currentUserId AND i.isDeleted = false")
	List<Workouts> findByAccountId(@Param("currentUserId") Long currentUserId);


}