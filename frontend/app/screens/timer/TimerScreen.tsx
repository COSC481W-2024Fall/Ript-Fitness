import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { GlobalContext } from '@/context/GlobalContext';

const TimerScreen = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  
  const context = useContext(GlobalContext);
  const isDarkMode = context?.isDarkMode;

  useEffect(() => {
    let timer: number | NodeJS.Timeout | undefined;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [isRunning]);

  const startStopTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setLaps([]);
  };

  const lapTimer = () => {
    setLaps([...laps, seconds]);
  };

  return (
    <View style={isDarkMode ? styles.darkContainer : styles.container}>
      <Text style={styles.timer}>{new Date(seconds * 1000).toISOString().substr(11, 8)}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: isRunning ? "red" : "green" }]} onPress={startStopTimer}>
          <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={lapTimer} disabled={!isRunning}>
          <Text style={styles.buttonText}>Lap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={laps}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.lapText}>Lap {index + 1}: {new Date(item * 1000).toISOString().substr(11, 8)}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  darkContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  timer: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#21BFBF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  lapText: {
    fontSize: 18,
    padding: 5,
  },
});

export default TimerScreen;
