// App.tsx
import "react-native-gesture-handler";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
import "react-native-gesture-handler";
import React, { useContext, useState } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";
import { View, Text, StatusBar, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SocialStack from "./app/(tabs)/SocialStack";
import WorkoutStack from "./app/(tabs)/WorkoutStack";
import BodyStack from "./app/(tabs)/BodyStack";
import ProfileStack from "./app/(tabs)/ProfileStack";
import { GlobalContext, GlobalProvider } from "./context/GlobalContext";
import { StreakProvider } from "./context/StreakContext";
import SplashScreen from "@/app/screens/SplashScreen";
import WelcomeScreen from "@/app/screens/welcome/WelcomeScreen";
import LoginScreen from "@/app/screens/welcome/LoginScreen";
import SignupScreen from "@/app/screens/welcome/SignupScreen";
import TimerScreen from "./app/screens/timer/TimerScreen"; // Import the TimerScreen component
import MyWorkoutsScreen from '@/app/screens/workout/MyWorkoutsScreen'; // Import the MyWorkoutsScreen component

import { SocialFeedProvider } from "./context/SocialFeedContext";

import { NotesProvider } from "./components/MyNotes/NotesContext";

import { LogBox } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import { WorkoutProvider } from "./context/WorkoutContext";
import FoodLogScreen from "./app/screens/foodlog/FoodLog";

// Suppress specific Reanimated warnings using LogBox
LogBox.ignoreLogs([
  /\[Reanimated\] Reading from `value` during component render/,
  /Reanimated/, // This will suppress all Reanimated-related warnings
]);

// Configure Reanimated's internal logger
configureReanimatedLogger({
  level: ReanimatedLogLevel.error, // Only show errors, suppress warnings
  strict: false, // Disable strict mode to reduce warnings
});


// Define types for the navigation stack
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};
export type RootScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainApp() {
  
  const context = useContext(GlobalContext);
  const theme = context?.isDarkMode;

  if (context?.additionalLoadingRequired) {
    return <SplashScreen />;
  }

  const activeTintColor = theme  ? "#ffffff" : "#0D0D0D";
  const inactiveTintColor = theme ? "#73726F" : "#A4A4A4";
  const tabBarBackgroundColor = theme ? "#1F1F1F" : "#ffffff";

  return (
    <Tab.Navigator
      initialRouteName="Social"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarStyle: {backgroundColor: tabBarBackgroundColor},
        
      }}
    >
      <Tab.Screen
        name="Social"
        component={SocialStack}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutStack}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Food"
        component={BodyStack}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? "nutrition" : "nutrition-outline"}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

    {/*Defines the Timer screen in the bottom tab navigator with 
    an icon that changes based on focus state.*/} 
      {/* Timer Screen */} 
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? "timer" : "timer-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


function RootNavigator() {
  const context = useContext(GlobalContext);
  const isLoading = context?.isLoaded;
  const [verifiedToken, setVerifiedToken] = useState(false);
  const [temp, setTemp] = useState(true);
  let user = context?.data.token != "";

  if (context?.isLoaded != true) {
    return <SplashScreen />;
  } else {
    user = context?.data.token != "";
  }

  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: true }}
      initialRouteName={user ? "Home" : "Welcome"}
    >
      {user ? (
        <Stack.Screen
          name="Home"
          component={MainApp}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <NavigationContainer>
          <PortalProvider>
            <GlobalProvider>
              <StreakProvider>
                <NotesProvider>
                
                  <SocialFeedProvider>
                    <WorkoutProvider>
                        <StatusBar barStyle= "default" />
                        <RootNavigator />
                    </WorkoutProvider>
                  </SocialFeedProvider>
                </NotesProvider>
              </StreakProvider>
            </GlobalProvider>
            
          </PortalProvider>
        </NavigationContainer>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}