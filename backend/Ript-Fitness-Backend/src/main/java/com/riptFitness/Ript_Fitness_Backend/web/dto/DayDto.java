package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Food;

//Dto must match the model class exactly minus the "@" declarations
public class DayDto {

	public Long id;
	public List<FoodDto> foodsEatenInDay = new ArrayList<>();	
	public double calories;
	public double totalCarbs;
	public double totalProtein;
	public double totalFat;
	public int totalWaterConsumed;
	public boolean isDeleted = false;
	public ZonedDateTime dateCreated;
}
