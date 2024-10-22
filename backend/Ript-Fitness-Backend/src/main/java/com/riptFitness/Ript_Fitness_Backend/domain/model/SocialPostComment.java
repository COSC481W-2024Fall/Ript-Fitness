package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class SocialPostComment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
	public AccountsModel accountsModel;
	
	public String content;
	
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    public SocialPost socialPost;
}
