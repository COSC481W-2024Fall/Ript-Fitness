package com.riptFitness.Ript_Fitness_Backend.infrastructure.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import com.riptFitness.Ript_Fitness_Backend.domain.mapper.UserProfileMapper;
import com.riptFitness.Ript_Fitness_Backend.domain.model.Photo;
import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.PhotoRepository;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.UserProfileRepository;
import com.riptFitness.Ript_Fitness_Backend.web.dto.UserDto;

import jakarta.transaction.Transactional;

@Service
public class UserProfileService {

    private final UserProfileRepository userRepository;
    private final PhotoRepository photoRepository;

    public UserProfileService(UserProfileRepository userRepository, PhotoRepository photoRepository) {
        this.userRepository = userRepository;
        this.photoRepository = photoRepository;
    }

    public UserDto addUser(UserDto userDto, String username) {
        UserProfile userToBeAdded = UserProfileMapper.INSTANCE.toUser(userDto);
        userToBeAdded.setUsername(username);
        initializeDefaultValues(userToBeAdded);

        userToBeAdded = userRepository.save(userToBeAdded);
        UserDto result = UserProfileMapper.INSTANCE.toUserDto(userToBeAdded);
        result.setProfilePicture(userToBeAdded.getProfilePicture());
        return result;
    }

    private void initializeDefaultValues(UserProfile userProfile) {
        userProfile.setRestDays(3);
        userProfile.setRestDaysLeft(3);
        userProfile.setRestResetDate(getNextSunday());
        userProfile.setRestResetDayOfWeek(1);
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public UserDto getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .map(user -> {
                UserDto userDto = UserProfileMapper.INSTANCE.toUserDto(user);
                userDto.setProfilePicture(user.getProfilePicture());
                return userDto;
            })
            .orElseThrow(() -> new RuntimeException("User not found with username = " + username));
    }

    public UserDto updateUserByUsername(String username, UserDto userDto) {
        UserProfile userToBeEdited = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username = " + username));

        updateProfileFields(userToBeEdited, userDto);

        userToBeEdited = userRepository.save(userToBeEdited);
        UserDto updatedDto = UserProfileMapper.INSTANCE.toUserDto(userToBeEdited);
        updatedDto.setProfilePicture(userToBeEdited.getProfilePicture());
        return updatedDto;
    }

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
            userProfile.setProfilePicture(userDto.getProfilePicture());
        }
    }

    public UserDto softDeleteUserByUsername(String username) {
        UserProfile userToBeDeleted = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username = " + username));

        userToBeDeleted.setDeleted(true);
        userRepository.save(userToBeDeleted);
        UserDto deletedDto = UserProfileMapper.INSTANCE.toUserDto(userToBeDeleted);
        deletedDto.setProfilePicture(userToBeDeleted.getProfilePicture());
        return deletedDto;
    }

    public List<UserDto> getUserProfilesFromListOfUsernames(List<String> usernames) {
        List<UserProfile> userProfiles = userRepository.findAllByUsernames(usernames);
        return userProfiles.stream()
            .map(user -> {
                UserDto userDto = UserProfileMapper.INSTANCE.toUserDto(user);
                userDto.setProfilePicture(user.getProfilePicture());
                return userDto;
            })
            .collect(Collectors.toList());
    }

    public void updateProfilePicture(String username, byte[] profilePicture) {
        UserProfile user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePicture(profilePicture);
        userRepository.save(user);
    }

    public byte[] getProfilePicture(String username) {
        UserProfile user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getProfilePicture();
    }

    public void addPrivatePhoto(String username, byte[] photo) {
        UserProfile user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Photo newPhoto = new Photo();
        newPhoto.setUserProfile(user);
        newPhoto.setPhoto(photo);
        newPhoto.setUploadTimestamp(LocalDateTime.now());
        photoRepository.save(newPhoto);
    }

    public List<Photo> getPrivatePhotos(String username, int startIndex, int endIndex) {
        if (endIndex <= startIndex) {
            throw new IllegalArgumentException("End index must be greater than start index.");
        }

        UserProfile user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Photo> allPhotos = photoRepository.findByUserProfile_Id(user.getId());

        int toIndex = Math.min(endIndex, allPhotos.size());
        if (startIndex >= allPhotos.size()) {
            return Collections.emptyList();
        }
        return allPhotos.subList(startIndex, toIndex);
    }

    public void deletePrivatePhoto(Long photoId) {
        photoRepository.deleteById(photoId);
    }

    private LocalDate getNextSunday() {
        LocalDate today = LocalDate.now();
        int todayDayOfWeek = today.getDayOfWeek().getValue();
        int daysUntilSunday = 7 - todayDayOfWeek;
        return today.plusDays(daysUntilSunday);
    }

    @Transactional
    public void updateRestResetDateIfNeeded(UserProfile userProfile) {
        LocalDate currentRestResetDate = userProfile.getRestResetDate();
        LocalDate today = LocalDate.now();

        if (currentRestResetDate.isBefore(today.minusDays(7))) {
            userProfile.setRestResetDate(getNextSunday());
            userProfile.setRestDaysLeft(userProfile.getRestDays());
            userRepository.save(userProfile);
        }
    }
}
