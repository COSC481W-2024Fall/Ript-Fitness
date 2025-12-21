package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.util.List;

public class PlateCalculatorDto {
	
	public Long id;
	public double totalWeight;
	public double[] platesAvailable;
	public int weightOfBar;
	public List<PlateCountDto> plateCounts;
	public boolean isDeleted;
}
