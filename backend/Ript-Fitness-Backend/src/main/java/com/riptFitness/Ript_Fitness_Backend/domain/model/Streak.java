package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;

@Entity
public class Streak {
	
	//defines the primary key of the table
	@Id
	public Long id;
	
	@OneToOne
 	@MapsId
 	@JoinColumn(name = "account_id")
	@JsonBackReference // Prevents infinite recursion during serialization
 	public AccountsModel account; //maps the id for the account to id of the streak
	
	//defines the columns in the table
	public int currentSt;
	public LocalDateTime prevLogin;
	//future feature preparation 
	public int offDays;
	public int goal;
}
