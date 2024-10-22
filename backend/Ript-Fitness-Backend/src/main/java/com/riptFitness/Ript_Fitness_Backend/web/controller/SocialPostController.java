package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.SocialPostService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.SocialPostDto;

@RestController
@RequestMapping("/socialPost")
public class SocialPostController {
	
	SocialPostService socialPostService;
	
	public SocialPostController(SocialPostService socialPostService) {
		this.socialPostService = socialPostService;
	}
	
	@PostMapping("/addPost")
	public ResponseEntity<SocialPostDto> addPost(@RequestBody SocialPostDto socialPostDto){
		SocialPostDto savedSocialPostObject = socialPostService.addPost(socialPostDto);
		return new ResponseEntity<>(savedSocialPostObject, HttpStatus.CREATED);
	}
}
