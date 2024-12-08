
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpRequests } from '@/api/httpRequests';
import { ProfileContext } from './ProfileContext';
import DEFAULT_PROFILE_PICTURE from '@/assets/base64/defaultPicture';




// Define the structure of your global data
export interface GlobalData {
  token: string;
}

export interface ProfileObject {
  id: string,
  firstName: string,
  lastName: string,
  username: string,
  displayname: string,
  bio: string,
  profilePicture: string,
  isDeleted: false,
  restDays: number,
  restDaysLeft: number,
  restResetDate: string,
  restRestDayOfWeek: number,
}

export interface FriendObject {
  id: string,
  firstName: string,
  lastName: string,
  username: string,
  displayname: string,
  bio: string,
  profilePicture: string,
  isDeleted: false,
  restDays: number,
  restDaysLeft: number,
  restResetDate: string,
  restRestDayOfWeek: number,
}


export interface CalendarDay {
  date: "string",
  activityType: number,
}

export interface Calendar {
  [date: string]: number,
}

export interface CalendarLoadTracker {
  startDate: string,
  endDate: string,
}

export interface Workout {
  id: number; // Optional, as it will be mapped from workoutsId
  name: string;
  exercises: Exercise[];
  isDeleted?: boolean;
}


export interface Exercise {
  exerciseId: number | null ;
  nameOfExercise: string;
  sets: number;
  reps: number[];
  weight: number[];
  description: string;
  exerciseType: number;
  isDeleted?: boolean;


}


interface GlobalContextType {
  data: GlobalData;
  updateGlobalData: (updatedData: GlobalData) => void;
  isLoaded: boolean;
  additionalLoadingRequired: boolean;
  loadInitialData: () => void;
  loadAdditionalData: () => void;
  setToken: (token: string) => void;
  userProfile: ProfileObject;
  updateUserProfile: (newExampleObject: ProfileObject) => void;
  friends: FriendObject[];
  setFriends: (newFriends : FriendObject[]) => void;
  removeFriend: (friendId: string) => void;
  addFriend: (newFriend: FriendObject) => void;
  calendar: Calendar;
  calendarLoadTracker: CalendarLoadTracker;
  loadCalendarDays: (dateRange: { startYear: number; startMonth: number; endYear: number; endMonth: number; }) => Promise<void>;
  clearCalendar: () => void;


  workouts: Workout[];
  fetchWorkouts: () => Promise<void>;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (updatedWorkout: Workout) => void;
  reloadFriends: () => void;

}


export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);


interface GlobalProviderProps {
  children: ReactNode;
}

function getDateRange() {
  // Get the current date
  const currentDate = new Date();

  // Set endYear and endMonth to the current year and month
  const endYear = currentDate.getFullYear();
  const endMonth = currentDate.getMonth() + 1; // getMonth() is zero-based

  // Calculate last month's date
  const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, 1);

  // Set startYear and startMonth to the year and month of last month
  const startYear = lastMonthDate.getFullYear();
  const startMonth = lastMonthDate.getMonth() + 1; // Adjust for zero-based month

  // Return the results
  return { startYear, startMonth, endYear, endMonth };
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {


  const [isLoaded, setIsLoaded] = useState(false);
  const [additionalLoadingRequired, setAdditionalLoadingRequired] = useState(false);
  const [data, setData] = useState<GlobalData>({ token: '' });
  const [calendar, setCalendar] = useState<Calendar>({});
  const [calendarLoadTracker, setCalendarLoadTracker] = useState<CalendarLoadTracker>({ startDate:"", endDate:""})
  const [workouts, setWorkouts] = useState<Workout[]>([]);




  const updateCalendarLoadTracker = (dateRange: { startDate: string; endDate: string }) => {
    setCalendarLoadTracker((prevTracker) => {
      // Compare and update the startDate
      const updatedStartDate =
        !prevTracker.startDate || new Date(dateRange.startDate) < new Date(prevTracker.startDate)
          ? dateRange.startDate
          : prevTracker.startDate;
  
      // Compare and update the endDate
      const updatedEndDate =
        !prevTracker.endDate || new Date(dateRange.endDate) > new Date(prevTracker.endDate)
          ? dateRange.endDate
          : prevTracker.endDate;
  
      return {
        startDate: updatedStartDate,
        endDate: updatedEndDate,
      };
    });
  };
  
  
  const defaultUserProfile: ProfileObject = {
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    displayname: '',
    bio: '',
    profilePicture: '',
    isDeleted: false,
    restDays: 0,
    restDaysLeft: 0,
    restResetDate: '',
    restRestDayOfWeek: 0,
  };

  const [userProfile, setMyUserProfile] = useState<ProfileObject>(defaultUserProfile);

  const [privatePhotos, setPrivatePhotos] = useState<String[]>([]);


    const [friends, setFriends] = useState<FriendObject[]>([]);

    const updateUserProfile = (newProfile: ProfileObject) => {
      setMyUserProfile((prevProfile) => ({
        ...prevProfile,
        ...newProfile,
        profilePicture: (newProfile.profilePicture == undefined || newProfile.profilePicture == "") ? DEFAULT_PROFILE_PICTURE : newProfile.profilePicture,
      }));
    };

    const updateFriends = (newFriends: FriendObject[]) => {
      setFriends((prevFriends) => 
        newFriends.map((newFriend, index) => {
          const prevFriend = prevFriends[index] || {}; // Get the corresponding previous friend or an empty object
          return {
            ...prevFriend,
            ...newFriend,
            profilePicture: (newFriend.profilePicture == undefined || newFriend.profilePicture == "")
              ? DEFAULT_PROFILE_PICTURE
              : newFriend.profilePicture,
          };
        })
      );
    };
    

  const removeFriend = (friendId: string) => {
    setFriends((prevFriends) =>
      prevFriends.filter((friend) => friend.id !== friendId)
    );
  };

  const addFriend = (newFriend: FriendObject) => {
    setFriends((prevFriends) => {
      // Check if the friend already exists based on `id`
      const friendExists = prevFriends.some((friend) => friend.id === newFriend.id);
  
      // If the friend doesn't exist, add it to the list
      return friendExists ? prevFriends : [...prevFriends, newFriend];
    });
  };
  /*const startFriendsList = (usernames: string[]): FriendObject[] => {
    return usernames.map((username) => ({
      id: '', // Empty string for now
      username,
      displayName: '',
      bio: '',
      image: 'https://via.placeholder.com/40',
      isDeleted: false,
    }));
  };*/
  
  const updateGlobalData = (updatedData: GlobalData) => {
    setData(updatedData);
  };

  const clearContext = () => {
    setMyUserProfile(defaultUserProfile);
    setFriends([])

  };

  const clearCalendar =() => {
    setCalendar({})
    setCalendarLoadTracker({ startDate:"", endDate:""})
  }

  const setToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('@token', token);
      setData((prevData) => ({ ...prevData, token }));
      if (token == "") {
        clearContext();
        setAdditionalLoadingRequired(true)
      }
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  };
  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts((prevWorkouts) =>
      prevWorkouts.map((workout) =>
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      )
    );
  };


  const fetchWorkouts = async () => {
    try {
      console.log("Fetching workouts with token:", data.token);


      const response = await fetch(`${httpRequests.getBaseURL()}/workouts/getUsersWorkouts/0/10000`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });


      if (!response.ok) {
        throw new Error(`Failed to fetch workouts: ${response.statusText}`);
      }


      const fetchedWorkouts: Workout[] = await response.json();
      console.log("Fetched workouts:", fetchedWorkouts);


      setWorkouts(fetchedWorkouts); // Update the state with fetched workouts
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };
  const addWorkout = (workout: Workout) => {
    console.log("Adding workout to global context:", workout);
    setWorkouts((prevWorkouts) => [...prevWorkouts, workout]);
  };




  // Track changes to `data` and log the new value
  useEffect(() => {
  }, [data.token]); // Run whenever `data` changes


  const loadInitialData = async () => {
    if (!isLoaded) {
      await loadToken();
      if (data.token != "") {
        await Promise.all([
          loadInitialBodyData(),
          loadInitialProfileData(),
          loadInitialSocialData(),
          loadInitialWorkoutData(),
        ]);
      } else {
        setAdditionalLoadingRequired(true);
      }
      setIsLoaded(true);
    }
  };

  const loadAdditionalData = async () => {
      if (data.token != "") {
        await Promise.all([
          loadInitialBodyData(),
          loadInitialProfileData(),
          loadInitialSocialData(),
          loadInitialWorkoutData(),
        ]);
        setIsLoaded(true);
        setAdditionalLoadingRequired(false);
    }
    return false;
  };


  const loadToken = async () => {
    let storedToken
    try {
      storedToken = await AsyncStorage.getItem('@token');
      if (storedToken) {
        await setToken(storedToken);
      } else {
        return
      }
    } catch (error) {
      console.error('Failed to load token:', error);
    }

    try {
    const response = await fetch(`${httpRequests.getBaseURL()}/api/token/validate`, {
      method: 'POST', // Set method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: `${storedToken}`, // Convert the data to a JSON string
    }); // Use endpoint or replace with BASE_URL if needed
    if (!response.ok) {
      setToken("");
    }
    //const json = await response.text() //.json(); // Parse the response as JSON;
    //return json; // Return the JSON data directly
  } catch (error) {
  
    console.error('0001 GET request failed:', error);
    throw error; // Throw the error for further handling if needed
  }

  };



  // Simulated data loading functions
  const loadInitialBodyData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const loadCalendarDays = async (dateRange: { startYear:number, startMonth:number, endYear:number, endMonth:number }) => {
    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/calendar/getMonth?startYear=${dateRange.startYear}&startMonth=${dateRange.startMonth}&endYear=${dateRange.endYear}&endMonth=${dateRange.endMonth}`, {
        method: 'GET', // Set method to POST
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
          "Authorization": `Bearer ${data.token}`,
        },
        body: "", // Convert the data to a JSON string
      });
      if (!response.ok) {
        console.log("response not okay")
        //setToken("");
      }
      
     const json = await response.json()

     const calendarData: Calendar = {};
     json.forEach((day : CalendarDay) => {
       calendarData[day.date] = day.activityType;
     });
    
     setCalendar((prevCalendar) => ({
      ...prevCalendar,
      ...json.reduce((acc : any, day: CalendarDay) => {
        acc[day.date] = day.activityType;
        return acc;
      }, {} as Calendar),
    }));

    updateCalendarLoadTracker(getFormattedDateRange(dateRange))
    } catch (error) {
    
      console.error('0005 GET request failed:', error);
      throw error; // Throw the error for further handling if needed
    }
  }

  const getFormattedDateRange = (dateRange: { startYear: number; startMonth: number; endYear: number; endMonth: number }) => {
    // First day of the start month/year
    const firstDay = new Date(dateRange.startYear, dateRange.startMonth - 1, 1);
  
    // Last day of the end month/year
    const lastDay = new Date(dateRange.endYear, dateRange.endMonth, 0); // Day 0 gives the last day of the previous month
  
    // Helper function to format dates to year-month-day
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  
    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  };

  const reloadFriends = async () => {
    try {


      const response = await fetch(`${httpRequests.getBaseURL()}/friends/getFriendsListOfCurrentlyLoggedInUser`, {
        method: 'GET', // Set method to POST
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
          "Authorization": `Bearer ${data.token}`,
        },
        body: "", // Convert the data to a JSON string
      }); // Use endpoint or replace with BASE_URL if needed
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const friendNames = await response.json()
            try {
  
  
              const response = await fetch(`${httpRequests.getBaseURL()}/userProfile/getUserProfilesFromList`, {
                method: 'POST', // Set method to POST
                headers: {
                  'Content-Type': 'application/json', // Set content type to JSON
                  "Authorization": `Bearer ${data.token}`,
                },
                body: JSON.stringify(friendNames), // Convert the data to a JSON string
              }); // Use endpoint or replace with BASE_URL if needed
              if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
              }
              const json = await response.json()
              console.log("foo " + JSON.stringify(json))
              updateFriends(json)
          
            } catch (error) {
              // If access denied
              // Send to login page
              setToken("")
              console.error('0004 GET request failed:', error);
              throw error; // Throw the error for further handling if needed
            }
  
    } catch (error) {
      // If access denied
      // Send to login page
      setToken("")
      console.error('0003 GET request failed:', error);
      throw error; // Throw the error for further handling if needed
    }
  }

  const loadInitialProfileData = async () => {
      try {
      const response = await fetch(`${httpRequests.getBaseURL()}/userProfile/getUserProfile`, {
        method: 'GET', // Set method to POST
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
          "Authorization": `Bearer ${data.token}`,
        },
        body: "", // Convert the data to a JSON string
      }); // Use endpoint or replace with BASE_URL if needed
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      console.log("loading...")
      const json = await response.json()
      console.log(json)
      updateUserProfile(json)
    } catch (error) {
      // If access denied
      // Send to login page
      setToken("")
      console.error('0002 GET request failed:', error);
      throw error; // Throw the error for further handling if needed
    }
    reloadFriends();

  const dateRange = getDateRange();
  await loadCalendarDays(dateRange)

  };

  const loadInitialSocialData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const loadInitialWorkoutData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };


  return (


    <GlobalContext.Provider
      value={{
        data,
        updateGlobalData,
        loadInitialData,
        loadAdditionalData,
        isLoaded,
        additionalLoadingRequired,
        setToken,
        userProfile,
        updateUserProfile,
        friends,
        setFriends,
        removeFriend,
        addFriend,
        calendar,
        calendarLoadTracker,
        loadCalendarDays,
        clearCalendar,
        workouts,
        fetchWorkouts,
        addWorkout,
        updateWorkout,
        reloadFriends,
      }}
    >


      {children}
    </GlobalContext.Provider>
  );
};

