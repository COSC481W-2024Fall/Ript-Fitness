package com.riptFitness.Ript_Fitness_Backend.web.dto;

public class TestDto {

	public Long id;
	
	public String firstName;
	public String lastName;
	
	// Getters and Setters below:
	
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
