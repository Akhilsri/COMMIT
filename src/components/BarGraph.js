import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;

const PornWatchBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // "week", "month", "all"
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    
    // Set up real-time listeners for logs data
    const fetchLogsRealTime = () => {
      setLoading(true);
      
      // Create a reference to the logs collection for the current user
      const logsRef = collection(db, "users", user.uid, "logs");
      
      // Set up the real-time listener
      const unsubscribe = onSnapshot(logsRef, (snapshot) => {
        let logsMap = {};
        
        snapshot.forEach((doc) => {
          const logDate = doc.id; // YYYY-MM-DD
          const logs = Array.isArray(doc.data().logs) ? doc.data().logs : [];
          const totalHours = logs.reduce(
            (sum, log) => sum + (typeof log.hoursWatched === "number" ? log.hoursWatched : 0),
            0
          );

          logsMap[logDate] = totalHours;
        });
        
        // Process the data for the chart
        processChartData(logsMap);
        setLoading(false);
      }, (error) => {
        console.error("Error in logs snapshot listener:", error);
        setLoading(false);
      });
      
      // Return the unsubscribe function
      return unsubscribe;
    };
    
    const unsubscribe = fetchLogsRealTime();
    
    // Clean up listener when component unmounts or timeRange changes
    return () => unsubscribe();
  }, [user, timeRange]);
  
  const processChartData = (logsMap) => {
    // Convert object to array & sort by date
    const sortedData = Object.keys(logsMap)
      .map((date) => ({
        value: logsMap[date],
        fullDate: date, // Full date for sorting
        date: new Date(date)
      }))
      .sort((a, b) => a.date - b.date);

    // Filter based on selected time range
    const today = new Date();
    let filteredData = [...sortedData];
    
    if (timeRange === "week") {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      filteredData = sortedData.filter(item => item.date >= lastWeek);
    } else if (timeRange === "month") {
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filteredData = sortedData.filter(item => item.date >= lastMonth);
    }

    // Optimize date display depending on how many dates we have
    const formattedData = filteredData.map((item, index) => {
      const month = item.date.getMonth() + 1;
      const day = item.date.getDate();
      
      // Decide on label format based on number of bars
      let dateLabel;
      if (filteredData.length > 14) {
        // For many dates, only show label on every 3rd bar
        dateLabel = index % 3 === 0 ? `${month}/${day}` : "";
      } else {
        dateLabel = `${month}/${day}`;
      }
      
      return {
        value: item.value,
        label: dateLabel,
        fullDate: item.fullDate,
        date: item.date, // Keep the date object for tooltip
        topLabelComponent: () => (
          <Text style={styles.barTopLabel}>{item.value.toFixed(1)}</Text>
        ),
        frontColor: getGradientColor(item.value),
      };
    });

    setChartData(formattedData);
  };

  // Get color based on hours watched
  const getGradientColor = (value) => {
    if (value < 1) return "#4CAF50"; // Green for low usage
    if (value < 2) return "#FFC107"; // Yellow for moderate
    if (value < 3) return "#FF9800"; // Orange for high
    return "#F44336"; // Red for very high
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const calculateBarDimensions = (numItems) => {
    // Dynamically calculate bar width based on number of items
    if (numItems > 30) return { barWidth: 6, spacing: 2 };
    if (numItems > 20) return { barWidth: 8, spacing: 3 };
    if (numItems > 14) return { barWidth: 10, spacing: 4 };
    if (numItems > 7) return { barWidth: 15, spacing: 7 };
    return { barWidth: 20, spacing: 10 }; // Default for small number of items
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5AE0" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  // Dynamically calculate dimensions based on number of items
  const { barWidth, spacing } = calculateBarDimensions(chartData.length);
  const chartWidth = Math.max(
    chartData.length * (barWidth + spacing) + 50,
    screenWidth - 40
  );

  // Calculate statistics
  const totalHours = chartData.reduce((sum, item) => sum + item.value, 0).toFixed(1);
  const avgHours = chartData.length > 0 
    ? (chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(1) 
    : "0.0";
  const maxDay = chartData.length > 0 
    ? chartData.reduce((max, item) => item.value > max.value ? item : max, { value: 0, fullDate: "N/A" })
    : { value: 0, fullDate: "N/A" };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Porn Watching Tracker</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === "week" && styles.activeFilter]}
            onPress={() => handleTimeRangeChange("week")}
          >
            <Text style={[styles.filterText, timeRange === "week" && styles.activeFilterText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === "month" && styles.activeFilter]}
            onPress={() => handleTimeRangeChange("month")}
          >
            <Text style={[styles.filterText, timeRange === "month" && styles.activeFilterText]}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === "all" && styles.activeFilter]}
            onPress={() => handleTimeRangeChange("all")}
          >
            <Text style={[styles.filterText, timeRange === "all" && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalHours}</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgHours}</Text>
          <Text style={styles.statLabel}>Avg Daily</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{maxDay.value.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Peak Day</Text>
        </View>
      </View>

      {chartData.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for selected period</Text>
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>
            Daily Hours Watched ({chartData.length} days)
          </Text>
          
          {/* Info text for many dates */}
          {chartData.length > 14 && (
            <Text style={styles.infoText}>
              Scroll horizontally to view all data
            </Text>
          )}
          
          <View style={styles.chartContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ minWidth: chartWidth }}
            >
              <BarChart
                data={chartData}
                barWidth={barWidth}
                spacing={spacing}
                initialSpacing={10}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor="#DDDDDD"
                yAxisColor="#DDDDDD"
                xAxisLabelTextStyle={[
                  styles.axisLabel,
                  chartData.length > 14 && styles.smallAxisLabel
                ]}
                yAxisTextStyle={styles.axisLabel}
                noOfSections={5}
                maxValue={Math.max(...chartData.map((item) => item.value)) * 1.2 || 5}
                showLine
                lineConfig={{
                  color: "#6A5AE0",
                  thickness: 2,
                  curved: true,
                  hideDataPoints: false,
                  shiftY: 0,
                  initialSpacing: 10,
                }}
              />
            </ScrollView>
          </View>
        </View>
      )}
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>{"< 1 hour"}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FFC107" }]} />
          <Text style={styles.legendText}>{"1-2 hours"}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FF9800" }]} />
          <Text style={styles.legendText}>{"2-3 hours"}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#F44336" }]} />
          <Text style={styles.legendText}>{"> 3 hours"}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  activeFilter: {
    backgroundColor: "#6A5AE0",
  },
  filterText: {
    fontSize: 14,
    color: "#666666",
  },
  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8F8FF",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6A5AE0",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  chartWrapper: {
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444444",
    marginBottom: 5,
    textAlign: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
    marginBottom: 5,
  },
  chartContainer: {
    height: 280,
    borderRadius: 16,
    backgroundColor: "#FBFBFF",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  axisLabel: {
    fontSize: 10,
    color: "#888888",
  },
  smallAxisLabel: {
    fontSize: 8,
  },
  barTopLabel: {
    color: "#666666",
    fontSize: 10,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8FF",
    borderRadius: 16,
  },
  noDataText: {
    color: "#888888",
    fontSize: 16,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666666",
  },
});

export default PornWatchBarChart;