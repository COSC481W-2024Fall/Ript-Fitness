import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the structure of your user data
interface User {
  id: number;
  username: string;
}

// Define the structure of your global data
export interface GlobalData {
  session_id: string;
}
interface GlobalContextType {
  data: GlobalData;
  updateGlobalData: (updatedData: GlobalData) => void;
  isLoaded: boolean;
  loadInitialData: () => void;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const defaultGlobalContext: GlobalContextType = {
  data: { session_id: '' },
  updateGlobalData: () => {},
  isLoaded: false,
  loadInitialData: () => {},
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
};

export const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GlobalData>({ session_id: "FakeSessionIdHere02u342" });

  const updateGlobalData = (updatedData: GlobalData) => {
    setData(updatedData);
  };

  const loadInitialData = async () => {
    await Promise.all([
      loadInitialBodyData(),
      loadInitialProfileData(),
      loadInitialSocialData(),
      loadInitialWorkoutData(),
    ]);
    setIsLoaded(true);
  };

  // Simulated data loading functions
  const loadInitialBodyData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const loadInitialProfileData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const loadInitialSocialData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const loadInitialWorkoutData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  //Load the user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Loading user data...');
        setIsLoading(true);
        const userDataString = await AsyncStorage.getItem('@user');
        if (userDataString) {
          const userData: User = JSON.parse(userDataString);
          console.log('User data loaded:', userData);
          setUser(userData);
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadUserData().catch(error => {
      console.error('Unhandled error in loadUserData:', error);
    });
  }, []);

  // Function to handle login
  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  };

  return (
    <GlobalContext.Provider 
      value={{ 
        data, 
        updateGlobalData, 
        loadInitialData, 
        isLoaded,
        user, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};