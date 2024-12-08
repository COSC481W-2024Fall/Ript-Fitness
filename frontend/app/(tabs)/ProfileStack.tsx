import { StyleSheet } from 'react-native';


import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { ProfileProvider } from '@/context/ProfileContext';
import ProfileScreen from '@/app/screens/profile/ProfileScreen';
import GraphScreen from '@/app/screens/profile/GraphScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/PasswordScreen';
import FriendsScreen from '../screens/profile/FriendsScreen';
import FindFriendsScreen from '../screens/profile/FindFriendsScreen';
import FullBioScreen from '../screens/profile/FullBioScreen'
import VisitProfileScreen from '../screens/profile/VisitProfileScreen'
import { ProfileObject } from '@/context/GlobalContext';
import ApiScreen from '../screens/ApiScreen';
import EditNoteScreen from '../screens/notes/EditNoteScreen';
import { Note } from '@/components/MyNotes/NotesContext';
import ImageFullScreen from '../screens/profile/ImageFullScreen';
import RiptTeamScreen from '../screens/profile/RiptTeamScreen';



export type ProfileStackParamList = {
  GraphScreen: undefined;
  SettingsScreen: undefined;
  RiptTeamScreen: undefined;
  FriendsScreen: undefined;
  FindFriendsScreen: undefined;
  FullBioScreen: { userProfile: ProfileObject };
  VisitProfileScreen: any;
  ApiScreen: undefined;
  ImageFullScreen: {};
};

export type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const Stack = createStackNavigator();

export default function ProfileStack(props : any) {
  return (
    <ProfileProvider>
    <Stack.Navigator initialRouteName="ProfileScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerShown:false}}/>
      <Stack.Screen name="GraphScreen" component={GraphScreen} options={{headerShown:false}}/>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{headerShown:false}}/>
      <Stack.Screen name="RiptTeamScreen" component={RiptTeamScreen} options={{headerShown:false}}/>
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{headerShown:false}}/>
      <Stack.Screen name="FriendsScreen" component={FriendsScreen} options={{headerShown:false}}/>
      <Stack.Screen name="FindFriendsScreen" component={FindFriendsScreen} options={{headerShown:false}}/>
      <Stack.Screen name="FullBioScreen" component={FullBioScreen as any} options={{headerShown:false}}/>
      <Stack.Screen name="VisitProfileScreen" component={VisitProfileScreen} options={{headerShown:false}}/>
      <Stack.Screen name="ImageFullScreen" component={ImageFullScreen} options={{headerShown:false}}/>
      <Stack.Screen name="ApiScreen" component={ApiScreen} options={{headerShown:false}}/>
      {/* Put any additional screens for your tab here. This allows us to use a stack.
        A stack allows us to easily navigate back a page when we're in a secondary screen on a certain tab.
      */}
    </Stack.Navigator>
    </ProfileProvider>
  );
}

/*
      {contacts.map((contact, index) => (
                <Tile key={contact.key}
                index={index}
                onTileLoad={() => setTilesLoaded(prevTilesLoaded => prevTilesLoaded + 1)}
                //contactOnPress={() => navigation.navigate(Contact, {key:Tiles.length, contactInfo: contactsList[Tiles.length]})} 
                navigation={navigation}/>
            ))}

*/

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
