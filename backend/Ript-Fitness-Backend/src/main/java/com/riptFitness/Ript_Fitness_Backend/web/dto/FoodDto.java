package com.riptFitness.Ript_Fitness_Backend.web.dto;

//Dto must match the model class exactly minus the "@" declarations
public class FoodDto {

	public Long id;	
	public String name;
	public double calories;
	public double carbs;
	public double protein;
	public double fat;
	public double cholesterol;
	public double saturatedFat;
	public double transFat;
	public double sodium;
	public double fiber;
	public double sugars;
	public double calcium;
	public double iron;
	public double potassium;
	public double serving;
	public boolean isDeleted = false;
}
