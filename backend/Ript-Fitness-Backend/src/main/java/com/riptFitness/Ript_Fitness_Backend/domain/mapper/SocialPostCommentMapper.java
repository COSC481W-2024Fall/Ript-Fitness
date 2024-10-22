package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPostComment;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostCommentDto;

@Mapper
public interface SocialPostCommentMapper {
	SocialPostCommentMapper INSTANCE = Mappers.getMapper(SocialPostCommentMapper.class);
	
	SocialPostCommentDto toSocialPostCommentDto(SocialPostComment socialPostComment);
	
	SocialPostComment toSocialPostComment(SocialPostComment socialPostComment);
}
