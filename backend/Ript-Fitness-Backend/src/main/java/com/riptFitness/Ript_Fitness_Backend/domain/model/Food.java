package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity		//Tells database to create a table in the database called "Food" with column defined below
public class Food {

	@Id		//Defines "id" as the primary key in the database
	@GeneratedValue(strategy = GenerationType.IDENTITY)		//Tells database to add 1 to previous row's id value and assign to next row (first row id = 1, second row id = 2...)
	public Long id;
	
    @ManyToOne
    @JoinColumn(name = "account_id")
    public AccountsModel account;
	
	//Define columns in the database
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
	public double serving; //for the serving (can have .75 of something)
	public boolean isDeleted = false;
}
