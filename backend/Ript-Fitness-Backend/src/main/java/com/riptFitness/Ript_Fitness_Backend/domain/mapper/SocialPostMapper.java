package com.riptFitness.Ript_Fitness_Backend.domain.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostDto;

@Mapper
public interface SocialPostMapper {
	SocialPostMapper INSTANCE = Mappers.getMapper(SocialPostMapper.class);
	
	SocialPostDto toSocialPostDto(SocialPost socialPost);
	
	SocialPost toSocialPost(SocialPostDto socialPostDto);
}
