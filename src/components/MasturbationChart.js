import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const MasturbationTracker = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [stats, setStats] = useState({ total: 0, average: 0, max: 0 });

  useEffect(() => {
    let logsUnsubscriber = null;

    const setupRealTimeListeners = async () => {
      try {
        setLoading(true);
        let logsMap = {};

        // Check if a user is authenticated
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.error("No authenticated user found");
          setLoading(false);
          return;
        }

        // Get the current user's ID
        const userId = currentUser.uid;
        
        // Set up listener only for the authenticated user's logs
        const logsRef = collection(db, "users", userId, "logs");
        
        logsUnsubscriber = onSnapshot(logsRef, (logsSnapshot) => {
          // Reset logsMap when updating
          logsMap = {};
          
          // Process each log document
          logsSnapshot.forEach((logDoc) => {
            const logDate = logDoc.id; // YYYY-MM-DD
            const logs = Array.isArray(logDoc.data().logs) ? logDoc.data().logs : [];
            
            // Count masturbation entries for this date
            let masturbationCount = 0;
            logs.forEach((log) => {
              if (typeof log.masturbated === "string") {
                masturbationCount += log.masturbated.toLowerCase() === "yes" ? 1 : 0;
              }
            });
            
            // Store the count for this date
            if (masturbationCount > 0) {
              logsMap[logDate] = masturbationCount;
            }
          });
          
          // Process and update the data whenever logs change
          processData(logsMap);
        });

      } catch (error) {
        console.error("Error setting up real-time listeners:", error);
        setLoading(false);
      }
    };

    const processData = (logsMap) => {
      // Filter based on selected time range
      const today = new Date();
      const filteredDates = Object.keys(logsMap).filter(date => {
        const dateObj = new Date(date);
        if (timeRange === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return dateObj >= weekAgo && dateObj <= today;
        } else if (timeRange === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return dateObj >= monthAgo && dateObj <= today;
        } else { // year
          const yearAgo = new Date();
          yearAgo.setFullYear(today.getFullYear() - 1);
          return dateObj >= yearAgo && dateObj <= today;
        }
      });

      // Filter and format the data
      const filteredLogsMap = {};
      filteredDates.forEach(date => {
        filteredLogsMap[date] = logsMap[date];
      });

      // Calculate stats based on filtered data
      const values = Object.values(filteredLogsMap);
      const total = values.reduce((sum, val) => sum + val, 0);
      const average = values.length > 0 ? (total / values.length).toFixed(1) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      
      setStats({ total, average, max });

      // Format data for chart
      const formattedData = filteredDates
        .map((date) => {
          const dateObj = new Date(date);
          let label;
          
          if (timeRange === "week" || timeRange === "month") {
            label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
          } else {
            label = `${dateObj.getMonth() + 1}/${dateObj.getFullYear().toString().slice(2)}`;
          }
          
          return {
            value: filteredLogsMap[date],
            label: label,
            fullDate: date,
            frontColor: generateGradient(filteredLogsMap[date], max),
            labelTextStyle: { color: '#7F8EA3', fontSize: 10 }
          };
        })
        .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

      setChartData(formattedData);
      setLoading(false);
    };

    // Start listening
    setupRealTimeListeners();

    // Cleanup function
    return () => {
      if (logsUnsubscriber) {
        logsUnsubscriber();
      }
    };
  }, [timeRange]);

  // Generate gradient colors based on intensity
  const generateGradient = (value, max) => {
    if (max === 0) return "#6CB4EE";
    
    const intensity = value / max;
    if (intensity < 0.3) return "#6CB4EE";
    if (intensity < 0.6) return "#4682B4";
    return "#1E3A8A";
  };

  const renderTimeRangeSelector = () => {
    return (
      <View style={styles.timeRangeContainer}>
        <TouchableOpacity 
          style={[styles.timeButton, timeRange === "week" ? styles.activeTimeButton : null]}
          onPress={() => setTimeRange("week")}
        >
          <Text style={[styles.timeButtonText, timeRange === "week" ? styles.activeTimeText : null]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeButton, timeRange === "month" ? styles.activeTimeButton : null]}
          onPress={() => setTimeRange("month")}
        >
          <Text style={[styles.timeButtonText, timeRange === "month" ? styles.activeTimeText : null]}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeButton, timeRange === "year" ? styles.activeTimeButton : null]}
          onPress={() => setTimeRange("year")}
        >
          <Text style={[styles.timeButtonText, timeRange === "year" ? styles.activeTimeText : null]}>Year</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.average}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.max}</Text>
          <Text style={styles.statLabel}>Maximum</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  // Calculate appropriate y-axis values
  const maxValue = Math.max(...chartData.map(item => item.value), 1);
  // Round up to the nearest integer for better readability
  const roundedMaxValue = Math.ceil(maxValue);
  // Use integer steps for masturbation count
  const yAxisSections = 5;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Masturbation Log</Text>
      <Text style={styles.subtitle}>Track your habits and patterns</Text>
      
      {renderTimeRangeSelector()}
      {renderStats()}
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Activity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ padding: 10, paddingBottom: 20 }}>
            <BarChart
              data={chartData}
              barWidth={22}
              spacing={12}
              roundedTop
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor="#EAEDF2"
              yAxisColor="#EAEDF2"
              yAxisTextStyle={{ color: '#7F8EA3', fontSize: 10 }}
              noOfSections={yAxisSections}
              maxValue={roundedMaxValue}
              stepValue={Math.ceil(roundedMaxValue / yAxisSections)}
              stepHeight={30}
              renderTooltip={(item) => (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>Date: {item.fullDate}</Text>
                  <Text style={styles.tooltipText}>Count: {item.value}</Text>
                </View>
              )}
              yAxisLabelTexts={Array.from({length: yAxisSections + 1}, (_, i) => 
                String(Math.round(i * (roundedMaxValue / yAxisSections)))
              )}
            />
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Understanding your patterns can help improve mindfulness and well-being.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  timeRangeContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#EAEDF2",
    borderRadius: 12,
    padding: 4,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTimeButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTimeText: {
    color: "#4F46E5",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  tooltip: {
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    padding: 8,
    borderRadius: 6,
    width: 150,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoText: {
    color: "#1E40AF",
    fontSize: 14,
    lineHeight: 20,
  }
});

export default MasturbationTracker;