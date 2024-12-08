import { httpRequests } from '@/api/httpRequests';
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { GlobalContext } from './GlobalContext';
import DEFAULT_PROFILE_PICTURE from '@/assets/base64/defaultPicture';

// Define RequestingFriend type
export interface RequestingFriend {
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
  accountCreatedDate: string,
  timeZone: string,
}

interface ProfileContextType {
  requestingFriends: RequestingFriend[];
  requestsOpen: boolean;
  sentFriendRequests: String[];
  setRequestsOpen: (isOpen: boolean) => void;
  reloadFriendRequests: () => void;
  removeFriendRequest: (id: string) => void;
  getFriendRequesterById: (id: string) => RequestingFriend | undefined;
  handleAddSentFriendRequest: (name: string) => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {

  const context = useContext(GlobalContext)

  const [loadedRequests, setLoadedRequests] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)

  const [sentFriendRequests, setSentFriendRequests] = useState<String[]>([])
  const [loadingSent, setLoadingSent] = useState(false)

  const handleAddSentFriendRequest = (name: string) => {
    if (!sentFriendRequests.includes(name)) {
      setSentFriendRequests([...sentFriendRequests, name]);
    }
  };


  const defaultUserProfile: RequestingFriend = {
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    displayname: '',
    bio: '',
    profilePicture: "",
    isDeleted: false,
    restDays: 0,
    restDaysLeft: 0,
    restResetDate: '',
    restRestDayOfWeek: 0,
    accountCreatedDate: '',
    timeZone: '',
  };


  const updateFriendRequests = (newProfiles: RequestingFriend[]) => {
    setRequestingFriends(prevProfiles =>
      newProfiles.map((newProfile, index) => ({
        ...prevProfiles[index],
        ...newProfile,
        profilePicture: newProfile.profilePicture == "" || newProfile.profilePicture == null ? DEFAULT_PROFILE_PICTURE : newProfile.profilePicture
      }))
    );
  };
  

  const [requestingFriends, setRequestingFriends] = useState<RequestingFriend[]>([]);

  const [requestsOpen, setRequestsOpen] = useState(false);

  const removeFriendRequest = (idToRemove: string): void => {
    setRequestingFriends((prevProfiles) =>
      prevProfiles.filter((profile) => profile.id !== idToRemove)
    );
  };

  const getFriendById = (idToFind: string): RequestingFriend | undefined => {
    return requestingFriends.find((profile) => profile.id === idToFind);
  };


  const getSentRequests = async () => {
    try {
    const response = await fetch(`${httpRequests.getBaseURL()}/friendRequest/getAllAccountsWithSpecificStatus/SENT`, {
      method: 'GET', // Set method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
        "Authorization": `Bearer ${context?.data.token}`,
      },
      body: "", // Convert the data to a JSON string
    }); // Use endpoint or replace with BASE_URL if needed
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    setSentFriendRequests(await response.json())
  } catch (error) {
    // If access denied
    // Send to login page
    //context?.setToken("")
    console.error('0013 GET request failed:', error);
    throw error; // Throw the error for further handling if needed
  } finally {
    setLoadingSent(true)
  }
  }
  if (!loadingSent) {
  getSentRequests();
  }

  const fetchFriendRequests = async () => {
    let friendList;
    try {
      console.log("ff")
    setLoadingRequests(true)
    const response = await fetch(`${httpRequests.getBaseURL()}/friendRequest/getAllAccountsWithSpecificStatus/PENDING`, {
      method: 'GET', // Set method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
        "Authorization": `Bearer ${context?.data.token}`,
      },
      body: "", // Convert the data to a JSON string
    }); // Use endpoint or replace with BASE_URL if needed
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    friendList = await response.json()
  } catch (error) {
    // If access denied
    // Send to login page
    //context?.setToken("")
    console.error('0013 GET request failed:', error);
    throw error; // Throw the error for further handling if needed
  }

  try {
    const response = await fetch(`${httpRequests.getBaseURL()}/userProfile/getUserProfilesFromList`, {
      method: 'POST', // Set method to POST
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
        "Authorization": `Bearer ${context?.data.token}`,
      },
      body: JSON.stringify(friendList), // Convert the data to a JSON string
    }); // Use endpoint or replace with BASE_URL if needed
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const json = await response.json()

    updateFriendRequests(json)
  } catch (error) {
    // If access denied
    // Send to login page
    //context?.setToken("")
    console.error('0012 GET request failed:', error);
    throw error; // Throw the error for further handling if needed
  } finally {
    setLoadedRequests(true)
    setLoadingRequests(false)
  }
  }
  const reloadFriendRequests = () => {
    console.log(!loadingRequests)
    if (!loadingRequests) {
      fetchFriendRequests();
    }
}

  return (
    <ProfileContext.Provider
      value={{
        requestingFriends,
        requestsOpen,
        setRequestsOpen,
        reloadFriendRequests,
        removeFriendRequest,
        getFriendRequesterById: getFriendById,
        handleAddSentFriendRequest,
        sentFriendRequests
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
