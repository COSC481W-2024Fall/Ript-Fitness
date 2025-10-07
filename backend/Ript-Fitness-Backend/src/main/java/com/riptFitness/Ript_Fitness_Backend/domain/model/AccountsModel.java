package com.riptFitness.Ript_Fitness_Backend.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
    @JsonManagedReference // Indicates that AccountsModel is the parent in the relationship
    private Streak streak;
    
    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    @JsonManagedReference
    private UserProfile userProfile;
    
    // If you want to define a bi-directional relationship
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Workouts> workouts;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    private List<WorkoutData> workoutdata;

    // 10/17/24: Adding One-To-Many relationship with the exercise class:
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL) // "account" is the insatnce variable in the exercise class
    @JsonIgnoreProperties("account") // Ignore the account field inside exercises when serializing
    private List<ExerciseModel> exercises; // This is a collection (List) that holds exercises

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Day> days;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Food> foods;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialPost> socialPostList;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialPostComment> socialPostComments;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Note> notes = new ArrayList<>();
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Graph> graphs;
    
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlateCalculator> plateCalculations;

    @ManyToMany
    @JoinTable(
        name = "friends_list", 
        joinColumns = @JoinColumn(name = "account_id"), //Currently logged in account's ID
        inverseJoinColumns = @JoinColumn(name = "friend_id") //ID of friend's account to be added
    )
    @JsonIgnore 
    private List<AccountsModel> friends;

	// Fields:
    private String username;
    @JsonIgnore // Ignore password field during serialization
    private String password;
    @JsonIgnore // Ignore password field during serialization
    private String email;
    private LocalDateTime lastLogin;
    
    // Automatically set the date
    @PostPersist
    protected void onCreate() {
        this.lastLogin = LocalDateTime.now();
    }

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
    
    public List<Workouts> getWorkouts() {
		return workouts;
	}

	public void setWorkouts(List<Workouts> workouts) {
		this.workouts = workouts;
	}

	public List<Day> getDays() {
		return days;
	}

	public void setDays(List<Day> days) {
		this.days = days;
	}

	public List<SocialPost> getSocialPostList() {
		return socialPostList;
	}

	public void setSocialPostList(List<SocialPost> socialPostList) {
		this.socialPostList = socialPostList;
	}

	public List<SocialPostComment> getSocialPostComments() {
		return socialPostComments;
	}

	public void setSocialPostComments(List<SocialPostComment> socialPostComments) {
		this.socialPostComments = socialPostComments;
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


	public List<ExerciseModel> getExercises() {
		return exercises;
	}


	public void setExercises(List<ExerciseModel> exercises) {
		this.exercises = exercises;
	}
	
	public List<Note> getNotes() {
	    return notes;
	}

	public void setNotes(List<Note> notes) {
	    this.notes = notes;
	}

	public void addNote(Note note) {
	    notes.add(note);
	    note.setAccount(this);
	}

	public void removeNote(Note note) {
	    notes.remove(note);
	    note.setAccount(null);
	}


	public UserProfile getUserProfile() {
		return userProfile;
	}

    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
        if (userProfile != null) {
            userProfile.setAccount(this);
        }
    }
	public List<AccountsModel> getFriends() {
		return friends;
	}

	public void setFriends(List<AccountsModel> friends) {
		this.friends = friends;
	}

	public List<Food> getFoods() {
		return foods;
	}

	public void setFoods(List<Food> foods) {
		this.foods = foods;
	}

	public List<WorkoutData> getWorkoutdata() {
		return workoutdata;
	}

	public void setWorkoutdata(List<WorkoutData> workoutdata) {
		this.workoutdata = workoutdata;
	}

	public List<Graph> getGraphs() {
		return graphs;
	}

	public void setGraphs(List<Graph> graphs) {
		this.graphs = graphs;
	}

	public List<PlateCalculator> getPlateCalculations() {
		return plateCalculations;
	}

	public void setPlateCalculations(List<PlateCalculator> plateCalculations) {
		this.plateCalculations = plateCalculations;
	}
}
