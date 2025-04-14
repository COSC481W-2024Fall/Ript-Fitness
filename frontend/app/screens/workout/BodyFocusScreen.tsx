import React, { useState, useEffect,useRef } from 'react';
import { View, Text, StyleSheet, Modal, Button, FlatList, TouchableOpacity, ActivityIndicator,PanResponder, Animated } from 'react-native';
import BodyDiagram from '@/components/BodyDiagram';
import { httpRequests } from '@/api/httpRequests'; // Use named import
import { ScrollView } from 'react-native';
import { useContext } from 'react';
import { RouteProp } from '@react-navigation/native'; // Import RouteProp
import { GlobalContext } from '@/context/GlobalContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WorkoutScreenNavigationProp,WorkoutStackParamList } from '@/app/(tabs)/WorkoutStack';
import { Exercise } from "@/context/GlobalContext";

// Define the BodyPart type
export type BodyPart = 'Core' | 'Legs' | 'Arms' | 'Back' | 'Shoulders'| 'Chest'| 'Cardio'; // Example of defining BodyPart as a type

// Define the route type for BodyFocusScreen
type BodyFocusScreenRouteProp = RouteProp<WorkoutStackParamList, 'BodyFocusScreen'>;

export default function BodyFocusScreen() {
 // Move context declaration to the top
  const context = useContext(GlobalContext);
  const token = context?.data?.token??''; //Access the context data with the defined type
  const exerciseList = context?.exerciseList; // Use from GlobalContext
  const setExerciseList = context?.setExerciseList; // Use from GlobalContext

 // State variables to manage selected body part, exercise list, modal visibility, and view mode
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  //const [exerciseList, setExerciseList] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [isFrontView, setIsFrontView] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const route = useRoute<BodyFocusScreenRouteProp>(); // Type the route
 // State for tutorial overlay
 const [showTutorial, setShowTutorial] = useState(true); // Show tutorial on first load
 const [tutorialOpacity] = useState(new Animated.Value(1)); // For fade-out animation

 // Ref to trigger animation in BodyDiagram
  const bodyDiagramRef = useRef<{ triggerAllAnimations:() => void }>(null);
  
  //chatGPT assisted with this section
  const [workoutData, setWorkoutData] = useState<{
    front: { [key in BodyPart]?: Exercise[] };
    back: { [key in BodyPart]?: Exercise[] };
  }>({
    front: {},
    back: {},
  });

  const [error, setError] = useState<string | null>(null);

  const isDarkMode = context?.isDarkMode; 

// Map BodyPart to backend `exerciseType`
const bodyPartToType: { [key in BodyPart]: number[] } = {
  Arms: [1],
  Shoulders: [2],
  Legs: [5],
  Core: [4],
  Back: [6,7],
  Chest: [3],
  Cardio:[8]
};

// Fetch workouts from backend API when a body part is selected
useEffect(() => {
  let isMounted = true; // Prevents setting state after unmount

  if (!selectedPart || token.trim() === "") {
    return;
  }

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);

    try {
      const exerciseTypes = bodyPartToType[selectedPart]; // Get exercise type
      if (!exerciseTypes) {
        throw new Error(`Invalid body part: ${selectedPart}`);
      }

      let allExercises: Exercise[] = [];

      for (const type of exerciseTypes) {
        const response = await httpRequests.get(`/exercises/getByType/${type}`, token);

        if (isMounted && response) {
          const exercisesWithNames = response.map((exercise: any) => exercise.nameOfExercise);
          allExercises = [...allExercises, ...response];
        }
      }

      // remove duplicates based on nameOfExercise
    const uniqueMap = new Map<string, Exercise>();
    for (const exercise of allExercises) {
      if (!uniqueMap.has(exercise.nameOfExercise)) {
        uniqueMap.set(exercise.nameOfExercise, exercise);
      }
    }
    const uniqueExercises = Array.from(uniqueMap.values());

      if (isMounted) {
        setWorkoutData(prev => ({
          ...prev,
          [isFrontView ? 'front' : 'back']: {
            ...prev[isFrontView ? 'front' : 'back'],
            [selectedPart]: uniqueExercises,
          },
        }));
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (isMounted) setError(err.message || "Failed to fetch workout data");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchWorkouts();

  return () => {
    isMounted = false; // Prevents memory leaks
  };
}, [selectedPart, token]);

// Auto-hide tutorial after 3 seconds
useEffect(() => {
  if (showTutorial) {
    const timer = setTimeout(() => {
      Animated.timing(tutorialOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowTutorial(false);
      });
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }
}, [showTutorial]);

  // Handles body part selection and opens the modal if valid
  const handleBodyPartClick = (part: BodyPart) => {
    console.warn("handleBodyPartClick invoked with:", part);
    if (isFrontView && (part === 'Back' || part === 'Shoulders')) {
      console.warn("Ignored: Front view cannot select Back or Shoulders");
      return;
    }
    if (!isFrontView && part !== 'Back' && part !== 'Shoulders') {
      console.warn("Ignored: Back view allows only Back or Shoulders");
      return;
    }
    setSelectedPart(part);
    console.warn("selectedPart state set to:", part);
    setModalVisible(true);
  };
  

  // Toggles selection of exercises in the modal
  const toggleExerciseSelection = (exercise: string) => {
    setSelectedExercises(prev => {
      const newSet = new Set(prev);
      newSet.has(exercise) ? newSet.delete(exercise) : newSet.add(exercise);
      return newSet;
    });
  };

  const selectedExercisesList: Exercise[] = isFrontView
  ? workoutData.front?.[selectedPart as BodyPart] || []
  : workoutData.back?.[selectedPart as BodyPart] || [];
  // Saves selected exercises to the main exercise list and closes the modal
    const saveSelectedExercises = () => {
      console.log("Selected exercises to save:", Array.from(selectedExercises));
        
 
      // extract full objects of current modal display
      const selectedExerciseObjects = selectedExercisesList.filter(
        ex => selectedExercises.has(ex.nameOfExercise)
      );

      // save to context: dynamic reps/weight come from these real objects
      if (context?.setSelectedExerciseObjects) {
        const existing = context.selectedExerciseObjects || [];
        const existingNames = new Set(existing.map(e => e.nameOfExercise));
        const newUnique = selectedExerciseObjects.filter(e => !existingNames.has(e.nameOfExercise));
        const merged = [...existing, ...newUnique];
      
        context.setSelectedExerciseObjects(merged);
      }
      
  // save nameOfExercise to UI used exerciseList (left list highlight used)
      if (setExerciseList) {
        setExerciseList(new Set([...exerciseList || [], ...selectedExercises]));}
      setSelectedExercises(new Set());
      setModalVisible(false);
    };

  const viewSelectedExercises = () => {
    
    navigation.navigate('SelectedExercises', { exercises: Array.from(exerciseList || []) });
    };

  // Toggles between front and back body diagram views
  const toggleView = (direction: 'left' | 'right') => {
    // Trigger animation in BodyDiagram
    if (bodyDiagramRef.current) {
      bodyDiagramRef.current.triggerAllAnimations();
    }
    
    setIsFrontView(prev => {
      const newView = !prev;
      // If switching to the back view while a front-view body part is selected, clear the selection.
      if (newView === false 
        && (selectedPart === "Legs" || selectedPart === "Arms" || selectedPart === "Core"|| selectedPart === "Chest"|| selectedPart === "Cardio")) {
        setSelectedPart(null);
      }
      // If switching to the front view while a back-view body part is selected, clear the selection.
      if (newView === true && (selectedPart === "Back" || selectedPart === "Shoulders")) {
        setSelectedPart(null);
      }
      return newView;
    });
  };

  // PanResponder for handling swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only handle horizontal movements
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      // When the user starts swiping, hide the tutorial immediately
      if (showTutorial) {
        Animated.timing(tutorialOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowTutorial(false);
        });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx } = gestureState;
      if (dx > 50) {
        toggleView('right');
      } else if (dx < -50) {
        toggleView('left');
      }
    },
  });

// Flatten just in case items are arrays or weirdly structured
const flattened = [...(exerciseList || [])].flat().map(e => String(e).trim());
const uniqueExerciseList = Array.from(new Set(flattened));


  return (
    <View style={isDarkMode?styles.darkContainer:styles.container} {...panResponder.panHandlers}>
       {/* Displays the selected exercises as touchable text */}
       <TouchableOpacity
        onPress={viewSelectedExercises}
        disabled={!exerciseList || exerciseList.size === 0}
        style={styles.viewExercisesButton}
      >
        <Text style={styles.viewExercisesButtonText}>
          View Selected Exercises ({exerciseList?.size || 0})
        </Text>
      </TouchableOpacity>

      {/* Displays the interactive body diagram */}
      <View style={styles.bodyDiagramContainer}>
        <BodyDiagram
          ref={bodyDiagramRef}
          onBodyPartClick={handleBodyPartClick}
          imageSource={isFrontView ? require('@/assets/images/body-diagram.png') : require('@/assets/images/body-diagram-back.png')}
          isFrontView={isFrontView} 
          triggerAnimation={() => bodyDiagramRef.current?.triggerAllAnimations()}
        />
      </View>

       {/* Modal for selecting exercises */}
      <Modal animationType="slide" transparent visible={modalVisible} 
            onRequestClose={() => {
              setSelectedExercises(new Set()); // clear selection
              setModalVisible(false);
            }}
        >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Exercises for {selectedPart}</Text>

          <FlatList
            style={styles.scrollContainer}
            data={selectedExercisesList}
            keyExtractor={(item) => item.exerciseId?.toString() ?? item.nameOfExercise}
            renderItem={({ item }) => (
              <TouchableOpacity 
                  onPress={() => toggleExerciseSelection(item.nameOfExercise)} 
                  style={styles.exerciseOption}
              >
                  <Text style = {{
                    color: selectedExercises.has(item.nameOfExercise) ? 'rgb(19, 245, 61)' : 'rgb(23, 220, 220)',
                    textAlign: 'center', 
                    fontSize: 16,
                    marginBottom: 20, 
                    }}>
                      {item.nameOfExercise}
                    </Text>
                  </TouchableOpacity>
            )}
            
            numColumns={1}           
          />
          <TouchableOpacity onPress={saveSelectedExercises} style={styles.customButton}>
            <Text style={styles.customButtonText}>Save Selected Exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
            setSelectedExercises(new Set()); // clear selection
            setModalVisible(false); // close Modal
          }}
          >

          <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

        </View>
      </Modal>

    {/* Tutorial Overlay */}
    {showTutorial && (
        <Animated.View style={[styles.tutorialOverlay, { opacity: tutorialOpacity }]}>
          <Text style={styles.tutorialText}>
          ← Swipe 180° →
          </Text>
        </Animated.View>
      )}

    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "#fff", 
  },
  darkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "rgba(0, 0, 7, 0.82)", 
  },
  exerciseContainer: {  // Controls the layout of the selected exercises section
    marginTop: 510,     // Adjusts the vertical position of the section
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },

  exerciseTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#21BFBF',
  },
  selectedBodyPart: {
    fontWeight: 'bold', // Adjust as needed
    fontSize: 14, // Adjust as needed
    color: '#21BFBF', // Adjust as needed
  },
  exerciseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  exerciseListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxHeight: 180, // Limit list to 6 rows, each around 30px
  },
  exerciseText: {
    fontSize: 14,
    color: '#21BFBF',
    textAlign: 'center',
    marginHorizontal: 5,
  },
  bodyDiagramContainer: {
    position: 'absolute',
    top: 490,  // Adjust this value to move the body diagram up or down
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  toggleButton: {
    backgroundColor: '#21BFBF',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    width: 150,  
    height: 30, 
    justifyContent: 'center',
    shadowColor: '#21BFBF', // Glow color matches the button
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 60, // For Android
  },
  toggleButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },

  modalView: {
    width: '80%',
    marginTop: 70, 
    margin: 38,
    minHeight: 200, // **Set a minimum height to prevent it from being too small.**
    maxHeight: '75%', // **Limit the maximum height to prevent it from exceeding the screen**
    backgroundColor: "rgba(4, 4, 25, 0.73)",
    borderRadius: 90,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: 'rgb(72, 243, 10)',
    fontWeight: 'bold',
  },
  exerciseOption: {
    marginVertical: -3,
  },

  customButton: {
    backgroundColor: 'rgba(49, 221, 233, 0.79)', 
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10, 
  },
  customButtonText: {
    fontSize: 12, 
    color: 'white', 
  },

  clearButton: {
    backgroundColor: '#21BFBF',
    width: 60,  
    height: 30, 
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, 
  },
  
  clearButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },

  // Styles for tutorial overlay
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    maxHeight: 500,
    width: '100%',
  },
  closeText: {
    fontSize: 18,
    color: 'rgba(55, 58, 247, 0.96)',  
    textAlign: 'center',
    paddingVertical: 10,
    fontWeight: 'bold',
  },
  viewExercisesButton: {
    backgroundColor: 'rgba(53, 131, 128, 0)',
    padding: 10,
    borderRadius: 5,
    marginTop: 520,
    alignItems: 'center',
    width: '60%',
  },
  viewExercisesButtonText: {
    fontSize: 16,
    color: '#21BFBF',
    fontWeight: 'bold',
  },
});