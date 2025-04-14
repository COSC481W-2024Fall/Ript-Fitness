package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.LocalDate;
import java.util.List;

//Dto is same as the model but doesn't need the @ 
public class WorkoutsDto {
	private Long workoutsId;
	private String name;
	private List<Long> exerciseIds;
	private List<ExerciseDto> exercises; // New as of 11/22/24
	private boolean isDeleted = false;
	private LocalDate workoutDate; // new as of 3/3/20

	// Getters and Setters
	public Long getWorkoutsId() {
		return workoutsId;
	}

	public void setWorkoutsId(Long workoutsId) {
		this.workoutsId = workoutsId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isIsDeleted() {
		return isDeleted;
	}

	public void setIsDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public List<Long> getExerciseIds() {
		return exerciseIds;
	}

	public void setExerciseIds(List<Long> exerciseIds) {
		this.exerciseIds = exerciseIds;
	}

	public List<ExerciseDto> getExercises() {
		return exercises;
	} // New as of 11/22/24

	public void setExercises(List<ExerciseDto> exercises) {
		this.exercises = exercises;
	} // New as of 11/22/24

	public LocalDate getWorkoutDate() {
		return workoutDate;
	}

	public void setWorkoutDate(LocalDate workoutDate) {
		this.workoutDate = workoutDate;
	}

}
