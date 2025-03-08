package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.NutritionTrackerService;

public class FoodItemController {
	private final NutritionTrackerService nutritionTrackerService;
	
	public FoodItemController(NutritionTrackerService nutritionTrackerService) {
		this.nutritionTrackerService = nutritionTrackerService;
	}

	@GetMapping("/{barcode}")
	public Food getFoodByBarcode (@PathVariable String barcode) {
		Food food = null;
		return food;
		
	}

}
