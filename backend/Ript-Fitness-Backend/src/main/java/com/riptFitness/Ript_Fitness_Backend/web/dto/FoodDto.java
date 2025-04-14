package com.riptFitness.Ript_Fitness_Backend.web.dto;

//Dto must match the model class exactly minus the "@" declarations
public class FoodDto {

	public Long id;	
	public String name;
	public Double calories;
	public Double carbs;
	public Double protein;
	public Double fat;
	public Double cholesterol;
	public Double saturatedFat;
	public Double transFat;
	public Double sodium;
	public Double fiber;
	public Double sugars;
	public Double calcium;
	public Double iron;
	public Double potassium;
	public Double serving;
	public boolean isDeleted = false;
	
}
