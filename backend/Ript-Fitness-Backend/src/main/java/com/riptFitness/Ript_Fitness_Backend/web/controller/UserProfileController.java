package com.riptFitness.Ript_Fitness_Backend.web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.domain.model.Photo;
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
		// Include profile picture in the response
		returnedUserObject.setProfilePicture(userProfileService.getProfilePicture(username));
		return ResponseEntity.ok(returnedUserObject);
	}

	// PUT localhost:8080/userProfile/updateUserProfile
	@PutMapping("/updateUserProfile")
	public ResponseEntity<UserDto> updateUserProfile(@RequestBody UserDto userDto) {
		String username = getUsernameFromContext();
		UserDto updatedUserObject = userProfileService.updateUserByUsername(username, userDto);
		// Include profile picture in the response
		updatedUserObject.setProfilePicture(userProfileService.getProfilePicture(username));
		return ResponseEntity.ok(updatedUserObject);
	}

	// DELETE localhost:8080/userProfile/deleteUserProfile
	@DeleteMapping("/deleteUserProfile")
	public ResponseEntity<UserDto> deleteUserProfile() {
		String username = getUsernameFromContext();
		UserDto deletedUserObject = userProfileService.softDeleteUserByUsername(username);
		// Include profile picture in the response
		deletedUserObject.setProfilePicture(userProfileService.getProfilePicture(username));
		return ResponseEntity.ok(deletedUserObject);
	}
	
    @PostMapping("/getUserProfilesFromList")
    public ResponseEntity<List<UserDto>> getUserProfilesFromList(@RequestBody List<String> usernames) {
        List<UserDto> userProfiles = userProfileService.getUserProfilesFromListOfUsernames(usernames);
        // Include profile pictures in the response
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

    // Private photo endpoints
    @PostMapping("/photo")
    public ResponseEntity<Void> addPrivatePhoto(@RequestBody byte[] photo) {
        String username = getUsernameFromContext();
        userProfileService.addPrivatePhoto(username, photo);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/userProfile/photos")
    public ResponseEntity<List<Photo>> getPrivatePhotos(
            @RequestParam String username,
            @RequestParam int startIndex,
            @RequestParam int endIndex) {
        List<Photo> photos = userProfileService.getPrivatePhotos(username, startIndex, endIndex);
        return ResponseEntity.ok(photos);
    }

    @DeleteMapping("/photo/{photoId}")
    public ResponseEntity<Void> deletePrivatePhoto(@PathVariable Long photoId) {
        userProfileService.deletePrivatePhoto(photoId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUserProfiles(
            @RequestParam String searchTerm,
            @RequestParam int startIndex,
            @RequestParam int endIndex) {
        try {
            List<UserDto> userProfiles = userProfileService.searchUserProfilesByUsername(searchTerm, startIndex, endIndex);
            // Include profile pictures in the response
            userProfiles.forEach(user -> user.setProfilePicture(userProfileService.getProfilePicture(user.getUsername())));
            return ResponseEntity.ok(userProfiles);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}
