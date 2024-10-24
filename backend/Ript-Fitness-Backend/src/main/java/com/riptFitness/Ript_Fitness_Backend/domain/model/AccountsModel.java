package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;

@Entity // Creates a database table with that name and columns equal to the variables in the object class
@Table(name = "accounts_model")
public class AccountsModel {

    @Id // This means this is the primary key of the AccountsModel database table
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Generates an ID via auto-increment
    private Long id;
    
    // Bidirectional relationship with Streak
    @OneToOne(mappedBy = "account")
    @JsonManagedReference // Indicates that AccountsModel is the parent in the relationship
    private Streak streak;
    
    // 10/17/24: Adding One-To-Many relationship with the exercise class:
    @OneToMany(mappedBy = "account") // "account" is the insatnce variable in the exercise class
    @JsonIgnoreProperties("account") // Ignore the account field inside exercises when serializing
    private List<ExerciseModel> exercises; // This is a collection (List) that holds exercises

    // Fields:
    private String username;
    @JsonIgnore // Ignore password field during serialization
    private String password;
    @JsonIgnore // Ignore password field during serialization
    private String email;
    private LocalDateTime lastLogin;
    
    // Automatically set the date
    @PostPersist
    protected void onCreate() {
        this.lastLogin = LocalDateTime.now();
    }


    // Getters:
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getEmail() {
        return email;
    }
    
    public LocalDateTime getlastLogin(){
    	return lastLogin;
    }

    // Setters:
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password; 
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setlastLogin(LocalDateTime lastLogin) {
    	this.lastLogin = lastLogin;
    }
    
    public Streak getStreak() {
        return streak;
    }

    public void setStreak(Streak streak) {
        this.streak = streak;
    }


	public List<ExerciseModel> getExercises() {
		return exercises;
	}


	public void setExercises(List<ExerciseModel> exercises) {
		this.exercises = exercises;
	}
}
