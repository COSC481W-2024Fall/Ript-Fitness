import { TextInput, StyleSheet, ScrollView, Text, View, Dimensions, FlatList } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import PreCreatedWorkoutButton from '@/components/custom/PreCreatedWorkoutButton'
import StreakHeader from '@/components/StreakHeader';
import { SavedWorkoutButton } from "@/components/custom/SavedWorkoutButton";
import RiptWorkouts, { Workout } from '@/app/screens/riptworkouts/RiptWorkouts';
import { useNavigation } from '@react-navigation/native';
import { WorkoutScreenNavigationProp } from "@/app/(tabs)/WorkoutStack";
import CustomSearchBar from "@/components/custom/CustomSearchBar";



export default function RiptWorkoutsScreen() {

  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  

  //   const handleWorkoutPress = (workoutId: number) => {
  //       // Find the selected workout data
  //       const selectedWorkout = workouts.find(workout => workout.id === workoutId);
  //       navigation.navigate('WorkoutDetail', { workout: selectedWorkout });
  //   };

  const SearchBarHeader = () => {
    return (
      <View style={styles.searchContainer}>
        <CustomSearchBar/>
      </View>
    )
    }

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 30) / 2; // Adjust for padding and spacing

    return (
        <View style={styles.container}>
            <StreakHeader></StreakHeader>
            {/* <SearchBarHeader></SearchBarHeader> */}
            <FlatList 
                style={styles.workoutContainer}
                data={RiptWorkouts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: {item: Workout}) => (
                  <View style={[styles.itemContainer, { width: itemWidth }]}>
                    <SavedWorkoutButton
                      key={item.id}
                      name={item.name}
                      level={item.level}
                      time={item.time} 
                      exercises={item.exercises}
                      onPress={() => navigation.navigate('WorkoutDetailScreen', { workout: item })} // Pass workout ID to navigate
                    />
                  </View>
                )}
                numColumns={2} // Specify two columns
                columnWrapperStyle={styles.columnWrapper} // Add spacing between columns
                showsVerticalScrollIndicator= {false}
            />
        </View>
      );
}


const styles = StyleSheet.create({
  searchContainer: {
    // margin: 10,
    // gap: 8, 
  },
  workoutContainer: {
    flex:1,
    width: '100%',
    // flexDirection:"row",
    // flexWrap:"wrap",
  },
  itemContainer: {
    margin: 5, // Add spacing between items
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color:'gray',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 8, 
    backgroundColor: '#fff',
  },
  columnWrapper: {
    paddingHorizontal: 5, // Add padding to the left and right of the row
  },
});
