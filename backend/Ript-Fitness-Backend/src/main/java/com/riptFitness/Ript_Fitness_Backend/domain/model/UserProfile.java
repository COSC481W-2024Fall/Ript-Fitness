package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.JoinColumn;

@Entity
public class UserProfile {

    @Id
    private Long id;
    
    private String firstName;

    private String lastName;

    public String displayName;
    
    @OneToMany(mappedBy = "userProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialPost> socialPosts;

    @OneToMany(mappedBy = "userProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialPostComment> comments;

    @Column
    private String bio;

    @Column(unique = true, nullable = false)
    private String username;

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id") 
    @JsonBackReference
    private AccountsModel account;

    private boolean isDeleted = false;

    @Column(name = "rest_days")
    private Integer restDays = 3; 

    @Column(name = "rest_days_left")
    private Integer restDaysLeft; 

    @Column(name = "rest_reset_date")
    private LocalDate restResetDate; 

    @Column(name = "rest_reset_day_of_week")
    private Integer restResetDayOfWeek = 7; // Sunday (default reset day)
    
    @Column(name = "profile_picture", columnDefinition = "LONGBLOB")
    private byte[] profilePicture;
    
    private ZonedDateTime dateTimeAccountWasCreated;
    
    // Default Constructor
    public UserProfile() {
        this.restDays = 3;
        this.restDaysLeft = 3;  
        LocalDate today = LocalDate.now();
        int todayDayOfWeek = today.getDayOfWeek().getValue();
        int daysUntilSunday = 7 - todayDayOfWeek;
        
        this.restResetDate = today.plusDays(daysUntilSunday);  
        this.restResetDayOfWeek = 7;     
    }
    // Parameterized Constructor
    public UserProfile(String firstName, String lastName, String username, String bio) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.bio = bio;
        this.displayName = username;
        this.restDays = 3; 
        this.restDaysLeft = 3;  
        
        LocalDate today = LocalDate.now();
        int todayDayOfWeek = today.getDayOfWeek().getValue();
        int daysUntilSunday = 7 - todayDayOfWeek;
        
        this.restResetDate = today.plusDays(daysUntilSunday); 
        this.restResetDayOfWeek = 7;  
    }
	@PrePersist
	public void ensureDefaults() {
		if (this.displayName == null || this.displayName.isEmpty()) {
			this.displayName = this.username; // Default displayName to username
		}
		if (this.account != null) {
            this.id = this.account.getId(); // Ensure profileID matches accountID
        }
	}
	

    @PreUpdate
    public void updateIdWithAccount() {
        if (this.account != null) {
            this.id = this.account.getId(); // Maintain sync during updates
        }
    }
	
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

    public String getDisplayname() {
        return displayName;
    }

    public void setDisplayname(String displayname) {
        this.displayName = displayname;
    }

    public List<SocialPost> getSocialPosts() {
        return socialPosts;
    }

    public void setSocialPosts(List<SocialPost> socialPosts) {
        this.socialPosts = socialPosts;
    }

    public List<SocialPostComment> getComments() {
        return comments;
    }

    public void setComments(List<SocialPostComment> comments) {
        this.comments = comments;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
    	return displayName;
    }
    
    public void setDisplayName(String displayName) {
    	this.displayName = displayName;
    }
    
    public AccountsModel getAccount() {
        return account;
    }

    public void setAccount(AccountsModel account) {
        this.account = account;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Integer getRestDays() {
        return restDays != null ? restDays : 3;  
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
	public ZonedDateTime getDateTimeAccountWasCreated() {
		return dateTimeAccountWasCreated;
	}
	public void setDateTimeAccountWasCreated(ZonedDateTime dateTimeAccountWasCreated) {
		this.dateTimeAccountWasCreated = dateTimeAccountWasCreated;
	}
}
