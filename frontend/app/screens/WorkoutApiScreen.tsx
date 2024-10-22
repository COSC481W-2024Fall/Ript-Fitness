import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { WorkoutScreenNavigationProp } from '../(tabs)/WorkoutStack';

//https://ionic.io/ionicons
// used this for icons npm install react-native-vector-icons
// npm install --save-dev @types/react-native-vector-icons
// https://www.youtube.com/watch?v=ooEFRONfq_s just a good watch
// https://www.youtube.com/watch?v=q2s6VTHl2kE went off this video 
// https://reactnativeelements.com/docs/1.2.0/icon
 
 
export default function WorkoutApiScreen() { 
  
  const navigation = useNavigation<WorkoutScreenNavigationProp >();
  // TouchableOpacity is what gives the fade effect
  // view is calling the container that helps the layout
    
// makes button clickable 
  return (
    <View style={styles.container}>
      {/* My Workouts */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyWorkoutsScreen', { })}  > 
        <Text style={styles.buttonText}>My Workouts</Text>
        <Ionicons name="heart-outline" size={30} color="red" />
      </TouchableOpacity>

      {/* Add Workout */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddWorkoutScreen', { })}  >
        <Text style={styles.buttonText}>Add Workout</Text>
        <Ionicons name="add" size={30} color="green" />
      </TouchableOpacity>

      {/* Ript Workouts */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ApiScreen', { })}  >
        <Text style={styles.buttonText}>Ript Workouts</Text>
        <Ionicons name="barbell-outline" size={30} color="black" />
      </TouchableOpacity>

      {/* My Notes */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyNotesScreen', { })} >
        <Text style={styles.buttonText}>My Notes</Text>
        <Ionicons name="document-outline" size={30} color="black" />
      </TouchableOpacity>

      {/* Start Workout */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StartWorkoutScreen', { })} >
        <Text style={styles.buttonText}>Start Workout</Text>
        <Ionicons name="chevron-forward-outline" size={30} color="blue" />
      </TouchableOpacity>

    </View>
  );
}

// talk to team about adujust position to look more/less like figma
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: '#FFFFFF',
  },

  // add a button for ript fitness influencer links
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    //'#000000', this is black border check with team
  },

  // can add more button colors if needed for each button 
  // overall I like the UI tho
  buttonText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    //333333 gray text
  },
});
