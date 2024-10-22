package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.util.ArrayList;
import java.util.List;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPostComment;

public class SocialPostDto {

	public Long id;
	
	public AccountsModel accountsModel;
    
    public String content;
    
    public int numberOfLikes = 0;
    
    public List<Long> userIDsOfLikes = new ArrayList<>();
    
    public List<SocialPostComment> socialPostComments;
}
