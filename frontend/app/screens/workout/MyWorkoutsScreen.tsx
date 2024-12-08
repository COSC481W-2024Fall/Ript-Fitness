import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { GlobalContext } from "@/context/GlobalContext";
import { Workout, Exercise } from "@/context/GlobalContext";


export default function MyWorkoutsScreen() {
  const context = useContext(GlobalContext);


  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState<string>("");
  const [updatedExercises, setUpdatedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Show loading indicator
      await context?.fetchWorkouts();
      setLoading(false); // Hide loading indicator
    };
    fetchData();
  }, []);

  const openModal = (workout: Workout) => {
    setSelectedWorkout(workout);
    setWorkoutName(workout.name);
    setUpdatedExercises([...workout.exercises]);
    setIsEditing(false);
    setIsModalVisible(true);
  };


  const closeModal = () => {
    // Reset modal state without persisting changes
    setIsModalVisible(false);
 
    // Revert changes if unsaved
    if (selectedWorkout) {
      setWorkoutName(selectedWorkout.name);
      setUpdatedExercises([...selectedWorkout.exercises]);
    }
    setSelectedWorkout(null);
  };
 


  const saveWorkout = async () => {
    if (!selectedWorkout) {
      Alert.alert("Error", "No workout selected to save.");
      return;
    }
 
    try {
      // Fetch the workout ID
      const workoutId = await fetchWorkoutById(selectedWorkout.name);
      if (!workoutId) {
        Alert.alert("Error", "Failed to fetch workout ID.");
        return;
      }
 
      // Update the workout name
      const workoutResponse = await fetch(
        `http://ript-fitness-app.azurewebsites.net/workouts/updateWorkout/${workoutId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context?.data.token}`,
          },
          body: JSON.stringify({ name: workoutName }),
        }
      );
 
      if (!workoutResponse.ok) {
        throw new Error(`Failed to update workout: ${workoutResponse.statusText}`);
      }
 
      console.log("Workout name updated successfully");
 
      // Update each exercise
      for (const exercise of updatedExercises) {
        const exercisePayload = {
          exerciseId: exercise.exerciseId,
          nameOfExercise: exercise.nameOfExercise,
          reps: exercise.reps,
          weight: exercise.weight,
          sets: exercise.reps.length, // Ensure sets matches the number of reps
        };
 
        const exerciseResponse = await fetch(
          `http://ript-fitness-app.azurewebsites.net/exercises/updateExercise`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${context?.data.token}`,
            },
            body: JSON.stringify(exercisePayload),
          }
        );
 
        if (!exerciseResponse.ok) {
          throw new Error(
            `Failed to update exercise: ${exercise.nameOfExercise} - ${exerciseResponse.statusText}`
          );
        }
 
        console.log(`Exercise updated successfully: ${exercise.nameOfExercise}`);
      }
 
      // Refresh the workout list
      await context?.fetchWorkouts();
      Alert.alert("Success", "Workout and exercises updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    }
  };
 
  const deleteWorkout = async (workoutName: string) => {
    try {
      const workoutId = await fetchWorkoutById(workoutName);


      if (!workoutId) {
        Alert.alert("Error", "Failed to fetch workout ID.");
        return;
      }


      const response = await fetch(
        `http://ript-fitness-app.azurewebsites.net/workouts/deleteWorkout/${workoutId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${context?.data.token}`,
          },
        }
      );


      if (!response.ok) {
        throw new Error(`Failed to delete workout: ${response.statusText}`);
      }


      console.log("Workout deleted successfully");
      await context?.fetchWorkouts(); // Refresh the workout list
      Alert.alert("Success", "Workout deleted successfully!");
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };


  const fetchWorkoutById = async (workoutName: string): Promise<number | undefined> => {
    try {
      const response = await fetch(
        `http://ript-fitness-app.azurewebsites.net/workouts/getUsersWorkouts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${context?.data.token}`,
          },
        }
      );


      if (!response.ok) {
        throw new Error(`Failed to fetch workouts: ${response.statusText}`);
      }


      const workouts = await response.json();
      const matchedWorkout = workouts.find(
        (workout: any) => workout.name === workoutName
      );


      return matchedWorkout ? matchedWorkout.workoutsId : undefined;
    } catch (error) {
      console.error("Error fetching workout by name:", error);
      return undefined;
    }
  };








const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4", // Light gray background for better contrast
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  workoutItem: {
    backgroundColor: "#fff", // White card background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50", // Green text for workout names
    flex: 3,
  },
  buttonGroup: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
  },
  viewButton: {
    backgroundColor: "#4CAF50", // Fitness-friendly green color
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF6347", // Subtle red for delete
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay for focus
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    maxHeight: "90%", // Increased max height for better visibility
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  exerciseItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555", // Neutral gray for exercise names
    marginBottom: 10,
    textAlign: "center",
  },
  exerciseDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  exerciseDetailsHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  exerciseDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  exerciseDetailsText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
  },
  counterButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  counterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseNameInput: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    flex: 1,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4", // Match background with container
  },
  setValue: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    flex: 1,
  },
  addSetButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addSetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  removeSetButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  removeSetText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
 
});

return (
  <View style={styles.container}>
    {loading ? ( // Show ActivityIndicator if loading is true
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading Workouts...</Text>
      </View>
    ) : (
      <>
        <Text style={styles.title}></Text>
        <FlatList
          data={context?.workouts}
          keyExtractor={(item, index) =>
            item.id ? `workout-${item.id}-${index}` : `workout-${index}`
          }
          renderItem={({ item }) => (
            <View style={styles.workoutItem}>
              <Text style={styles.workoutName}>{item.name}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    Alert.alert(
                      "Confirm Delete",
                      `Are you sure you want to delete the workout "${item.name}"?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteWorkout(item.name),
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </>
    )}

    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedWorkout && (
            <>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    placeholder="Workout Name"
                  />
                  <FlatList
                    data={updatedExercises}
                    keyExtractor={(item, index) =>
                      `exercise-${item.exerciseId}-${index}`
                    }
                    renderItem={({ item, index }) => (
                      <View style={styles.exerciseCard}>
                        <TextInput
                          style={styles.exerciseNameInput}
                          value={item.nameOfExercise}
                          onChangeText={(text) => {
                            const updated = [...updatedExercises];
                            updated[index].nameOfExercise = text;
                            setUpdatedExercises(updated);
                          }}
                          placeholder="Exercise Name"
                        />
                        <FlatList
                          data={item.reps.map((_, setIndex) => ({
                            reps: item.reps[setIndex],
                            weight: item.weight[setIndex],
                          }))}
                          keyExtractor={(setItem, setIndex) =>
                            `set-${index}-${setIndex}`
                          }
                          renderItem={({ item: setItem, index: setIndex }) => (
                            <View style={styles.setRow}>
                              <Text style={styles.setLabel}>
                                Set {setIndex + 1}
                              </Text>
                              <TextInput
                                style={styles.setInput}
                                value={setItem.reps.toString()}
                                onChangeText={(text) => {
                                  const updated = [...updatedExercises];
                                  updated[index].reps[setIndex] =
                                    parseInt(text, 10) || 0;
                                  setUpdatedExercises(updated);
                                }}
                                placeholder="Reps"
                                keyboardType="numeric"
                              />
                              <TextInput
                                style={styles.setInput}
                                value={setItem.weight.toString()}
                                onChangeText={(text) => {
                                  const updated = [...updatedExercises];
                                  updated[index].weight[setIndex] =
                                    parseFloat(text) || 0;
                                  setUpdatedExercises(updated);
                                }}
                                placeholder="Weight"
                                keyboardType="numeric"
                              />
                              <TouchableOpacity
                                style={styles.removeSetButton}
                                onPress={() => {
                                  const updated = [...updatedExercises];
                                  updated[index].reps.splice(setIndex, 1);
                                  updated[index].weight.splice(setIndex, 1);
                                  setUpdatedExercises(updated);
                                }}
                              >
                                <Text style={styles.removeSetText}>
                                  Remove
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        />
                        <TouchableOpacity
                          style={styles.addSetButton}
                          onPress={() => {
                            const updated = [...updatedExercises];
                            updated[index].reps.push(0);
                            updated[index].weight.push(0);
                            setUpdatedExercises(updated);
                          }}
                        >
                          <Text style={styles.addSetText}>Add Set</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveWorkout}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>
                    {selectedWorkout.name}
                  </Text>
                  <FlatList
                    data={selectedWorkout.exercises || []}
                    keyExtractor={(item, index) =>
                      `exercise-${item.exerciseId}-${index}`
                    }
                    renderItem={({ item }) => (
                      <View style={styles.exerciseCard}>
                        <Text style={styles.exerciseName}>
                          {item.nameOfExercise}
                        </Text>
                        <FlatList
                          data={item.reps.map((_, setIndex) => ({
                            reps: item.reps[setIndex],
                            weight: item.weight[setIndex],
                          }))}
                          keyExtractor={(setItem, setIndex) =>
                            `set-${setIndex}`
                          }
                          renderItem={({
                            item: setItem,
                            index: setIndex,
                          }) => (
                            <View style={styles.setRow}>
                              <Text style={styles.setLabel}>
                                Set {setIndex + 1}
                              </Text>
                              <Text style={styles.setValue}>
                                Reps: {setItem.reps}
                              </Text>
                              <Text style={styles.setValue}>
                                Weight: {setItem.weight} lbs
                              </Text>
                            </View>
                          )}
                        />
                      </View>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  </View>
)};
