package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.ZonedDateTime;

public class SocialPostCommentDto {

	public Long id;
		
    public UserDto userProfile;
		
	public String content;
	
    public Long postId;
    
    public ZonedDateTime dateTimeCreated;
    
    public boolean isDeleted;
}
