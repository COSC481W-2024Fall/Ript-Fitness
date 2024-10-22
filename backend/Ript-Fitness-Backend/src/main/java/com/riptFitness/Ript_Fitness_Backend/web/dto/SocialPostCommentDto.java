package com.riptFitness.Ript_Fitness_Backend.web.dto;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;

public class SocialPostCommentDto {

	public Long id;
	
	public AccountsModel accountsModel;
	
	public String content;
	
    public SocialPost socialPost;
}
