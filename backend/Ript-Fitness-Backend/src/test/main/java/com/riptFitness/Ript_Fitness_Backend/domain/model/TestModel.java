package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // This tells spring that it needs to create a table named the same as the class
		// and also that there needs to be columns the same as the variables in the class.
public class TestModel {
	
	@Id	//This means this is the primary key of the TestModel database table.
	@GeneratedValue(strategy = GenerationType.IDENTITY) // This is basically auto increment for the prim.key
	public Long id;
	
	public String firstName;
	public String lastName;
	
	// Getters and setters for fields:
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
