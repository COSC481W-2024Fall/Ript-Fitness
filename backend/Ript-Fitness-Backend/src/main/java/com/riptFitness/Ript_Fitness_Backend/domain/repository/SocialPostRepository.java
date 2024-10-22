package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;

public interface SocialPostRepository extends JpaRepository<SocialPost, Long>{
	
}
