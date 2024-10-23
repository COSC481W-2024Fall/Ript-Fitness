package com.riptFitness.Ript_Fitness_Backend.web.dto;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class ExerciseDto {
	
	
	public Long exerciseId;
	public int sets;
	public int reps;
	// private int weight; Not sure what to do with this yet; may use later.
	public String nameOfExercise;
	
	// Reference to the users account (AccountsModel)
	public AccountsModel account; // Reference to the account that owns this exercise
	
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

    public int getReps() {
        return reps;
    }

    public void setReps(int reps) {
        this.reps = reps;
    }

    public String getNameOfExercise() {
        return nameOfExercise;
    }

    public void setNameOfExercise(String nameOfExercise) {
        this.nameOfExercise = nameOfExercise;
    }

    public Long getAccountreferenceId() {
        return account.getId();
    }

    public void setAccountreferenceId(Long AccountReferenceId) {
        account.setId(AccountReferenceId);
    }

    // Optional WorkoutId field
    // public Long getWorkoutId() {
    //    return workoutId;
    // }
    
    // public void setWorkoutId(Long workoutId) {
    //    this.workoutId = workoutId;
    // }
}