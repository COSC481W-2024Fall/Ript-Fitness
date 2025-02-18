import React, { useContext } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator, HeaderStyleInterpolators, StackNavigationProp } from '@react-navigation/stack';
import ApiScreen from '@/app/screens/ApiScreen';
import MyWorkoutsScreen from '@/app/screens/workout/MyWorkoutsScreen';
import WorkoutApiScreen from '@/app/screens/workout/WorkoutApiScreen';
import { WorkoutContext } from '@/context/WorkoutContext';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import StartWorkoutScreen from '@/app/screens/workout/StartWorkoutScreen';
import RiptWorkoutScreen from '@/app/screens/riptworkouts/RiptWorkoutScreen';
import WorkoutDetailScreen from '@/app/screens/riptworkouts/WorkoutDetailScreen';
import StreakCounter from '@/components/StreakCounter';
import MyNotesScreen from '@/app/screens/notes/MyNotesScreen';
import EditNoteScreen from '@/app/screens/notes/EditNoteScreen';
import { AddWorkoutScreen } from '../screens/workout/AddWorkoutScreen';
import { Note } from '@/components/MyNotes/NotesContext';
import { GlobalContext } from '@/context/GlobalContext';

const Stack = createStackNavigator();

export type WorkoutStackParamList = {
  WorkoutApiScreen: {};
  ApiScreen: {};
  StartWorkoutScreen: {};
  AddWorkoutScreen: {};
  MyWorkoutsScreen: {};
  MyNotesScreen: {};
  EditNoteScreen: { note:Note | null };
  RiptWorkoutScreen: {};
  WorkoutDetailScreen: {};
};

export type WorkoutScreenNavigationProp = StackNavigationProp<WorkoutStackParamList>;

export default function WorkoutStack() {
  const context = useContext(WorkoutContext);
  const globContext = useContext(GlobalContext);

  const isDarkMode = globContext?.isDarkMode;

  return (
    <Stack.Navigator
      initialRouteName="WorkoutApiScreen"
      screenOptions={{
        headerShown: true,
        headerStyleInterpolator: HeaderStyleInterpolators.forNoAnimation,
        headerStyle: {
          backgroundColor: isDarkMode? 'black' : 'white',
         
        },
      }}
    >
      <Stack.Screen
        name="WorkoutApiScreen"
        component={WorkoutApiScreen}
        options={{
          title: '',
          headerLeft: () => <></>,
          headerRight: () => <StreakCounter />,
        }}
      />
      <Stack.Screen
        name="ApiScreen"
        component={ApiScreen}
        options={{
          headerRight: () => <StreakCounter />,
        }}
      />
      <Stack.Screen
        name="StartWorkoutScreen"
        component={StartWorkoutScreen}
        options={({ navigation }) => ({
          title: 'Live Workout',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="MyWorkoutsScreen"
        component={MyWorkoutsScreen}
        options={({ navigation }) => ({
          title: 'My Workouts',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: isDarkMode? 'black' : 'white',
           
          },
          headerTitleStyle: {
            color: isDarkMode? 'white' : 'black',
          },
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="RiptWorkoutScreen"
        component={RiptWorkoutScreen}
        options={({ navigation }) => ({
          title: 'Ript Workouts',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),

          headerTitleStyle: {
            color: isDarkMode? 'white' : 'black',
          },
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="WorkoutDetailScreen"
        component={WorkoutDetailScreen}
        options={({ navigation }) => ({
          title: 'Workout Details',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),

          headerTitleStyle: {
            color: isDarkMode? 'white' : 'black',
          },
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="EditNoteScreen"
        component={EditNoteScreen}
        options={({ navigation }) => ({
          title: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="AddWorkoutScreen"
        component={AddWorkoutScreen}
        options={({ navigation }) => ({
          title: 'Add Workout',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            color: isDarkMode? 'white' : 'black',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => context?.setVisible(true)}
              style={[styles.rightButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon name="add-outline" size={30} color="#454343" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="MyNotesScreen"
        component={MyNotesScreen}
        options={({ navigation }) => ({
          title: 'My Notes',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.leftButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon
                name="arrow-back-outline"
                size={30}
                color="#454343"
              />
            </TouchableOpacity>
          ),

          headerTitleStyle: {
            color: isDarkMode? 'white' : 'black',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('EditNoteScreen', { note: null })}
              style={[styles.rightButton, styles.button, styles.buttonSize]}
            >
              <TabBarIcon name="create-outline" size={30} color="#454343" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
        })}
      />
    </Stack.Navigator>
  );
}

const maxWidth = Dimensions.get('window').width;
const buttonDimension = maxWidth * 0.1;
const titleWidth = maxWidth - buttonDimension * 2 - 32;

const styles = StyleSheet.create({
  headerTitleView: {
    width: titleWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  leftButton: {
    paddingLeft: 10,
  },
  buttonSize: {
    height: '100%',
    aspectRatio: 1,
  },
  rightButton: {
    paddingRight: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
