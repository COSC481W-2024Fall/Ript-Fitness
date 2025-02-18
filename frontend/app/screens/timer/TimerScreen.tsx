import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

// define CurrentEditing type
type CurrentEditing = {
  rowId: number | string;
  setIndex: number;
} | null;

const TimerScreen = () => {
  const [workoutData, setWorkoutData] = useState([
    { id: 1, exercise: "Rong exercise", sets: 2, time: ["Not Started", "Not Started"] },
    { id: 2, exercise: "Back in Action", sets: 2, time: ["Not Started", "Not Started"] },
  ]);

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<CurrentEditing>(null);

  useEffect(() => {
    let timer: number | NodeJS.Timeout | undefined;
    if (isRunning) {   //isRunning is true, asetInterval stars and this increases seconds every second. isRunning is false, the interval is cleared to stop the timer.
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer !== undefined) {
        clearInterval(timer);  // Clear the timer
      }
    };
  }, [isRunning]);

  const startTimer = (rowId: number | string, setIndex: number): void => {  //Starts the global stopwatch.
    setCurrentEditing({ rowId, setIndex });  //Records which set is being timed
    setSeconds(0); //Resets the timer to 0 when a new timer starts.
    setIsRunning(true);
  };

  const stopTimer = () => {
    if (currentEditing) {
      const { rowId, setIndex } = currentEditing;
      setWorkoutData((prevData) =>
        prevData.map((item) =>
          item.id === rowId
            ? {
                ...item,
                time: item.time.map((t, index) =>
                  index === setIndex ? new Date(seconds * 1000).toISOString().substr(11, 8) : t
                ),
              }
            : item
        )
      );
    }
    setIsRunning(false);
    setCurrentEditing(null);
  };

  const resetTimer = () => { //Stops the timer but doesn’t save the time.
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={workoutData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.exercise}>{item.exercise}</Text>
            {item.time.map((t, index) => {
              const isActive = currentEditing?.rowId === item.id && currentEditing?.setIndex === index;
              return (
                <View key={index} style={[styles.timeRow, isActive && styles.activeSet]}>
                  <Text style={styles.setText}>Set {index + 1}: {isActive ? new Date(seconds * 1000).toISOString().substr(11, 8) : t}</Text>
                  <TouchableOpacity style={styles.button} onPress={() => startTimer(item.id, index)}>
                    <Text style={styles.buttonText}>{isActive ? "Running..." : "Start"}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      />
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{new Date(seconds * 1000).toISOString().substr(11, 8)}</Text>
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: isRunning ? "red" : "green" }]} onPress={isRunning ? stopTimer : resetTimer}> 
          <Text style={styles.mainButtonText}>{isRunning ? "Stop" : "Reset"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  row: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  exercise: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  activeSet: {
    backgroundColor: "#cce5ff",
    borderColor: "#007bff",
    borderWidth: 1,
  },
  setText: {
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  timerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  timer: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
  },
  mainButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default TimerScreen;