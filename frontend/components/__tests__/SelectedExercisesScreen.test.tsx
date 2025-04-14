import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SelectedExercisesScreen from '@/app/screens/workout/SelectedExercisesScreen';
import { GlobalContext } from '@/context/GlobalContext';
import { createMockGlobalContext } from '@/__mocks__/createMockGlobalContext';
import type { Exercise } from '@/context/GlobalContext';
import { Alert } from 'react-native'; // Import Alert to spy on alert behavior

// 1. Mock the global fetch implementation used for network requests
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;

// 2. Provide necessary mocks for third-party libraries
jest.mock('react-native-reanimated', () => ({
  Value: jest.fn(),
  SpringUtils: {
    makeDefaultConfig: jest.fn(),
  },
}));

// Prevent TouchableOpacity from interfering in the test environment
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => 'View');

// 3. Mock API modules and environment variables
jest.mock('@/api/httpRequests', () => ({ default: jest.fn() }));
jest.mock('@env', () => ({
  USE_LOCAL: 'false',
  LOCAL_IP: undefined,
  BASE_URL: 'https://mock-api-url.com'
}));

// 4. Mock the navigation and route props from react-navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: { exercises: ['Push Ups', 'Squats'] } }),
}));

describe('SelectedExercisesScreen', () => {
   // Create mock exercise data to simulate selected exercises
  const mockExercises: Exercise[] = [
    {
      nameOfExercise: 'Push Ups',
      exerciseId: 1,
      accountReferenceId: 123,
      sets: 3,
      reps: [10, 10, 10],
      weight: [0, 0, 0],
      description: 'Push Ups description',
      exerciseType: 1,
    },
    {
      nameOfExercise: 'Squats',
      exerciseId: 2,
      accountReferenceId: 123,
      sets: 3,
      reps: [12, 12, 12],
      weight: [0, 0, 0],
      description: 'Squats description',
      exerciseType: 1,
    },
  ];

  // Create a mocked global context that mimics the actual app's state
  const mockContext = createMockGlobalContext({
    exerciseList: new Set(['Push Ups', 'Squats']),
    selectedExerciseObjects: mockExercises,
  });

  // Reset mocks before each test to ensure clean environment
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected exercise names correctly on screen', () => {
    const { getByText } = render(
      <GlobalContext.Provider value={mockContext}>
        <SelectedExercisesScreen />
      </GlobalContext.Provider>
    );

    // Check if both exercise names are displayed
    expect(getByText('Push Ups')).toBeTruthy();
    expect(getByText('Squats')).toBeTruthy();
  });

  it('shows an error alert if trying to submit a workout without a name', async () => {
    // Spy on the Alert.alert function to confirm it is called
    jest.spyOn(Alert, 'alert');
  
    const { getByText, getByTestId } = render(
      <GlobalContext.Provider value={mockContext}>
        <SelectedExercisesScreen />
      </GlobalContext.Provider>
    );
  
   // Step 1: Simulate user tapping one of the exercises to select it
  // This is necessary because the modal won't open unless at least one exercise is selected
  fireEvent.press(getByTestId('exercise-Push Ups'));

  // Step 2: Press the "Send" button to trigger the workout name modal
  fireEvent.press(getByTestId('send-button'));
  
     // Step 3: Wait for the modal and its input field to appear in the component tree
    await waitFor(() => {
      expect(getByTestId('workout-modal')).toBeTruthy();       // Modal should now be visible
      expect(getByTestId('workout-name-input')).toBeTruthy();  // Input field should exist inside modal
    }, { timeout: 2000 }); 
    
  // Step 4: Press "Confirm" without typing any workout name
  fireEvent.press(getByTestId('confirm-button'));
  
    // Step 5: Wait and verify that an alert is shown with the expected error message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error", 
        "Workout name cannot be empty"
      );
    });
  });
});


// run command: npm run test -- SelectedExercisesScreen.test.tsx
