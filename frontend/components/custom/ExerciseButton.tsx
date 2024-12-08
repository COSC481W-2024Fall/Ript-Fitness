import { Dimensions, TouchableOpacity, View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '../ThemedText';

export type ExerciseButtonProps = ViewProps & {
    leftColor?: string;
    descColor?: string;
    title?: string;
    desc?: string;
    children?: React.ReactNode;
    darkColor?: string;
    sideButtons?: any;
    onLongPress?: any;
    onPressOut?: any;
    isActive?: any
    style?: any
};

export function ExerciseButton({ leftColor, descColor, title, desc, children, sideButtons, id, onLongPress, onPressOut, isActive, style, ...otherProps }: ExerciseButtonProps) {
  const toggleExpand = () => {
    if (isExpanded) {
      setExpanded(false)
      setIconStr("chevron-down")
    } else {
      setExpanded(true)
      setIconStr("chevron-up")
    }

    }
  const [iconStr, setIconStr] = useState("chevron-down")

  const [isExpanded, setExpanded] = useState(false);

  return <TouchableOpacity style={[styles.view, style] } onLongPress={onLongPress}  // Long press triggers drag
  disabled={isActive} activeOpacity={1} onPressOut={onPressOut}>

<ThemedView style={styles.fullWidth}>
<ThemedText style={styles.title}>{title}</ThemedText>
{desc && <ThemedView style={[{backgroundColor: descColor}, styles.innerBar]}><ThemedText style={styles.description}>{desc}</ThemedText></ThemedView>}
</ThemedView>

       {isExpanded && (
  <ThemedView style={styles.dropDownDiv}>
    {children}
  </ThemedView>
)}

   <View style={[{backgroundColor:leftColor}, styles.leftColor]}></View>
   

  <TouchableOpacity key='arrow' style={styles.innerButton} onPress={toggleExpand} >
    
  <Ionicons name={iconStr as any} size={30} color="#000000" />

  </TouchableOpacity>
  

  {isExpanded && (<View style={styles.sideButtonsView}>
  {sideButtons?.map((button: {id: string, icon: string, func: any, style:any}, index : number) => (
      <TouchableOpacity style={styles.sideButton} key={index} onPress={() => button.func(id)}>
    
      <Ionicons name={button.icon as any} style={button.style} size={20} color="#000" />
    
      </TouchableOpacity>
        ))}
{/*
<TouchableOpacity
      onLongPress={onLongPress}  // Long press triggers drag
      disabled={isActive}        // Disable interaction while dragging
      style={[
        styles.sideButton,
        { backgroundColor: isActive ? '#E8E8E8' : '#E2E2E2', opacity: isActive ? 0.8 : 1}  // Change style while dragging
      ]}
    ><Ionicons name="menu" size={30} color="#000000" /></TouchableOpacity>
*/}
</View>)}

  </TouchableOpacity>;
}

const { width, height } = Dimensions.get('window');
const titleSize = width * 0.06;
const descSize = width * 0.035;

const styles = StyleSheet.create({ 
  fullWidth: {
    width:'100%',
    backgroundColor:'inherit',
    height:'auto',
    alignItems:'center',
    paddingTop:15,
    paddingBottom:15,
  },
  sideButtonsView: {
    position:'absolute',
    bottom:10,
    right:20,
  },
  sideButton: {
    marginTop:8
  },
  title: {
    fontSize:titleSize,
    marginBottom:5,
    fontWeight: '500',
  },

  description: {
    fontSize:descSize,
    color:'#40403F',    //or #fff
    alignSelf: 'center',
    fontWeight: '600',
  },
  //Sets
  innerBar: {
    backgroundColor:'#BFBFBF', //or comment out to match left color
    width: '25%',
    paddingTop:'2%',
    paddingBottom:'2%',
    paddingLeft:'5%',
    paddingRight:'5%',
    borderRadius:20,
    marginTop:5,
  },
    view: {
        backgroundColor:'#F2F2F2',    //color for exercise container
        borderRadius:15,
        // borderWidth: 1,
        marginTop:15,
      },
      innerButton: {
        position: 'absolute',
        right:15,
        top:11,
        height:30,
        width:30,
        // backgroundColor:'blue',
        //color:'white',
        borderTopLeftRadius:15,
        borderBottomLeftRadius:15,
      },
      leftColor: {
        position: 'absolute',
        left:0,
        top:0,
        height:'100%',
        width:18,
        borderTopLeftRadius:15,
        borderBottomLeftRadius:15,
      },
      dropDownDiv: {
        position: 'relative',
        left:30,
        width:'75%',
        paddingTop:'0%',
        height:'auto',
        backgroundColor:'inherit',
        //backgroundColor:'blue',
        paddingBottom:10,
      },



});