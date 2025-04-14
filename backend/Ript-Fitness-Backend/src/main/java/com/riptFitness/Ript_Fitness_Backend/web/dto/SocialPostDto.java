package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SocialPostDto {

	public Long id;
		
    public UserDto userProfile;
	    
    public String content;
    
    public int numberOfLikes;
    
    public List<Long> userIDsOfLikes;
    
    public List<SocialPostCommentDto> socialPostComments;
    
    public boolean isDeleted;
    
    public boolean isPublic;
    
    public LocalDateTime dateTimeCreated;
}
