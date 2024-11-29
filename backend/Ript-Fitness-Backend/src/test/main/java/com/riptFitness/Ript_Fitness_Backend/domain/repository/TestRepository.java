package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.riptFitness.Ript_Fitness_Backend.domain.model.TestModel;

public interface TestRepository extends JpaRepository <TestModel, Long>{
	//Put database stuff in here!
}
