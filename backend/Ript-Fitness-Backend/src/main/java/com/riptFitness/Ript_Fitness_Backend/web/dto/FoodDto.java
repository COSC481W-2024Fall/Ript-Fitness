package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.ZonedDateTime;

//Dto must match the model class exactly minus the "@" declarations
public class FoodDto {

	public Long id;	
	public String name;
	public double calories;
	public double carbs;
	public double protein;
	public double fat;
	public double multiplier = 1.0;
	public boolean isDeleted = false;
	public ZonedDateTime dateCreated;
}
