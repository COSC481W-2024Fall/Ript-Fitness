package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;  // Correct import for JPA
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "exercise_model")
public class ExerciseModel {

    @Id // Primary Key (ID for exercise object)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long exerciseId;

    private int sets;
    private List<Integer> reps = new ArrayList<>(); // List to store the number of reps per set
    private String nameOfExercise;
    private boolean isDeleted = false; // False to start because true means the exercise is deleted
    private List<Integer> weight = new ArrayList<>();
    private String description;
    
    /*Exercise types:
     * 1: Arms
     * 2: Shoulders
     * 3: Chest
     * 4: Core
     * 5: Legs
     * 6: Upper Back
     * 7: Lower Back
     * 8: Cardio
     * 9: Uncategorized
     */
    private int exerciseType;

    // Reference to the user's account (to get the ID of the account)
    @ManyToOne
    @JoinColumn(name = "account_id") // Creates a foreign key column in the exercise table
    @JsonIgnoreProperties("exercises") // Ignore the exercises list inside account when serializing
    private AccountsModel account; // Reference to the account that owns this exercise

    // Reference to the workout model
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id") // Creates a foreign key column in the exercise table
    private Workouts workout;

    // Getters and Setters for all fields
    public String getDescription() {
    	return description;
    }
    
    public void setDescription(String description) {
    	this.description = description;
    }
    
    public int getExerciseType() {
    	return exerciseType;
    }
    
    public void setExerciseType(int exerciseType) {
    	this.exerciseType = exerciseType;
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

    public void setSets(int sets) {
        this.sets = sets;

        // Adjust reps and weight lists if necessary
        if (this.reps == null) {
            this.reps = new ArrayList<>();
        }
        while (this.reps.size() < sets) {
            this.reps.add(0);
        }
        while (this.reps.size() > sets) {
            this.reps.remove(this.reps.size() - 1);
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

    public boolean isDeleted() {
        return this.isDeleted;
    }

    public void setIsDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public List<Integer> getWeight() {
        return weight;
    }

    public void setWeight(List<Integer> weight) {
        this.weight = weight;

        // Adjust weight list if necessary
        if (this.weight == null) {
            this.weight = new ArrayList<>();
        }
        while (this.weight.size() < sets) {
            this.weight.add(0);
        }
        while (this.weight.size() > sets) {
            this.weight.remove(this.weight.size() - 1);
        }
    }

    public AccountsModel getAccount() {
        return account;
    }

    public void setAccount(AccountsModel account) {
        this.account = account;
    }

    public Workouts getWorkout() {
        return workout;
    }

    public void setWorkout(Workouts workout) {
        this.workout = workout;
    }

    // Convenience method to get the account ID
    public Long getAccountReferenceId() {
        return account != null ? account.getId() : null;
    }

    public void setAccountReferenceId(Long accountReferenceId) {
        if (this.account == null) {
            this.account = new AccountsModel(); // Create a new AccountsModel if null
        }
        this.account.setId(accountReferenceId);
    }
}
