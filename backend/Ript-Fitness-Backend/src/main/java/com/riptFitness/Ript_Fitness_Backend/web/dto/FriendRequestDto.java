package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.LocalDateTime;

import com.riptFitness.Ript_Fitness_Backend.domain.model.RequestStatus;

public class FriendRequestDto {

	public Long id;
	public Long accountIdOfToAccount;
	public RequestStatus status;
	public String fromUsername;
	public String toUsername;
	public LocalDateTime dateTimeOfMostRecentChangeToStatus;
}
