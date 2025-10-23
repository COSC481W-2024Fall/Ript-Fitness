package com.riptFitness.Ript_Fitness_Backend.web.dto;

public class PlateCountDto {
	public double plateWeight;
	public int numberOfPlates;
	
	public PlateCountDto() {}
	
	public PlateCountDto(double plateWeight, int numberOfPlates) {
		this.plateWeight = plateWeight;
		this.numberOfPlates = numberOfPlates;
	}
}
