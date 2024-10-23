// StreakContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { GlobalContext } from './GlobalContext';
import { httpRequests } from '@/api/httpRequests';

interface StreakData {
  id: number;
  currentSt: number;
  prevLogin: string;
}

interface StreakContextProps {
  streak: number;
  loading: boolean;
  error: string | null;
  refreshStreak: () => Promise<void>;
}

const StreakContext = createContext<StreakContextProps | undefined>(undefined);

interface StreakProviderProps {
  children: ReactNode;
}

export const StreakProvider: React.FC<StreakProviderProps> = ({ children }) => {
  const { user } = useContext(GlobalContext);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = async () => {
    if (!user) {
      setStreak(0);
      setLoading(false);
      console.log("streak was set to 0... no user loaded")
      return;
    }

    setLoading(true);
    setError(null);

    try {
        const response = await httpRequests.get(`/streak/getStreak/${user.id}`)
        console.log(response);
      if (!response.ok) throw new Error('Failed to fetch streak');
      const data: StreakData = await response.json();
      setStreak(data.currentSt);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError('Failed to fetch streak. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStreak = async () => {
    await fetchStreak();
  };

  useEffect(() => {
    fetchStreak().catch((err) => {
      console.error('Unhandled error in fetchStreak:', err);
      setError('Failed to fetch streak. Please try again.');
    });
  }, [user]);

  const value = {
    streak,
    loading,
    error,
    refreshStreak,
  };

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
};

export const useStreak = (): StreakContextProps => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export default StreakContext;
