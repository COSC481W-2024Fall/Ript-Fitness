package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PlateCount {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
	@ManyToOne
	@JoinColumn(name = "plateCalculator_id")
	public PlateCalculator plateCalculator;
	
	public double plateWeight;
	public int numberOfPlates;
	
	public PlateCount(double plateWeight, int numberOfPlates) {
		this.plateWeight = plateWeight;
		this.numberOfPlates = numberOfPlates;
	}
}
