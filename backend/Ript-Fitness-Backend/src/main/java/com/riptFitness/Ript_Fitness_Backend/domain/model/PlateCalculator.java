package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class PlateCalculator {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
	@ManyToOne
	@JoinColumn(name = "account_id")
	public AccountsModel account;
	
	@OneToMany(mappedBy = "plateCalculator", cascade = CascadeType.ALL, orphanRemoval = true)
	public List<PlateCount> plateCounts;
	
	public double totalWeight;
	public double[] platesAvailable;
	public int weightOfBar;
}
