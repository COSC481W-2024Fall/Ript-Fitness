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
import TimeZone from "@/api/timeZone";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view"
import { KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Stopwatch from "./Stopwatch";
import { httpRequests } from "@/api/httpRequests";

export default function MyWorkoutsScreen() {
  const context = useContext(GlobalContext);


  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState<string>("");
  const [updatedExercises, setUpdatedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [checkboxStates, setCheckboxState] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Show loading indicator
      await context?.fetchWorkouts();
      setLoading(false); // Hide loading indicator
    };
    fetchData();
  }, []);
  const startWorkout = (workout: Workout) => {
    const initialState: { [key: string]: boolean } = {}; // Explicit type for dynamic keys

    workout.exercises.forEach((exercise, exerciseIndex) => {
      exercise.reps.forEach((_, setIndex) => {
        initialState[`${exerciseIndex}-${setIndex}`] = false; // This now works
      });
    });
    
    setCheckboxState(initialState);
    setSelectedWorkout(workout);
    setIsTracking(true);
  };
  
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
        `${httpRequests.getBaseURL()}/workouts/updateWorkout/${workoutId}`,
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
          `${httpRequests.getBaseURL()}/exercises/updateExercise`,
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
        `${httpRequests.getBaseURL()}/workouts/deleteWorkout/${workoutId}`,
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
        `${httpRequests.getBaseURL()}/workouts/getUsersWorkouts/0/10000`,
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







  const logWorkout = async () => {
    if (!selectedWorkout) {
      Alert.alert("Error", "No workout selected to log.");
      return;
    }

    try {
      const response = await fetch(
       `${httpRequests.getBaseURL()}/calendar/logWorkout?timeZone=${TimeZone.get()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context?.data.token}`,
          },
          body: JSON.stringify({ workoutId: selectedWorkout.id }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        if (errorMessage.includes("Workout already logged for this date")) {
          Alert.alert(
            "Duplicate Log",
            "A workout has already been logged for today."
          );
          return;
        }
        throw new Error(`Failed to log workout: ${errorMessage}`);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to log workout. Please check your network or try again later."
      );
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    // backgroundColor: "white", // Light gray background for better contrast
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },

  workoutItem: {
    backgroundColor: "#fff",
    width: '95%',
    height: 90,
    borderRadius: 10,
    // borderWidth: 0.3,
    // borderColor: 'grey',
    padding: 5,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "column", // Stack workout name and buttons vertically
    textAlign: 'left',
    paddingLeft: 10,
    alignSelf: 'center',
  },
  
  
  workoutName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    padding: 5,
    marginBottom: 15, // Add space between workout name and buttons
  },
  
  buttonGroup: {
    flexDirection: "row", // Align buttons in a row
    justifyContent: "space-evenly", // Even spacing between buttons
    width: "100%", // Buttons take up full width
  },
  
  viewButton: {
    backgroundColor: "white", // Fitness-friendly green color
    width: '30%',
    height: 30,
    padding: 5,
    borderRadius: 8,
    borderColor: '#21BFBF',
    borderWidth: 1, 
  },

  viewButtonText: {
    color: "#21BFBF",
    fontWeight: "bold",
    textAlign: "center",
  },

  deleteButton: {
    backgroundColor: "#F2505D", // Subtle red for delete
    width: '30%',
    height: 30,
    padding: 5,
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
    backgroundColor: "#f9f9f9",
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
    color: "black",
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
    color: "black", // Neutral gray for exercise names
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
    fontSize: 22,
    fontWeight: 'bold',
    // color: 'grey',
    // backgroundColor: "#fff",
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#21BFBF",
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
    backgroundColor: "#21BFBF",
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
    marginTop: 20,
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
    marginRight: -7,
    marginLeft: -7,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    marginRight: -10,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    flex: 1,
  },
  setInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 6, // Match original padding
    borderRadius: 5,
    fontSize: 16,
    textAlign: 'center', // Center align text
    minWidth: 60, // Keep input size consistent
    height: 30, // Match the height of the input boxes
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f4f4f4", // Match background with container
  },
  setValueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#555",
    textAlign: "center",
    flex: 1,
  }, 
  setValueTitleStart: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#555",
    textAlign: "right",
    flex: 1,
  }, 
  setValue: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    flex: 1,
  },
  addSetButton: {
    // backgroundColor: "#56C97B",
    paddingTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 2,
    // borderWidth: 1, 
    // borderColor: 'lightgrey',
    // borderRadius: 8,
    // marginTop: 10,
  },
  addSetText: {
    color: "#21BFBF",
    fontSize: 16,
    margin: 3, 
  },
  removeSetButton: {
    // backgroundColor: "lightgrey",
    // padding: 10,
    borderRadius: 8,
    alignItems: "center", 
  },
  removeSetText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#21BFBF", // Blue for Start Workout button
    width: '30%',
    height: 30,
    padding: 5,
    borderRadius: 8,
  },
  
  checkBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  
  checked: {
    color: "green",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  unchecked: {
    color: "gray",
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: "#21BFBF", // Green button for finishing workout
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  
  finishButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'column',
    marginRight: 20, // Space between inputs
    marginBottom: 2, // Space below each input container
    flex: 1.3, // Maintain proper sizing within the set row
  },
  inputHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 20, // Space between inputs
    marginBottom: 2, // Space below each input container
    flex: 1.3, // Maintain proper sizing within the set row
  }, 
  inputHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    // marginRight: 50,
    color: '#555',
  },
  // columnWrapper: {
  //   paddingHorizontal: 5, // Add padding to the left and right of the row
  // },

  
});

return (
  <View style={styles.container}>
    {loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading Workouts...</Text>
      </View>
    ) : (
      <>
      {/* <Stopwatch /> */}
        <FlatList
          data={context?.workouts}
          keyExtractor={(item, index) =>
            item.id ? `workout-${item.id}-${index}` : `workout-${index}`
          }
          // numColumns={1} // Specify two columns
          // columnWrapperStyle={styles.columnWrapper} // Add spacing between columns
          showsVerticalScrollIndicator= {false}
          renderItem={({ item }) => (
            <View style={styles.workoutItem}>
              <Text style={styles.workoutName}>{item.name}</Text>
              <View style={styles.buttonGroup}>
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
                  {/* <Ionicons name="trash-outline" size={25} color="#F2505D"></Ionicons> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => openModal(item)} // Open view modal
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => startWorkout(item)} // Open start workout modal
                >
                  <Text style={styles.buttonText}>Start</Text>
                  {/* <Ionicons name="arrow-up-circle" size={60} color="#21BFBF"></Ionicons> */}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </>
    )}

    {/* Modal for View and Edit */}
<Modal
  visible={isModalVisible && !isTracking}
  animationType="slide"
  transparent={true}
  onRequestClose={closeModal}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: -.1 }}
    >
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
              nestedScrollEnabled={true} // Allow FlatList to scroll inside ScrollView

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
                    <View style={styles.inputHeaderContainer}>
                      <Text style={styles.inputHeader}>Set</Text>
                      <Text style={styles.inputHeader}>Reps</Text>
                      <Text style={styles.inputHeader}>     Weight</Text>
                      <Text style={styles.inputHeader}></Text>
                    </View>
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
                          <Text style={styles.setLabel}>  {setIndex + 1}</Text>
                          
                          {/* Reps Label and Input */}
                          <View style={styles.inputContainer}>
                            {/* <Text style={styles.inputLabel}></Text> */}
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
                          </View>

                          {/* Weight Label and Input */}
                          <View style={styles.inputContainer}>
                            {/* <Text style={styles.inputLabel}></Text> */}
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
                          </View>

                          
                          <TouchableOpacity
                            style={styles.removeSetButton}
                            onPress={() => {
                              const updated = [...updatedExercises];
                              updated[index].reps.splice(setIndex, 1);
                              updated[index].weight.splice(setIndex, 1);
                              setUpdatedExercises(updated);
                            }}
                          >
                            <Ionicons name="trash-outline" size={25} color="#F2505D"></Ionicons>
                            {/* <Text style={styles.removeSetText}>
                              Remove
                            </Text> */}
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
                      {/* <Text style={styles.addSetText}>Add Set</Text> */}
                      <Text style={styles.addSetText}>Add Set</Text>
                      <Ionicons name="add-circle-outline" size={20} color={'#21BFBF'}></Ionicons>
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
              <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
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
                    <View style={styles.setRow}>
                      <Text style={styles.setLabel}>Set</Text>
                      <Text style={styles.setValueTitle}>Reps</Text>
                      <Text style={styles.setValueTitle}>Weight</Text>
                    </View>
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
                            {setIndex + 1}
                          </Text>
                          <Text style={styles.setValue}>
                            {setItem.reps}
                          </Text>
                          <Text style={styles.setValue}>
                            {setItem.weight} lbs
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
    </KeyboardAvoidingView>
    </View>
  </View>
</Modal>


   {/* Modal for Start Workout */}
<Modal
  visible={isTracking}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setIsTracking(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {selectedWorkout && (
        <>
          <Text style={styles.modalTitle}>
            Start {selectedWorkout.name}
          {/* <Stopwatch />  */}
          </Text>
          <FlatList
              data={selectedWorkout.exercises || []}
              keyExtractor={(item, index) => `exercise-${item.exerciseId}-${index}`}
              renderItem={({ item, index: exerciseIndex }) => (
                <View style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{item.nameOfExercise}</Text>
                  <View style={styles.labelRow}>
                      <Text style={styles.setLabel}>Set</Text>
                      <Text style={styles.setValueTitleStart}>Reps</Text>
                      <Text style={styles.setValueTitleStart}>Weight</Text>
                      <Ionicons style={{ marginLeft: '10%', marginRight: '5%' }} name="checkmark" size={30} color="#555" />
                      {/* <Text style={styles.setValueTitleStart}>Finish</Text> */}
                  </View>
                  
                  {/* Replace the nested FlatList with map() */}
                  {item.reps.map((rep, setIndex) => (
                    <View key={`set-${exerciseIndex}-${setIndex}`} style={styles.setRow}>
                      <Text style={styles.setLabel}> {setIndex + 1}</Text>
                      <Text style={styles.setValue}>{rep}</Text>
                      <Text style={styles.setValue}>{item.weight[setIndex]} lbs</Text>

                      {/* Checkbox */}
                      <TouchableOpacity
                        style={styles.checkBox}
                        onPress={() => {
                          const key = `${exerciseIndex}-${setIndex}`;
                          setCheckboxState((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }));
                        }}
                      >
                        <Text
                          style={
                            checkboxStates[`${exerciseIndex}-${setIndex}`]
                              ? styles.checked
                              : styles.unchecked
                          }
                        >
                        {checkboxStates[`${exerciseIndex}-${setIndex}`] ? "✔" : " "}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            />

         <TouchableOpacity
                style={styles.finishButton}
                onPress={async () => {
                  await logWorkout();
                  setIsTracking(false);
                }}
              >
                <Text style={styles.finishButtonText}>Finish Workout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsTracking(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>

  </View>
)};
