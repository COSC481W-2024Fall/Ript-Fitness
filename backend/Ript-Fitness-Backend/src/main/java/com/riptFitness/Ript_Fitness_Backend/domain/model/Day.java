package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.JoinColumn;

@Entity		//Tells database to create a table in the database called "Food" with column defined below
public class Day {

	@Id		//Defines "id" as the primary key in the database
	@GeneratedValue(strategy = GenerationType.IDENTITY)		//Tells database to add 1 to previous row's id value and assign to next row (first row id = 1, second row id = 2...)
	public Long id;
	
	//Defines many-to-many foreign key relationship in database between Day and Food. ChatGpt/Stack Overflow will define this for you
	//Disclaimer: ChatGpt helped me create this command
	@ManyToMany
	@JoinTable(
			name = "day_food",
			joinColumns = @JoinColumn(name = "day_id"),
			inverseJoinColumns = @JoinColumn(name = "food_id")
	)
	public List<Food> foodsEatenInDay = new ArrayList<>();
		
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    public AccountsModel account;
	
	public LocalDate date;

	public double calories;
	public double totalCarbs;
	public double totalProtein;
	public double totalFat;
	public double totalCholesterol;
	public double totalSaturatedFat;
	public double totalTransFat;
	public double totalSodium;
	public double totalFiber;
	public double totalSugars;
	public double totalCalcium;
	public double totalIron;
	public double totalPotassium;
	public int totalWaterConsumed;
	public boolean isDeleted = false;
	
    @PrePersist
    protected void onCreate() {
    	date = LocalDate.now();
    }
}
