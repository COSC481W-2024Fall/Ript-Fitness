import { GlobalContextType } from '@/context/GlobalContext';
import type {
  GlobalData,
  ProfileObject,
  FriendObject,
  Calendar,
  CalendarLoadTracker,
  Workout,
  Exercise,
} from '@/context/GlobalContext';

/**
 * Creates a fully mocked version of the GlobalContext to be used in tests.
 * You can override any part of the context by passing a partial object to `overrides`.
 */

export const createMockGlobalContext = (
  overrides: Partial<GlobalContextType> = {}
): GlobalContextType => {
  const mockUserProfile: ProfileObject = {
    id: 'mock-user-id',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    displayname: 'John D.',
    bio: 'Mock bio',
    profilePicture: '',
    isDeleted: false,
    accountCreatedDate: new Date().toISOString(),
    timeZone: 'UTC',
    restDays: 0,
    restDaysLeft: 0,
    restResetDate: new Date().toISOString(),
    restRestDayOfWeek: 0,
  };

  return {
    // Simulated user token and data
    data: { token: 'mock-token' } as GlobalData,
    updateGlobalData: jest.fn(),

    // Loading flags
    isLoaded: true,
    additionalLoadingRequired: false,
    loadInitialData: jest.fn(),
    loadAdditionalData: jest.fn(),

    // Auth-related methods
    setToken: jest.fn(),

    // User profile and methods
    userProfile: mockUserProfile,
    updateUserProfile: jest.fn(),

    // Friend-related fields
    friends: [],
    setFriends: jest.fn(),
    removeFriend: jest.fn(),
    addFriend: jest.fn(),

    // Calendar data and loaders
    calendar: {} as Calendar,
    calendarLoadTracker: {} as CalendarLoadTracker,
    loadCalendarDays: jest.fn().mockResolvedValue(undefined),
    clearCalendar: jest.fn(),

    // Pending state tracking
    incrementRemovePending: jest.fn(),
    decrementRemovePending: jest.fn(),

    // Workout list and management functions
    workouts: [],
    fetchWorkouts: jest.fn().mockResolvedValue(undefined),
    addWorkout: jest.fn(),
    updateWorkout: jest.fn(),
    setWorkouts: jest.fn(),

    // Refresh friends list
    reloadFriends: jest.fn(),

    // UI mode
    isDarkMode: false,
    toggleTheme: jest.fn(),

    // Exercise selection and workout planning
    exerciseList: new Set(),
    setExerciseList: jest.fn(),
    clearExerciseList: jest.fn(),
    selectedExerciseObjects: [],
    setSelectedExerciseObjects: jest.fn(),

    // Allow overrides
    ...overrides,
  };
};
