import React, { useState, useEffect, useContext, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Animated, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { httpRequests } from "@/api/httpRequests";
import { GlobalContext } from "@/context/GlobalContext";

// Get the screen width for responsive chart sizing
const screenWidth = Dimensions.get("window").width;

// Color mapping for different nutrition metrics displayed in charts
const metricColors = {
  calories: "red",
  protein: "#00BFFF", // Bright blue
  carbs: "#32CD32", // Bright green
  fat: "#FFA500", // Orange
};

// Interface for individual data items (value and date)
interface DataItem {
  value: number;
  date: string;
}

// Modified: Convert UTC "YYYY-MM-DD" to Local date string using timezone offset
const formatLocalDateLabel = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day); // Convert ISO date to local time
  const label = localDate.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
  console.log(`📅 formatLocalDateLabel | ISO: ${isoDate} → Local: ${label}`);
  return label;
};

// Replace invalid chart values (NaN, Infinity) with 0 for safe rendering
const cleanChartData = (data: DataItem[]): number[] => {
  return data.map((item, i) => {
    const value = Number(item?.value);
    if (!isFinite(value) || isNaN(value)) {
      console.warn(`⚠️ Invalid chart value at index ${i}:`, item);
    }
    return isFinite(value) && !isNaN(value) ? value : 0;
  });
};

//Align all datasets by date and fill missing dates with 0 values
const ensureUniformLength = (datasets: {
  calories: DataItem[];
  protein: DataItem[];
  carbs: DataItem[];
  fat: DataItem[];
}): typeof datasets => {
  const allDatesSet = new Set<string>();
  Object.values(datasets).forEach(metric =>
    metric.forEach(item => allDatesSet.add(item.date))
  );
  const allDates = Array.from(allDatesSet).sort();

  const fillMissing = (data: DataItem[]): DataItem[] => {
    const map = new Map(data.map(d => [d.date, d.value]));
    return allDates.map(date => ({
      date,
      value: isFinite(map.get(date)!) ? map.get(date)! : 0,
    }));
  };

  return {
    calories: fillMissing(datasets.calories),
    protein: fillMissing(datasets.protein),
    carbs: fillMissing(datasets.carbs),
    fat: fillMissing(datasets.fat),
  };
};

export default function NutritionTrendScreen() {
  const context = useContext(GlobalContext);
  // State to toggle between 7-day and 30-day views
  const [isThirtyDays, setIsThirtyDays] = useState(false);
  // Animation value for fading in the chart
  const [chartAnimation] = useState(new Animated.Value(0));
  // Index of the selected day when a dot is clicked
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  // Index of the clicked dot for visual feedback
  const [clickedDotIndex, setClickedDotIndex] = useState<number | null>(null);
  // Selected metric (calories, protein, carbs, fat) for highlighting in charts
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  // Counter for active loading requests to manage the loading spinner
  const [loadingCount, setLoadingCount] = useState(0); 
  const [error, setError] = useState<string | null>(null);
  // Loading state to show/hide the spinner
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  // Animation value for scaling the clicked dot
  const [dotScale] = useState(new Animated.Value(1));
  const [glowAnimation] = useState(new Animated.Value(0.5));

  // Type definition for nutrition data (weekly or monthly)
  type NutritionPeriodData = { [date: string]: { calories: number; carbs: number; fat: number; protein: number } } | null;
  
  // State for weekly and monthly nutrition data from API
  const [weekly, setWeekly] = useState<NutritionPeriodData>(null);
  const [monthly, setMonthly] = useState<NutritionPeriodData>(null);

  // State for processed weekly data, structured by metric
  const [weeklyData, setWeeklyData] = useState<{ calories: DataItem[]; protein: DataItem[]; carbs: DataItem[]; fat: DataItem[] }>({
    calories: [],
    protein: [],
    carbs: [],
    fat: [],
  });

  // State for processed monthly data, structured by metric
  const [monthlyData, setMonthlyData] = useState<{ calories: DataItem[]; protein: DataItem[]; carbs: DataItem[]; fat: DataItem[] }>({
    calories: [],
    protein: [],
    carbs: [],
    fat: [],
  });

  
  // Fetch weekly and monthly data on component mount
  useEffect(() => {
    loadNutritionWeekly();
    loadNutritionMonthly();
  }, []);

  // Helper function to sanitize data by filtering out invalid values and ensuring non-negative numbers
  const sanitizeData = (data: DataItem[]): DataItem[] => {
    return data
      .filter(item => item.date && isFinite(item.value)) // Remove items with no date or non-finite values
      .map(item => ({ value: Math.max(0, item.value), date: item.date })); // Ensure values are >= 0
  };

  // Process weekly data when it changes
  useEffect(() => {
    if (weekly && Object.keys(weekly).length > 0) {
      const sortedDates = Object.keys(weekly).sort();
      const myCalories = sortedDates.map(date => ({ value: weekly[date].calories, date }));
      const myProtein = sortedDates.map(date => ({ value: weekly[date].protein, date }));
      const myCarbs = sortedDates.map(date => ({ value: weekly[date].carbs, date }));
      const myFat = sortedDates.map(date => ({ value: weekly[date].fat, date }));
  
      setWeeklyData(
        ensureUniformLength({
          calories: sanitizeData(myCalories),
          protein: sanitizeData(myProtein),
          carbs: sanitizeData(myCarbs),
          fat: sanitizeData(myFat),
        })
      );

      console.log("Initial weeklyData:", weeklyData); // Log initial weeklyData to verify
    }
  }, [weekly]);

  // Memoized X-axis labels for weekly data
  const weeklyLabels = useMemo(() => {
    const labels = weeklyData.calories.map((item) =>
      item.date ? formatLocalDateLabel(item.date) : ""
    );
    console.log("Weekly Labels:", labels);
    return labels;
  }, [weeklyData]);
  

  // Process monthly data when it changes
  useEffect(() => {
    if (monthly && Object.keys(monthly).length > 0) {
      const sortedDates = Object.keys(monthly).sort();
      const myCalories = sortedDates.map(date => ({ value: monthly[date].calories, date }));
      const myProtein = sortedDates.map(date => ({ value: monthly[date].protein, date }));
      const myCarbs = sortedDates.map(date => ({ value: monthly[date].carbs, date }));
      const myFat = sortedDates.map(date => ({ value: monthly[date].fat, date }));
  
      setMonthlyData(
        ensureUniformLength({
          calories: sanitizeData(myCalories),
          protein: sanitizeData(myProtein),
          carbs: sanitizeData(myCarbs),
          fat: sanitizeData(myFat),
        })
      );
    }
  }, [monthly]);

  //Validate all nutrition datasets to detect and log any invalid (NaN/Infinity) values
useEffect(() => {
  const logDatasetCheck = (data: DataItem[], label: string) => {
    data.forEach((item, idx) => {
      if (!isFinite(item.value)) {
        console.warn(`⚠️ ${label} dataset contains invalid value at index ${idx}:`, item);
      }
    });
  };

  logDatasetCheck(weeklyData.calories, "weekly-calories");
  logDatasetCheck(weeklyData.protein, "weekly-protein");
  logDatasetCheck(weeklyData.carbs, "weekly-carbs");
  logDatasetCheck(weeklyData.fat, "weekly-fat");

  logDatasetCheck(monthlyData.calories, "monthly-calories");
  logDatasetCheck(monthlyData.protein, "monthly-protein");
  logDatasetCheck(monthlyData.carbs, "monthly-carbs");
  logDatasetCheck(monthlyData.fat, "monthly-fat");
}, [weeklyData, monthlyData]);



  // Memoized X-axis labels for monthly data 
  const monthlyLabels = useMemo(() => {
    const labels = monthlyData.calories.map((item) =>
      item.date ? formatLocalDateLabel(item.date) : ""
    );
    console.log("Monthly Labels:", labels);
    return labels;
  }, [monthlyData]);


// Helper functions to increment loading counter
const startLoading = () => setLoadingCount((prev) => prev + 1);

// Helper function to decrement loading counter and update isLoading state
const stopLoading = () => {
  setLoadingCount((prev) => {
    const newCount = Math.max(0, prev - 1);
    if (newCount === 0) setIsLoading(false); // Hide spinner when all requests complete
    return newCount;
  });
};

//Fetch weekly nutrition trends from the API
const loadNutritionWeekly = async () => {
    startLoading();
    setError(null);
    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getWeeklyTrends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.data.token}`,
        },
      });
      if (response.status === 200) {
        const nutritionWeekly = await response.json();
        console.log("Raw API Response (Weekly):", nutritionWeekly); // Debug log
        if (nutritionWeekly && typeof nutritionWeekly === 'object' && !Array.isArray(nutritionWeekly)) {
          setWeekly(nutritionWeekly);
        } else {
          console.error('loadNutritionWeekly: Invalid data format', nutritionWeekly);
          setError('loadNutritionWeekly: Invalid data format received');
          Alert.alert('Error', 'Invalid data format received');
        }
        console.log("loadNutritionWeekly", nutritionWeekly);
      } else {
        console.error('loadNutritionWeekly: fetch error: ', response.status);
        setError(`loadNutritionWeekly: Failed to fetch: ${response.status}`);
        Alert.alert(`loadNutritionWeekly: Failed to fetch: ${response.status}`);
      }
    } catch (err: any) {
      console.error('loadNutritionWeekly: fetch error: ', err.message);
      setError(`loadNutritionWeekly: Failed to fetch: ${err.message}`);
      Alert.alert(`loadNutritionWeekly: Failed to fetch: ${err.message}`);
    } finally {
      stopLoading();
    }
  };

  //Fetch monthly nutrition trends from the API
  const loadNutritionMonthly = async () => {
    startLoading();
    setError(null);

    try {
      const response = await fetch(`${httpRequests.getBaseURL()}/nutritionCalculator/getMonthlyTrends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.data.token}`,
        },
      });
      if (response.status === 200) {
        const nutritionMonthly = await response.json();
        console.log("Raw API Response (Monthly):", nutritionMonthly); // Debug log
        if (nutritionMonthly && typeof nutritionMonthly === 'object' && !Array.isArray(nutritionMonthly)) {
          setMonthly(nutritionMonthly);
        } else {
          console.error('loadNutritionMonthly: Invalid data format', nutritionMonthly);
          setError('loadNutritionMonthly: Invalid data format received');
          Alert.alert('Error', 'Invalid data format received');
        }
        console.log("loadNutritionMonthly", nutritionMonthly);
      } else {
        console.error('loadNutritionMonthly: fetch error: ', response.status);
        setError(`loadNutritionMonthly: Failed to fetch: ${response.status}`);
        Alert.alert(`loadNutritionMonthly: Failed to fetch: ${response.status}`);
      }
    } catch (err: any) {
      console.error('loadNutritionMonthly: fetch error: ', err.message);
      setError(`loadNutritionMonthly: Failed to fetch: ${err.message}`);
      Alert.alert(`loadNutritionMonthly: Failed to fetch: ${err.message}`);
    } finally {
      stopLoading();
    }
  };

  // Animate chart fade-in when weeklyData changes
  useEffect(() => {
    Animated.timing(chartAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [weeklyData]);

  // Loop glow animation for dots
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 0.9,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnimation]);

  // Memoized labels based on the current view (7 or 30 days)
  const labels = useMemo(() => {
    return isThirtyDays ? monthlyLabels : weeklyLabels;
  }, [isThirtyDays, weeklyLabels, monthlyLabels]);

  // Select dataSource based on current view
  const dataSource = isThirtyDays ? monthlyData : weeklyData; 

  // Check if chart data is ready (to prevent invalid path rendering)
const isDataReady = useMemo(() => {
  return (
    dataSource.calories.length > 0 &&
    dataSource.protein.length > 0 &&
    dataSource.carbs.length > 0 &&
    dataSource.fat.length > 0
  );
}, [dataSource]);

  // Calculate the maximum value and generate Y-axis labels dynamically
  const yAxisRange = useMemo(() => {
    const allValues = [
      ...dataSource.protein.map(item => item.value ?? []),
      ...dataSource.carbs.map(item => item.value ?? []),
      ...dataSource.fat.map(item => item.value ?? []),
    ];

    if (allValues.length === 0 || allValues.every((v) => !isFinite(v))) {
      return { min: 0, max: 100, interval: 25, labels };
    }
    
    const max = Math.max(...allValues);  
    console.log("🔎 yAxis max:", max, "allValues:", allValues);
    
    // Ensure the minimum is 0 and round the maximum to the nearest 200 (or larger)
    const roundedMax = Math.ceil(max / 200) * 200; // Round up to the nearest 200
    const interval = 100; // Fixed interval of 100 for Y-axis labels
  
    return { min: 0, max: roundedMax, interval, labels };
  }, [dataSource]);

  // Calculate total values for a metric over the selected period or day
  const calculateTotal = (dataArray: { value: number; date: string }[]) =>
    Math.round(dataArray.reduce((a, b) => a + b.value, 0));

  // Total values for display (either for a single day or the entire period)
  const totalValues = selectedDayIndex !== null
    ? {
        total_calories: Math.round(
          isFinite(dataSource.calories[selectedDayIndex]?.value)
          ? dataSource.calories[selectedDayIndex].value
          : 0
        ),
        total_protein: Math.round(
          isFinite(dataSource.protein[selectedDayIndex]?.value)
          ? dataSource.protein[selectedDayIndex].value
          : 0
        ),
        total_carbs: Math.round(
          isFinite(dataSource.carbs[selectedDayIndex]?.value)
          ? dataSource.carbs[selectedDayIndex].value
          : 0
        ),
        total_fat: Math.round(
          isFinite(dataSource.fat[selectedDayIndex]?.value)
          ? dataSource.fat[selectedDayIndex].value
          : 0
        ),
      }
    : {
        total_calories: calculateTotal(dataSource.calories),
        total_protein: calculateTotal(dataSource.protein),
        total_carbs: calculateTotal(dataSource.carbs),
        total_fat: calculateTotal(dataSource.fat),
      };

  // Handle metric selection (toggle highlighting)
  const handleMetricClick = (metric: string) => {
    setSelectedMetric(selectedMetric === metric ? null : metric);
  };

  // Handle dot click (toggle selection)
  const handleDotClick = (index: number) => {
    setClickedDotIndex((prevIndex) => (prevIndex === index ? null : index));
    setSelectedDayIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Animate dot scale on click
  const animateDot = () => {
    Animated.sequence([
      Animated.timing(dotScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Combine dot click and animation
  const handleDotClickWithAnimation = (index: number) => {
    handleDotClick(index);
    animateDot();
  };

  // Render a bright, interactive dot for the calories chart
  const renderBrightDot = ({ x, y, index, datasetKey }: { 
    x: number; 
    y: number; 
    index: number; 
    datasetKey: string; 
  }) => {
    const date = dataSource.calories[index]?.date || `index-${index}`; // Fallback to index if date is undefined
    return (
      <TouchableOpacity
        key={`dot-${datasetKey}-${date}-${index}-${x.toFixed(2)}-${y.toFixed(2)}-${Math.random()}`} // Add random suffix to ensure uniqueness
        onPress={() => handleDotClickWithAnimation(index)}
        style={{
          position: "absolute",
          left: x - (clickedDotIndex === index ? 10 : 6),
          top: y - (clickedDotIndex === index ? 10 : 6),
          width: clickedDotIndex === index ? 19 : 11,
          height: clickedDotIndex === index ? 19 : 11,
          borderRadius: clickedDotIndex === index ? 10 : 6,
          backgroundColor: clickedDotIndex === index ? "hsl(180, 100%, 70%)" : "hsla(180, 91.10%, 69.00%, 0.90)",
          borderWidth: clickedDotIndex === index ? 2 : 1,
          borderColor: clickedDotIndex === index ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.6)",
          shadowColor: "#ffffff",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: clickedDotIndex === index ? 0.9 : glowAnimation,
          shadowRadius: clickedDotIndex === index ? 10 : 10,
          elevation: clickedDotIndex === index ? 15 : 12,
          transform: [{ scale: clickedDotIndex === index ? dotScale : 1 }],
        }}
      />
    );
  };

  // Render a normal dot for macronutrient charts
  const renderNormalDot = ({ x, y, index, datasetKey }: { 
    x: number; 
    y: number; 
    index: number; 
    datasetKey: string; 
  }) => {
    const metric = datasetKey.replace('-dataset', '') as keyof typeof dataSource;
    const dataset = dataSource[metric] as DataItem[] | undefined;
    const date = dataset && dataset[index] ? dataset[index].date : `index-${index}`;
    const value = dataset && dataset[index] ? dataset[index].value : 0;

    return (
      <View
        key={`dot-${datasetKey}-${date}-${value}-${index}-${x.toFixed(2)}-${y.toFixed(2)}-${Math.random()}`} // Add random suffix to ensure uniqueness
        style={{
          position: "absolute",
          left: x - (clickedDotIndex === index ? 6 : 3),
          top: y - (clickedDotIndex === index ? 6 : 3),
          width: clickedDotIndex === index ? 16 : 8,
          height: clickedDotIndex === index ? 16 : 8,
          borderRadius: clickedDotIndex === index ? 8 : 3,
          backgroundColor: "rgba(72, 240, 255, 0.97)",
          borderWidth: clickedDotIndex === index ? 2 : 0,
          borderColor: clickedDotIndex === index ? "#ffffff" : "transparent",
          shadowOpacity: 0,
        }}
      />
    );
  };

  // Chart configuration for calories
  const chartConfigCalories = {
    backgroundGradientFrom: "#0f2027",
    backgroundGradientTo: "#203a43",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(72, 239, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    fillShadowGradient: "rgba(10, 101, 192, 0.25)",
    fillShadowGradientOpacity: 0.3,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "rgba(233, 244, 244, 0.34)",
    },
    propsForDots: { r: "4", strokeWidth: "3", stroke: "#48efff" },
    yAxisMinimum: 0,
    propsForHorizontalLabels: {
      fontSize: 10,
      textAlign: "center",
      dx: 0,
    },
    propsForVerticalLabels: {
      fontSize: 10,
      dx: 0,
    },
  };

  // Chart configuration for macronutrients (protein, carbs, fat)
  const chartConfigMacros = {
    backgroundGradientFrom: "#0f2027",
    backgroundGradientTo: "#203a43",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(72, 239, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    fillShadowGradient: "rgba(10, 101, 192, 0.25)",
    fillShadowGradientOpacity: 0.3,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "rgba(233, 244, 244, 0.34)",
    },
    propsForDots: { r: "4", strokeWidth: "3", stroke: "#48efff" },
    yAxisMinimum: 0,
    yAxisInterval: yAxisRange.interval, // Use the dynamically calculated interval
    propsForHorizontalLabels: {
      fontSize: 10,
      textAlign: "center",
      dx: 0,
    },
    propsForVerticalLabels: {
      fontSize: 10,
      dx: 0,
    },
  };

  // Render the component
  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        // Display loading spinner while data is being fetched
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#48efff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <Text style={styles.header}>Nutrition Trend</Text>

          {/* Toggle switch for 7-day vs 30-day view */}
          <View style={styles.switchContainer}>
            <Text testID="range-label" style={styles.switchLabel}>
                {isThirtyDays ? '30 Days' : '7 Days'}
            </Text>
            <Switch
                testID="range-switch"
                value={isThirtyDays}
                onValueChange={() => {
                    setIsThirtyDays(!isThirtyDays);
                    setSelectedDayIndex(null);
                    setClickedDotIndex(null);
                }}
              />
          </View>

          {/* Calories Line Chart */}
          <Text style={[styles.chartTitle, { marginBottom: 7 }]}>Calories</Text>

          <View style={styles.chartContainer}>
            {selectedMetric === "calories" && <View style={styles.shadowEffect} />}
          </View>
          {isDataReady ? (  //Render charts only when all datasets are loaded and non-empty
          <Animated.View style={{ opacity: chartAnimation }}>
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    key: "calories-dataset",
                    data: cleanChartData(dataSource?.calories ?? []),
                    strokeWidth: selectedMetric === "calories" ? 5 : 3,
                    color: () => (selectedMetric === "calories" ? "rgb(246, 57, 48)" : "rgb(235, 27, 16)"),
                  },
                ],
              }}
              width={screenWidth - 40}
              height={170}
              chartConfig={chartConfigCalories}
              bezier
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              style={styles.chart}
              onDataPointClick={({ index }) => handleDotClickWithAnimation(index)}
              renderDotContent={({ x, y, index }) =>
                renderBrightDot({ x, y, index, datasetKey: "calories-dataset" })
              }
            />
          </Animated.View>
          ) : (
            <Text style={{ color: "#ccc", textAlign: "center", marginVertical: 20 }}>
              No data to display.
            </Text>
          )}

          {/* Protein, Carbs, Fat Line Chart */}
          <Text style={[styles.chartTitle, { marginTop: 25 }]}>Protein, Carbs & Fat</Text>
          <View style={styles.chartContainer}>
            {selectedMetric && (
              <View
                style={[
                  styles.shadowEffect,
                  {
                    shadowColor: selectedMetric ? metricColors[selectedMetric as keyof typeof metricColors] : "transparent",
                    backgroundColor: selectedMetric ? metricColors[selectedMetric as keyof typeof metricColors] + "40" : "transparent",
                  },
                ]}
              />
            )}
          </View>
          {isDataReady ? (  //Render charts only when all datasets are loaded and non-empty
            <Animated.View style={{ opacity: chartAnimation }}>
              <LineChart
                data={{
                  labels: labels,
                  datasets: [
                    {
                      key: "protein-dataset",
                      data: cleanChartData(dataSource?.protein ?? []),
                      strokeWidth: selectedMetric === "protein" ? 6 : 2,
                      color: () => (selectedMetric === "protein" ? "rgb(4, 187, 248)" : "rgba(0, 191, 255, 0.89)"),
                    },
                    {
                      key: "carbs-dataset",
                      data: cleanChartData(dataSource?.carbs ?? []),
                      strokeWidth: selectedMetric === "carbs" ? 6 : 2,
                      color: () => (selectedMetric === "carbs" ? "rgba(50, 205, 50, 1)" : "rgba(50, 205, 50, 0.89)"),
                    },
                    {
                      key: "fat-dataset",
                      data: cleanChartData(dataSource?.fat ?? []),
                      strokeWidth: selectedMetric === "fat" ? 6 : 2,
                      color: () => (selectedMetric === "fat" ? "rgba(255, 165, 0, 1)" : "rgba(255, 166, 0, 0.98)"),
                    },                
                  ],
                }}
                width={screenWidth - 40}
                height={170}
                
                chartConfig={chartConfigMacros}
                bezier
                fromZero={true}  // Ensure Y-axis starts from 0
                yAxisInterval={yAxisRange.interval} // Set the interval dynamically
                withVerticalLines={false}
                withHorizontalLines={true}
                style={styles.chart}
                withDots={!isThirtyDays}  // Show dots only for 7-day view
                renderDotContent={({ x, y, index }) => {
                  let datasetKey = "";
                  let datasetIndex = index; // The index within the specific dataset

                  if (index < dataSource.protein.length) {
                    datasetKey = "protein-dataset";
                  } else if (index < dataSource.protein.length + dataSource.carbs.length) {
                    datasetKey = "carbs-dataset";
                    datasetIndex = index - dataSource.protein.length;
                  } else if (index < dataSource.protein.length + dataSource.carbs.length + dataSource.fat.length) {
                    datasetKey = "fat-dataset";
                    datasetIndex = index - dataSource.protein.length - dataSource.carbs.length;
                  }else {
                    return null; 
                  }
                  return renderNormalDot({ x, y, index: datasetIndex, datasetKey });
                }}
              />
            </Animated.View>
          ) : (
            <Text style={{ color: "#ccc", textAlign: "center", marginVertical: 20 }}>
              No data to display.
            </Text>
          )}
          

          {/* Total Data Display (Aligned in Two Columns) */}
          <View style={styles.totalContainer}>
            <View style={styles.timeRangeContainer}>
              <Text style={styles.timeRangeText}>
                {selectedDayIndex !== null ? "1 Day" : isThirtyDays ? "30 Days" : "7 Days"}
              </Text>
            </View>

            {/* Two-column layout for totals */}
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[styles.column, { flexDirection: "row", alignItems: "center", marginBottom: 8 }]}
                onPress={() => handleMetricClick("calories")}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: metricColors.calories,
                      width: selectedMetric === "calories" ? 16 : 10,
                      height: selectedMetric === "calories" ? 16 : 10,
                      borderRadius: selectedMetric === "calories" ? 8 : 4,
                    },
                  ]}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.totalText}> Calories: </Text>
                  <Text style={styles.totalValue}>{totalValues.total_calories}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.column, { flexDirection: "row", alignItems: "center", marginBottom: 8 }]}
                onPress={() => handleMetricClick("protein")}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: metricColors.protein,
                      width: selectedMetric === "protein" ? 16 : 10,
                      height: selectedMetric === "protein" ? 16 : 10,
                      borderRadius: selectedMetric === "protein" ? 8 : 4,
                    },
                  ]}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.totalText}>Protein: </Text>
                  <Text style={styles.totalValue}>{totalValues.total_protein} g</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[styles.column, { flexDirection: "row", alignItems: "center", marginBottom: 8 }]}
                onPress={() => handleMetricClick("carbs")}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: metricColors.carbs,
                      width: selectedMetric === "carbs" ? 16 : 10,
                      height: selectedMetric === "carbs" ? 16 : 10,
                      borderRadius: selectedMetric === "carbs" ? 8 : 4,
                    },
                  ]}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.totalText}>Carbs: </Text>
                  <Text style={styles.totalValue}>{totalValues.total_carbs} g</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.column, { flexDirection: "row", alignItems: "center", marginBottom: 8 }]}
                onPress={() => handleMetricClick("fat")}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: metricColors.fat,
                      width: selectedMetric === "fat" ? 16 : 10,
                      height: selectedMetric === "fat" ? 16 : 10,
                      borderRadius: selectedMetric === "fat" ? 8 : 4,
                    },
                  ]}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.totalText}>Fat: </Text>
                  <Text style={styles.totalValue}>{totalValues.total_fat} g</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgba(0, 0, 7, 0.9)", padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    color: "#48efff",
    fontSize: 16,
    marginTop: 10,
  },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#48efff", marginBottom: 20 },
  switchContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  switchLabel: { fontSize: 16, marginHorizontal: 10, fontWeight: "bold", color: "#48efff" },
  chart: { marginVertical: 10, marginTop: -6, borderRadius: 16, alignSelf: "center", elevation: 4 },
  totalContainer: { marginTop: 20, alignItems: "center" },
  rowContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  column: {
    width: 160,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  totalText: { fontSize: 16, fontWeight: "bold", color: "#48efff" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  timeRangeContainer: {
    backgroundColor: "rgba(68, 68, 68, 0.5)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    marginTop: -12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -250,
    width: 90,
    height: 25,
  },
  icon: {
    marginLeft: 5,
  },
  timeRangeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#48efff",
    marginTop: -0,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  shadowEffect: {
    position: "absolute",
    top: 20,
    left: 10,
    width: screenWidth - 55,
    height: 153,
    backgroundColor: "rgba(255, 69, 58, 0.3)",
    borderRadius: 10,
    shadowColor: "red",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
    transform: [{ translateY: -5 }, { scale: 1.02 }],
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
    width: screenWidth - 40,
    marginHorizontal: 0,
  },
});