package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToOne;
import jakarta.persistence.JoinColumn;

@Entity
public class UserProfile {

    @Id //pk
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    public Long id;

    public String firstName;

    public String lastName;
    
    @OneToMany(mappedBy = "userProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<SocialPost> socialPosts;
    
    @OneToMany(mappedBy = "userProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<SocialPostComment> comments;

    //list to store PRs
    @ElementCollection
    public List<String> prs = new ArrayList<>();

    //user's email or username
    @Column(unique = true, nullable = false)
    public String username;
    
    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private AccountsModel account;

    //delete (soft delete)
    public boolean isDeleted = false;
    
    public UserProfile() {}

    public UserProfile(String firstName, String lastName, String username, List<String> prs) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.prs = prs;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<String> getPrs() {
        return prs;
    }

    public void setPrs(List<String> prs) {
        this.prs = prs;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

	public AccountsModel getAccount() {
		return account;
	}

	public void setAccount(AccountsModel account) {
		this.account = account;
	}
    
    
}
