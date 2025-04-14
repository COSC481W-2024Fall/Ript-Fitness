package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Column;
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
    public String barcode;
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
	public Double serving; //for the serving (can have .75 of something)
	public boolean isDeleted = false;
	
}
