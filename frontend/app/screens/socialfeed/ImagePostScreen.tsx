import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import StreakHeader from '@/components/StreakHeader';

const ImagePostScreen = ({ route }: any) => {
  const { imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <StreakHeader></StreakHeader>
      <Image source={{ uri: imageUrl }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default ImagePostScreen;
