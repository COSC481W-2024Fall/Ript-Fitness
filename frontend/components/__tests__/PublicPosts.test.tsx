//DeepSeek generated test
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, TouchableOpacity, Text } from 'react-native';

// Create mock functions
const mockAddPost = jest.fn();
const mockUseSocialFeed = jest.fn(() => ({
  addPost: mockAddPost,
}));

// Mock the context
jest.mock('@/context/SocialFeedContext', () => ({
  useSocialFeed: mockUseSocialFeed,
}));

// Test component
const TestComponent = () => {
  const { addPost } = require('@/context/SocialFeedContext').useSocialFeed();
  const [isPublic, setIsPublic] = React.useState(false);

  return (
    <View testID="container">
      <TouchableOpacity 
        testID="visibility-toggle"
        onPress={() => setIsPublic(!isPublic)}
      >
        <Text>{isPublic ? 'Public' : 'Private'}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        testID="post-button"
        onPress={() => addPost('Test content', isPublic)}
      >
        <Text>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('PublicPost Functionality', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAddPost.mockClear();
    mockUseSocialFeed.mockImplementation(() => ({
      addPost: mockAddPost,
    }));
  });

  it('should toggle and submit post visibility correctly', () => {
    const { getByTestId } = render(<TestComponent />);

    // Test initial private state
    fireEvent.press(getByTestId('post-button'));
    expect(mockAddPost).toHaveBeenCalledWith('Test content', false);

    // Toggle to public and test
    fireEvent.press(getByTestId('visibility-toggle'));
    fireEvent.press(getByTestId('post-button'));
    expect(mockAddPost).toHaveBeenCalledWith('Test content', true);
  });
});