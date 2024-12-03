package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.FriendsService;

public class FriendsServiceTest {

	@Mock
	private AccountsRepository accountsRepository;
	
	@Mock
	private AccountsService accountsService;
	
	@Mock
	private FriendRequestRepository friendRequestRepository;
	
	@InjectMocks
	private FriendsService friendsService;
	
	private AccountsModel currentlyLoggedInUser;
	private AccountsModel friendOfCurrentlyLoggedInUser;
	private FriendRequest fromRequest;
	private FriendRequest toRequest;
	
	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);
		
		currentlyLoggedInUser = new AccountsModel();
		friendOfCurrentlyLoggedInUser = new AccountsModel();
		
		currentlyLoggedInUser.setFriends(new ArrayList<AccountsModel>());
		friendOfCurrentlyLoggedInUser.setFriends(new ArrayList<AccountsModel>());
		
		currentlyLoggedInUser.setUsername("cpichle1");
		friendOfCurrentlyLoggedInUser.setUsername("nHalash");
	}
	
	@Test
	void testAddFriendValid() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(friendOfCurrentlyLoggedInUser));
		
		String result = friendsService.addFriend(2L);
		
		assertNotNull(result);
		assertEquals(result, "The currently logged in user has successfully added the user with ID = 2 to their friend's list.");
	}
	
	@Test
	void testAddFriendInvalidRequestAccountWithIdEqualToPathVariableDoesNotExist() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));
		when(accountsRepository.findById(2L)).thenReturn(Optional.empty());

		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.addFriend(2L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "An account with the ID of the parameter in the path variable, 2, does not exist in the Account database.");
	}
	
	@Test
	void testAddFriendInvalidRequestBothAccountsAreAlreadyFriendsWithEachOther() {
		currentlyLoggedInUser.setFriends(List.of(friendOfCurrentlyLoggedInUser));
		friendOfCurrentlyLoggedInUser.setFriends(List.of(currentlyLoggedInUser));
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(friendOfCurrentlyLoggedInUser));
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.addFriend(2L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The currently logged in user is already friends with the user with id = 2");
	}
	
	@Test
	void testAddFriendAccountIdParameterIsSameAsCurrentlyLoggedInUser() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.addFriend(1L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The ID in the path can't be the same as the currently logged in user.");
	}
	
	@Test
	void testGetFriendsListOfCurrentlyLoggedInUserValidRequest() {
		currentlyLoggedInUser.setFriends(List.of(friendOfCurrentlyLoggedInUser));
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));

		ArrayList<String> result = friendsService.getFriendsListOfCurrentlyLoggedInUser();
		
		assertNotNull(result);
		assertEquals(result.get(0), "nHalash");
	}
	
	@Test
	void testGetFriendsListValidRequest() {
		friendOfCurrentlyLoggedInUser.setFriends(List.of(currentlyLoggedInUser));

		when(accountsRepository.findById(2L)).thenReturn(Optional.of(friendOfCurrentlyLoggedInUser));
		
		ArrayList<String> result = friendsService.getFriendsList(2L);
		
		assertNotNull(result);
		assertEquals(result.get(0), "cpichle1");

	}
	
	@Test
	void testGetFriendsListInvalidRequestAccountIdNotInDatabase() {
		when(accountsRepository.findById(2L)).thenReturn(Optional.empty());
				
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.getFriendsList(2L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The account with ID = 2 could not be found in the AccountsModel database table.");
	}
	
	@Test
	void testDeleteFriendValidRequest() {
		ArrayList<AccountsModel> currentlyLoggedInUsersFriends = new ArrayList<>(List.of(friendOfCurrentlyLoggedInUser));
		ArrayList<AccountsModel> friendsOfTheOtherUser = new ArrayList<>(List.of(currentlyLoggedInUser));
		currentlyLoggedInUser.setFriends(currentlyLoggedInUsersFriends);
		friendOfCurrentlyLoggedInUser.setFriends(friendsOfTheOtherUser);
		
		fromRequest = new FriendRequest(currentlyLoggedInUser, friendOfCurrentlyLoggedInUser, 1L, 2L, RequestStatus.ACCEPTED, "cpichle1", "nHalash", ZonedDateTime.now(ZoneId.of("America/New_York")));
		toRequest = new FriendRequest(friendOfCurrentlyLoggedInUser, currentlyLoggedInUser, 2L, 1L, RequestStatus.ACCEPTED, "nHalash", "cpichle1", ZonedDateTime.now(ZoneId.of("America/New_York")));
		
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(friendOfCurrentlyLoggedInUser));
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(1L, 2L)).thenReturn(Optional.of(fromRequest));
		when(friendRequestRepository.findByAccountIdOfFromAccountAndAccountIdOfToAccount(2L, 1L)).thenReturn(Optional.of(toRequest));

		
		String result = friendsService.deleteFriend(2L);
		
		assertNotNull(result);
		assertEquals(result, "The currently logged in user has successfully deleted the user with ID = 2 from their friend's list.");
	}
	
	@Test
	void testDeleteFriendInvalidRequestAccountWithIdEqualToPathVariableDoesNotExist() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));
		when(accountsRepository.findById(2L)).thenReturn(Optional.empty());

		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.deleteFriend(2L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "An account with the ID of the parameter in the path variable, 2, does not exist in the Account database.");
	}
	
	@Test
	void testDeleteFriendInvalidRequestAccountsAreNotAlreadyFriendsWithEachOther() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);
		when(accountsRepository.findById(1L)).thenReturn(Optional.of(currentlyLoggedInUser));
		when(accountsRepository.findById(2L)).thenReturn(Optional.of(friendOfCurrentlyLoggedInUser));
		
		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.deleteFriend(2L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The currently logged in user is not friends with the user with ID = 2. No changes were made to the database with this HTTP request.");
	}
	
	@Test
	void testDeleteFriendAccountIdParameterIsSameAsCurrentlyLoggedInUser() {
		when(accountsService.getLoggedInUserId()).thenReturn(1L);

		RuntimeException exceptionThrown = assertThrows(RuntimeException.class, () -> {
			friendsService.deleteFriend(1L);
		});
		
		assertEquals(exceptionThrown.getMessage(), "The ID in the path can't be the same as the currently logged in user.");
	}
}
