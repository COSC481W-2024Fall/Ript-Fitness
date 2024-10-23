import React, { useState, useCallback, useEffect, useContext, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  RefreshControl,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import PostItem from '@/components/socialfeed/PostItem';
import { useNavigation } from '@react-navigation/native';
import { useStreak } from '@/context/StreakContext';
import StreakCounter from '@/components/StreakCounter';
import StreakHeader from '@/components/StreakHeader';

type PostData = {
  id: string;
  type: 'text' | 'image';
  content?: string;
  imageUrl?: string;
  caption?: string;
  user: {
    name: string;
    profilePicture: string;
  };
  timestamp: string;
};

// Mock data for the feed
const MOCK_FEED_DATA: PostData[] = [
  {
    id: '1',
    type: 'text',
    content: 'Just hit a new PR on my deadlift! 300lbs!',
    user: {
      name: 'John Doe',
      profilePicture: 'https://avatar.iran.liara.run/public/boy?username=Ash',
    },
    timestamp: '2024-09-27T08:30:00Z',
  },
  {
    id: '2',
    type: 'image',
    imageUrl: 'https://cdn.mos.cms.futurecdn.net/pLaRi5jXSHDKu6WRydetBo-1000-80.jpg.webp',
    caption: 'Bench Press PR - 300lbs!',
    user: {
      name: 'Jane Smith',
      profilePicture: 'https://avatar.iran.liara.run/public/86',
    },
    timestamp: '2024-09-26T15:45:00Z',
  },
  {
    id: '3',
    type: 'text',
    content: 'Feeling amazing after my workout today! 💪💪💪',
    user: {
      name: 'Alexis Johnson',
      profilePicture: 'https://avatar.iran.liara.run/public/63',
    },
    timestamp: '2024-09-26T10:00:00Z',
  },
  {
    id: '4',
    type: 'image',
    imageUrl: 'https://kutv.com/resources/media2/16x9/full/1500/center/80/6b7a7c7c-3c44-489c-9880-4a17508cdc6d-jumbo16x9_Postworkout_meal.jpg',
    caption: 'Just made a good post workout meal',
    user: {
      name: 'John Lee',
      profilePicture: 'https://avatar.iran.liara.run/public/50',
    },
    timestamp: '2024-09-25T12:00:00Z',
  },
    {
    id: '5',
    type: 'image',
    imageUrl: 'https://www.mensjournal.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_1188/MTk2MTM2NjkwOTU5MDY2NjI5/main-squat.webp',
    caption: 'Squat PR - 225lbs!',
    user: {
      name: 'Rob H',
      profilePicture: 'https://avatar.iran.liara.run/public/46',
    },
    timestamp: '2024-09-25T12:01:00Z',
  },
    {
    id: '6',
    type: 'text',
    content: 'Add the greatest workout ever yesterday! 💪💪💪',
    user: {
      name: 'Franky McDonald',
      profilePicture: 'https://avatar.iran.liara.run/public/boy?username=Ash',
    },
    timestamp: '2023-10-26T10:00:00Z',
  },
      {
    id: '7',
    type: 'image',
    imageUrl: 'https://i.insider.com/5f46c955db1ed0002971418c?width=1136&format=jpeg',
    caption: 'I ate some good food after my workout',
    user: {
      name: 'Robbie Fazel',
      profilePicture: 'https://avatar.iran.liara.run/public/37',
    },
    timestamp: '2023-10-26T10:00:00Z',
  },
        {
    id: '8',
    type: 'image',
    imageUrl: 'https://www.superstock.com/cdn/5507/Comp/5507-48208576.webp',
    caption: 'I just finished my workout and feeling great',
    user: {
      name: 'Kate Grantson',
      profilePicture: 'https://avatar.iran.liara.run/public/59',
    },
    timestamp: '2023-10-30T23:57:00Z',
  },
];

// Sort the MOCK_FEED_DATA once to prevent re-sorting on every render
// we might need to re-sort everything when the refresh is pulled down
const sortedMockFeedData = MOCK_FEED_DATA.sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);

export default function SocialFeed() {

  const [likedPosts, setLikedPosts] = React.useState<string[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

const toggleLike = (id: string) => {
  setLikedPosts((prevLikedPosts) => {
    const isAlreadyLiked = prevLikedPosts.includes(id);
    if (isAlreadyLiked) {
      return prevLikedPosts.filter((postId) => postId !== id);
    } else {
      return [...prevLikedPosts, id];
    }
  });
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); //Medium also viable
};

const renderItem = useCallback(
  ({ item }: { item: PostData }) => (
    <PostItem
      item={item}
      liked={likedPosts.includes(item.id)}
      onLikePress={() => toggleLike(item.id)}
    />
  ),
  [likedPosts, toggleLike]
);

  return (
    <SafeAreaView style={styles.container}>
      <StreakHeader></StreakHeader>
      <StatusBar barStyle="default" />
      <FlatList
        ListHeaderComponent={() => <View style={{ marginTop: StatusBar.currentHeight || 0 }} />}
        data={sortedMockFeedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts available</Text>
            <Text style={styles.emptyEmoji}>😭</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
    margin: 7,
  },
  emptyEmoji: {
    fontSize: 48,
    color: '#999',
    margin: 7,
  }
});