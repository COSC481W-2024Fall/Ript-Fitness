package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.FriendRequestMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.FriendRequest;
import com.riptFitness.Ript_Fitness_Backend.domain.model.RequestStatus;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.FriendRequestRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FriendRequestDto;

@Service
public class FriendRequestService {

	private FriendRequestRepository friendRequestRepository;
	
	private FriendsService friendsService;
	
	private AccountsRepository accountsRepository;
	
	private AccountsService accountsService;
		
	public FriendRequestService(FriendRequestRepository friendRequestRepository, FriendsService friendsService, AccountsRepository accountsRepository, AccountsService accountsService) {
		this.friendRequestRepository = friendRequestRepository;
		this.friendsService = friendsService;
		this.accountsRepository = accountsRepository;
		this.accountsService = accountsService;
	}
	
	//Endpoint only hit if fromAccount and toAccount don't have a current relationship in the FriendRequest database table
	public ArrayList<FriendRequestDto> sendNewRequest(FriendRequestDto friendRequestDto) {
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		
		if(currentlyLoggedInUserId.equals(friendRequestDto.accountIdOfToAccount))
			throw new RuntimeException("The ID in the DTO body object can't be the same as the currently logged in user.");
		
		AccountsModel currentlyLoggedInUser = accountsRepository.findById(currentlyLoggedInUserId).get();
		
		Long toAccountId = friendRequestDto.accountIdOfToAccount;
		
		Optional<AccountsModel> optionalToAccount = accountsRepository.findById(toAccountId);
		
		if(optionalToAccount.isEmpty())
			throw new RuntimeException("The Account with ID = " + toAccountId + " does not exist in the database.");
		
		AccountsModel toAccountUser = optionalToAccount.get();
		
		if(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(currentlyLoggedInUserId, toAccountId)) {
			throw new RuntimeException("A relationship already exists between the currently logged in user and the user with ID = " + toAccountId + ". Please call the sendRequest endpoint.");
		}
		
		String fromUsername = currentlyLoggedInUser.getUsername();
		String toUsername = toAccountUser.getUsername();
		
		//FriendRequest constructor order: fromAccount, toAccount, accountIdOfFromAccount, accountIdOfToAccount, RequestStatus, fromUsername, toUsername, LocalDateTime
		FriendRequest fromRequest = new FriendRequest(currentlyLoggedInUser, toAccountUser, currentlyLoggedInUser.getId(), toAccountUser.getId(), RequestStatus.SENT, fromUsername, toUsername, LocalDateTime.now());
		FriendRequest toRequest = new FriendRequest(toAccountUser, currentlyLoggedInUser, toAccountUser.getId(), currentlyLoggedInUser.getId(), RequestStatus.PENDING, toUsername, fromUsername, LocalDateTime.now());
		
		friendRequestRepository.save(fromRequest);
		friendRequestRepository.save(toRequest);
		
		FriendRequestDto fromRequestDto = FriendRequestMapper.INSTANCE.toFriendRequestDto(fromRequest);
		FriendRequestDto toRequestDto = FriendRequestMapper.INSTANCE.toFriendRequestDto(toRequest);
		
		return new ArrayList<FriendRequestDto>(List.of(fromRequestDto, toRequestDto));
	}
	
	public String getStatus(Long toAccountId) {
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		
		if(currentlyLoggedInUserId.equals( toAccountId))
			throw new RuntimeException("The ID in the path can't be the same as the currently logged in user.");
		
		Optional<AccountsModel> optionalToAccountUser = accountsRepository.findById(toAccountId);
		
		if(optionalToAccountUser.isEmpty())
			throw new RuntimeException("The Account with ID = " + toAccountId + " does not exist in the database.");
				
		Optional<RequestStatus> optionalStatus = friendRequestRepository.getStatus(currentlyLoggedInUserId, toAccountId);
		
		if(optionalStatus.isEmpty())
			return "NO RELATIONSHIP";
		
		return optionalStatus.get().toString();
	}
	
	public ArrayList<String> getAllAccountsWithSpecificStatus(RequestStatus status){
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		
		Optional<ArrayList<Long>> optionalIdsOfAllAccountsWithSpecificStatus = friendRequestRepository.getToAccountFromFromAccountAndStatus(currentlyLoggedInUserId, status);
		
		if(optionalIdsOfAllAccountsWithSpecificStatus.isEmpty())
			throw new RuntimeException("The currently logged in user has no realtionships with any accounts with status = " + status);
		
		ArrayList<Long> idsOfAllAccountsWithSpecificStatus = optionalIdsOfAllAccountsWithSpecificStatus.get();
		
		ArrayList<String> listOfUsernamesReturnedByMethod = new ArrayList<>();
		
		for(Long accountId : idsOfAllAccountsWithSpecificStatus) {
			Optional<AccountsModel> optionalAccount = accountsRepository.findById(accountId);
			
			if(optionalAccount.isEmpty())
				throw new RuntimeException("The getToAccountFromFromAccountAndStatus query in Friend Request Repository returned a Long that does not belong to any row with that id in the AccountsModel database table.");
			
			AccountsModel account = optionalAccount.get();
			
			listOfUsernamesReturnedByMethod.add(account.getUsername());
		}
		
		return listOfUsernamesReturnedByMethod;
	}
	
	public ArrayList<FriendRequestDto> sendRequest(FriendRequestDto friendRequestDto) {
		Long currentlyLoggedInUserId = accountsService.getLoggedInUserId();
		
		if(currentlyLoggedInUserId.equals(friendRequestDto.accountIdOfToAccount))
			throw new RuntimeException("The ID in the DTO body object can't be the same as the currently logged in user.");
		
		Long toAccountId = friendRequestDto.accountIdOfToAccount;
		
		Optional<AccountsModel> optionalToAccount = accountsRepository.findById(toAccountId);
		
		if(optionalToAccount.isEmpty())
			throw new RuntimeException("The Account with ID = " + toAccountId + " does not exist in the database.");
		
		if(!friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(currentlyLoggedInUserId, toAccountId)) {
			throw new RuntimeException("A relationship does not already exist between the currently logged in user and the user with ID = " + toAccountId + ". Please call the sendNewRequest endpoint.");
		}
		
		FriendRequest fromRequest = friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(currentlyLoggedInUserId, toAccountId).get();
		FriendRequest toRequest = friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(toAccountId, currentlyLoggedInUserId).get();
		
		fromRequest.status = friendRequestDto.status;
		changeToRequestBasedOnStatus(toRequest, friendRequestDto.status);
		
		fromRequest.dateTimeOfMostRecentChangeToStatus = LocalDateTime.now();
		toRequest.dateTimeOfMostRecentChangeToStatus = LocalDateTime.now();
		
		friendRequestRepository.save(fromRequest);
		friendRequestRepository.save(toRequest);
		
		if(friendRequestDto.status.equals(RequestStatus.ACCEPTED)) {
			friendsService.addFriend(toAccountId);
		}
		
		FriendRequestDto fromRequestDto = FriendRequestMapper.INSTANCE.toFriendRequestDto(fromRequest);
		FriendRequestDto toRequestDto = FriendRequestMapper.INSTANCE.toFriendRequestDto(toRequest);
		
		return new ArrayList<FriendRequestDto>(List.of(fromRequestDto, toRequestDto));
	}
	
	private void changeToRequestBasedOnStatus(FriendRequest toRequest, RequestStatus requestStatus) {
		//The toAccount was sent a friend request from the fromAccount
		if(requestStatus.equals(RequestStatus.SENT)) {
			
			//FriendRequest constructor order: fromAccount, toAccount, RequestStatus, fromUsername, toUsername, LocalDateTime
			toRequest.status = RequestStatus.PENDING;
			return;
		}
		
		//The toAccount had their friend request accepted by the fromAccount
		if(requestStatus.equals(RequestStatus.ACCEPTED)) {
			toRequest.status = RequestStatus.ACCEPTED;
			return;
		}
		
		//The toAccount had their friend request declined by the fromAccount, keep their RequestStatus as SENT so they can't see that their request was declined/can't continue to friend request fromAccount
		if(requestStatus.equals(RequestStatus.DECLINED)) {
			return;
		}
		
		//If requestStatus = PENDING, throw a Runtime Exception as that isn't a valid RequestStatus sent to the sendRequest endpoint
		throw new RuntimeException("The only RequestStatuses in the FriendRequestDto sent to the sendRequest endpoint should be SENT, ACCEPTED, or DECLINED. The RequestStatus in this HTTP request is " + requestStatus);
	}
}
