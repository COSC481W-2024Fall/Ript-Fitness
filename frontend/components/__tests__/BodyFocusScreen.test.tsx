import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BodyFocusScreen from '@/app/screens/workout/BodyFocusScreen';
import { GlobalContext } from '@/context/GlobalContext';
import { createMockGlobalContext } from '@/__mocks__/createMockGlobalContext';

// Mock animation and native dependencies that may slow down or break test execution
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
jest.mock('@/components/BodyDiagram', () => () => null);  // Skip rendering of BodyDiagram for testing
jest.mock('@/api/httpRequests', () => ({ default: jest.fn() }));
jest.mock('@env', () => ({ USE_LOCAL: 'false', LOCAL_IP: undefined }));

// Mock react-navigation to test navigation behavior without real navigator
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({}),
}));

// Mock native components that may not behave well in the test environment
jest.mock('react-native/Libraries/Image/Image', () => 'Image');
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => 'TouchableOpacity');

describe('BodyFocusScreen', () => {
  beforeEach(() => {
    // Replace real timers with fake timers to control animation-related behavior
    jest.useFakeTimers();
    mockNavigate.mockClear(); // Clear navigation mock before each test
  });

  afterEach(() => {
    // Run any remaining timers and restore real timers after each test
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders initial state correctly', () => {
    // Render the screen with an empty exercise list
    const { getByText } = render(
      <GlobalContext.Provider value={createMockGlobalContext()}>
        <BodyFocusScreen />
      </GlobalContext.Provider>
    );
    
    // Expect the text to show that 0 exercises are currently selected
    expect(getByText('View Selected Exercises (0)')).toBeTruthy();
  });

  it('navigates when exercise button is pressed', () => {
    // Create context with one selected exercise
    const { getByText } = render(
      <GlobalContext.Provider value={createMockGlobalContext({
        exerciseList: new Set(['Push Ups'])
      })}>
        <BodyFocusScreen />
      </GlobalContext.Provider>
    );

     // Simulate pressing the button to view selected exercises
    fireEvent.press(getByText('View Selected Exercises (1)'));

    // Verify navigation was triggered with correct route and parameters
    expect(mockNavigate).toHaveBeenCalledWith('SelectedExercises', {
      exercises: ['Push Ups']
    });
  });
});

// run command: npm run test -- BodyFocusScreen.test.tsx