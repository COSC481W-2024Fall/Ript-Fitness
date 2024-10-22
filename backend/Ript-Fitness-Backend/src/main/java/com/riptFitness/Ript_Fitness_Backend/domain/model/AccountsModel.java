package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;

@Entity // Creates a database table with that name and columns equal to the variables in the object class
@Table(name = "accounts_model")
public class AccountsModel {

    @Id // This means this is the primary key of the AccountsModel database table
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Generates an ID via auto-increment
    private Long id;
    
    // Bidirectional relationship with Streak
    @OneToOne(mappedBy = "account")
    private Streak streak;

    // Fields:
    private String username;
    private String password;
    private String email;
    private LocalDateTime lastLogin;
    
    // Automatically set the date
    @PostPersist
    protected void onCreate() {
        this.lastLogin = LocalDateTime.now();
    }

    //Represents a List of social posts that the user makes in the social feed
    @OneToMany(mappedBy = "accountsModel", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<SocialPost> socialPosts;

    // Getters:
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getEmail() {
        return email;
    }
    
    public LocalDateTime getlastLogin(){
    	return lastLogin;
    }

    // Setters:
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password; 
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setlastLogin(LocalDateTime lastLogin) {
    	this.lastLogin = lastLogin;
    }
    
    public Streak getStreak() {
        return streak;
    }

    public void setStreak(Streak streak) {
        this.streak = streak;
    }
}
