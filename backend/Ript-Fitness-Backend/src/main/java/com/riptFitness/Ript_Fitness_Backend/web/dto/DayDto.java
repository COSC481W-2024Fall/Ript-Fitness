package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

//Dto must match the model class exactly minus the "@" declarations (and excluding any variables you don't want sent to the front end)
public class DayDto {

	public Long id;
	public List<FoodDto> foodsEatenInDay = new ArrayList<>();	
	public LocalDate date;
	public Double calories;
	public Double totalCarbs;
	public Double totalProtein;
	public Double totalFat;
	public Double totalCholesterol;
	public Double totalSaturatedFat;
	public Double totalTransFat;
	public Double totalSodium;
	public Double totalFiber;
	public Double totalSugars;
	public Double totalCalcium;
	public Double totalIron;
	public Double totalPotassium;
	public int totalWaterConsumed;
	public boolean isDeleted = false;
}
