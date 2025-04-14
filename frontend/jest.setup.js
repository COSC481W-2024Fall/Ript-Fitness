// jest.setup.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// jest.setup.js
// Suppress console.error output during tests to keep test logs clean
// This is especially helpful to hide expected React or Jest warnings (e.g., act() warnings)
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
// Restore original console.error behavior after all tests complete
afterAll(() => {
  console.error.mockRestore();
});


// Mock react-native-reanimated early to prevent crashes related to Animated.Value
// This fixes common issues with Reanimated v2 during testing (e.g., "Animated call not supported")
// The `.default.call` override is required for some Reanimated internals used in animations
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {}; // Avoid runtime errors on `.call()` usage
  return Reanimated;
});
 
// Mock react-native-screens to simplify rendering of navigation screens in Jest environment
// These mocks bypass native behavior of screen containers and treat screens as regular views
// This is essential when testing components that are part of a navigation stack
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),                  // Stub screen enabling (no-op)
  Screen: ({ children }) => children,        // Render children directly
  NativeScreen: ({ children }) => children,
  ScreenContainer: ({ children }) => children,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
import '@testing-library/jest-native/extend-expect';

// Mock react-native-svg to prevent Jest from failing on SVG imports
jest.mock('react-native-svg', () => require('react-native-svg-mock'));

jest.mock('react-native-draggable-flatlist', () => {
  return {
    __esModule: true,
    default: jest.fn(() => null), // Mock the DraggableFlatList component
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// jest.setup.js
jest.mock('expo-modules-core', () => ({
    NativeModule: jest.fn(),
  }));
  
  jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
  }));
  
  jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
  }));


  jest.mock('@expo/vector-icons/Ionicons', () => {
    return {
      __esModule: true,
      default: 'Ionicons',
    };
  });

  
  jest.mock('@react-navigation/native', () => {
    return {
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: jest.fn(),
      }),
    };
  });

  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      ScrollView: View,
      Switch: View,
      TextInput: View,
      DrawerLayoutAndroid: View,
      WebView: View,
      State: {},
      PanGestureHandler: View,
      TapGestureHandler: View,
      FlingGestureHandler: View,
      ForceTouchGestureHandler: View,
      LongPressGestureHandler: View,
      PinchGestureHandler: View,
      RotationGestureHandler: View,
      /* Add any other components as needed */
    };
  });

 // Custom mock for react-native Animated module to support animation-based components in tests
// This ensures animations like timing, parallel, sequence, and loop won't crash during Jest runs
jest.mock('react-native/Libraries/Animated/Animated', () => {
  // Get the actual Animated module to preserve default behavior where needed
  const actual = jest.requireActual('react-native/Libraries/Animated/Animated');

  return {
    // Spread the original Animated module to retain non-overridden methods
    ...actual,

    // Explicitly mock the Animated.Value class (needed for consistency)
    Value: actual.Value,

    /**
     * Mock implementation of Animated.timing:
     * Immediately sets the animated value to its target (config.toValue)
     * and invokes the start callback with { finished: true }.
     */
    timing: (value, config) => ({
      start: (callback) => {
        value.setValue(config.toValue); // simulate the value reaching its target
        callback?.({ finished: true }); // simulate animation completion
        return { stop: jest.fn() };     // stub stop method
      },
    }),

    /**
     * Mock implementation of Animated.parallel:
     * Starts all animations simultaneously, then calls the callback.
     */
    parallel: (animations) => ({
      start: (callback) => {
        animations.forEach(anim => anim.start()); // start each animation
        callback?.({ finished: true });           // simulate group completion
        return { stop: jest.fn() };
      },
    }),

    /**
     * Mock implementation of Animated.sequence:
     * Runs animations sequentially using Promise chaining,
     * and calls the final callback once all are done.
     */
    sequence: (animations) => ({
      start: (callback) => {
        animations.reduce(
          (promise, anim) => promise.then(() => new Promise(resolve => anim.start(resolve))),
          Promise.resolve()
        ).then(() => callback?.({ finished: true })); // after all animations
        return { stop: jest.fn() };
      },
    }),

    /**
     * Mock implementation of Animated.loop:
     * Doesn't actually repeat, just returns a mocked start/stop interface.
     */
    loop: (animation) => ({
      start: () => ({ stop: jest.fn() }), // no-op loop
    }),
  };
});