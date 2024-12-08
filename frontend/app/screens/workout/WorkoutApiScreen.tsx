import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { WorkoutScreenNavigationProp } from '@/app/(tabs)/WorkoutStack';
import { GlobalContext } from '@/context/GlobalContext';

//https://ionic.io/ionicons
// used this for icons npm install react-native-vector-icons
// npm install --save-dev @types/react-native-vector-icons
// https://www.youtube.com/watch?v=ooEFRONfq_s just a good watch
// https://www.youtube.com/watch?v=q2s6VTHl2kE went off this video 
// https://reactnativeelements.com/docs/1.2.0/icon
 
 
export default function WorkoutApiScreen() { 
  
  const navigation = useNavigation<WorkoutScreenNavigationProp >();
  const context = useContext(GlobalContext)
  // TouchableOpacity is what gives the fade effect
  // view is calling the container that helps the layout
    
// makes button clickable 
  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {context?.userProfile.displayname}!</Text>
      </View>
      <View style={styles.lineBreak}></View>
      {/* My Workouts */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyWorkoutsScreen', { })}  > 
        {/* <Ionicons name="heart" size={35} color="#F2505D" /> */}
        <Image 
        style={styles.image}
          source={require('@/assets/images/my_workouts.png')}
        />
        <Text style={styles.buttonText}>My Workouts</Text>
      </TouchableOpacity>

      {/* Add Workout */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddWorkoutScreen', { })}  >
        <Image 
        style={styles.image}
          source={require('@/assets/images/dashboard-widgets-add.png')}
        />
        <Text style={styles.buttonText}>Add Workout</Text>
      </TouchableOpacity>
      
      {/* Ript Workouts */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RiptWorkoutScreen', { })}  >
      <Image 
        style={styles.image}
        source={require('@/assets/images/secondary.png')}
        />
        <Text style={styles.buttonText}>Ript Workouts</Text>
      </TouchableOpacity>
      
      {/* My Notes */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyNotesScreen', { })} >
      <Image 
        style={styles.image}
        source={require('@/assets/images/my-notes.png')}
        />
        <Text style={styles.buttonText}>My Notes</Text>
      </TouchableOpacity>

      {/* Start Workout */}
      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('StartWorkoutScreen', { })} >
        <Text style={styles.buttonText}>Start Live Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

// talk to team about adujust position to look more/less like figma
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 50,
    paddingTop: 30,
    backgroundColor: '#FFFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
  },
  welcomeContainer: {
    width: '90%',
    // borderBottomColor: 'black',
    // borderBottomWidth: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginHorizontal: 20,
    color: '#1D2526',
  },
  lineBreak: {
    backgroundColor: '#21BFBF',
    width: '90%',
    height: '1%',
    borderRadius: 20,
    marginBottom: 10,
  },
  // add a button for ript fitness influencer links
  button: {
    width: '45%',
    height: 150,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 25,
    // backgroundColor: '#F5F5F5',
    backgroundColor: '#2493BF',
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 5,
    //'#000000', this is black border check with team
  },
  startButton: {
    width: '90%',
    height: '7%',
    backgroundColor: '#21BFBF',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  // can add more button colors if needed for each button 
  // overall I like the UI tho
  buttonText: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFF',
  },
  image: {
    width: 75,
    height: 75,

  }
});
