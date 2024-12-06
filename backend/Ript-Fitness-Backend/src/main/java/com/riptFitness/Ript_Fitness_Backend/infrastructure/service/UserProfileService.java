package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.net.MalformedURLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.UserProfileMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Calendar;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Photo;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.PhotoRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.CalendarRepository;

import jakarta.transaction.Transactional;

@Service
public class UserProfileService {

	private final UserProfileRepository userRepository;
	private final PhotoRepository photoRepository;
	private final AzureBlobService azureBlobService;
	private final CalendarRepository calendarRepository;

	// Dependency injection constructor
	public UserProfileService(UserProfileRepository userRepository, PhotoRepository photoRepository,
			AzureBlobService azureBlobService, CalendarRepository calendarRepository) {
		this.userRepository = userRepository;
		this.photoRepository = photoRepository;
		this.azureBlobService = azureBlobService;
		this.calendarRepository = calendarRepository; 
	}

	// Adds a new user profile with default values
	public UserDto addUser(UserDto userDto, String username) {
		UserProfile userToBeAdded = UserProfileMapper.INSTANCE.toUser(userDto);
		userToBeAdded.setUsername(username);
		initializeDefaultValues(userToBeAdded, username);

		userToBeAdded = userRepository.save(userToBeAdded);
		return UserProfileMapper.INSTANCE.toUserDto(userToBeAdded);
	}

	// Initialize default values for the UserProfile
	private void initializeDefaultValues(UserProfile userProfile, String username) {
		userProfile.setDisplayname(username);
		userProfile.setRestDays(3);
		userProfile.setRestDaysLeft(3);

		String userTimeZone = userProfile.getTimeZone();
		System.out.println(getNextSunday(userTimeZone).toString());
		userProfile.setRestResetDate(getNextSunday(userTimeZone));
		userProfile.setRestResetDayOfWeek(1);
	}

	// Check if user profile exists by username
	public boolean existsByUsername(String username) {
		return userRepository.findByUsername(username).isPresent();
	}

	// Retrieves user profile by username
	public UserDto getUserByUsername(String username) {
		return userRepository.findByUsername(username).map(user -> {
			updateRestDays(user); //update rest days for the user before returning
			UserDto userDto = UserProfileMapper.INSTANCE.toUserDto(user);
			userDto.setProfilePicture(user.getProfilePicture());
			return userDto;
		}).orElseThrow(() -> new RuntimeException("User not found with username = " + username));
	}
	
	private void updateRestDays(UserProfile userProfile) {
		ZonedDateTime zonedDateTime = LocalDateTime.now().atZone(ZoneId.of("GMT")).withZoneSameInstant(ZoneId.of(userProfile.getTimeZone()));
		
		
        if (zonedDateTime.toLocalDate().isAfter(
        		userProfile.getRestResetDate()
        		.atZone(ZoneId.of("GMT"))
        		.withZoneSameInstant(ZoneId.of(userProfile.getTimeZone()))
        		.toLocalDate())) {
            
        	
        	int todayDayOfWeek = zonedDateTime.getDayOfWeek().getValue();
            int daysUntilSunday = 7 - todayDayOfWeek;

            //Set next reset date based on days until sunday for the user's timezone
            userProfile.setRestResetDate(zonedDateTime.plusDays(daysUntilSunday).toLocalDateTime());
            userProfile.setRestDaysLeft(userProfile.getRestDays());
            userRepository.save(userProfile);
        }
	}

	
	
	
	
	// Edits user profile by username
	public UserDto updateUserByUsername(String username, UserDto userDto) {
		UserProfile userToBeEdited = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found with username = " + username));

		updateProfileFields(userToBeEdited, userDto);

		userToBeEdited = userRepository.save(userToBeEdited);
		UserDto updatedDto = UserProfileMapper.INSTANCE.toUserDto(userToBeEdited);
		updatedDto.setProfilePicture(userToBeEdited.getProfilePicture()); // Include profile picture
		return updatedDto;
	}

	// Update the profile fields based on UserDto, including profile picture
	private void updateProfileFields(UserProfile userProfile, UserDto userDto) {
		if (userDto.getFirstName() != null) {
			userProfile.setFirstName(userDto.getFirstName());
		}
		if (userDto.getLastName() != null) {
			userProfile.setLastName(userDto.getLastName());
		}
		if (userDto.getDisplayname() != null) {
			userProfile.setDisplayName(userDto.getDisplayname());
		}
		if (userDto.getBio() != null) {
			userProfile.setBio(userDto.getBio());
		}
		if (userDto.getRestDays() != null) {
			userProfile.setRestDays(userDto.getRestDays());
		}
		if (userDto.getRestDaysLeft() != null) {
			userProfile.setRestDaysLeft(userDto.getRestDaysLeft());
		}
		if (userDto.getRestResetDate() != null) {
			userProfile.setRestResetDate(userDto.getRestResetDate());
		}
		if (userDto.getRestResetDayOfWeek() != null) {
			userProfile.setRestResetDayOfWeek(userDto.getRestResetDayOfWeek());
		}
		if (userDto.getProfilePicture() != null) {
			userProfile.setProfilePicture(userDto.getProfilePicture()); // Update profile picture
		}
	}

	// Soft-deletes user profile by username
	public UserDto softDeleteUserByUsername(String username) {
		UserProfile userToBeDeleted = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found with username = " + username));

		userToBeDeleted.setDeleted(true); // Flag as deleted
		userRepository.save(userToBeDeleted);
		return UserProfileMapper.INSTANCE.toUserDto(userToBeDeleted);
	}

	// Retrieves remaining rest days for the current week
	public Integer getRemainingRestDays(String username) {
		return userRepository.findByUsername(username)
				.map(userProfile -> userProfile.getRestDaysLeft() != null ? userProfile.getRestDaysLeft() : 0)
				.orElseThrow(() -> new RuntimeException("User not found with username = " + username));
	}

	// Updates the allowed rest days per week and the reset day of the week
	public void updateRestDays(String username, Integer allowedRestDays, Integer resetDayOfWeek) {
		UserProfile userProfile = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found with username = " + username));

		if (allowedRestDays != null) {
			userProfile.setRestDays(allowedRestDays);
			userProfile.setRestDaysLeft(allowedRestDays); // Reset remaining rest days to the new limit
		}

		userProfile.setRestResetDayOfWeek(resetDayOfWeek != null ? resetDayOfWeek : 1);
		userRepository.save(userProfile);
	}

	// Log a rest day for a user
	public void DepricatedlogRestDay(String username) {
		UserProfile userProfile = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found with username = " + username));

		// Retrieve the user's preferred timezone
		String userTimeZone = userProfile.getTimeZone();

		// Current time in GMT
		LocalDateTime nowInGMT = LocalDateTime.now();

		// Ensure the restResetDate is updated if necessary
		updateRestResetDateIfNeeded(userProfile);

		// Check the last logged date in the Calendar
		Optional<Calendar> lastLoggedEntryOpt = calendarRepository
				.findTopByAccountIdOrderByDateDesc(userProfile.getAccount().getId());
		
		if (lastLoggedEntryOpt.isPresent()) {
			Calendar lastLoggedEntry = lastLoggedEntryOpt.get();

			// Convert last logged date to the timezone it was logged in
			ZonedDateTime lastLoggedDateInUserZone = lastLoggedEntry.getDate()
					.atZone(ZoneId.of(lastLoggedEntry.getTimeZoneWhenLogged()));

			// Convert the current time to the user's current timezone
			LocalDateTime currentDateInUserZone = nowInGMT.atZone(ZoneId.of("GMT")) // From GMT
					.withZoneSameInstant(ZoneId.of(userTimeZone)) // Convert to the user's current timezone
					.toLocalDateTime();

			// Check if the last logged date and the current date are one day apart
			if (!currentDateInUserZone.toLocalDate().minusDays(1).isEqual(lastLoggedDateInUserZone.toLocalDate())) {
				throw new RuntimeException("Rest day cannot be logged yet.");
			}
		}

		// Proceed to log the rest day
		Calendar restDayEntry = new Calendar();
		restDayEntry.setAccount(userProfile.getAccount());
		restDayEntry.setDate(LocalDateTime.now()); // Store date in GMT
		restDayEntry.setActivityType(2); // 2 for rest day
		restDayEntry.setTimeZoneWhenLogged(userTimeZone); // Store the user's current timezone

		calendarRepository.save(restDayEntry);

		// Update remaining rest days
		Integer restDaysLeft = userProfile.getRestDaysLeft();
		if (restDaysLeft != null && restDaysLeft > 0) {
			userProfile.setRestDaysLeft(restDaysLeft - 1);
			userRepository.save(userProfile);
		} else {
			throw new RuntimeException("No remaining rest days available for this week.");
		}
	}

	// Calculates the next Sunday for resetting the rest day logic
	private LocalDateTime getNextSunday(String userTimeZone) {
		// Get the current date in the user's timezone
		ZonedDateTime nowInUserZone = ZonedDateTime.now(ZoneId.of(userTimeZone));
		LocalDateTime todayInUserZone = nowInUserZone.toLocalDateTime();

		// Calculate the number of days until the next Sunday
		int todayDayOfWeek = todayInUserZone.getDayOfWeek().getValue();
		int daysUntilSunday = 7 - todayDayOfWeek;

		// Return the next Sunday in the user's timezone
		return todayInUserZone.plusDays(daysUntilSunday);
	}

	// Updates restResetDate if it's older than 7 days
	@Transactional
	public void updateRestResetDateIfNeeded(UserProfile userProfile) {
		LocalDateTime currentRestResetDate = userProfile.getRestResetDate();
		LocalDateTime today = LocalDateTime.now();

		String userTimeZone = userProfile.getTimeZone(); // Retrieve user's timezone
		if (currentRestResetDate.isBefore(today.minusDays(7))) {
			userProfile.setRestResetDate(getNextSunday(userTimeZone)); // Pass timezone
			userProfile.setRestDaysLeft(userProfile.getRestDays());
			userRepository.save(userProfile);
		}
	}

	public List<UserDto> getUserProfilesFromListOfUsernames(List<String> usernames) {
		List<UserProfile> userProfiles = userRepository.findAllByUsernames(usernames);
		return userProfiles.stream().map(user -> {
			UserDto userDto = UserProfileMapper.INSTANCE.toUserDto(user);
			userDto.setProfilePicture(user.getProfilePicture()); // Include profile picture
			return userDto;
		}).collect(Collectors.toList());
	}

	// Add profile picture
	public void updateProfilePicture(String username, byte[] profilePicture) {
		UserProfile user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));
		user.setProfilePicture(profilePicture);
		userRepository.save(user);
	}

	// Get profile picture
	public byte[] getProfilePicture(String username) {
		UserProfile user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));
		return user.getProfilePicture();
	}

	public void addPrivatePhoto(String username, byte[] photo, String contentType) {
		// Retrieve the user by username
		UserProfile user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Generate a unique photo name with extension
		String fileExtension = getFileExtensionFromContentType(contentType);
		String photoName = "photo_" + System.currentTimeMillis() + fileExtension;

		// Upload the photo to Azure Blob Storage
		String photoUrl = azureBlobService.uploadPhoto(username, photo, photoName, contentType);

		// Save the photo metadata in the database
		Photo newPhoto = new Photo();
		newPhoto.setUserProfile(user);
		newPhoto.setPhoto(photoUrl); // Store the URL
		newPhoto.setUploadTimestamp(LocalDateTime.now());
		photoRepository.save(newPhoto);
	}

	// Utility method to determine the file extension from the content type
	private String getFileExtensionFromContentType(String contentType) {
		switch (contentType) {
		case "image/jpeg":
			return ".jpg";
		case "image/png":
			return ".png";
		case "image/gif":
			return ".gif";
		default:
			throw new IllegalArgumentException("Unsupported content type: " + contentType);
		}
	}

	public List<String> getPrivatePhotos(String username, int startIndex, int endIndex) {
		if (endIndex <= startIndex) {
			throw new IllegalArgumentException("End index must be greater than start index.");
		}

		UserProfile user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));

		List<String> allPhotos = azureBlobService.listPhotos(username, startIndex, endIndex);

		// Paginate results
		int toIndex = Math.min(endIndex, allPhotos.size());
		if (startIndex >= allPhotos.size()) {
			return Collections.emptyList(); // No results in range
		}
		// Generate SAS URLs for the photos in the range
		return allPhotos.subList(startIndex, toIndex).stream().peek(photo -> {
			String blobName = photo; // Assuming `photo` contains the blob name

			String sasUrl = azureBlobService.generateSasUrl(blobName);
			photo = sasUrl; // Assuming `Photo` has a `photoUrl` field for the SAS URL
		}).collect(Collectors.toList());
	}

	// Delete private photo
	public void deletePrivatePhoto(String username, String photoUrl) {
		UserProfile user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Extract blobName from the URL
		String blobName;
		try {
			blobName = azureBlobService.extractBlobNameFromUrl(photoUrl, username);
		} catch (MalformedURLException e) {
			throw new RuntimeException("Invalid photo URL", e);
		}

		// Delete from Azure Blob Storage
		azureBlobService.deletePhoto(blobName);

		// Delete photo metadata from the database
		photoRepository.findByUserProfile_Id(user.getId()).stream().filter(photo -> photoUrl.equals(photo.getPhoto()))
				.findFirst().ifPresent(photoRepository::delete);
	}

	// search profiles by username
	public List<UserDto> searchUserProfilesByUsername(String searchTerm, int startIndex, int endIndex,
			String currentUsername) {
		// Validate start and end indices
		if (endIndex <= startIndex) {
			throw new IllegalArgumentException("End index must be greater than start index.");
		}

		// Validate the search term
		if (searchTerm == null || searchTerm.trim().isEmpty()) {
			throw new IllegalArgumentException("Search term cannot be empty.");
		}

		// Calculate pagination parameters
		int pageSize = endIndex - startIndex;
		int pageNumber = startIndex / pageSize;

		Pageable pageable = PageRequest.of(pageNumber, pageSize);

		// Call the repository to retrieve results excluding the current user
		List<UserProfile> userProfiles = userRepository.findByUsernameContainingIgnoreCaseAndNotUsername(searchTerm,
				currentUsername, pageable);
		// Map results to DTOs
		return userProfiles.stream().map(UserProfileMapper.INSTANCE::toUserDto).collect(Collectors.toList());
	}

}
