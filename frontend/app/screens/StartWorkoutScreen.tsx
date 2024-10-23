import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
// still need to add a save to myworkouts feature

// Define the Exercise type
interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

export default function StartWorkoutScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Push-Ups', sets: '5', reps: '10' },
    { id: '2', name: 'Squats', sets: '4', reps: '12' },
  ]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [suggestedExercises, setSuggestedExercises] = useState<string[]>([]);

  // State for custom inputs
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customReps, setCustomReps] = useState('');
  const [customSets, setCustomSets] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Remove an exercise
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  // Add or Update an exercise
  const addOrUpdateExercise = () => {
    if (customExerciseName && customReps && customSets) {
      if (editingExerciseId) {
        // Update the existing exercise
        setExercises(exercises.map(exercise =>
          exercise.id === editingExerciseId
            ? { ...exercise, name: customExerciseName, sets: customSets, reps: customReps }
            : exercise
        ));
        setEditingExerciseId(null);
      } else {
        // Add a new exercise
        const newExercise: Exercise = {
          id: Math.random().toString(),
          name: customExerciseName,
          reps: customReps,
          sets: customSets,
        };
        setExercises([...exercises, newExercise]);
      }

      // Clear the input fields
      setCustomExerciseName('');
      setCustomReps('');
      setCustomSets('');
    }
  };

  // Load exercise details into the input fields for editing
  const editExercise = (exercise: Exercise) => {
    setCustomExerciseName(exercise.name);
    setCustomReps(exercise.reps);
    setCustomSets(exercise.sets);
    setEditingExerciseId(exercise.id);
  };

  // Suggested exercises
  const suggestExercises = (muscleGroup: string) => {
    let suggestions: string[] = [];
    switch (muscleGroup) {
      case 'chest':
        suggestions = ['Bench Press', 'Chest Fly', 'Incline Press'];
        break;
      case 'back':
        suggestions = ['Pull-Ups', 'Cable row', 'Bent Over Rows'];
        break;
      case 'arms':
        suggestions = ['Bicep Curls', 'Rope Pull Downs', 'Hammer Curls'];
        break;
      case 'shoulders':
        suggestions = ['Shoulder Press', 'Lateral Raises', 'Rear delt flys'];
        break;
      case 'legs':
        suggestions = ['Squats', 'Leg curl', 'calf raises'];
        break;
      default:
        suggestions = [];
    }
    setSuggestedExercises(suggestions);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <Swipeable
      renderLeftActions={() => (
        <View style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      )}
      onSwipeableOpen={() => removeExercise(item.id)}
    >
      <View style={styles.exerciseItem}>
        <Text>{item.name} - {item.sets} Sets, {item.reps} Reps</Text>
        <TouchableOpacity onPress={() => editExercise(item)}>
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {/* Custom Input Fields for Exercise */}
      <TextInput
        style={styles.input}
        placeholder="Exercise Name"
        value={customExerciseName}
        onChangeText={setCustomExerciseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Reps"
        value={customReps}
        onChangeText={setCustomReps}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Sets"
        value={customSets}
        onChangeText={setCustomSets}
        keyboardType="numeric"
      />

      {/* Add or Update Button */}
      <TouchableOpacity style={styles.addButton} onPress={addOrUpdateExercise}>
        <Text style={styles.addButtonText}>
          {editingExerciseId ? 'Update Exercise' : 'Add Exercise'}
        </Text>
        <Ionicons name={editingExerciseId ? "save-outline" : "add"} size={20} color="white" />
      </TouchableOpacity>

      {/* Exercise List */}
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      {/* Suggest Exercise Buttons */}
      <Text style={styles.suggestTitle}>Suggested Exercises:</Text>
      <View style={styles.suggestButtonContainer}>
        <TouchableOpacity style={styles.suggestButton} onPress={() => suggestExercises('chest')}>
          <Text style={styles.buttonText}>Chest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestButton} onPress={() => suggestExercises('back')}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestButton} onPress={() => suggestExercises('arms')}>
          <Text style={styles.buttonText}>Arms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestButton} onPress={() => suggestExercises('shoulders')}>
          <Text style={styles.buttonText}>Shoulders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestButton} onPress={() => suggestExercises('legs')}>
          <Text style={styles.buttonText}>Legs</Text>
        </TouchableOpacity>
      </View>

      {/* Suggested Exercises Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suggested Exercises</Text>
            {suggestedExercises.map((exercise, index) => (
              <Text key={index} style={styles.suggestionItem}>{exercise}</Text>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  exerciseItem: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  suggestButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  suggestButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '30%',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionItem: {
    fontSize: 16,
    padding: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
