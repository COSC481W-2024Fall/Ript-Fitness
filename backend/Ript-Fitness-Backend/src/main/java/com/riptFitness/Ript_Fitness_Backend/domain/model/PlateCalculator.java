package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PlateCalculator {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
	@ManyToOne
	@JoinColumn(name = "account_id")
	public AccountsModel account;
	
	public double totalWeight;
	public double[] platesAvailable;
	public int weightOfBar;
}
