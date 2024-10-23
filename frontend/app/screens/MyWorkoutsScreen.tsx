import { TextInput, StyleSheet, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from '@/components/ThemedText';
import SearchBar from '@/components/custom/CustomSearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayoutEffect } from "react";
import WorkoutButton from "@/components/custom/PreCreatedWorkoutButton";
import StreakHeader from '@/components/StreakHeader';

export default function MyWorkoutsScreen() {
  const SearchBarHeader = () => {
    return (
      <View style={styles.searchContainer}>
        <Text style={styles.text}>My History</Text>
        <SearchBar></SearchBar>
      </View>
    )
    }

  return (
    <View style= {styles.container}> 
    <StreakHeader></StreakHeader>
      <SearchBarHeader></SearchBarHeader>
      <SafeAreaView style= {styles.safeView}>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <WorkoutButton></WorkoutButton>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}



const styles = StyleSheet.create({
  searchContainer: {
    height: 'auto',
    margin: 10,
    gap: 8, 
  },
  safeView: {
    flex:1
  },
  text: {
    fontSize: 20,
    fontFamily: 'Courier',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    color:'gray',
  },
  container: {
    width:'100%',
    height: '100%', 
    alignItems: 'center',
    gap: 8, 
    paddingBottom: 29,
  },
});
