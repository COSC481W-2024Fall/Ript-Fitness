package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.SocialPostMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.SocialPost;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.SocialPostCommentRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.SocialPostRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostDto;

@Service
public class SocialPostService {
	
	private SocialPostRepository socialPostRepository;
	
	private SocialPostCommentRepository socialPostCommentRepository;

	public SocialPostService(SocialPostRepository socialPostRepository, SocialPostCommentRepository socialPostCommentRepository) {
		this.socialPostRepository = socialPostRepository;
		this.socialPostCommentRepository = socialPostCommentRepository;
	}
	
	public SocialPostDto addPost(SocialPostDto socialPostDto) {
		SocialPost socialPostToBeAdded = SocialPostMapper.INSTANCE.toSocialPost(socialPostDto);
		socialPostToBeAdded = socialPostRepository.save(socialPostToBeAdded);
		return SocialPostMapper.INSTANCE.toSocialPostDto(socialPostToBeAdded);
	}
}
