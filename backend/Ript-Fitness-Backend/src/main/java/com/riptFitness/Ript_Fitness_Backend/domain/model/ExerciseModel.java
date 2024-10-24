package com.riptFitness.Ript_Fitness_Backend.domain.model;


import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;  // Correct import for JPA
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


// TODO: Add the following fields to the class:
// - ExerciseID (auto incerment) *
// - sets *
// - reps *
// - weight *
// - nameOfExercise *
// - reference_user_id *
// - refernce_workout_id (set after the workout has been set) * 
@Entity
@Table(name = "exercise_model")
public class ExerciseModel {
	
	@Id // Primary Key (ID for exercise object)
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long exerciseId;
	
	public int sets;
	public List<Integer> reps; // List to store the number of reps per set
	public String nameOfExercise;
	public boolean isDeleted = false; // False to start because true means the exercisde is deleted.
	// private int weight; Not sure what to do with this yet; may use later.
	
	// Reference to the users account (to get the ID of the account)
	@ManyToOne
	@JoinColumn(name = "account_id") // Creates a foreign key column in the exercise table
	@JsonIgnoreProperties("exercises") // Ignore the exercises list inside account when serializing
	private AccountsModel account; // Reference to the account that owns this exercise
	
	// We also will need a reference to the workout model: (UNCOMMENT BELOW ONCE CHRIS IS DONE)
	//@ManyToOne
	//@JoinColumn(name = "workout_id")
	//public WorkoutModel workout;
	
	// Getters and Setters for all fields
    public AccountsModel getAccount() {
        return account;
    }

    public void setAccount(AccountsModel account) {
        this.account = account;
    }

	public Long getExerciseId() {
		return exerciseId;
	}

	public void setExerciseId(Long exerciseId) {
		this.exerciseId = exerciseId;
	}

	public int getSets() {
		return sets;
	}

	// When the number of sets is updated, initialize or adjust the size of the reps list accordingly
    public void setSets(int sets) {
        this.sets = sets;

        // If reps is null or its size doesn't match the number of sets, resize it
        if (this.reps == null || this.reps.size() != sets) {
            this.reps = new ArrayList<>(sets);
            for (int i = 0; i < sets; i++) {
                this.reps.add(null); // Initialize all elements to null
            }
        }
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

	public boolean isIsDeleted() {
		return this.isDeleted;
	}

	public void setIsDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public Long getAccountreferenceId() {
        return account.getId();
    }

    public void setAccountreferenceId(Long AccountReferenceId) {
        account.setId(AccountReferenceId);
    }

	


	
	

}
