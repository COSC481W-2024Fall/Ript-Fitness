import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FullBioScreen from '@/app/screens/profile/FullBioScreen';
import { GlobalContext } from '@/context/GlobalContext';
import { NavigationContainer } from '@react-navigation/native';

//  Use fake timers to avoid Jest warnings related to unhandled 
// async timeouts (like setTimeout)
jest.useFakeTimers(); 

//  Mock global fetch to simulate backend success response
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('Updated!'),
  })
) as jest.Mock;

// Mock for navigation.goBack() to verify if navigation was triggered
const mockGoBack = jest.fn();

//Mock useNavigation from React Navigation to avoid using the actual navigator
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
  };
});

describe('FullBioScreen (as current user)', () => {
  //Mock user profile passed through route and used in context
  const mockUserProfile = {
    id: '123',
    bio: 'This is my old bio.',
    profilePicture: '',
    displayname: 'TestUser',
  };

  // Mock value for GlobalContext, including user info and token
  const mockContextValue = {
    isDarkMode: false,
    userProfile: mockUserProfile,
    data: { token: 'fake-token' },
    updateUserProfile: jest.fn(),
  };

  it('renders bio input, allows editing and saving', async () => {
    // Render FullBioScreen inside both context and navigation containers
    const { getByPlaceholderText, getByText } = render(
      <GlobalContext.Provider value={mockContextValue as any}>
        <NavigationContainer>
          <FullBioScreen route={{ params: { userProfile: mockUserProfile } }} />
        </NavigationContainer>
      </GlobalContext.Provider>
    );

    // Find and change the bio input text
    const bioInput = getByPlaceholderText('Enter your bio...');
    fireEvent.changeText(bioInput, 'Updated bio for test');

    // Tap the save button
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    // Wait for all async actions (fetch, update, navigation) to complete
    await waitFor(() => {
      // Check if fetch is called with correct payload
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/userProfile/updateUserProfile'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
          body: JSON.stringify({ bio: 'Updated bio for test' }),
        })
      );

      // Check if context's updateUserProfile was called
      expect(mockContextValue.updateUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          bio: 'Updated bio for test',
        })
      );

      // Check if navigation.goBack was triggered
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});

//After all tests are done, restore real timers
afterAll(() => {
  jest.useRealTimers(); 
});
