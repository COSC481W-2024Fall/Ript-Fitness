import { StyleSheet } from 'react-native';


import { createStackNavigator } from '@react-navigation/stack';
import ApiScreen from '@/app/screens/ApiScreen';
import { WorkoutProvider } from '@/context/WorkoutContext';



const Stack = createStackNavigator();

export default function WorkoutStack(props : any) {
  return (
    <WorkoutProvider>
    <Stack.Navigator initialRouteName="MyHomeScreen123" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyHomeScreen123" component={ApiScreen} />
      {/* Put any additional screens for your tab here. This allows us to use a stack.
        A stack allows us to easily navigate back a page when we're in a secondary screen on a certain tab.
      */}
    </Stack.Navigator>
    </WorkoutProvider>
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