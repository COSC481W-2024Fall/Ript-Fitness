package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity // Creates a database table with the name below and the columns equal to the variable
@Table(name = "workouts")
public class Workouts {
	
	@Id //Declares this variable the primary key in the table
	@GeneratedValue(strategy = GenerationType.IDENTITY) //Auto-increments the id
	public Long workoutsId;
	
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private AccountsModel account;

    @ManyToMany
    @JoinTable(
        name = "exercise_ids",
        joinColumns = @JoinColumn(name = "workout_id"),
        inverseJoinColumns = @JoinColumn(name = "exercise_id")
    )
    private List<ExerciseModel> exercises = new ArrayList<>();

	
	public String name;
	public boolean isDeleted = false;
	
	
    public AccountsModel getAccount() {
        return account;
    }

    public void setAccount(AccountsModel account) {
        this.account = account;
    }
    
    public List<ExerciseModel> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseModel> exercises) {
        this.exercises = exercises;
        for (ExerciseModel exercise : exercises) {
            exercise.setWorkout(this);
        }
    }

	

}