package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // Creates a database table with that name and and columns equal to the variables in the object class
public class TestModel {
	
	@Id	//This means this is the primary key of the TestModel database table
	@GeneratedValue(strategy = GenerationType.IDENTITY) // Generates an ID via auto-increment
	public Long id;
	
	public String firstName;
	public String lastName;
	
	// Getters & Setters:
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	} 
	
}