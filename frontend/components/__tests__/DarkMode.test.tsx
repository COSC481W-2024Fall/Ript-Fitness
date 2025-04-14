import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyWorkoutsScreen from '../../app/screens/workout/MyWorkoutsScreen';
import { GlobalContext } from '@/context/GlobalContext'; // Replace with the correct path for your context
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSocialFeed } from "@/context/SocialFeedContext";
import CreatePostSheet from "@/app/screens/socialfeed/CreatePostSheet";



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

  //mocking socialfeed context 
  jest.mock("@/context/SocialFeedContext", () => ({
    useSocialFeed: jest.fn(),
  }));
  
  // mocking sheet creation 
  jest.mock("@gorhom/bottom-sheet", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
      __esModule: true,
      default: React.forwardRef(({ children }, ref) => (
        <View ref={ref}>{children}</View>
      )),
      BottomSheetTextInput: (props: any) => <View {...props} />,
    };
  });
  
  jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: "Icon",
  }));
  
  describe("CreatePostSheet", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
  
    it("automatically sets as white", () => {
      (useSocialFeed as jest.Mock).mockReturnValue({
        addPost: jest.fn(),
      });
  
      const { getByText, getByTestId } = render(<CreatePostSheet />);
      const container = getByTestId('create-post-sheet');

      const isDarkMode = false;

      // automatic setting is set so that background is white! 
      expect(container).toHaveStyle({backgroundColor: isDarkMode? "black" : "white"});
    });
  });

// Mock the GlobalContext.Provider in the test
const MockGlobalProvider = ({ children, value }: any) => {
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

describe('CreatePostSheet', () => {
  it('renders post sheet correctly when isDarkMode is false', () => {
    const mockContextValue = {
      isDarkMode: false,
      toggleTheme: jest.fn(),
    };

    const { getByTestId } = render(
      <MockGlobalProvider value={mockContextValue}>
        <CreatePostSheet />
      </MockGlobalProvider>
    );

    const container = getByTestId('create-post-sheet');
    
    expect(container).toHaveStyle({ backgroundColor: 'white' });
  });

  it('renders post sheet correctly when isDarkMode is true', () => {
    // Provide mock context value with isDarkMode: true
    const mockContextValue = {
      isDarkMode: true,
      toggleTheme: jest.fn(),
    };

    const { getByTestId } = render(
      <MockGlobalProvider value={mockContextValue}>
        <CreatePostSheet />
      </MockGlobalProvider>
    );

    const container = getByTestId('create-post-sheet');
    
    expect(container).toHaveStyle({ backgroundColor: 'black' });
  });

  test('it should pop up a modal after button press', () => {
    // Render the component
    const { getByText } = render(<Calendar />);

    // Find the "Press me" button and simulate a press
    const pressButton = getByText('Press me');
    
    // Fire the press event
    fireEvent.press(pressButton);

    // Check if the "You pressed the button!" text appears after the press
    expect(getByText('You pressed the button!')).toBeTruthy();
  });
});

  

