package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.util.Optional;
import org.springframework.stereotype.Service;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.UserProfileMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;

@Service
public class UserProfileService {

    private final UserProfileRepository userRepository;

    // Dependency injection constructor
    public UserProfileService(UserProfileRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Adds user profile to database
    public UserDto addUser(UserDto userDto) {
        UserProfile userToBeAdded = UserProfileMapper.INSTANCE.toUser(userDto);
        userToBeAdded = userRepository.save(userToBeAdded);
        return UserProfileMapper.INSTANCE.toUserDto(userToBeAdded);
    }

    // Fetches user profile using the username !!
    public UserDto getUserByUsername(String username) {
        Optional<UserProfile> returnedOptionalUserObject = userRepository.findByUsername(username);

        if (returnedOptionalUserObject.isEmpty()) {
            throw new RuntimeException("User not found in database with username = " + username);
        }

        UserProfile returnedUserObject = returnedOptionalUserObject.get();
        return UserProfileMapper.INSTANCE.toUserDto(returnedUserObject);
    }

    // Edits user profile based on the username
    public UserDto editUserByUsername(String username, UserDto userDto) {
        Optional<UserProfile> optionalUserToBeEdited = userRepository.findByUsername(username);

        if (optionalUserToBeEdited.isEmpty()) {
            throw new RuntimeException("User not found in database with username = " + username);
        }

        UserProfile userToBeEdited = optionalUserToBeEdited.get();
        UserProfileMapper.INSTANCE.updateUserFromDto(userDto, userToBeEdited);
        userToBeEdited = userRepository.save(userToBeEdited);
        return UserProfileMapper.INSTANCE.toUserDto(userToBeEdited);
    }

    // "Deletes" user (soft delete) by setting the isDeleted flag to true using the username
    public UserDto deleteUserByUsername(String username) {
        Optional<UserProfile> optionalUserToBeDeleted = userRepository.findByUsername(username);

        if (optionalUserToBeDeleted.isEmpty()) {
            throw new RuntimeException("User not found in database with username = " + username);
        }

        UserProfile userToBeDeleted = optionalUserToBeDeleted.get();
        userToBeDeleted.setDeleted(true); // Set the condition of "isDeleted" to true.
        userRepository.save(userToBeDeleted);
        return UserProfileMapper.INSTANCE.toUserDto(userToBeDeleted);
    }
}
