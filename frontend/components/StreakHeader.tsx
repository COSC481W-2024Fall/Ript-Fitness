import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation} from '@react-navigation/native';
import StreakCounter from './StreakCounter';
import { useStreak } from '@/context/StreakContext';

const StreakHeader = () => {
  const navigation = useNavigation();
  const { streak, loading, error } = useStreak();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (loading || error) {
          return <View />;
        }
        return <StreakCounter streak={streak} />;
      },
    });
  }, [navigation, streak, loading, error]);

  return null;
};

export default StreakHeader;
