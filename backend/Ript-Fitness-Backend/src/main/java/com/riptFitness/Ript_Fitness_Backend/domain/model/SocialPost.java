package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;

@Entity
public class SocialPost {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    public AccountsModel account;
    
    @ManyToOne
    @JoinColumn(name = "user_profile_id", referencedColumnName = "id")
    public UserProfile userProfile;
    
    public String content;
    
    public int numberOfLikes = 0;
    
    //Represents a list of AccountsModels IDs that have liked a specific post
    public List<Long> userIDsOfLikes = new ArrayList<>();
    
    @OneToMany(mappedBy = "postId", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<SocialPostComment> socialPostComments = new ArrayList<>();
    
    public boolean isDeleted = false;
    
    public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public boolean isPublic = false; 
    
    @Column(name = "created_date", updatable = false)
    public LocalDateTime dateTimeCreated;
    
    @PrePersist
    protected void onCreate() {
    	dateTimeCreated = LocalDateTime.now();
    }
    
    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    //added for debugging below
    public Long getId() {
        return id;
    }

    public AccountsModel getAccount() {
        return account;
    }

    public UserProfile getUserProfile() {
        return userProfile;
    }

    public String getContent() {
        return content;
    }

    public int getNumberOfLikes() {
        return numberOfLikes;
    }

    public List<Long> getUserIDsOfLikes() {
        return userIDsOfLikes;
    }

    public List<SocialPostComment> getSocialPostComments() {
        return socialPostComments;
    }

    public LocalDateTime getDateTimeCreated() {
        return dateTimeCreated;
    }

}
