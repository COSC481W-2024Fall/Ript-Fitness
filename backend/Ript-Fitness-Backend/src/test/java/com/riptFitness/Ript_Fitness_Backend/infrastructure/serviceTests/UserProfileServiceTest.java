package com.riptFitness.Ript_Fitness_Backend.infrastructure.serviceTests;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.UserProfileMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Photo;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.model.WeightHistory;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.PhotoRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.WeightHistoryRepository;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AzureBlobService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.UserProfileService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;

public class UserProfileServiceTest {

	@Mock
	private UserProfileRepository userProfileRepository;

	@Mock
	private PhotoRepository photoRepository;

	@Mock
	private AzureBlobService azureBlobService;

	@Mock
	private UserProfileMapper userProfileMapper;
	
	@Mock
	private WeightHistoryRepository weightHistoryRepository;


	@InjectMocks
	private UserProfileService userProfileService;

	private UserDto userDto;
	private UserProfile userProfile;

	@BeforeEach
	public void setUp() {
	    MockitoAnnotations.openMocks(this);

	    userDto = new UserDto();
	    userDto.setFirstName("Tom");
	    userDto.setLastName("Van");
	    userDto.setUsername("tom.van");
	    userDto.setDeleted(false);
	    userDto.setTimeZone("America/New_York"); 
	    userDto.setWeight(175.0);

	    userProfile = new UserProfile();
	    userProfile.setId(1L);
	    userProfile.setFirstName("Tom");
	    userProfile.setLastName("Van");
	    userProfile.setUsername("tom.van");
	    userProfile.setDeleted(false);
	    userProfile.setRestDays(3);
	    userProfile.setRestDaysLeft(3);
	    userProfile.setRestResetDate(LocalDateTime.now());
	    userProfile.setTimeZone("America/New_York"); 
	    userProfile.setWeight(175.0);
	    userProfile.setProfilePicture(new byte[]{1, 2, 3});

	    when(userProfileMapper.toUser(any(UserDto.class))).thenReturn(userProfile);
	    when(userProfileMapper.toUserDto(any(UserProfile.class))).thenReturn(userDto);
	}

	@Test
	public void testAddUser() {
	    when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

	    UserDto savedUser = userProfileService.addUser(userDto, "tom.van");

	    assertNotNull(savedUser);
	    assertEquals("Tom", savedUser.getFirstName());
	    assertEquals("Van", savedUser.getLastName());
	    assertEquals("America/New_York", savedUser.getTimeZone()); 
	}

	@Test
	public void testGetUserByUsername() {
	    userProfile.setTimeZone("America/New_York"); 
	    when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));

	    UserDto foundUser = userProfileService.getUserByUsername("tom.van");

	    assertNotNull(foundUser);
	    assertEquals("Tom", foundUser.getFirstName());
	    assertEquals("Van", foundUser.getLastName());
	    assertEquals("America/New_York", foundUser.getTimeZone()); 
	}
	
	@Test
	public void testGetUserNotFoundByUsername() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.empty());

		Exception exception = assertThrows(RuntimeException.class,
				() -> userProfileService.getUserByUsername("tom.van"));

		assertEquals("User not found with username = tom.van", exception.getMessage());
	}

	@Test
	public void testUpdateUserByUsername() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));
		when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

		UserDto updatedUser = userProfileService.updateUserByUsername("tom.van", userDto);

		assertNotNull(updatedUser);
		assertEquals("Tom", updatedUser.getFirstName());
		assertEquals("Van", updatedUser.getLastName());
	}

	@Test
	public void testUpdateUserNotFoundByUsername() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.empty());

		Exception exception = assertThrows(RuntimeException.class,
				() -> userProfileService.updateUserByUsername("tom.van", userDto));

		assertEquals("User not found with username = tom.van", exception.getMessage());
	}

	@Test
	public void testSoftDeleteUserByUsername() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));
		when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

		UserDto deletedUser = userProfileService.softDeleteUserByUsername("tom.van");

		assertNotNull(deletedUser);
	}

	@Test
	public void testSoftDeleteUserNotFoundByUsername() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.empty());

		Exception exception = assertThrows(RuntimeException.class,
				() -> userProfileService.softDeleteUserByUsername("tom.van"));

		assertEquals("User not found with username = tom.van", exception.getMessage());
	}

	@Test
	public void testLogRestDaySuccess() {
	    userProfile.setRestDaysLeft(2);
	    userProfile.setRestResetDate(LocalDateTime.now().minusDays(8)); // Ensure the reset date is outdated
	    userProfile.setTimeZone("America/New_York"); // Set timezone

	    when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));

	    userProfileService.updateRestResetDateIfNeeded(userProfile);

	    verify(userProfileRepository, times(1)).save(userProfile);
	    assertEquals(userProfile.getRestDays(), userProfile.getRestDaysLeft());
	    assertEquals("America/New_York", userProfile.getTimeZone()); // Assert timezone remains unchanged
	}

	@Test
	public void testUpdateRestDays() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));

		userProfileService.updateRestDays("tom.van", 5, 3);

		assertEquals(5, userProfile.getRestDays());
		assertEquals(5, userProfile.getRestDaysLeft());
		assertEquals(3, userProfile.getRestResetDayOfWeek());
		verify(userProfileRepository, times(1)).save(userProfile);
	}

	@Test
	public void testGetUserProfilesFromListOfUsernames() {
		List<String> usernames = List.of("user1", "user2");
		List<UserProfile> userProfiles = List.of(userProfile);

		when(userProfileRepository.findAllByUsernames(anyList())).thenReturn(userProfiles);

		List<UserDto> result = userProfileService.getUserProfilesFromListOfUsernames(usernames);

		assertNotNull(result);
		assertFalse(result.isEmpty());
		assertEquals(1, result.size());
		assertEquals("Tom", result.get(0).getFirstName());
		verify(userProfileRepository, times(1)).findAllByUsernames(usernames);
	}

	@Test
	public void testUpdateProfilePicture() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));

		byte[] picture = new byte[] { 1, 2, 3 }; // Mock profile picture data
		userProfileService.updateProfilePicture("tom.van", picture);

		verify(userProfileRepository, times(1)).save(userProfile);
		assertArrayEquals(picture, userProfile.getProfilePicture());
	}

	@Test
	public void testGetProfilePicture() {
		byte[] picture = new byte[] { 1, 2, 3 }; // Mock profile picture data
		userProfile.setProfilePicture(picture);
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));

		byte[] result = userProfileService.getProfilePicture("tom.van");

		assertArrayEquals(picture, result);
	}

	@Test
	public void testAddPrivatePhoto() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));
		when(azureBlobService.uploadPhoto(any(String.class), any(byte[].class), any(String.class), any(String.class)))
				.thenReturn("https://mock.url/photo.jpg");

		byte[] photoData = new byte[] { 1, 2, 3 };
		String contentType = "image/jpeg";

		userProfileService.addPrivatePhoto("tom.van", photoData, contentType);

		verify(photoRepository, times(1)).save(any(Photo.class));
	}

	@Test
	public void testGetPrivatePhotos() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));
		when(azureBlobService.listPhotos(any(String.class), anyInt(), anyInt()))
				.thenReturn(List.of("https://mock.url/photo1.jpg", "https://mock.url/photo2.jpg"));

		List<String> result = userProfileService.getPrivatePhotos("tom.van", 0, 2);

		assertNotNull(result);
		assertEquals(2, result.size());
		assertEquals("https://mock.url/photo1.jpg", result.get(0));
	}

	@Test
	public void testDeletePrivatePhoto() {
		when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));
		Photo mockPhoto = new Photo();
		mockPhoto.setPhoto("https://mock.url/photo.jpg");
		when(photoRepository.findByUserProfile_Id(anyLong())).thenReturn(List.of(mockPhoto));

		doNothing().when(azureBlobService).deletePhoto(any(String.class));

		userProfileService.deletePrivatePhoto("tom.van", "https://mock.url/photo.jpg");

		verify(photoRepository, times(1)).delete(mockPhoto);
	}

	@Test
	public void testSearchUserProfilesByUsername() {
		Pageable pageable = PageRequest.of(0, 10);
		List<UserProfile> mockProfiles = List.of(userProfile);

		when(userProfileRepository.findByUsernameContainingIgnoreCaseAndNotUsername(any(String.class),
				any(String.class), eq(pageable))).thenReturn(mockProfiles);

		List<UserDto> result = userProfileService.searchUserProfilesByUsername("tom", 0, 10, "current-user");

		assertNotNull(result);
		assertFalse(result.isEmpty());
		assertEquals(1, result.size());
		assertEquals("Tom", result.get(0).getFirstName());
	}
	
	/* Weight testing*/
	@Test
	public void testUpdateUserWeight_SavesWeightHistory() {
	    when(userProfileRepository.findByUsername(any(String.class)))
	            .thenReturn(Optional.of(userProfile));
	    
	    when(userProfileRepository.save(any(UserProfile.class)))
	            .thenReturn(userProfile);
	    
	    when(userProfileMapper.toUserDto(any(UserProfile.class)))
	            .thenReturn(userDto);
	    
	    when(weightHistoryRepository.save(any(WeightHistory.class)))
	            .thenReturn(new WeightHistory());

	    UserDto updatedUser = userProfileService.updateUserByUsername("tom.van", userDto);
	    
	    assertNotNull(updatedUser);
	    assertEquals(userDto.getWeight(), updatedUser.getWeight());

	    verify(weightHistoryRepository, times(1)).save(any(WeightHistory.class));
	}



	@Test
	public void testGetUserWeightHistory_ReturnsHistory() {
	    when(userProfileRepository.findByUsername(any(String.class))).thenReturn(Optional.of(userProfile));

	    List<WeightHistory> history = List.of(
	        new WeightHistory() {{ setWeight(170.0); }},
	        new WeightHistory() {{ setWeight(165.0); }}
	    );
	    
	    when(weightHistoryRepository.findByUserProfileOrderByRecordedAtDesc(anyLong())).thenReturn(history);

	    List<WeightHistory> retrievedHistory = userProfileService.getUserWeightHistory("tom.van");

	    assertEquals(2, retrievedHistory.size());
	    assertEquals(170.0, retrievedHistory.get(0).getWeight());
	    assertEquals(165.0, retrievedHistory.get(1).getWeight());
	}

}
