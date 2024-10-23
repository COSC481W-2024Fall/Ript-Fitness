// ./app/(tabs)/SocialStack.tsx

import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator, HeaderStyleInterpolators } from '@react-navigation/stack';
import { SocialProvider } from '@/context/SocialContext';
import SocialFeed from '../screens/socialfeed/SocialFeed';
import CommentsScreen from '../screens/socialfeed/CommentsScreen';
import TextPostScreen from '../screens/socialfeed/TextPostScreen';
import ImagePostScreen from '../screens/socialfeed/ImagePostScreen';
import StreakCounter from '@/components/StreakCounter';
import { StreakProvider} from '@/context/StreakContext';

const Stack = createStackNavigator();

const SocialStack: React.FC = () => {
  return (
      <SocialProvider>
        <Stack.Navigator
          initialRouteName="SocialFeed"
          screenOptions={{
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#f8f8f8',
            },
            headerStyleInterpolator: HeaderStyleInterpolators.forNoAnimation,
          }}
        >
          <Stack.Screen
            name="SocialFeed"
            component={SocialFeed}
            options={{ title: 'Social Feed', headerRight: () => <StreakCounter />, }}
          />
          <Stack.Screen
            name="CommentsScreen"
            component={CommentsScreen}
            options={{ title: 'Comments', headerRight: () => <StreakCounter />, }}
          />
          <Stack.Screen
            name="TextPostScreen"
            component={TextPostScreen}
            options={{ title: 'New Text Post', headerRight: () => <StreakCounter />, }}
          />
          <Stack.Screen
            name="ImagePostScreen"
            component={ImagePostScreen}
            options={{ title: 'New Image Post', headerRight: () => <StreakCounter />, }}
          />
          {/* Add any additional screens here */}
        </Stack.Navigator>
      </SocialProvider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor:'#005500',
    padding:0,
    margin:0,
    width:'100%',
    },
    
    centerContentContainer: {
      alignItems:'center',
    },
      SafeAreaView: {

        //alignItems: 'center',
        backgroundColor: '#0ffff0',
        height:'100%',
        width:'100%',
        //overflow:'scroll',
        paddingTop:20,
        justifyContent: 'flex-start',
        flexDirection:'column',
      },
    
      sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
      },
      sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
      },
      sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
      },
      highlight: {
        fontWeight: '700',
      },
    
      size40x40: {
        height:40,
        width:40,
      },
    });

    export default SocialStack; // Ensure SocialStack is exported as default