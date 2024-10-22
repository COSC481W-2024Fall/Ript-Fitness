import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';



const Note = () => {
  const navigation = useNavigation();

  const notesData = [
    {
      title: 'Push',
      date: '10/22/2024',
      items: ['Bench Press', 'Shoulder Press', 'Tricep Dip'],
    },
    {
      title: 'Pull',
      date: '10/19/2024',
      items: ['Pull-Up', 'Bent Over Row', 'Bicep Curl'],
    },
    {
      title: 'Legs',
      date: '10/15/2024',
      items: ['Squats', 'Leg Press', 'Calf Raises'],
    },
    {
      title: 'Glutes',
      date: '10/11/2024',
      items: ['RDLs', 'Hip Thrusts', 'Step Ups'],
    },
    {
      title: 'Quads',
      date: '10/2/2024',
      items: ['Leg Press', 'Goblet Squats', 'Quad extension'],
    },
  ];

  return (
    <View style={styles.container}>
      {notesData.map((note, index) => (
        <TouchableOpacity 
          key={index}
          activeOpacity={0.7}
          // onPress={() => navigation.navigate('WorkoutApiScreen')}
          style={styles.button}>
          <View style={styles.buttonContent}>
            <Text style={styles.titleText}>
              {note.title}
            </Text>
            <View style={styles.itemsContainer}>
              {note.items.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.bulletText}>
                  {`\u2022 ${item}`}  {/* Bullet point */}
                </Text>
              ))}
              <Text style={styles.dateText}>{note.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'flex-start', 
    gap: 20,
    width: '100%',
    paddingTop: 15,
  },
  button: {
    backgroundColor: '#FFF3AD', 
    padding: 5, 
    borderRadius: 10,
    width: 150,
    height: 160, 
    borderWidth: 2,
    borderColor: '#DAD19D',
}, 
buttonContent: {
    height: '100%',
    width: '100%',
}, 
dateText: {
    fontSize: 12, 
    textAlign: 'left',
    paddingTop: 10,
    color: '#454343',
},
bulletText: {
  fontSize: 16, 
  textAlign: 'left',
  paddingBottom: 5,
},
titleText: {
  textAlign: 'center',
  color: 'black',
  fontSize: 24,
  padding: 10, 
  fontWeight: 'bold',
},
itemsContainer: {
  paddingHorizontal: 5, 
},
});

export default Note;