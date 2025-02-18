package com.riptFitness.Ript_Fitness_Backend.web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.riptFitness.Ript_Fitness_Backend.domain.model.WeightHistory;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.AzureBlobService;
import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.UserProfileService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;

@RestController
@RequestMapping("/userProfile") // base URL for all user profile endpoints
public class UserProfileController {

	private final UserProfileService userProfileService;

	public UserProfileController(UserProfileService userProfileService) {
		this.userProfileService = userProfileService;
	}

	private String getUsernameFromContext() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication.getName(); // Username from JWT token
	}

	// GET localhost:8080/userProfile/getUserProfile
	@GetMapping("/getUserProfile")
	public ResponseEntity<UserDto> getUserProfile() {
		String username = getUsernameFromContext();
		UserDto returnedUserObject = userProfileService.getUserByUsername(username);
		returnedUserObject.setProfilePicture(userProfileService.getProfilePicture(username));
		return ResponseEntity.ok(returnedUserObject);
	}

	// PUT localhost:8080/userProfile/updateUserProfile
	@PutMapping("/updateUserProfile")
	public ResponseEntity<UserDto> updateUserProfile(@RequestBody UserDto userDto) {
		String username = getUsernameFromContext();
		UserDto updatedUserObject = userProfileService.updateUserByUsername(username, userDto);
		updatedUserObject.setProfilePicture(userProfileService.getProfilePicture(username));
		return ResponseEntity.ok(updatedUserObject);
	}

	// DELETE localhost:8080/userProfile/deleteUserProfile
	@DeleteMapping("/deleteUserProfile")
	public ResponseEntity<UserDto> deleteUserProfile() {
		String username = getUsernameFromContext();
		UserDto deletedUserObject = userProfileService.softDeleteUserByUsername(username);
		deletedUserObject.setProfilePicture(userProfileService.getProfilePicture(username));
		return ResponseEntity.ok(deletedUserObject);
	}

	@PostMapping("/getUserProfilesFromList")
	public ResponseEntity<List<UserDto>> getUserProfilesFromList(@RequestBody List<String> usernames) {
		List<UserDto> userProfiles = userProfileService.getUserProfilesFromListOfUsernames(usernames);
		userProfiles.forEach(user -> user.setProfilePicture(userProfileService.getProfilePicture(user.getUsername())));
		return ResponseEntity.ok(userProfiles);
	}

	// Profile picture endpoints
	@PutMapping("/profilePicture")
	public ResponseEntity<Void> updateProfilePicture(@RequestBody byte[] profilePicture) {
		String username = getUsernameFromContext();
		userProfileService.updateProfilePicture(username, profilePicture);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/profilePicture")
	public ResponseEntity<byte[]> getProfilePicture() {
		String username = getUsernameFromContext();
		byte[] profilePicture = userProfileService.getProfilePicture(username);
		return ResponseEntity.ok(profilePicture);
	}

	@PostMapping("/photo")
	public ResponseEntity<Void> addPrivatePhoto(@RequestParam("file") MultipartFile file) {
		try {
			// Retrieve the username from the security context
			String username = getUsernameFromContext();

			// Validate the uploaded file
			if (file.isEmpty()) {
				return ResponseEntity.badRequest().build(); // File is empty
			}

			// Call the service method to process the photo
			userProfileService.addPrivatePhoto(username, file.getBytes(), file.getContentType());

			return ResponseEntity.ok().build(); // Successfully uploaded
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping("/photos")
	public ResponseEntity<List<String>> getPrivatePhotos(@RequestParam int startIndex, @RequestParam int endIndex) {
		String username = getUsernameFromContext();
		List<String> photos = userProfileService.getPrivatePhotos(username, startIndex, endIndex);
		return ResponseEntity.ok(photos);
	}

	@DeleteMapping("/deletePhoto")
	public ResponseEntity<Void> deletePrivatePhoto(@RequestParam String photoUrl) {
		String username = getUsernameFromContext();
		userProfileService.deletePrivatePhoto(username, photoUrl);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/getSasUrl")
	public ResponseEntity<String> getSasUrl(@RequestParam String blobName) {
		AzureBlobService azureBlobService = new AzureBlobService();
		String sasUrl = azureBlobService.generateSasUrl(blobName);
		return ResponseEntity.ok(sasUrl);
	}

	@GetMapping("/search")
	public ResponseEntity<?> searchUserProfiles(@RequestParam String searchTerm, @RequestParam int startIndex,
			@RequestParam int endIndex) {
		try {
			// Get the current user's username from the security context
			String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
			// Call the service method and exclude the current user
			List<UserDto> userProfiles = userProfileService.searchUserProfilesByUsername(searchTerm, startIndex,
					endIndex, currentUsername);
			// Add profile pictures for each user
			userProfiles
					.forEach(user -> user.setProfilePicture(userProfileService.getProfilePicture(user.getUsername())));
			return ResponseEntity.ok(userProfiles);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}
	
	@PutMapping("/updateWeight")
    public ResponseEntity<UserDto> updateUserWeight(@RequestParam Double weight) {
        String username = getUsernameFromContext();
        UserDto updatedUser = userProfileService.updateUserWeight(username, weight);
        return ResponseEntity.ok(updatedUser);
    }
	
	@GetMapping("/weightHistory")
	public ResponseEntity<List<WeightHistory>> getUserWeightHistory(@RequestParam(required = false) String username) {
	    if (username == null) {
	        username = getUsernameFromContext();
	    }
	    List<WeightHistory> history = userProfileService.getUserWeightHistory(username);
	    return ResponseEntity.ok(history);
	}

}
