import StreakContext from '@/context/StreakContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TextPostScreen = ({ route }: any) => {
  const { content } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.postContent}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  postContent: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default TextPostScreen;
