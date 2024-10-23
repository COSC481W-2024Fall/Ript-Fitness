import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';


import { createStackNavigator, StackNavigationProp, HeaderStyleInterpolators } from '@react-navigation/stack';
import ApiScreen from '@/app/screens/ApiScreen';
import MyWorkoutsScreen from '@/app/screens/MyWorkoutsScreen';
import WorkoutApiScreen from '@/app/screens/WorkoutApiScreen';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import AddWorkoutScreen from '../screens/workout/AddWorkoutScreen';
import StartWorkoutScreen from '../screens/StartWorkoutScreen';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import StreakCounter from '@/components/StreakCounter';


const Stack = createStackNavigator();


export type WorkoutStackParamList = {
  ApiScreen: {};
  StartWorkoutScreen: {};
  AddWorkoutScreen: {};
  MyWorkoutsScreen: {};
};

export type WorkoutScreenNavigationProp = StackNavigationProp<WorkoutStackParamList>;

export default function WorkoutStack(props : any) {
  const navigation = useNavigation<WorkoutScreenNavigationProp >();
  return (
    <WorkoutProvider>
    <Stack.Navigator initialRouteName="WorkoutApiScreen" screenOptions={{ 
      headerShown: true,
      headerStyleInterpolator: HeaderStyleInterpolators.forNoAnimation,
    }}>
      <Stack.Screen name="WorkoutApiScreen" component={WorkoutApiScreen} options={{ headerShown: true }}/>
      <Stack.Screen name="ApiScreen" component={ApiScreen} options={{
        headerRight: () => <StreakCounter />,
      }} />
      <Stack.Screen name="StartWorkoutScreen" component={StartWorkoutScreen} options={{
        headerRight: () => <StreakCounter />,
      }} />
      <Stack.Screen name="MyWorkoutsScreen" component={MyWorkoutsScreen} />

      <Stack.Screen name="AddWorkoutScreen" component={AddWorkoutScreen} options={{ headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.leftButton, styles.button, styles.buttonSize]}>
            <TabBarIcon style={styles.leftArrow} name='arrow-down' size={30} color='#bbbbbb' />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.headerTitleView}>
            <ThemedText style={styles.title}>Add Workout</ThemedText>
          </View>
        ),
        // <Svg ... /> commented out
        headerRight: () => (
          <TouchableOpacity
            onPress={() => { navigation.navigate("ApiScreen", {}) }}
            style={[styles.rightButton, styles.button, styles.buttonSize]}
          >
            <TabBarIcon name='add-circle-outline' size={30} color='#bbbbbb' />
          </TouchableOpacity>
        ),
        headerTitleAlign: 'center',
        }}
        />
      {/* Put any additional screens for your tab here. This allows us to use a stack.
        A stack allows us to easily navigate back a page when we're in a secondary screen on a certain tab.

      */}
    </Stack.Navigator>
    </WorkoutProvider>
  );
}









var maxWidth = Dimensions.get('window').width;
var buttonDimension = maxWidth * 0.1; // This sets button size to 10% of screen width
var titleWidth = maxWidth - (buttonDimension * 2) - 32; // Title width minus button space

const styles = StyleSheet.create({
  headerTitleView: {
    width: titleWidth,          // Limit the width of the title to avoid overlap
    justifyContent: 'center',   // Center vertically
    alignItems: 'center',       // Center horizontally
  },
  title: {
    fontSize: 20,               // Adjust the base font size
    textAlign: 'center',        // Center the text content
  },
  leftButton: {
    paddingLeft:10,
  },
  buttonSize: {
    height: '100%',
    aspectRatio: 1,             // Keep buttons square
  },
  rightButton: {
    paddingRight:10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftArrow: {
    transform: [{ rotate: '90deg' }],
  },
});




/*
      {contacts.map((contact, index) => (
                <Tile key={contact.key}
                index={index}
                onTileLoad={() => setTilesLoaded(prevTilesLoaded => prevTilesLoaded + 1)}
                //contactOnPress={() => navigation.navigate(Contact, {key:Tiles.length, contactInfo: contactsList[Tiles.length]})} 
                navigation={navigation}/>
            ))}

*/











/*
var maxWidth = Dimensions.get('window').width;
var buttonDimension = maxWidth * 0.1;

var titleWidth = maxWidth - (buttonDimension*2)-32;



const styles = StyleSheet.create({
  /*headerTitleView: {
    //paddingRight:155,
    width:'100%',
    alignItems:'center',
    borderWidth:1,
  },
  headerTitleView: {
    flex: 1,                   // Make sure the view takes up available space
    justifyContent: 'center',   // Center vertically
    alignItems: 'center',       // Center horizontally
  },
  title: {
    fontSize: 20,               // Adjust the base font size
    transform: [{ scale: 1.5 }], // Scale the text (1.5 times bigger)
    textAlign: 'center',        // Center the text content
  },
  leftButton: {
    //marginLeft:'8%',
    borderWidth:1,
  },

  buttonSize: {
    height:'100%',
    //width:buttonDimension,
    aspectRatio:1,
  },

  rightButton: {
    //marginRight:'8%',
    borderWidth:1,
  },

  button: {
    alignItems: 'center',
    justifyContent:'center',
    //backgroundColor: '#DDDDDD',
    //padding: buttonPadding,
    //borderWidth:1,
  },
  leftArrow: {
    transform: [{ rotate: '90deg' }],
  },
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

  /*title: {
    fontSize:22,
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
*/