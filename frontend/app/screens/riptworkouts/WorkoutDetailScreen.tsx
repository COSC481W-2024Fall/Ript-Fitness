import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Workout as WorkoutType } from './RiptWorkouts'; // Ensure this path is correct
import { ThemedText } from '@/components/ThemedText'; // Ensure this path is correct
import { httpRequests } from '../../../api/httpRequests'; // Ensure this path is correct
import { GlobalContext } from '@/context/GlobalContext'; // Ensure this path is correct

// Define the route prop type
type WorkoutDetailScreenRouteProp = RouteProp<
  { params: { workout: WorkoutType } },
  'params'
>;

// define workout interface:
// interface Workout {
//   workoutsId: number | null;
//   name: string;
//   isDeleted: boolean;
//   exerciseIds: number[];
//   exercises: Exercise[];
// }


// Define the Exercise interface
export interface Exercise {
  exerciseId: number;
  nameOfExercise: string;
  sets: number;
  reps: number[];
  weight: number[];
  description: string;
  exerciseType: number;
  isDeleted?: boolean;


}

export default function WorkoutDetailScreen() {
  // Access route parameters
  const {
    params: { workout },
  } = useRoute<WorkoutDetailScreenRouteProp>();

  // Access global context for authentication token and user profile
  const gblContext = useContext(GlobalContext);
  const token = gblContext?.data.token;
  const userProfile = gblContext?.userProfile;
  const isDarkMode = gblContext?.isDarkMode;

  // Access navigation for screen transitions
  const navigation = useNavigation();

  // State variables
  const [submitting, setSubmitting] = useState(false);
  const [workoutName, setWorkoutName] = useState(''); // State for workout name

  // Initialize workoutName if editing an existing workout
  useEffect(() => {
    setWorkoutName(workout.name || '');
  }, [workout.name]);

  // Effect to log exercises whenever they change
  useEffect(() => {
    console.log('Workout Exercises:', workout.exercises);
  }, [workout.exercises]);

  // Function to format reps into a list of numbers
  const formatRepsToList = (reps: number | string | number[]): number[] => {
    if (Array.isArray(reps)) {
      return reps.map((rep) => parseInt(rep.toString(), 10));
    } else if (typeof reps === 'string') {
      const matches = reps.match(/\d+/g);
      if (matches) {
        return matches.map((rep) => parseInt(rep, 10));
      } else {
        return [];
      }
    } else if (typeof reps === 'number') {
      return [reps];
    } else {
      return [];
    }
  };

  const formatWeightsToList = (weight: number | string | number[]): number[] => {
    if (Array.isArray(weight)) {
      return weight.map((w) => parseInt(w.toString(), 10));
    } else if (typeof weight === 'string') {
      const matches = weight.match(/\d+/g);
      if (matches) {
        return matches.map((w) => parseInt(w, 10));
      } else {
        return [];
      }
    } else if (typeof weight === 'number') {
      return [weight];
    } else {
      return [];
    }
  };
  


  // Function to handle adding the workout and its exercises
// Function to handle adding the workout and its exercises
const handleAddWorkout = async () => {
  console.log('Submitting Workout Name:', workoutName); // Debugging line

  // Validate authentication
  if (!token) {
    Alert.alert('Error', 'You must be logged in to perform this action.');
    console.error('User is not authenticated. Token is missing.');
    return;
  }

  // Validate workout name
  if (!workoutName.trim()) {
    Alert.alert('Error', 'Workout name is required.');
    return;
  }

  // Validate that at least one exercise exists
  if (!workout.exercises || workout.exercises.length === 0) {
    Alert.alert('Error', 'No exercises found in this workout.');
    return;
  }

  // Validate that userProfile is available
  if (!userProfile || !userProfile.id) {
    Alert.alert('Error', 'User profile information is missing.');
    console.error('User profile information is missing.');
    return;
  }

  setSubmitting(true);

  try {
    // Step 1: Add each exercise first without associating with a workout
    const addExercisePromises = workout.exercises.map((exercise, index) => {
      const { sets } = exercise;

      let repsList = formatRepsToList(exercise.reps);
      let weightList = formatWeightsToList(exercise.weight);

      // Ensure repsList matches the number of sets
      if (repsList.length === 1 && sets > 1) {
        repsList = Array(sets).fill(repsList[0]);
      } else if (repsList.length !== sets) {
        repsList = repsList.slice(0, sets);
      }

      // Ensure weightList matches the number of sets
      if (weightList.length === 1 && sets > 1) {
        weightList = Array(sets).fill(weightList[0]);
      } else if (weightList.length !== sets) {
        weightList = weightList.slice(0, sets);
      }

      const exerciseData = {
        ...exercise,
        nameOfExercise: exercise.exercise,
        reps: repsList,      // Now matches the number of sets
        weight: weightList,  // Now matches the number of sets
      };

      console.log(`Preparing to add Exercise ${index + 1}:`, JSON.stringify(exerciseData, null, 2));

      return fetch(`${httpRequests.getBaseURL()}/exercises/addExercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
      })
        .then((response) => {
          console.log(`Exercise ${index + 1} response status:`, response.status);
          if (response.status === 200 || response.status === 201) {
            return response.json();
          } else {
            return response.text().then((text) => {
              throw new Error(`Failed to add exercise ${index + 1}: ${response.status} ${text}`);
            });
          }
        })
        .catch((error) => {
          console.error(`Error adding Exercise ${index + 1}:`, error);
          throw error;
        });
    });

    // Step 2: Wait for all exercises to be added
    const addedExercises = await Promise.all(addExercisePromises);
    console.log('All exercises added:', addedExercises);

    // Step 3: Collect all exercise IDs
    const workoutExerciseIds: number[] = addedExercises.map((ex) => ex.exerciseId);

    // Step 4: Create the workout with the list of exercise IDs
    const workoutData = {
      name: workoutName,
      isDeleted: false,
      exerciseIds: workoutExerciseIds, // Assuming the backend accepts 'exerciseIds'
    };

    console.log('Sending request to add workout with exercises:', JSON.stringify(workoutData, null, 2));
    const workoutResponse = await fetch(`${httpRequests.getBaseURL()}/workouts/addWorkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workoutData),
    });

    console.log('Workout response status:', workoutResponse.status);

    if (workoutResponse.status === 200 || workoutResponse.status === 201) {
      const addedWorkout = await workoutResponse.json();
      console.log('Added Workout Response:', JSON.stringify(addedWorkout, null, 2));

      // Optional: Update global context with the new workout
      if (gblContext && gblContext.addWorkout) {
        gblContext.addWorkout({
          id: addedWorkout.workoutsId,
          name: workoutName,
          exercises: addedExercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            nameOfExercise: ex.nameOfExercise,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            description: ex.description,
            exerciseType: ex.exerciseType,
            isDeleted: ex.isDeleted,
          })),
          isDeleted: false,
        });
      }

      Alert.alert('Success', 'Workout and all exercises added successfully!');
      // Navigate to "MyWorkouts" screen
      //navigation.navigate('MyWorkouts'); // Replace with your actual route name
    } else {
      const errorText = await workoutResponse.text();
      console.error('Workout addition failed. Status:', workoutResponse.status);
      console.error('Error response text:', errorText);
      let errorMessage = `Error ${workoutResponse.status}: ${errorText}`;
      Alert.alert('Error', errorMessage);
    }
  } catch (error) {
    console.error('Exception occurred while adding workout and exercises:', error);
    Alert.alert('Error', 'Failed to add workout and exercises. Please try again.');
  } finally {
    setSubmitting(false);
  }
};



  return (
    <View style={[isDarkMode? styles.darkContainer : styles.container]}>
      {/* Workout Name Input */}
      <View style={styles.workoutNameContainer}>
        {/* <TextInput
          placeholder='Enter Workout Name'
          placeholderTextColor='#747474'
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={(text) => {
            console.log('Workout Name Input Changed:', text); // Debugging line
            setWorkoutName(text);
          }}
        /> */}
      </View>

      {/* Workout Details */}
      <ThemedText style={[isDarkMode ? styles.darkTitle : styles.title]}>{workout.name}</ThemedText>

      <View style={styles.textWrapper}>
        <ThemedText style={styles.dateText}>
          {workout.level}: {workout.time} min
        </ThemedText>
      </View>

      {/* Exercises List */}
      <FlatList
        data={workout.exercises}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={isDarkMode?styles.darkExercise:styles.exercise}>
            <Text style={isDarkMode?styles.darkNameOfExercise: styles.nameOfExercise}>{item.exercise}</Text>
            <Text style={isDarkMode?styles.darkExerciseText:styles.exerciseText}>
              {item.sets} sets x {item.reps} reps | {item.weight} lbs
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddWorkout}
        disabled={submitting} // Disable button while submitting
      >
        {submitting ? (
          <ActivityIndicator size='small' color='#ffffff' />
        ) : (
          <Text style={styles.buttonText}>Add this to My Workouts!</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Stylesheet remains unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  workoutNameContainer: {
    marginBottom: 20,
  },
  workoutNameInput: {
    height: 50,
    borderColor: '#B6B6B6',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#000000',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  darkTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  exercise: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginVertical: 5,
  },
  darkExercise: {
    padding: 15,
    backgroundColor: '#333333',
    borderRadius: 10,
    marginVertical: 5,
  },
  exerciseText: {
    fontSize: 18,
    color: '#000000',
  },
  nameOfExercise: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkExerciseText: {
    fontSize: 18,
    color: '#666666',
  },
  darkNameOfExercise: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  textWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#2493BF',
    padding: 5,
    borderRadius: 40,
    width: '80%',
    bottom: 10,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#2493BF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 50, // Fixed height for consistency
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
