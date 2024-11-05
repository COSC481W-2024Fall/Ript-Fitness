package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.util.List;

import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "workout_id")
    private List<ExerciseModel> exercises;
	
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
    }
	

}
