import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { WorkoutScreenNavigationProp } from '@/app/(tabs)/WorkoutStack';
import { GlobalContext } from '@/context/GlobalContext';
import flameImage from '@/assets/images/flame.svg';
import MuscleIcon from '@/assets/images/muscle.svg';

//https://ionic.io/ionicons
// used this for icons npm install react-native-vector-icons
// npm install --save-dev @types/react-native-vector-icons
// https://www.youtube.com/watch?v=ooEFRONfq_s just a good watch
// https://www.youtube.com/watch?v=q2s6VTHl2kE went off this video 
// https://reactnativeelements.com/docs/1.2.0/icon
 
 
export default function WorkoutApiScreen() { 
  
  const navigation = useNavigation<WorkoutScreenNavigationProp >();
  const context = useContext(GlobalContext);

  const isDarkMode = context?.isDarkMode;  
  // TouchableOpacity is what gives the fade effect
  // view is calling the container that helps the layout
    
// makes button clickable 
  return (
    
    <View style={[isDarkMode ? styles.darkContainer : styles.container]}>
      <View style={styles.welcomeContainer}>
        <Text style={[isDarkMode ? styles.darkWelcomeText : styles.welcomeText]}>Welcome, {context?.userProfile.displayname}!</Text>
      </View>
      <View style={styles.lineBreak}></View>
      {/* My Workouts */}
      <TouchableOpacity style={isDarkMode? styles.darkButton: styles.button} onPress={() => navigation.navigate('MyWorkoutsScreen', { })}  > 
        {/* <Ionicons name="heart" size={35} color="#F2505D" /> */}
        {/* <Image 
        style={styles.image}
          source={require('@/assets/images/my_workouts.png')}
        />
        <Text style={styles.buttonText}>My Workouts</Text> */}
        <View style={styles.iconStyles}>
          <MaterialCommunityIcons name="bookmark" size={32} color="#aef1f1" />
        </View>
        <View style={{ justifyContent: 'flex-start' }}>
          <Text style={isDarkMode? styles.darkButtonText:styles.buttonText}>My Workouts</Text>
          <Text style={{ color: '#757575', }}>View your workouts</Text>
        </View>
      </TouchableOpacity>

      {/* Add Workout */}
      <TouchableOpacity style={isDarkMode? styles.darkButton: styles.button} onPress={() => navigation.navigate('AddWorkoutScreen', { })}  >
        {/* <Image 
        style={styles.image}
          source={require('@/assets/images/dashboard-widgets-add.png')}
        />
        <Text style={styles.buttonText}>Add Workout</Text> */}
        <View style={styles.iconStyles}>
          <MaterialCommunityIcons name="plus" size={32} color="#aef1f1" />
        </View>
        <View style={{ justifyContent: 'flex-start' }}>
          <Text style={isDarkMode? styles.darkButtonText:styles.buttonText}>Add Workout</Text>
          <Text style={{ color: '#757575', }}>Create a workout</Text>
        </View>
      </TouchableOpacity>
      
      {/* Ript Workouts */}
      <TouchableOpacity style={isDarkMode? styles.darkButton: styles.button} onPress={() => navigation.navigate('RiptWorkoutScreen', { })}  >
      {/* <Image 
        style={styles.image}
        source={require('@/assets/images/secondary.png')}
        />
        <Text style={styles.buttonText}>Ript Workouts</Text> */}
        <View style={styles.iconStyles}>
          <MaterialCommunityIcons name="dumbbell" size={32} color="#aef1f1" />
        </View>
        <View style={{ justifyContent: 'flex-start' }}>
          <Text style={isDarkMode? styles.darkButtonText:styles.buttonText}>Ript Workouts</Text>
          <Text style={{ color: '#757575', }}>Explore Ript workouts</Text>
        </View>
      </TouchableOpacity>
      
      {/* My Notes */}
      <TouchableOpacity style={isDarkMode? styles.darkButton: styles.button} onPress={() => navigation.navigate('MyNotesScreen', { })} >
      {/* <Image 
        style={styles.image}
        source={require('@/assets/images/my-notes.png')}
        /> */}
        <View style={styles.iconStyles}>
          <MaterialCommunityIcons name="notebook" size={32} color="#aef1f1" />    
        </View>
        <View style={{ justifyContent: 'flex-start' }}>
          <Text style={isDarkMode? styles.darkButtonText:styles.buttonText}>My Notes</Text>
          <Text style={{ color: '#757575', }}>Write down anything</Text>
        </View>
      </TouchableOpacity>

     {/* Body Focus */}
      <TouchableOpacity 
        style={isDarkMode? styles.darkButton:styles.button} 
        onPress={() => navigation.navigate('BodyFocusScreen', {})} 
        testID='touchable-opacity-id'
      >
        <View style={styles.iconStyles}>
            <MuscleIcon width={32} height={32} />
        </View>
        <View style={{ justifyContent: 'flex-start' }}>
          <Text style={isDarkMode? styles.darkButtonText:styles.buttonText}>Body Focus</Text>
          <Text style={{ color: '#757575', }}>Body-based workouts</Text>
        </View>
      </TouchableOpacity>
      
      {/* Body Weight History Trend */}
      <TouchableOpacity 
        style={isDarkMode? styles.darkButton:styles.button} 
        onPress={() => navigation.navigate('BodyWeightHistoryScreen', {})} 
      >
        <View style={styles.iconStyles}>
          <MaterialCommunityIcons name="chart-line" size={32} color="#aef1f1" />
        </View>
        <View style={{ justifyContent: 'flex-start' }}>
            <Text style={isDarkMode?styles.darkButtonText:styles.buttonText}>Bodyweight History</Text>
            <Text style={{ color: '#757575', }}>Track your progress</Text>
        </View>
      </TouchableOpacity>

      {/* Start Workout */}
      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('StartWorkoutScreen', { })} >
        <Text style={[styles.buttonText, {color: '#fff'}]}>Start Live Workout</Text>
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
    //backgroundColor: 'black',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
  },
  darkContainer: {
    flex: 1,
    // paddingHorizontal: 50,
    paddingTop: 30,
    backgroundColor: 'black',
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
  darkWelcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginHorizontal: 20,
    color: 'white',
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
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 17,
    backgroundColor: '#fff',
    // backgroundColor: '#2493BF',
    // backgroundColor: '#444444',
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  darkButton: {
    width: '45%',
    height: 150,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 17,
    backgroundColor: '#333333',
    // backgroundColor: '#2493BF',
    // backgroundColor: '#444444',
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  iconStyles: {
    backgroundColor: '#21bfbf', 
    width: 45, 
    borderRadius: 40, 
    padding: 5,
    alignItems: 'center',
    // marginBottom: 10,
  },
  shadowProp: {
    shadowColor: '#000',
    // shadowOffset: {width: 2, height: 7},
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    // shadowRadius: 3,
    shadowRadius: 4,
  },
  startButton: {
    width: '90%',
    height: '7%',
    backgroundColor: '#21BFBF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    // paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    // color: '#FFFF',
    color: '#303030',
    textAlign: 'center',

  },
  darkButtonText: {
    // paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFF',
    textAlign: 'center',

  },
  image: {
    width: 75,
    height: 75,

  }
});
