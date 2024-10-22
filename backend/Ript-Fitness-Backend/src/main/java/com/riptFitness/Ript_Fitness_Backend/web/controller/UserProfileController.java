package com.riptFitness.Ript_Fitness_Backend.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riptFitness.Ript_Fitness_Backend.infrastructure.service.UserProfileService;
import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;

import jakarta.servlet.http.HttpServletRequest;

@RestController 
@RequestMapping("/userProfile") //base url for all userprofile endpoints
public class UserProfileController {
    private final UserProfileService userProfileService;

    // Constructor for dependency injection
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    // POST localhost:8080/userProfile/addUser
    @PostMapping("/addUser")
    public ResponseEntity<UserDto> addUser(@RequestBody UserDto userDto) {
        UserDto savedUserObject = userProfileService.addUser(userDto);
        return new ResponseEntity<>(savedUserObject, HttpStatus.CREATED);
    }

    // GET localhost:8080/userProfile/getUserProfile
    // Retrieves the profile of the logged-in user based on the username in the session
    @GetMapping("/getUserProfile")
    public ResponseEntity<UserDto> getUserProfile(HttpServletRequest request) {
        String username = (String) request.getSession().getAttribute("username"); // Retrieve the username from session
        if (username == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // Return 401 if the user is not logged in
        }
        UserDto returnedUserObject = userProfileService.getUserByUsername(username);
        return ResponseEntity.ok(returnedUserObject);
    }

    // PUT localhost:8080/userProfile/editUserProfile
    // Allows the logged-in user to update their profile, with username tied to the session
    @PutMapping("/editUserProfile")
    public ResponseEntity<UserDto> editUserProfile(@RequestBody UserDto userDto, HttpServletRequest request) {
        String username = (String) request.getSession().getAttribute("username"); // Retrieve the username from session
        if (username == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // Return 401 if the user is not logged in
        }
        UserDto updatedUserObject = userProfileService.editUserByUsername(username, userDto);
        return ResponseEntity.ok(updatedUserObject);
    }

    // DELETE localhost:8080/userProfile/deleteUserProfile
    // Soft deletes the profile of the logged-in user
    @DeleteMapping("/deleteUserProfile")
    public ResponseEntity<UserDto> deleteUserProfile(HttpServletRequest request) {
        String username = (String) request.getSession().getAttribute("username"); // Retrieve the username from session
        if (username == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // Return 401 if the user is not logged in
        }
        UserDto deletedUserObject = userProfileService.deleteUserByUsername(username);
        return ResponseEntity.ok(deletedUserObject);
    }
}
