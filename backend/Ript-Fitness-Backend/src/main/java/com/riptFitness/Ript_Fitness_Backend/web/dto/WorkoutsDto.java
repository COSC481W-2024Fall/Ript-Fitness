package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.util.List;

import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;

//Dto is same as the model but doesn't need the @ 
public class WorkoutsDto {
	public Long id;
	public List<ExerciseModel> exercises;
	public String name;
}
