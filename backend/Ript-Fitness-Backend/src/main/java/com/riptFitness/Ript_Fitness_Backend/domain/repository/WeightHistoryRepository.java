package com.riptFitness.Ript_Fitness_Backend.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.model.WeightHistory;

public interface WeightHistoryRepository extends JpaRepository<WeightHistory, Long>{
	//return all weight history from newest to oldest
	@Query("SELECT w FROM WeightHistory w WHERE w.userProfile.id = :userProfileId ORDER BY w.recordedAt DESC")
	List<WeightHistory> findByUserProfileOrderByRecordedAtDesc(@Param("userProfileId") Long userProfileId);
	
	//return last recorded weight before the last udpate
	@Query("SELECT u FROM WeightHistory u WHERE u.userProfile.id = :userId ORDER BY u.recordedAt DESC LIMIT 1")
	List<WeightHistory> findLastWeightBeforeUpdate (@Param("userId")Long userID);


}
