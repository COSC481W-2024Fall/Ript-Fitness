import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyWorkoutsScreen from '../../app/screens/workout/MyWorkoutsScreen';
import { GlobalContext } from '@/context/GlobalContext'; // Replace with the correct path for your context
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// Mocking GlobalContext
const mockContext = {
  isDarkMode: 'true',  
  toggleTheme: jest.fn(),
};

  it('renders correctly on MyWorkoutScreen', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MyWorkoutsScreen" component={MyWorkoutsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

  const screenContainer = getByTestId('screen-container'); 
  
  expect(screenContainer.props.style.backgroundColor).toBe(undefined);

  });

