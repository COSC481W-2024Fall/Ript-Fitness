import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import NutritionTrendScreen from '@/app/screens/foodlog/NutritionTrendScreen';
import { GlobalContext } from '@/context/GlobalContext';
import { createMockGlobalContext } from '@/__mocks__/createMockGlobalContext';

// Mock global fetch: always return 200 OK with an empty object
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;
});

//Mock navigation to avoid runtime errors related to navigation context
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({}),
}));

// Mock chart-kit library so chart rendering won't interfere with testing
jest.mock('react-native-chart-kit', () => ({
  LineChart: () => null,
}));

// Mock react-native-reanimated to prevent animation crashes during test runs
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('NutritionTrendScreen', () => {
  // Enable fake timers for better control over animations and async behavior
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // Clean up after each test to avoid memory leaks and side effects
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: Basic render check
   * This verifies that the screen first shows the loading spinner,
   * and then displays the "Nutrition Trend" header once data has loaded.
   */
  it('renders loading spinner and then header', async () => {
    const { getByText, queryByText } = render(
      <GlobalContext.Provider value={createMockGlobalContext()}>
        <NutritionTrendScreen />
      </GlobalContext.Provider>
    );

    // Expect loading spinner to be visible initially
    expect(getByText('Loading...')).toBeTruthy();

    // Wait until the header appears
    await waitFor(() => {
      expect(getByText('Nutrition Trend')).toBeTruthy();
    });

    // Ensure the loading spinner disappears
    expect(queryByText('Loading...')).toBeNull();
  });


   /**
   * Test Case 2: Toggle view between 7 Days and 30 Days
   * This simulates toggling the range switch and ensures
   * the label updates correctly to reflect the current view.
   */
  it('toggles between 7 Days and 30 Days view', async () => {
    const { getByTestId } = render(
      <GlobalContext.Provider value={createMockGlobalContext()}>
        <NutritionTrendScreen />
      </GlobalContext.Provider>
    );

    // Get the toggle switch and label elements
    const toggle = await waitFor(() => getByTestId('range-switch'));
    const label = getByTestId('range-label');

    // Expect default view to be 7 Days
    expect(label.props.children).toBe('7 Days');

    // Toggle switch to 30 Days
    fireEvent(toggle, 'valueChange', true);
    await waitFor(() => {
      expect(label.props.children).toBe('30 Days');
    });

    // Toggle switch back to 7 Days
    fireEvent(toggle, 'valueChange', false);
    await waitFor(() => {
      expect(label.props.children).toBe('7 Days');
    });
  });
});


// rum command: npm run test -- NutritionTrendScreen.test.tsx