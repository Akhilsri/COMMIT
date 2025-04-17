import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {GEMINI_API_KEY} from '@env'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BlurView } from '@react-native-community/blur';

const AIInsights = ({ userData, logsData }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCpoHqpGBuRWwRFKt5gjmr484om35BL3q8";
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    if (logsData && logsData.length > 0) {
      generateInsightsWithGemini();
    } else {
      setLoading(false);
      setInsights([{ 
        type: 'info', 
        insight: 'Start Your Journey', 
        recommendation: 'Log your data daily to receive personalized AI insights on your progress.' 
      }]);
    }
  }, [logsData]);

  const generateInsightsWithGemini = async () => {
    setLoading(true);
    try {
      const allLogs = logsData.flatMap(log => log.logs || []);
      if (allLogs.length === 0) {
        setInsights([{ 
          type: 'info', 
          insight: 'Start Your Journey', 
          recommendation: 'Log your data daily to receive personalized AI insights on your progress.' 
        }]);
        setLoading(false);
        return;
      }

      const userContext = {
        streak: userData?.streak || 0,
        reductionDays: userData?.reductionDays || 30,
        goal: userData?.goal || "Reduce usage"
      };

      const formattedLogs = allLogs.map(log => ({
        date: log.date,
        watchTime: log.watchTime,
        hoursWatched: log.hoursWatched || 0,
        mood: log.mood || "",
        masturbated: log.masturbated || "No",
        triggers: log.triggers || "",
        notes: log.notes || ""
      }));

      const prompt = `You are an AI assistant helping someone reduce addictive behaviors. Based on the user data and logs provided, generate 3-5 personalized insights. User context: ${JSON.stringify(userContext, null, 2)} User logs (most recent first): ${JSON.stringify(formattedLogs, null, 2)} Generate insights in JSON format.`;

      console.log("Generated Prompt for Gemini:", prompt);

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = await response.text();

      console.log("Raw Text Response from Gemini:", textResponse);

      try {
        const newInsights = JSON.parse(textResponse.trim().replace(/^```json|```$/g, ""));
        setInsights(newInsights);
        // Initialize expanded state for each insight
        const initialExpandedState = {};
        newInsights.forEach((_, index) => {
          initialExpandedState[index] = false;
        });
        setExpanded(initialExpandedState);
      } catch (jsonError) {
        console.error("Error parsing JSON from Gemini:", jsonError);
        setInsights([{ 
          type: 'error', 
          insight: 'Analysis Error', 
          recommendation: 'Failed to parse AI insights. Please try again later.' 
        }]);
      }
      
    } catch (error) {
      console.error("Error generating insights with Gemini:", error);
      setInsights([{ 
        type: 'error', 
        insight: 'Connection Error', 
        recommendation: 'Failed to fetch AI insights. Check your internet connection and try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getColorForInsightType = (type) => {
    switch (type) {
      case 'success': return ['#1DB954', '#1DB95499'];
      case 'warning': return ['#FF7043', '#FF704399'];
      case 'error': return ['#F44336', '#F4433699'];
      case 'info': return ['#2196F3', '#2196F399'];
      default: return ['#8E33FF', '#673AB799']; // Gemini-inspired purple
    }
  };

  const getIconForInsightType = (type) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      case 'info': return 'information';
      default: return 'brain';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Header with modern Gemini-inspired design */}
      <LinearGradient
        colors={['#8E33FF', '#673AB7']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="brain" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.headerText}>AI Insights</Text>
        </View>
        
        <View style={styles.headerPills}>
          <View style={styles.pill}>
            <Icon name="flash" size={16} color="#fff" />
            <Text style={styles.pillText}>AI Powered</Text>
          </View>
          <View style={styles.pill}>
            <Icon name="shield-check" size={16} color="#fff" />
            <Text style={styles.pillText}>Private Analysis</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#8E33FF', '#673AB7']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.loadingGradient}
          >
            <View style={styles.pulsingContainer}>
              <View style={styles.pulseEffect} />
              <View style={styles.pulseEffect} />
              <View style={styles.pulseEffect} />
              
              <Icon name="brain" size={40} color="#FFFFFF" style={styles.pulsingIcon} />
            </View>
            <Text style={styles.loadingText}>Analyzing patterns in your data...</Text>
            <Text style={styles.loadingSubtext}>Generating personalized insights</Text>
          </LinearGradient>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.sectionTitle}>Your Personal Insights</Text>
          
          {insights.map((insight, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => toggleExpand(index)}
              activeOpacity={0.9}
              style={styles.cardWrapper}
            >
              <LinearGradient 
                colors={getColorForInsightType(insight.type)} 
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[styles.insightCard, 
                  { borderRadius: 16 }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Icon name={getIconForInsightType(insight.type)} size={22} color="#fff" />
                  </View>
                  <Text style={styles.title} numberOfLines={expanded[index] ? undefined : 1}>
                    {insight.insight}
                  </Text>
                  <Icon 
                    name={expanded[index] ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                
                {(expanded[index] || !expanded[index]) && (
                  <View style={[
                    styles.cardContent, 
                    { 
                      height: expanded[index] ? undefined : 0, 
                      overflow: expanded[index] ? 'visible' : 'hidden',
                      opacity: expanded[index] ? 1 : 0
                    }
                  ]}>
                    <Text style={styles.message}>
                      {insight.recommendation}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={generateInsightsWithGemini}
          >
            <LinearGradient
              colors={['#8E33FF', '#673AB7']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.refreshButtonGradient}
            >
              <Icon name="refresh" size={18} color="#fff" style={styles.refreshIcon} />
              <Text style={styles.refreshText}>Refresh Insights</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.poweredByContainer}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <View style={styles.geminiLogoContainer}>
              <Icon name="google" size={16} color="#666" />
              <Text style={styles.geminiText}>Gemini</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FBFAFD', // Very light purple tint
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#673AB7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  googleIcon: {
    marginRight: 4,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  headerPills: {
    flexDirection: 'row',
    marginTop: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingGradient: {
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#673AB7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  pulsingContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.5,
    transform: [{ scale: 1 }],
  },
  pulsingIcon: {
    zIndex: 1,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 6,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  insightCard: { 
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  title: { 
    flex: 1,
    fontWeight: '600', 
    color: '#fff', 
    fontSize: 16,
  },
  message: { 
    color: '#fff', 
    fontSize: 14,
    lineHeight: 22,
  },
  refreshButton: {
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#673AB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  poweredByText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  geminiLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geminiText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 2,
  },
});

export default AIInsights;