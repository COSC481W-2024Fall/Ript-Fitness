package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.util.List;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.ExerciseModel;

public class ExerciseDto {
	
	
	public Long exerciseId;
	public int sets;
	public List<Integer> reps; // List to store the number of reps per set
	public boolean isDeleted = false; // False to start because true means the exercisde is deleted.
	// private int weight; Not sure what to do with this yet; may use later.
	public String nameOfExercise;
	
	// Reference to the users account (AccountsModel)
	public Long accountReferenceId; // Reference to the account that owns this exercise
	
	// We also will need a reference to the workout model: (UNCOMMENT BELOW ONCE CHRIS IS DONE)
	//public WorkoutModel workout;
	
	// Getters and Setters
    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public List<Integer> getReps() {
        return reps;
    }

    public void setReps(List<Integer> reps) {
        this.reps = reps;
    }

    public String getNameOfExercise() {
        return nameOfExercise;
    }

    public void setNameOfExercise(String nameOfExercise) {
        this.nameOfExercise = nameOfExercise;
    }

    public Long getAccountReferenceId() {
        return accountReferenceId;
    }

    public void setAccountReferenceId(Long accountReferenceId) {
        this.accountReferenceId = accountReferenceId;
    }

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}


    // Optional WorkoutId field
    // public Long getWorkoutId() {
    //    return workoutId;
    // }
    
    // public void setWorkoutId(Long workoutId) {
    //    this.workoutId = workoutId;
    // }
}