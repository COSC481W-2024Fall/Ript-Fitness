import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { GlobalContext, Exercise} from '@/context/GlobalContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WorkoutStackParamList } from '@/app/(tabs)/WorkoutStack';
import { WorkoutScreenNavigationProp } from '@/app/(tabs)/WorkoutStack';
import { httpRequests } from '@/api/httpRequests';

// Route type
type SelectedExercisesRouteProp = RouteProp<WorkoutStackParamList, 'SelectedExercises'>;

export default function SelectedExercisesScreen() {
  const context = useContext(GlobalContext);
  const exerciseList = context?.exerciseList || new Set<string>();
  const clearExerciseList = context?.clearExerciseList;
  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const route = useRoute<SelectedExercisesRouteProp>();

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');

   // received dataBodyFocusScreen 
   const exercises: string[] = route.params?.exercises || [];
   console.log("Received exercises from BodyFocusScreen:", exercises); 

  const toggleAllExercises = () => {
    const newState = !allChecked;
    setAllChecked(newState);
    setSelectedExercises(newState ? new Set(Array.from(exerciseList)) : new Set());
  };

  const toggleExerciseSelection = (exerciseName: string) => {
    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      newSet.has(exerciseName) ? newSet.delete(exerciseName) : newSet.add(exerciseName);
      setAllChecked(newSet.size === exerciseList.size);
      return newSet;
    });
  };

  const sendSelectedExercises = () => {
    if (selectedExercises.size === 0) {
      Alert.alert("Error", "Please select at least one exercise");
      return;
    }
    setModalVisible(true);
  };

  const submitWorkout = async () => {
    if (workoutName.trim() === '') {
      Alert.alert("Error", "Workout name cannot be empty");
      return;
    }
    if (!context?.selectedExerciseObjects || context.selectedExerciseObjects.length === 0) {
      Alert.alert("Error", "No exercise data found.");
      return;
    }

    const currentUserId = context.userProfile.id;
    console.log("Current userProfile.id:", currentUserId);

    console.log("All selectedExerciseObjects:");
    context.selectedExerciseObjects.forEach((ex) => {
    console.log(`${ex.nameOfExercise} → exerciseId: ${ex.exerciseId}, accountReferenceId: ${ex.accountReferenceId}`);
  });

    const exerciseObjects: Exercise[] = context.selectedExerciseObjects.filter(
      ex => selectedExercises.has(ex.nameOfExercise)
      
    );

    const exerciseIds = exerciseObjects.map(ex => ex.exerciseId).filter(id => id); // filter out undefined/null;

    // Added log comparing Slide Modal and selectedExercises
    console.log("Slide Modal exercise name:", Array.from(selectedExercises));
    console.log("Filtered exerciseObjects:", 
      exerciseObjects.map(ex => ({ name: ex.nameOfExercise, 
                                    id: ex.exerciseId,
                                    userId: ex.accountReferenceId,
                                  })));
    console.log("Submitted exerciseIds:", exerciseIds);
    console.log("Submitting workout:", JSON.stringify({
        name: workoutName,
        exerciseIds: exerciseIds
    }));
    
    // Check consistency
    const modalNames = Array.from(selectedExercises);
    const objectNames = exerciseObjects.map(ex => ex.nameOfExercise);
    const isConsistent = modalNames.every(name => objectNames.includes(name)) && 
                        objectNames.every(name => modalNames.includes(name));
    console.log("Are the names in the Slide Modal and exerciseObjects consistent?", isConsistent);

    if (exerciseIds.length === 0) {
      Alert.alert("Error", "No valid exercises selected.");
      return;
    }

    const pushingWorkout = {
      name: workoutName,
      exerciseIds: exerciseIds,
    };

    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/workouts/createWithExerciseClones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${context.data.token}`,
        },
        body: JSON.stringify(pushingWorkout),
      });

      if (!response.ok) {
        const errorText = await response.text();  
        console.error("Workout submission failed with status:", response.status);
        console.error("Workout submission failed:", errorText); 
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      console.log("Workout created with ID:", json.workoutId);
      console.log("Clone exercise ID:", json.exercises?.map((ex: any) => ex.exerciseId));
      console.log("Full response from backend:", JSON.stringify(json, null, 2));

      if (json.clonedExercises && Array.isArray(json.clonedExercises)) {
        console.log("Cloned Exercise Details:");
        json.clonedExercises.forEach((ex: any) => {
          console.log(`• ID: ${ex.exerciseId}, Name: ${ex.nameOfExercise}, Sets: ${ex.sets}, Reps: ${ex.reps?.join(', ')}`);
        });
      } else {
        console.log("No clonedExercises returned from backend");
      }


      Alert.alert("Success", "Workout created successfully!");
      setModalVisible(false);
      setWorkoutName('');
      setSelectedExercises(new Set());

      context.clearExerciseList();
      context.setSelectedExerciseObjects([]);

      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => {
          console.log("After clearing:");
          console.log("exerciseList", context.exerciseList);
          console.log("selectedExerciseObjects", context.selectedExerciseObjects);
        }, 300);
      }

      navigation.navigate("MyWorkoutsScreen", { exercises: exerciseObjects });
    } catch (error) {
      console.error("Workout submission failed:", error);
      Alert.alert("Error", "Workout submission failed.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected Exercises</Text>
      {exerciseList.size > 0 ? (
        <>
          <View style={styles.selectAllContainer}>
            <TouchableOpacity style={styles.exerciseRow} onPress={toggleAllExercises}>
              <View
                style={[styles.selectAllCircle, {
                  backgroundColor: allChecked ? 'rgb(19, 245, 61)' : 'rgb(23, 220, 220)',
                }]}
              >
                {allChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>
          <FlatList
            data={Array.from(exerciseList)}
            renderItem={({ item }) => (
              <TouchableOpacity
                testID={`exercise-${item}`} // Assign a unique testID to each exercise item for testing purposes 
                style={styles.exerciseRow}
                onPress={() => toggleExerciseSelection(item)}
              >
                <View
                  style={[styles.circle, {
                    backgroundColor: selectedExercises.has(item) ? 'rgb(19, 245, 61)' : 'rgb(23, 220, 220)',
                  }]}
                >
                  {selectedExercises.has(item) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.exerciseText, { marginLeft: 10 }]}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `exercise-${index}`}
            contentContainerStyle={{ paddingBottom: 20, paddingLeft: 0, paddingTop: 10, width: '100%', alignItems: 'flex-start' }}
          />
        </>
      ) : (
        <Text style={styles.noExercisesText}>No exercises selected yet.</Text>
      )}
      <View style={styles.buttonContainer}>
        {exerciseList.size > 0 && (
          <>
            <TouchableOpacity testID="send-button" onPress={sendSelectedExercises} style={styles.sendButton}>
              <Text style={styles.buttonText}> Send </Text>
            </TouchableOpacity>
            <TouchableOpacity   onPress={() => {
                   setSelectedExercises(new Set()); // Clear the setSelected
                   clearExerciseList?.(); // clear global exerciseList
                   context?.setSelectedExerciseObjects([]); // clear SelectedExerciseObjects
                }}
                style={styles.clearButton}
                >
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Slide Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View testID="workout-modal" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Workout</Text>
            <TextInput
              testID="workout-name-input" // Assign a unique testID to each exercise item for testing purposes
              placeholder="Workout name"
              style={styles.input}
              value={workoutName}
              onChangeText={setWorkoutName}
            />
            <Text style={{ marginTop: 0, fontWeight: 'bold', color: '#21BFBF' }}>Selected Exercises:</Text>
            {Array.from(selectedExercises).map((name, index) => (
              <Text key={index} style={{ color: '#21BFBF' }}>• {name}</Text>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity testID="cancel-button" onPress={() => setModalVisible(false)} style={styles.clearButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="confirm-button" onPress={submitWorkout} style={styles.sendButton}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 7, 0.82)',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#21BFBF',
    marginBottom: 10,
    alignSelf: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingLeft: 70,
    width: '100%',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgb(23, 220, 220)',
  },
  selectAllCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: -40,
    marginTop: -40,
    backgroundColor: 'rgb(23, 220, 220)',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseText: {
    fontSize: 16,
    color: '#21BFBF',
    marginLeft: 10,
  },
  noExercisesText: {
    fontSize: 16,
    color: '#21BFBF',
    marginTop: 20,
    marginLeft: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
    marginBottom: 40,
    marginLeft: 20,
  },
  sendButton: {
    backgroundColor: 'rgba(33, 191, 191, 0.67)',
    width: 70,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  clearButton: {
    backgroundColor: 'rgba(33, 191, 191, 0.67)',
    width: 70,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  buttonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    padding: 0,
    lineHeight: 20,
  },
  selectAllContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 191, 191, 0.3)',
    marginBottom: 10,
    marginTop: -10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  modalContent: {
    backgroundColor: 'rgba(74, 75, 78, 0.95)',
    padding: 40,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    elevation: 10, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#21BFBF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 120, 
    marginTop: 20,
  },
});
