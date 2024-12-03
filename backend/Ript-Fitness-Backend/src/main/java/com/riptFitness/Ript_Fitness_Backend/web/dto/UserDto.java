package com.riptFitness.Ript_Fitness_Backend.web.dto;

import java.time.LocalDate;
import java.time.ZonedDateTime;

public class UserDto {
    public Long id;
    public String firstName;
    public String lastName;
    public String username;
    public String displayname;
    public String bio;
    public boolean isDeleted = false;
    public Integer restDays;
    public Integer restDaysLeft;
    public LocalDate restResetDate;
    public Integer restResetDayOfWeek;
    public byte[] profilePicture; // Added field for profile picture
    public ZonedDateTime dateTimeAccountWasCreated;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
        if (this.displayname == null || this.displayname.isEmpty()) {
            this.displayname = username; // Default displayname to username
        }
    }

    public String getDisplayname() {
        return displayname;
    }

    public void setDisplayname(String displayname) {
        this.displayname = displayname;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Integer getRestDays() {
        return restDays;
    }

    public void setRestDays(Integer restDays) {
        this.restDays = restDays;
    }

    public Integer getRestDaysLeft() {
        return restDaysLeft;
    }

    public void setRestDaysLeft(Integer restDaysLeft) {
        this.restDaysLeft = restDaysLeft;
    }

    public LocalDate getRestResetDate() {
        return restResetDate;
    }

    public void setRestResetDate(LocalDate restResetDate) {
        this.restResetDate = restResetDate;
    }

    public Integer getRestResetDayOfWeek() {
        return restResetDayOfWeek;
    }

    public void setRestResetDayOfWeek(Integer restResetDayOfWeek) {
        this.restResetDayOfWeek = restResetDayOfWeek;
    }

    public byte[] getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }
    public void setDefaults() {
        if (this.displayname == null || this.displayname.isEmpty()) {
            this.displayname = this.username; // can be called whenever
        }
    }

}
