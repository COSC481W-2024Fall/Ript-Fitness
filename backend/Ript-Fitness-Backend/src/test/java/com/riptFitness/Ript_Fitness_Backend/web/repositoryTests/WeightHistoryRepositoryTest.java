package com.riptFitness.Ript_Fitness_Backend.web.repositoryTests;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.riptFitness.Ript_Fitness_Backend.domain.model.UserProfile;
import com.riptFitness.Ript_Fitness_Backend.domain.model.WeightHistory;
import com.riptFitness.Ript_Fitness_Backend.domain.repository.WeightHistoryRepository;

@DataJpaTest  // For JPA repository testing
public class WeightHistoryRepositoryTest {

    @Autowired
    private WeightHistoryRepository weightHistoryRepository;

    @Autowired
    private TestEntityManager entityManager;

    private UserProfile testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserProfile();
        testUser.setUsername("testUser");
        entityManager.persist(testUser);

        WeightHistory entry1 = new WeightHistory(testUser, 180.0, LocalDateTime.now().minusDays(1));
        WeightHistory entry2 = new WeightHistory(testUser, 175.0, LocalDateTime.now());
        entityManager.persist(entry1);
        entityManager.persist(entry2);
    }
/*
    @Test
    public void testFindUserByUserProfileOrderByRecordedAtDesc() {
        List<WeightHistory> history = weightHistoryRepository.findUserByUserProfileOrderByRecordedAtDesc(testUser);

        assertNotNull(history);
        assertEquals(2, history.size());
        assertEquals(175.0, history.get(0).getWeight()); // Latest weight should be first
    }
    */
}
