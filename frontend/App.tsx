// App.tsx
import "react-native-gesture-handler";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
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

import { SocialFeedProvider } from "./context/SocialFeedContext";

import { NotesProvider } from "./components/MyNotes/NotesContext";

import { LogBox } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

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
  return (
    <Tab.Navigator
      initialRouteName="Social"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0D0D0D",
        tabBarInactiveTintColor: "#73726F",
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
        name="Body"
        component={BodyStack}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? "body" : "body-outline"}
              size={size}
              color={color}
            />
          ),
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
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const context = useContext(GlobalContext);

  const isLoading = context.isLoaded;
  const user = context.data.token != "";
  //console.log('RootNavigator - user:', user);
  //console.log('RootNavigator - isLoading:', isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
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
      <NavigationContainer>
        <PortalProvider>
          <GlobalProvider>
            <StreakProvider>
              <NotesProvider>
                <SocialFeedProvider>
                  <>
                    <StatusBar barStyle="default" />
                    <RootNavigator />
                  </>
                </SocialFeedProvider>
              </NotesProvider>
            </StreakProvider>
          </GlobalProvider>
        </PortalProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
