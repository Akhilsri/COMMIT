import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ProgressBar, MD3Colors } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const addictionScore = 78;
  const dopamineImbalance = 4;
  const testosteroneDrop = 25;
  const sleepDisruption = 20;
  const timeWasted = 25;

  const data = {
    labels: ['Days Watched', 'Masturbation', 'Hours Watched'],
    datasets: [
      {
        data: [10, 20, 25],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your 15-Day Reduction Phase Report</Text>
      
      {/* Addiction Score */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Addiction Score: {addictionScore}/100</Text>
        <ProgressBar progress={addictionScore / 100} color={MD3Colors.primary50} style={styles.progressBar} />
        <Text style={styles.cardSubtitle}>{addictionScore > 80 ? 'Severe Addiction 🚨' : 'Moderate Addiction ⚠️'}</Text>
      </View>

      {/* Dopamine Imbalance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dopamine Imbalance: {dopamineImbalance}x Normal</Text>
        <Text style={styles.cardSubtitle}>Causes lack of motivation & brain fog</Text>
      </View>

      {/* Testosterone Drop */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Testosterone Drop: ↓{testosteroneDrop}%</Text>
        <Text style={styles.cardSubtitle}>Leads to fatigue & low energy</Text>
      </View>

      {/* Sleep Disruption */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Quality Decrease: ↓{sleepDisruption}%</Text>
        <Text style={styles.cardSubtitle}>Late-night watching affects deep sleep</Text>
      </View>

      {/* Productivity Loss */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Time Wasted: {timeWasted} hours</Text>
        <Text style={styles.cardSubtitle}>Affects study, work, and relationships</Text>
      </View>

      {/* Bar Chart */}
      <Text style={styles.chartTitle}>Your 15-Day Activity Breakdown</Text>
      <BarChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        }}
        style={styles.chart}
      />

      {/* AI Recommendation */}
      <View style={styles.aiAdvice}>
        <Text style={styles.aiTitle}>AI-Powered Advice</Text>
        <Text>🚀 Reduce session length gradually.</Text>
        <Text>📵 Avoid watching after 10 PM for better sleep.</Text>
        <Text>🏋️‍♂️ Exercise 30 minutes daily to rebalance dopamine.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  progressBar: {
    marginTop: 5,
    height: 8,
    borderRadius: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
  },
  aiAdvice: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default HomeScreen;
