import React, { useState, useEffect, useRef,forwardRef, useImperativeHandle } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated,Text } from 'react-native';
import { BodyPart } from '@/app/screens/workout/BodyFocusScreen';

// Define the type for the ref
interface BodyDiagramRef {
    triggerAllAnimations: () => void;
}

interface BodyDiagramProps {
  onBodyPartClick: (part: BodyPart) => void;
  imageSource: any;
  isFrontView: boolean;  // Newly added isFrontView
  triggerAnimation?: () => void; // Callback to trigger animation from parent
}

const BodyDiagram = forwardRef<BodyDiagramRef, BodyDiagramProps>(
      ({ onBodyPartClick, imageSource, isFrontView, triggerAnimation }, ref) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Holds references to running animation instances so they can be controlled or stopped later
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);
  // Stores timeout references to allow clearing them if needed (e.g., during cleanup)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Create animated values for each body part's line and text position
  const lineAnimations = useRef({
    Core: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Chest: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Cardio: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Legs: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Arms: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Back: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Shoulders: { x: new Animated.Value(0), y: new Animated.Value(0) },
  }).current;

  const textAnimations = useRef({
    Core: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Chest: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Cardio: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Legs: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Arms: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Back: { x: new Animated.Value(0), y: new Animated.Value(0) },
    Shoulders: { x: new Animated.Value(0), y: new Animated.Value(0) },
  }).current;

  const circleAnimations = useRef(
    Array.from({ length: 10 }, () => new Animated.Value(0))
  ).current;

  /**
 * Stops all active animations and clears any pending timeouts.
 * Resets both refs to ensure no memory leaks or side effects occur
 * when the component unmounts or animations are re-triggered.
 */
  const cleanupAnimations = () => {
    animationRefs.current.forEach(anim => anim?.stop());
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    animationRefs.current = [];
    timeoutRefs.current = [];
  };

  // Ensures all animations and timeouts are cleaned up when the component unmounts,
// preventing memory leaks or unwanted behavior after the component is removed from the screen.
  useEffect(() => {
    return () => {
      cleanupAnimations(); 
    };
  }, []);

  const handlePress = (part: BodyPart) => {
    setSelectedPart(part);
    onBodyPartClick(part);
    startCircleAnimation();
  };

  
  const startCircleAnimation = () => {
    setIsAnimating(true);
    cleanupAnimations(); // // Reset previous animations before starting new ones to avoid overlap or conflict.


    const animateCircle = (animatedValue: Animated.Value, delay: number) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      // Store the animation instance so it can be stopped or managed later during cleanup.
      animationRefs.current.push(anim);
      return anim;
    };

    circleAnimations.forEach((anim, index) => {
      const circleAnim = animateCircle(anim, index * 200);
      circleAnim.start();
    });
  };

//Trigger animation when view changes
useEffect(() => {
  if (typeof triggerAnimation === 'function') {
    triggerAnimation(); // Call the passed triggerAnimation function
  }
}, [isFrontView]); // Add isFrontView to dependencies

  useEffect(() => {
    if (!isAnimating) {
      startCircleAnimation();
    }
  }, []);

  const animatedStyle = (animatedValue: Animated.Value) => ({
    transform: [{ scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
    opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
  });

  // **Dynamic circles for the front view**
  const frontCircles = [
    { id: 1, style: styles.circle1, animation: circleAnimations[0] },
    { id: 2, style: styles.circle2, animation: circleAnimations[1] },
    { id: 3, style: styles.circle3, animation: circleAnimations[2] },
    { id: 4, style: styles.circle4, animation: circleAnimations[3] },
    { id: 5, style: styles.circle5, animation: circleAnimations[4] },
    { id: 9, style: styles.circle9, animation: circleAnimations[8] }, // add circle9
    { id: 10, style: styles.circle10, animation: circleAnimations[9] }, // add circle10
  ];

  // **Dynamic circles for the back view**
  const backCircles = [
    { id: 6, style: styles.circle6, animation: circleAnimations[5] },
    { id: 7, style: styles.circle7, animation: circleAnimations[6] },
    { id: 8, style: styles.circle8, animation: circleAnimations[7] },
  ];

  // Define touch areas corresponding to text and line with expansion directions
  const touchAreas: { part: BodyPart; touchStyle: any; label: string; lineStyle: any; textStyle: any }[] = [
    // Front view: Core (right), LegsLeft (left), ArmsLeft (left), Chest (right),Cardio (right)
    { part: 'Core', touchStyle: styles.Core, label: 'Core', lineStyle: styles.lineCore, textStyle: styles.textCore},
    { part: 'Chest', touchStyle: styles.Chest, label: 'Chest', lineStyle: styles.lineChest, textStyle: styles.textChest},
    { part: 'Cardio', touchStyle: styles.Cardio, label: 'Cardio', lineStyle: null, textStyle: styles.textCardio},
    { part: 'Legs', touchStyle: styles.legsLeft, label: 'Leg', lineStyle: styles.lineLegsLeft, textStyle: styles.textLegsLeft },
    { part: 'Legs', touchStyle: styles.legsRight, label: '', lineStyle: null, textStyle: null },
    { part: 'Arms', touchStyle: styles.armsLeft, label: 'Arm', lineStyle: styles.lineArmsLeft, textStyle: styles.textArmsLeft },
    { part: 'Arms', touchStyle: styles.armsRight, label: '', lineStyle: null, textStyle: null },
    
    // Back view: Back (right), ShouldersLeft (left)
    { part: 'Back', touchStyle: styles.back, label: 'Back', lineStyle: styles.lineBack, textStyle: styles.textBack },
    { part: 'Shoulders', touchStyle: styles.shouldersLeft, label: 'Shoulder', lineStyle: styles.lineShouldersLeft, textStyle: styles.textShouldersLeft },
    { part: 'Shoulders', touchStyle: styles.shouldersRight, label: '', lineStyle: null, textStyle: null },
  ];

  // Filter touch areas based on isFrontView
  const visibleTouchAreas = touchAreas.filter(({ part }) => {
    const isVisible = isFrontView
      ? ['Core', 'Legs', 'Arms','Chest','Cardio'].includes(part)
      : ['Back', 'Shoulders'].includes(part);
    console.log(`Part: ${part}, isVisible: ${isVisible}, isFrontView: ${isFrontView}`);
    return isVisible;
  });

  // Trigger animation for all lines and texts
  const triggerAllAnimations = () => {
    cleanupAnimations(); // Immediately stop all animations and clear timeouts to reset the animation state.

    const animationConfig = {
      Core: isFrontView ? 20 : 0, // Right in Front, no move in Back
      Legs: isFrontView ? -20 : 0,
      Chest: isFrontView ? 20 : 0,
      Cardio: isFrontView ? 20 : 0,   
      Arms: isFrontView ? -20 : 0,   
      Back: !isFrontView ? 20 : 0,   
      Shoulders: !isFrontView ? -20 : 0, 
    };

    Object.keys(animationConfig).forEach((part) => {
      const expandX = animationConfig[part as keyof typeof animationConfig];

      const parallelAnim = Animated.parallel([
        Animated.timing(lineAnimations[part as BodyPart].x, {
          toValue: expandX,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textAnimations[part as BodyPart].x, {
          toValue: expandX,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(lineAnimations[part as BodyPart].y, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textAnimations[part as BodyPart].y, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
      
      animationRefs.current.push(parallelAnim);

    parallelAnim.start(() => {
      const newTimeout = setTimeout(() => {
        const resetAnim =Animated.parallel([
            Animated.timing(lineAnimations[part as BodyPart].x, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(textAnimations[part as BodyPart].x, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(lineAnimations[part as BodyPart].y, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(textAnimations[part as BodyPart].y, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
          
    animationRefs.current.push(resetAnim);
    resetAnim.start();
        }, 500); // 2 seconds delay

    timeoutRefs.current.push(newTimeout);
      });
    });
  };

  // Expose the triggerAllAnimations method via the ref
  useImperativeHandle(ref, () => ({
    triggerAllAnimations,
    cleanupAnimations, // Immediately stop all animations and clear timeouts to reset the animation state.
  }));

  return (
    <View testID="body-diagram-container" style={styles.container}>
      {/* Background human body image */}
      <Image testID="body-image" source={imageSource} style={styles.image} resizeMode="contain" />
      
      {/* Render circles first (below touch areas) */}
      {(isFrontView ? frontCircles : backCircles).map(({ id, style, animation }) => (
        <Animated.View key={id} testID={`circle-${id}`} style={[styles.circle, style, animatedStyle(animation)]} />
      ))}

      {/* Transparent touch areas */}
      {visibleTouchAreas.map(({ part, touchStyle, label, lineStyle, textStyle }) => (
        <React.Fragment key={part + label}>
          {textStyle && typeof textStyle === 'object' && (
            <Animated.Text
              testID={`label-${part}`}
              style={[
                styles.label,
                textStyle,
                {
                  transform: [
                    { translateX: textAnimations[part].x },
                    { translateY: textAnimations[part].y },
                  ],
                },
              ]}
            >
              {label}
            </Animated.Text>
          )}

          <TouchableOpacity
            testID={`body-part-${part}`}
            style={[styles.touchable, touchStyle, selectedPart === part && styles.selected]}
            onPress={() => handlePress(part)}
          />
          {/* Render only when lineStyle is an object */}
          {lineStyle && typeof lineStyle === 'object' && (
            <Animated.View
              testID={`line-${part}`}
              style={[
                styles.line,
                lineStyle,
                {
                  transform: [
                    { translateX: lineAnimations[part].x },
                    { translateY: lineAnimations[part].y },
                  ],
                },
              ]}
            />
          )}
        </React.Fragment>
      ))} 
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: 450,
    height: 420,
    opacity: 0.9,
  },
  touchable: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0,0)',
  },
  Core: { top: '40%', left: '43%', width: 200, height: 30 },
  Chest: { top: '20%', left: '50%', width: 150, height: 30 },
  Cardio: { top: '4%', left: '70%', width: 90, height: 30 },
  legsRight: { top: '73%', left: '48%',width: 50, height: 30 },
  legsLeft: { top: '73%', left: '16%',width: 130, height: 30 },
  armsLeft: { top: '28%', left: '7%',width: 130, height: 30 },
  armsRight: { top: '24%', left: '58%',width: 50, height: 50 },
  back: { top: '27%', left: '45%',width: 160, height: 35 },
  shouldersLeft: { top: '15%', left: '3%',width: 165, height: 35 },
  shouldersRight: { top: '16%', left: '53%',width: 50, height: 35 },
  selected: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },

  // Dynamic circle styles
  circle: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 25,
    backgroundColor: 'rgb(6, 245, 209)',
  },
  circle1: { top: '30%', left: '35%' }, //left arm
  circle2: { top: '76%', left: '55%' }, //right leg
  circle3: { top: '76%', left: '42%' }, // left leg
  circle4: { top: '30%', left: '62%' }, //right arm
  circle5: { top: '43%', left: '49%' }, //Core
  circle6: { top: '18%', left: '39%' }, //left shoulder
  circle7: { top: '18%', left: '58%' }, //right shoulder
  circle8: { top: '30%', left: '49%' }, //back
  circle9: { top: '23%', left: '54%' }, //Chest
  circle10: { top: '6%', left: '76%',width: 9, height: 9, borderRadius: 25,backgroundColor: 'red' }, //Cardio

 // Line styles (connecting touch area and text)
line: {
  position: 'absolute',
  width: 50,
  height: 1,
  backgroundColor: 'rgb(6, 245, 209)',
},
lineCore: { top: 184, left: 230 }, 
lineChest: { top: 100, left: 230 },
lineCardio: { top: 30, left: 267 },
lineLegsLeft: { top: 323, left: 105 }, 
//lineLegsRight: { top: 323, left: 238 }, 
lineArmsLeft: { top: 131, left: 75 }, 
//lineArmsRight: { top: 131, left: 265 }, 
lineBack: { top: 129, left: 229 }, 
lineShouldersLeft: { top: 80, left: 95 }, 
//lineShouldersRight: { top: 61, left: 288 }, 

// Label styles
label: {
  position: 'absolute',
  fontSize: 16,
  color: 'rgb(6, 245, 209)',
  textAlign: 'center',
},
textCore: { top: 173, left: 294 }, 
textChest: { top: 90, left: 294 }, 
textCardio: { top: 20, left: 320 }, 
textLegsLeft: { top: 313, left: 70 }, 
//textLegsRight: { top: 316, left: 305 }, 
textArmsLeft: { top: 121, left: 37 }, 
//textArmsRight: { top: 145, left: 360 },
textBack: { top: 119, left: 285 }, 
textShouldersLeft: { top: 69, left: 25 }, 
//textShouldersRight: { top: 61, left: 338 }, 
});

export default BodyDiagram;
