// ContactsContext.tsx
import React, { createContext, useState, ReactNode } from 'react';


// Define this at the top of your file or in a separate types file
export interface modalInfo {
    id: string;
    isVisible: boolean;
  }
  


interface WorkoutContextType {
  modalObject: modalInfo;
  setModalObject: (newModalObject: modalInfo) => void;
  setVisible: (visible : boolean) => void;
  timeRanges: { [key: string]: string };  // Store time ranges
  setTimeRanges: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
    //Creating an array here, feel free to make it whatever you want though.
  //Pretty sure this would usually be an API call unless we hardcode some workouts?
  const [modalObject, setModalObject] = useState<modalInfo>({id: "-1", isVisible: false});
  const [timeRanges, setTimeRanges] = useState<{ [key: string]: string }>({});
  const updateExampleObject = (newModalObject: modalInfo) => {
    setModalObject(newModalObject)
  };

  const setVisible = (visible: boolean) => {
    setModalObject((prevData) => ({ ...prevData, isVisible:visible }))
  }

  return (
    <WorkoutContext.Provider value={{ modalObject, setModalObject, setVisible,timeRanges, setTimeRanges }}>
      {children}
    </WorkoutContext.Provider>
  );
};
