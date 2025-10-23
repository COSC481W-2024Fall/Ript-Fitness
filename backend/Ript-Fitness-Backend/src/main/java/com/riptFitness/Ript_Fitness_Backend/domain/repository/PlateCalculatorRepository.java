package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.PlateCalculator;

public interface PlateCalculatorRepository extends JpaRepository<PlateCalculator, Long> {
	@Query("SELECT p FROM PlateCalculator p WHERE p.account.id = :accountId AND p.isDeleted = false")
	Optional<ArrayList<PlateCalculator>> getFoodsFromAccountId(@Param("accountId") Long accountId);
}
