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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import { GlobalContext, Workout, Exercise } from "@/context/GlobalContext";
import { WorkoutContext } from "@/context/WorkoutContext";
import TimeZone from "@/api/timeZone";
import { httpRequests } from "@/api/httpRequests";
import { WorkoutScreenNavigationProp } from "@/app/(tabs)/WorkoutStack";
import Stopwatch from "./Stopwatch"; // If you need the stopwatch, uncomment in JSX
import PlateCalculatorScreen from "./PlateCalculatorScreen";

export default function MyWorkoutsScreen() {
  const context = useContext(GlobalContext);
  const workoutContext = useContext(WorkoutContext);

  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const isDarkMode = context?.isDarkMode;

  // ------------------------------------------------------------------
  // States
  // ------------------------------------------------------------------

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState<string>("");
  const [updatedExercises, setUpdatedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [checkboxStates, setCheckboxState] = useState<{ [key: string]: boolean }>({});

  // For set-timing
  const [startTime, setStartTime] = useState<{ [key: string]: ReturnType<typeof setInterval> }>({});
  const [timeRanges, setTimeRanges] = useState<{ [key: string]: string }>({});
  const [currentTimer, setCurrentTimer] = useState<number | null>(null);
  const [activeSet, setActiveSet] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Fetch Workouts on Mount
  // ------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await context?.fetchWorkouts();
      setLoading(false);
    };
    fetchData();
  }, []);

  // ------------------------------------------------------------------
  // Starting a Workout
  // ------------------------------------------------------------------

  const startWorkout = (workout: Workout) => {
    // Build initial checkboxes for each set
    const initialState: { [key: string]: boolean } = {};
    workout.exercises.forEach((exercise, exIndex) => {
      exercise.reps.forEach((_, setIndex) => {
        initialState[`${exIndex}-${setIndex}`] = false;
      });
    });

    setCheckboxState(initialState);
    setSelectedWorkout(workout);
    setIsTracking(true);
  };

  // Format elapsed time into "X hr Y min Z sec"
  const formatTimeRange = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hrs > 0 ? `${hrs} hr` : "",
      mins > 0 ? `${mins} min` : "",
      `${secs} sec`,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // Stop timer for one set
  const stopTimerForSet = (setKey: string) => {
    if (!startTime[setKey]) return;

    clearInterval(startTime[setKey]);
    setStartTime((prev) => {
      const copy = { ...prev };
      delete copy[setKey];
      return copy;
    });

    if (currentTimer !== null) {
      const elapsedSeconds = currentTimer;
      const formattedTime = formatTimeRange(elapsedSeconds);

      // Save to shared context
      workoutContext?.setTimeRanges((prev) => ({
        ...prev,
        [setKey]: formattedTime,
      }));
      // Local state
      setTimeRanges((prev) => ({
        ...prev,
        [setKey]: formattedTime,
      }));
    }
    setActiveSet(null);
    setCurrentTimer(null);
  };

  // ------------------------------------------------------------------
  // View & Edit Modal
  // ------------------------------------------------------------------

  const openModal = async (workout: any) => {
    const workoutId = workout.workoutsId;
    console.log("fetched workoutID:", workoutId);
    try {
      const res = await fetch(`${httpRequests.getBaseURL()}/workouts/${workoutId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context?.data.token}`,
        },
      });
      console.log("[DEBUG] Workout details fetch status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("[DEBUG] Workout details fetch response:", errorText);
        throw new Error("Failed to fetch workout exercises");
      }

      const fullWorkout = await res.json();
      const patchedWorkout: Workout = {
        ...workout,
        id: (workout as any).workoutsId ?? workout.id,
      };

      setSelectedWorkout(patchedWorkout);
      setWorkoutName(patchedWorkout.name);
      setUpdatedExercises([...patchedWorkout.exercises]);

    setIsEditing(false);
    setIsModalVisible(true);
  } catch (err) {
    console.error("Error loading workout details:", err);
    Alert.alert("Error", "Failed to load workout details.");
  }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setStartTime({});
    setTimeRanges({});

    if (selectedWorkout) {
      // revert changes if not saved
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
    if (workoutName.trim() === "") {
      Alert.alert("Error", "Workout Name cannot be empty");
      return;
    }

    try {
      const workoutId = await fetchWorkoutById(selectedWorkout.name);
      if (!workoutId) {
        Alert.alert("Error", "Failed to fetch workout ID.");
        return;
      }

      // Update name
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
          sets: exercise.reps.length,
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

      // Refresh
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
      await context?.fetchWorkouts();
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
      const matchedWorkout = workouts.find((w: any) => w.name === workoutName);
      return matchedWorkout ? matchedWorkout.workoutsId : undefined;
    } catch (error) {
      console.error("Error fetching workout by name:", error);
      return undefined;
    }
  };

  // For logging a workout to the calendar
  const logWorkout = async () => {
    if (!selectedWorkout) {
      Alert.alert("Error", "No workout selected to log.");
      return;
    }

    try {
      const formBody = new URLSearchParams();
      formBody.append("workoutId", String(selectedWorkout.id));
      const response = await fetch(
        `${httpRequests.getBaseURL()}/calendar/logWorkout?workoutId=${selectedWorkout.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${context?.data.token}`,
          },
          body: formBody.toString()
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        if (errorMessage.includes("Workout or Rest day already logged for this date")) {
          Alert.alert("Duplicate Log", "A workout has already been logged for today.");
          return;
        }
        throw new Error(`Failed to log workout: ${errorMessage}`);
      }

      console.log("Workout logged successfully");
      Alert.alert("Success", "Workout logged!");
    } catch (error) {
      console.log("Workout or Rest day already logged for this date");
      Alert.alert("Workout or Rest day already logged for this date");
    }
  };

  // ------------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------------

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10,
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    darkContainer: {
      flex: 1,
      paddingTop: 10,
      backgroundColor: "black",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    workoutItem: {
      backgroundColor: "#fff",
      width: "95%",
      height: 90,
      borderRadius: 10,
      padding: 5,
      marginBottom: 15,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: "column",
      textAlign: "left",
      paddingLeft: 10,
      alignSelf: "center",
    },
    darkWorkoutItem: {
      backgroundColor: "#333333",
      width: "95%",
      height: 90,
      borderRadius: 10,
      padding: 5,
      marginBottom: 15,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: "column",
      textAlign: "left",
      paddingLeft: 10,
      alignSelf: "center",
    },
    workoutName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "black",
      padding: 5,
      marginBottom: 15,
    },
    darkWorkoutName: {
      fontSize: 18,
      fontWeight: "bold",
      padding: 5,
      marginBottom: 15,
      color: "white",
    },
    buttonGroup: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
    },
    viewButton: {
      backgroundColor: "white",
      width: "30%",
      height: 30,
      padding: 5,
      borderRadius: 8,
      borderColor: "#21BFBF",
      borderWidth: 1,
    },
    viewButtonText: {
      color: "#21BFBF",
      fontWeight: "bold",
      textAlign: "center",
    },
    deleteButton: {
      backgroundColor: "#F2505D",
      width: "30%",
      height: 30,
      padding: 5,
      borderRadius: 8,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
    },
    startButton: {
      backgroundColor: "#21BFBF",
      width: "30%",
      height: 30,
      padding: 5,
      borderRadius: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "95%",
      backgroundColor: "#f9f9f9",
      borderRadius: 15,
      padding: 20,
      maxHeight: "90%",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    darkModalContent: {
      width: "95%",
      backgroundColor: "#333",
      borderRadius: 15,
      padding: 20,
      maxHeight: "90%",
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
    darkModalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginBottom: 20,
      textAlign: "center",
    },

    // Input for Workout Name, etc.
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      padding: 10,
      marginVertical: 10,
      fontSize: 22,
      fontWeight: "bold",
      backgroundColor: "#f9f9f9",
    },
    darkInput: {
      borderRadius: 10,
      padding: 10,
      marginVertical: 10,
      fontSize: 22,
      fontWeight: "bold",
      color: "white",
      backgroundColor: "#777",
    },

    // Card style for exercises
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
    darkExerciseCard: {
      backgroundColor: "#666",
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
    exerciseName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "black",
      marginBottom: 10,
      textAlign: "center",
    },
    darkExerciseName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
      marginBottom: 10,
      textAlign: "center",
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
    darkExerciseNameInput: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
      marginBottom: 10,
      borderRadius: 8,
      padding: 8,
      backgroundColor: "#777",
      marginRight: -7,
      marginLeft: -7,
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#f2f2f2",
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      paddingHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    setLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#555",
      flex: 1,
      textAlign: "center",
    },
    darkSetLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: "white",
      flex: 1,
      textAlign: "center",
    },
    setValue: {
      fontSize: 14,
      color: "#555",
      textAlign: "center",
      flex: 1,
    },
    darkSetValue: {
      fontSize: 14,
      color: "white",
      textAlign: "center",
      flex: 1,
    },
    setValueTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#555",
      textAlign: "center",
      flex: 1,
    },
    darkSetValueTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
      flex: 1,
    },
    setValueTitleStart: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#555",
      textAlign: "right",
      flex: 1,
    },
    darkSetValueTitleStart: {
      fontSize: 16,
      fontWeight: "bold",
      color: "white",
      textAlign: "right",
      flex: 1,
    },
    setInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 6,
      borderRadius: 5,
      fontSize: 16,
      textAlign: "center",
      minWidth: 60,
      height: 30,
    },
    darkSetInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 6,
      borderRadius: 5,
      fontSize: 16,
      textAlign: "center",
      minWidth: 60,
      height: 30,
      color: "white",
    },
    setLabelIcon: {
      flex: 1,
      textAlign: "center",
    },
    addSetButton: {
      paddingTop: 3,
      flexDirection: "row",
      alignItems: "center",
    },
    addSetText: {
      color: "#21BFBF",
      fontSize: 16,
      margin: 3,
    },
    removeSetButton: {
      borderRadius: 8,
      alignItems: "center",
    },
    removeSetText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    editButton: {
      backgroundColor: "#21BFBF",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    saveButton: {
      backgroundColor: "#21BFBF",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
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
      color: "#21BFBF",
      fontWeight: "bold",
      fontSize: 16,
    },
    unchecked: {
      color: "gray",
      fontSize: 16,
    },
    finishButton: {
      backgroundColor: "#21BFBF",
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
    miniButton: {
      backgroundColor: "#21BFBF",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 80,
    },
    miniButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
    helperText: {
      color: "#888",
      fontSize: 16,
      textAlign: "center",
      marginTop: "60%",
      marginVertical: 350,
    },
    editButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    saveButtonText: {
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
    
  });

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <View testID='screen-container' style={[isDarkMode ? styles.darkContainer : styles.container]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading Workouts...</Text>
        </View>
      ) : (
        <>
          {/* <Stopwatch /> -- If needed */}
          <FlatList
            data={context?.workouts}
            keyExtractor={(item, index) =>
              item.id ? `workout-${item.id}-${index}` : `workout-${index}`
            }
            // numColumns={1} // Specify two columns
            // columnWrapperStyle={styles.columnWrapper} // Add spacing between columns
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={isDarkMode ? styles.darkWorkoutItem : styles.workoutItem}>
                <Text style={isDarkMode ? styles.darkWorkoutName : styles.workoutName}>
                  {String(item.name)}
                </Text>
                <View style={styles.buttonGroup}>
                  {/* Delete button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      Alert.alert(
                        "Confirm Delete",
                        `Are you sure you want to delete the workout "${String(item.name)}"?`,
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

                  {/* View button */}
                  <TouchableOpacity style={styles.viewButton} onPress={() => openModal(item)}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>

                  {/* Start button */}
                  <TouchableOpacity style={styles.startButton} onPress={() => startWorkout(item)}>
                    <Text style={styles.buttonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* If there are no workouts, show helper text */}
      <View style={{ justifyContent: "center", alignContent: "center", alignSelf: "center" }}>
        {(!context?.workouts || context.workouts.length === 0) && (
          <Text style={styles.helperText} numberOfLines={1}>
            Please add a workout!
          </Text>
        )}
      </View>

      {/* ----------------------------------------------------------------
          MODAL #1: View & Edit
         ---------------------------------------------------------------- */}
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
                      <Text style={styles.inputHeader}>Weight</Text>
                      <Text style={styles.inputHeader}></Text>
                    </View>
                    <FlatList
                      data={item.reps.map((_, setIndex) => ({
                        reps: item.reps[setIndex],
                        weight: item.weight[setIndex],
                        // Retrieves the recorded time range for the set or defaults to "Not Started".
                        timeRange: timeRanges[`${selectedWorkout?.id}-${item.exerciseId}-${setIndex}`] || "Not Started",
                      }))}
                      keyExtractor={(setItem, setIndex) =>
                        `set-${item.exerciseId}-${setIndex}`
                      }
                      renderItem={({ item: setItem, index: setIndex }) => (
                          <View style={[styles.setRow, { alignItems: 'center' }]}>  
                            <Text style={{ flex: 0.5, fontWeight: 'bold' }}>{setIndex + 1}</Text>

                          {/* Reps Label and Input */}
                          <TextInput
                          style={[styles.setInput, { flex: 0.6, marginHorizontal: 15 }]}
                          value={setItem.reps.toString()}
                          onChangeText={(text) => {
                            const updated = [...updatedExercises];
                            updated[index].reps[setIndex] = parseInt(text, 10) || 0;
                            setUpdatedExercises(updated);
                          }}
                          placeholder="Reps"
                          keyboardType="numeric"
                        />

                          {/* Weight Label and Input */}
                          <TextInput
                          style={[styles.setInput, {flex: 0.6, marginHorizontal: 15 }]}
                          value={setItem.weight.toString()}
                          onChangeText={(text) => {
                            const updated = [...updatedExercises];
                            updated[index].weight[setIndex] = parseFloat(text) || 0;
                            setUpdatedExercises(updated);
                          }}
                          placeholder="Weight"
                          keyboardType="numeric"
                        />

                          <TouchableOpacity
                            onPress={() => {
                              const updated = [...updatedExercises];
                              updated[index].reps.splice(setIndex, 1);
                              updated[index].weight.splice(setIndex, 1);
                              setUpdatedExercises(updated);
                            }}
                          >
                            <Ionicons name="trash-outline" size={25} style={{ paddingLeft: 20 }} color="#F2505D"></Ionicons>
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
                renderItem={({ item,index: exerciseIndex }) => (
                  <View style={styles.exerciseCard}>
                    <Text style={styles.exerciseName}>
                      {item.nameOfExercise}
                    </Text>
                    <View style={styles.setRow}>
                      <Text style={[styles.setLabel, { flex: 0.5, textAlign: "left", paddingLeft: 10 }]}>Set</Text>
                      <Text style={[styles.setValueTitle, { flex: 1, textAlign: "center", paddingHorizontal: 5 }]}>Reps</Text>
                      <Text style={[styles.setValueTitle, { flex: 1, textAlign: "center", paddingHorizontal: 5 }]}>Weight</Text>
                      <Text style={[styles.setValueTitle, { flex: 1.2, textAlign: "left", paddingRight: 10 }]}>Time</Text>
                    </View>
                    <FlatList
                      data={item.reps.map((_, setIndex) => ({
                        reps: item.reps[setIndex],
                        weight: item.weight[setIndex],
                         // Retrieves the time range for the set, defaulting to "Not Started" if unavailable.
                        timeRange: timeRanges[`${selectedWorkout?.id}-${item.exerciseId}-${setIndex}`] || "Not Started",
                      }))}
                      keyExtractor={(setItem, setIndex) =>
                        `set-${item.exerciseId}-${setIndex}`
                      }
                      renderItem={({
                        item: setItem,
                        index: setIndex,
                      }) => {
                        const setKey = `${selectedWorkout?.id}-${item.exerciseId}-${setIndex}`;
                        const isActive = activeSet === setKey; // Check if the current set is being timed.
                                              
                     return(
                        <View style={styles.setRow}>
                          <Text style={styles.setLabel}>
                            {setIndex + 1}
                          </Text>
                          <Text style={styles.setValue}>
                            {setItem.reps ?? "N/A"}
                          </Text>
                          <Text style={styles.setValue}>
                            {item.weight[setIndex]} lbs
                          </Text>
                          <Text style={styles.setValue}>
                            {setItem.timeRange}         {/* Display recorded time range */}
                          </Text>


                          {/* Start and Stop button */}
                          {!isActive ? (
                              <TouchableOpacity
                                style={[styles.startButton, { width: 40, height: 30, padding: 3 }]} // Adjusts start button size and padding
                                onPress={() => {
                                  //const setKey = `${selectedWorkout?.id}-${item.exerciseId}-${setIndex}`;
                                  setActiveSet(setKey); // Set the currently active set being timed
                                  setCurrentTimer(0); // Initialize the timer
                                  const interval = setInterval(() => {
                                    setCurrentTimer((prev) => (prev !== null ? prev + 1 : 1)); // Increment every second
                                  }, 1000);  
                                  setStartTime((prev) => ({ ...prev, [setKey]: interval })); // Save the interval ID
                                }}
                              >
                                <Text style={styles.buttonText}>Start</Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={[styles.startButton, { backgroundColor: "red",  width: 40, height: 30, padding: 3 }]}// Adjusts button size and padding
                                  onPress={() => stopTimerForSet(setKey)} // Stop the timer and save the elapsed time             
                                >
                                  <Text style={styles.buttonText}>Stop</Text>
                                </TouchableOpacity>
                              )}
                        </View>
                      )}
                      }
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

      {/* ----------------------------------------------------------------
          MODAL #2: Start Workout
         ---------------------------------------------------------------- */}
      <Modal
        visible={isTracking}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTracking(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={isDarkMode ? styles.darkModalContent : styles.modalContent}>
            {selectedWorkout && (
              <>
                <Text style={isDarkMode ? styles.darkModalTitle : styles.modalTitle}>
                  Start {selectedWorkout.name}
                </Text>

                <FlatList
                  data={selectedWorkout.exercises || []}
                  keyExtractor={(item, index) => `exercise-${item.exerciseId}-${index}`}
                  renderItem={({ item, index: exerciseIndex }) => (
                    <View style={isDarkMode ? styles.darkExerciseCard : styles.exerciseCard}>
                      <Text style={isDarkMode ? styles.darkExerciseName : styles.exerciseName}>
                        {item.nameOfExercise}
                      </Text>

                      <View style={styles.labelRow}>
                        <Text style={isDarkMode ? styles.darkSetLabel : styles.setLabel}>Set</Text>
                        <Text
                          style={
                            isDarkMode
                              ? styles.darkSetValueTitleStart
                              : styles.setValueTitleStart
                          }
                        >
                          Reps
                        </Text>
                        <Text
                          style={
                            isDarkMode
                              ? styles.darkSetValueTitleStart
                              : styles.setValueTitleStart
                          }
                        >
                          Weight
                        </Text>
                        <Text
                          style={isDarkMode ? styles.darkSetValueTitle : styles.setValueTitle}
                        >
                          Time
                        </Text>
                        <Ionicons
                          style={styles.setLabelIcon}
                          name="checkmark"
                          size={24}
                          color={isDarkMode ? "white" : "#555"}
                        />
                      </View>

                      {item.reps.map((rep, setIndex) => {
                        const setKey = `${selectedWorkout?.id}-${item.exerciseId}-${setIndex}`;
                        const isActive = activeSet === setKey;
                        const timeRange = workoutContext?.timeRanges[setKey] || "Not Started";

                        return (
                          <View key={`set-${exerciseIndex}-${setIndex}`} style={styles.setRow}>
                            <Text style={isDarkMode ? styles.darkSetLabel : styles.setLabel}>
                              {setIndex + 1}
                            </Text>
                            <Text style={isDarkMode ? styles.darkSetValue : styles.setValue}>
                              {rep}
                            </Text>
                            <Text style={isDarkMode ? styles.darkSetValue : styles.setValue}>
                              {item.weight[setIndex]} lbs
                            </Text>
                            <Text style={isDarkMode ? styles.darkSetValue : styles.setValue}>
                              {timeRange}
                            </Text>

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
                        );
                      })}
                    </View>
                  )}
                />

                {/* Buttons for finishing, closing, and Plate Calculator */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                  {/* Left side: Finish + Close */}
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <TouchableOpacity
                      style={[styles.miniButton, { marginBottom: 10 }]}
                      onPress={async () => {
                        await logWorkout();
                        setIsTracking(false);
                        Alert.alert("Get Ript!", "You have logged a workout! Check the calendar.");
                      }}
                    >
                      <Text style={styles.miniButtonText}>Finish</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.miniButton} onPress={() => setIsTracking(false)}>
                      <Text style={styles.miniButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Plate Calculator */}
                  <TouchableOpacity
                    style={[
                      styles.miniButton,
                      {
                        aspectRatio: 1,
                        height: 92,
                        alignSelf: "flex-start",
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => navigation.navigate("PlateCalculatorScreen" as never)}
                  >
                    <Ionicons name="barbell-outline" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
