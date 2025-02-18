package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "weight_history")
public class WeightHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonIgnore //prevent infinite Recursion
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile userProfile;  // Links weight history to a user

    //in pounds
    private Double weight;

    private LocalDateTime recordedAt = LocalDateTime.now();  // Auto-set timestamp
    
    public WeightHistory(UserProfile userProfile, double weight, LocalDateTime recordedAt) {
        this.userProfile = userProfile;
        this.weight = weight;
        this.recordedAt = recordedAt;
    }
    
    public WeightHistory() {
    	
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
