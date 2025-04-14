package com.riptFitness.Ript_Fitness_Backend.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "calendar_workout_link",
       uniqueConstraints = @UniqueConstraint(name = "uniq_calendar_workout", columnNames = {"calendar_entry_id", "workout_id"}))
public class CalendarWorkoutLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "calendar_entry_id", nullable = false, foreignKey = @ForeignKey(name = "fk_calendar_entry"))
    private Calendar calendarEntry;

    @ManyToOne
    @JoinColumn(name = "workout_id", nullable = false, foreignKey = @ForeignKey(name = "fk_workout"))
    private Workouts workout;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Calendar getCalendarEntry() {
        return calendarEntry;
    }

    public void setCalendarEntry(Calendar calendarEntry) {
        this.calendarEntry = calendarEntry;
    }

    public Workouts getWorkout() {
        return workout;
    }

    public void setWorkout(Workouts workout) {
        this.workout = workout;
    }
}
