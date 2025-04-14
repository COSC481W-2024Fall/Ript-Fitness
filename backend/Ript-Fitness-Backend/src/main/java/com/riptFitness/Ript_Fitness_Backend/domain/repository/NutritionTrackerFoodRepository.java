package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.Optional;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;

public interface NutritionTrackerFoodRepository extends JpaRepository<Food, Long> {	
	@Override
	@Query("SELECT f FROM Food f WHERE f.id = :id AND f.isDeleted = false")
	Optional<Food> findById(@Param("id")Long id);
	
	@Query("SELECT f FROM Food f WHERE f.account.id = :accountId AND f.isDeleted = false")
	Optional<ArrayList<Food>> getFoodsFromAccountId(@Param("accountId") Long accountId);

    @Query("SELECT f FROM Food f WHERE f.barcode = :barcode AND f.isDeleted = false")
	Optional<Food> findByBarcode(@Param("barcode") String barcode);
    }
