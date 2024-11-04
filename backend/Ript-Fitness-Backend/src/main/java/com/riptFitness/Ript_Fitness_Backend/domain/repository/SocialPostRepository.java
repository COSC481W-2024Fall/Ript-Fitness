package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Streak;

public interface SocialPostRepository extends JpaRepository<SocialPost, Long>{
	
	//Searches database for SocialPost row with ID = socialPostId (input parameter) and returns it. If it is found Return the row. If not return an empty Optional object.
		@Override	
		@Query("SELECT s FROM SocialPost s WHERE s.id = :id AND s.isDeleted = false")
		Optional<SocialPost> findById(@Param("id") Long id);

		@Query("SELECT s.id FROM SocialPost s WHERE s.accountId = :accountId AND s.isDeleted = false")
		Optional<ArrayList<Long>> getPostsFromAccountId(@Param("accountId") Long accountId);
}
