package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.riptFitness.Ript_Fitness_Backend.domain.model.AccountsModel;
import com.riptFitness.Ript_Fitness_Backend.domain.model.FriendRequest;
import com.riptFitness.Ript_Fitness_Backend.domain.model.RequestStatus;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.AccountsRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.FriendRequestRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AccountsService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.FriendRequestService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.FriendsService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.FriendRequestDto;

public class FriendRequestServiceTest {

	@Mock
	private FriendRequestRepository friendRequestRepository;
	
	@Mock
	private FriendsService friendsService;
	
	@Mock
	private AccountsRepository accountsRepository;
	
	@Mock
	private AccountsService accountsService;
	
	@InjectMocks
	private FriendRequestService friendRequestService;
	
	private FriendRequestDto friendRequestDto;
	private FriendRequest fromRequest;
	private FriendRequest toRequest;
	private AccountsModel fromAccount;
	private AccountsModel toAccount;
	
	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);     
		
		friendRequestDto = new FriendRequestDto();
		friendRequestDto.accountIdOfToAccount = 2L;
		friendRequestDto.status = RequestStatus.SENT;
		
		fromAccount = new AccountsModel();
		toAccount = new AccountsModel();
		fromAccount.setUsername("cpichle1");
		toAccount.setUsername("nHalash");
	}
	
	@Test
	void testSendNewRequestValid() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		
		ArrayList<FriendRequestDto> result = friendRequestService.sendNewRequest(friendRequestDto);
		
		assertNotNull(result);
		assertEquals(result.get(0).status, RequestStatus.SENT);
		assertEquals(result.get(1).status, RequestStatus.PENDING);
	}
	
	@Test
	void testSendNewRequestInvalidToAccountDoesntExist() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
		when(accountsRepository.findById(2L)).thenReturn(Optional.empty());
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendNewRequest(friendRequestDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The Account with ID = 2 does not exist in the database.");
	}
	
	@Test
	void testSendNewRequestInvalidRelationshipBetweenAccountsAlreadyExists() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(true);
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendNewRequest(friendRequestDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "A relationship already exists between the currently logged in user and the user with ID = 2. Please call the sendRequest endpoint.");
	}
	
	@Test
	void testSendNewRequestInvalidIdOfToAccountInDTOIsSameAsCurrentlyLoggedInUser() {
		FriendRequestDto parameterDto = new FriendRequestDto();
		parameterDto.accountIdOfToAccount = 1L;
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendNewRequest(parameterDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The ID in the DTO body object can't be the same as the currently logged in user.");
	}
	
	@Test
	void testGetStatusValid() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.getStatus(1L, 2L)).thenReturn(Optional.of(RequestStatus.SENT));

		String result = friendRequestService.getStatus(2L);
		
		assertNotNull(result);
		assertEquals(result, "SENT");
	}
	
	@Test
	void testGetAllAccountsWithSpecificStatusValidDatabaseQueryReturnedNoAccounts() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(friendRequestRepository.getToAccountFromFromAccountAndStatus(1L, RequestStatus.PENDING)).thenReturn(Optional.empty());
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.getAllAccountsWithSpecificStatus(RequestStatus.PENDING);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The currently logged in user has no realtionships with any accounts with status = PENDING");
	
	}
	
	@Test
	void testGetStatusInvalidToAccountDoesntExist() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.empty());
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.getStatus(2L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The Account with ID = 2 does not exist in the database.");
	}
	
	@Test
	void testGetStatusInvalidNoRelationshipBetweenAccountsAlreadyExists() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.getStatus(1L, 2L)).thenReturn(Optional.empty());
		
		String result = friendRequestService.getStatus(2L);
		
		assertNotNull(result);
		assertEquals(result, "NO RELATIONSHIP");
	}
	
	@Test
	void testGetStatusInvalidParameterIdIsSameAsCurrentlyLoggedInUser() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);

		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.getStatus(1L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The ID in the path can't be the same as the currently logged in user.");
	}
	
	@Test
	void testGetAllAccountsWithSpecificStatusValid() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(friendRequestRepository.getToAccountFromFromAccountAndStatus(1L, RequestStatus.PENDING)).thenReturn(Optional.of(new ArrayList<Long>(List.of(2L, 3L))));
		when(accountsRepository.findById(any(Long.class))).thenReturn(Optional.of(toAccount));
		
		ArrayList<String> result = friendRequestService.getAllAccountsWithSpecificStatus(RequestStatus.PENDING);
		
		assertNotNull(result);
		assertEquals(result.get(0), "nHalash");
	}
	
	@Test
	void testGetAllAccountsWithSpecificStatusInvalidAccountNotValidInFriendRequestTable() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(friendRequestRepository.getToAccountFromFromAccountAndStatus(1L, RequestStatus.PENDING)).thenReturn(Optional.of(new ArrayList<Long>(List.of(2L, 3L))));
		when(accountsRepository.findById(any(Long.class))).thenReturn(Optional.empty());
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.getAllAccountsWithSpecificStatus(RequestStatus.PENDING);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The getToAccountFromFromAccountAndStatus query in Friend Request Repository returned a Long that does not belong to any row with that id in the AccountsModel database table.");

	}
	
	//The only way for a "SENT" request to be sent to the sendRequest endpoint is if fromAccount previously declined toAccount's friend request, and now wants to send a friend request to toAccount
	@Test
	void testSendRequestValidDtoStatusIsSent() {
		//FriendRequest constructor order: fromAccount, toAccount, accountIdOfFromAccount, accountIdOfToAccount, RequestStatus, fromUsername, toUsername, LocalDateTime
		fromRequest = new FriendRequest(fromAccount, toAccount, fromAccount.getId(), toAccount.getId(), RequestStatus.DECLINED, "cpichle1", "nHalash", ZonedDateTime.now(ZoneId.of("America/New_York")));
		toRequest = new FriendRequest(toAccount, fromAccount, toAccount.getId(), fromAccount.getId(), RequestStatus.SENT, "nHalash", "cpichle1", ZonedDateTime.now(ZoneId.of("America/New_York")));
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(true);
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(Optional.of(fromRequest));
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(2L, 1L)).thenReturn(Optional.of(toRequest));
		
		ArrayList<FriendRequestDto> result = friendRequestService.sendRequest(friendRequestDto);
		
		assertNotNull(result);
		assertEquals(result.get(0).status, RequestStatus.SENT);
		assertEquals(result.get(1).status, RequestStatus.PENDING);
	}
	
	//The only way for a "ACCEPETED" request to be sent to the sendRequest endpoint is if fromAccount was previously set to "PENDING" and toAccount was previously set to "SENT"
	@Test
	void testSendRequestValidDtoStatusIsAccepted() {
		//FriendRequest constructor order: fromAccount, toAccount, accountIdOfFromAccount, accountIdOfToAccount, RequestStatus, fromUsername, toUsername, LocalDateTime
		fromRequest = new FriendRequest(fromAccount, toAccount, fromAccount.getId(), toAccount.getId(), RequestStatus.PENDING, "cpichle1", "nHalash", ZonedDateTime.now(ZoneId.of("America/New_York")));
		toRequest = new FriendRequest(toAccount, fromAccount, toAccount.getId(), fromAccount.getId(), RequestStatus.SENT, "nHalash", "cpichle1", ZonedDateTime.now(ZoneId.of("America/New_York")));
		friendRequestDto.status = RequestStatus.ACCEPTED;
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(true);
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(Optional.of(fromRequest));
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(2L, 1L)).thenReturn(Optional.of(toRequest));
		when(friendsService.addFriend(2L)).thenReturn("The currently logged in user has successfully added the user with ID = 2 to their friend's list.");
		
		ArrayList<FriendRequestDto> result = friendRequestService.sendRequest(friendRequestDto);
		
		assertNotNull(result);
		assertEquals(result.get(0).status, RequestStatus.ACCEPTED);
		assertEquals(result.get(1).status, RequestStatus.ACCEPTED);
	}
	
	//The only way for a "DECLINED" request to be sent to the sendRequest endpoint is if fromAccount was previously set to "PENDING" and toAccount was previously set to "SENT"
	@Test
	void testSendRequestValidDtoStatusIsDeclined() {
		//FriendRequest constructor order: fromAccount, toAccount, accountIdOfFromAccount, accountIdOfToAccount, RequestStatus, fromUsername, toUsername, LocalDateTime
		fromRequest = new FriendRequest(fromAccount, toAccount, fromAccount.getId(), toAccount.getId(), RequestStatus.PENDING, "cpichle1", "nHalash", ZonedDateTime.now(ZoneId.of("America/New_York")));
		toRequest = new FriendRequest(toAccount, fromAccount, toAccount.getId(), fromAccount.getId(), RequestStatus.SENT, "nHalash", "cpichle1", ZonedDateTime.now(ZoneId.of("America/New_York")));
		friendRequestDto.status = RequestStatus.DECLINED;
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(true);
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(Optional.of(fromRequest));
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(2L, 1L)).thenReturn(Optional.of(toRequest));
		
		ArrayList<FriendRequestDto> result = friendRequestService.sendRequest(friendRequestDto);
		
		assertNotNull(result);
		assertEquals(result.get(0).status, RequestStatus.DECLINED);
		assertEquals(result.get(1).status, RequestStatus.SENT);
	}
	
	//The status of a FriendRequestDto object in the body of a request sent to sendRequest should never be set to "PENDING"
	@Test
	void testSendRequestInvalidStatusIsPending() {
		//FriendRequest constructor order: fromAccount, toAccount, accountIdOfFromAccount, accountIdOfToAccount, RequestStatus, fromUsername, toUsername, LocalDateTime
		fromRequest = new FriendRequest(fromAccount, toAccount, fromAccount.getId(), toAccount.getId(), RequestStatus.PENDING, "cpichle1", "nHalash", ZonedDateTime.now(ZoneId.of("America/New_York")));
		toRequest = new FriendRequest(toAccount, fromAccount, toAccount.getId(), fromAccount.getId(), RequestStatus.SENT, "nHalash", "cpichle1", ZonedDateTime.now(ZoneId.of("America/New_York")));
		friendRequestDto.status = RequestStatus.PENDING;
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(true);
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(Optional.of(fromRequest));
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(2L, 1L)).thenReturn(Optional.of(toRequest));
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendRequest(friendRequestDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The only RequestStatuses in the FriendRequestDto sent to the sendRequest endpoint should be SENT, ACCEPTED, or DECLINED. The RequestStatus in this HTTP request is PENDING");
	}
	
	@Test
	void testSendRequestInvalidToAccountDoesntExist() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.empty());
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendRequest(friendRequestDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The Account with ID = 2 does not exist in the database.");
	}
	
	@Test
	void testSendRequestInvalidNoRelationshipBetweenAccountsAlreadyExists() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(toAccount));
		when(friendRequestRepository.existsByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(false);
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendRequest(friendRequestDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "A relationship does not already exist between the currently logged in user and the user with ID = 2. Please call the sendNewRequest endpoint.");
	}
	
	@Test
	void testSendRequestInvalidIdOfToAccountInDTOIsSameAsCurrentlyLoggedInUser() {
		FriendRequestDto parameterDto = new FriendRequestDto();
		parameterDto.accountIdOfToAccount = 1L;
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
			
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendRequestService.sendRequest(parameterDto);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The ID in the DTO body object can't be the same as the currently logged in user.");
	}
}
