import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { WorkoutScreenNavigationProp } from '../(tabs)/WorkoutStack';

//https://ionic.io/ionicons
// used this for icons npm install react-native-vector-icons
// npm install --save-dev @types/react-native-vector-icons
// https://www.youtube.com/watch?v=ooEFRONfq_s just a good watch
// https://www.youtube.com/watch?v=q2s6VTHl2kE went off this video 
// https://reactnativeelements.com/docs/1.2.0/icon
 
 
export default function StartWorkoutScreen() { 
  
  const navigation = useNavigation<WorkoutScreenNavigationProp >();
  // TouchableOpacity is what gives the fade effect
  // view is calling the container that helps the layout
    
// makes button clickable 
  return (
    <View style={styles.container}>
      {/* Add exercise */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ApiScreen', { })}  > 
        <Text style={styles.buttonText}>Add exercises</Text>
        <Icon name="heart-outline" size={30} color="red" />
      </TouchableOpacity>
     
      {/* Timer */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ApiScreen', { })}  > 
        <Text style={styles.buttonText}>Timer</Text>
      <Icon name="timer-outline" size={30} color="black" />
      </TouchableOpacity>

    </View>
  );
}

// talk to team about adujust position to look more/less like figma
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#FFFFFF',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 35,
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
