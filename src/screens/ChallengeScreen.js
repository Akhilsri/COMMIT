import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated
} from "react-native";
import { LinearGradient } from 'react-native-linear-gradient';
import { collection, getDocs, addDoc, query, where, getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from "../firebaseConfig";

const db = getFirestore(app);
const { width } = Dimensions.get('window');

const ChallengeScreen = () => {
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [monthlyChallenges, setMonthlyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('daily');
  const [userXP, setUserXP] = useState(0);
  
  // Animation values
  const dailyHeight = new Animated.Value(0);
  const weeklyHeight = new Animated.Value(0);
  const monthlyHeight = new Animated.Value(0);

  useEffect(() => {
    const fetchAllChallenges = async () => {
      try {
        // Fetch Daily Challenges
        const dailySnapshot = await getDocs(collection(db, "dailyChallenges"));
        const dailyData = dailySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDailyChallenges(dailyData);
        
        // Fetch Weekly Challenges
        const weeklySnapshot = await getDocs(collection(db, "weeklyChallenges"));
        const weeklyData = weeklySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWeeklyChallenges(weeklyData);
        
        // Fetch Monthly Challenges
        const monthlySnapshot = await getDocs(collection(db, "monthlyChallenges"));
        const monthlyData = monthlySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMonthlyChallenges(monthlyData);
        
        // Fetch User XP
        // Assuming user ID is stored somewhere - this is a placeholder
        // In a real app, you would get the current user ID from authentication
        const user = auth.currentUser
        const userId = user.uid; 
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserXP(userDoc.data().xp || 0);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllChallenges();
  }, []);

  const toggleSection = (section) => {
    let targetDaily = 0;
    let targetWeekly = 0;
    let targetMonthly = 0;
    
    if (section === 'daily') {
      targetDaily = dailyChallenges.length * 170;
    } else if (section === 'weekly') {
      targetWeekly = weeklyChallenges.length * 170;
    } else if (section === 'monthly') {
      targetMonthly = monthlyChallenges.length * 170;
    }
    
    Animated.parallel([
      Animated.timing(dailyHeight, {
        toValue: targetDaily,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(weeklyHeight, {
        toValue: targetWeekly,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(monthlyHeight, {
        toValue: targetMonthly,
        duration: 300,
        useNativeDriver: false
      })
    ]).start();
    
    setExpandedSection(section);
  };

  useEffect(() => {
    // Initialize with daily section expanded
    if (!loading) {
      toggleSection('daily');
    }
  }, [loading]);

  const markAsCompleted = async (challenge) => {
    try {
      // Check if challenge is already completed
      const completedQuery = query(
        collection(db, "completedChallenges"),
        where("task", "==", challenge.task)
      );
      const querySnapshot = await getDocs(completedQuery);

      if (!querySnapshot.empty) {
        Alert.alert("Already Completed", "You have already completed this challenge!");
        return;
      }

      // Add completed challenge to Firestore
      await addDoc(collection(db, "completedChallenges"), {
        ...challenge,
        completedAt: new Date().toISOString(),
      });
      
      // Update user's XP (this is just for UI, you'd also need to update in Firebase)
      const newXP = userXP + (challenge.reward || 0);
      setUserXP(newXP);
      
      // In a real app, you would update the user's XP in Firestore here
      // const userDocRef = doc(db, "users", "currentUserId");
      // await updateDoc(userDocRef, { xp: newXP });

      Alert.alert("Challenge Completed 🎉", `You have successfully completed "${challenge.task}" and earned ${challenge.reward} XP!`);
    } catch (error) {
      console.error("Error marking challenge as completed:", error);
      Alert.alert("Error", "Failed to complete the challenge. Try again!");
    }
  };

  const renderChallengeItem = (item, index) => {
    // Different colors for different difficulty levels
    const difficultyColors = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#F44336',
    };
    
    const difficultyColor = difficultyColors[item.difficulty?.toLowerCase()] || '#4CAF50';
    
    return (
      <TouchableOpacity 
        key={item.id || `challenge-${index}`}
        style={styles.challengeCard}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#f5f5f5', '#ffffff']}
          style={styles.challengeCardGradient}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeTypeContainer}>
              <Text style={styles.challengeType}>{item.type}</Text>
            </View>
            <View style={[styles.difficultyBadge, {backgroundColor: difficultyColor}]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.challengeTask}>{item.task}</Text>
          
          <View style={styles.rewardAndAction}>
            <View style={styles.rewardContainer}>
              <Icon name="star" size={18} color="#FFD700" style={styles.starIcon} />
              <Text style={styles.rewardText}>{item.reward} XP</Text>
            </View>
            
            <TouchableOpacity
              onPress={() => markAsCompleted(item)}
              style={styles.completeButton}
            >
              <Icon name="check" size={16} color="white" />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text style={styles.loadingText}>Loading your challenges...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6200ea', '#9d4edd']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Challenges</Text>
            <Text style={styles.headerSubtitle}>Complete challenges to earn rewards</Text>
          </View>
          
          {/* XP Display */}
          <View style={styles.xpContainer}>
            <LinearGradient
              colors={['#8e44ad', '#6200ea']}
              style={styles.xpBadge}
            >
              <Icon name="star-circle" size={20} color="#FFD700" />
              <Text style={styles.xpText}>{userXP} XP</Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Challenge Categories */}
        <View style={styles.categoriesContainer}>
          
          {/* Daily Section */}
          <TouchableOpacity 
            style={[
              styles.categoryHeader, 
              expandedSection === 'daily' && styles.activeCategoryHeader
            ]}
            onPress={() => toggleSection('daily')}
          >
            <View style={styles.categoryTitleContainer}>
              <Icon 
                name="calendar-today" 
                size={24} 
                color={expandedSection === 'daily' ? "#6200ea" : "#555"} 
              />
              <Text style={[
                styles.categoryTitle,
                expandedSection === 'daily' && styles.activeCategoryTitle
              ]}>
                Daily Challenges
              </Text>
            </View>
            <View style={styles.challengeCountContainer}>
              <Text style={styles.challengeCount}>{dailyChallenges.length}</Text>
            </View>
          </TouchableOpacity>
          
          <Animated.View style={[styles.challengesContainer, {height: dailyHeight}]}>
            {dailyChallenges.map((item, index) => renderChallengeItem(item, `daily-${index}`))}
          </Animated.View>
          
          {/* Weekly Section */}
          <TouchableOpacity 
            style={[
              styles.categoryHeader, 
              expandedSection === 'weekly' && styles.activeCategoryHeader
            ]}
            onPress={() => toggleSection('weekly')}
          >
            <View style={styles.categoryTitleContainer}>
              <Icon 
                name="calendar-week" 
                size={24} 
                color={expandedSection === 'weekly' ? "#6200ea" : "#555"} 
              />
              <Text style={[
                styles.categoryTitle,
                expandedSection === 'weekly' && styles.activeCategoryTitle
              ]}>
                Weekly Challenges
              </Text>
            </View>
            <View style={styles.challengeCountContainer}>
              <Text style={styles.challengeCount}>{weeklyChallenges.length}</Text>
            </View>
          </TouchableOpacity>
          
          <Animated.View style={[styles.challengesContainer, {height: weeklyHeight}]}>
            {weeklyChallenges.map((item, index) => renderChallengeItem(item, `weekly-${index}`))}
          </Animated.View>
          
          {/* Monthly Section */}
          <TouchableOpacity 
            style={[
              styles.categoryHeader, 
              expandedSection === 'monthly' && styles.activeCategoryHeader
            ]}
            onPress={() => toggleSection('monthly')}
          >
            <View style={styles.categoryTitleContainer}>
              <Icon 
                name="calendar-month" 
                size={24} 
                color={expandedSection === 'monthly' ? "#6200ea" : "#555"} 
              />
              <Text style={[
                styles.categoryTitle,
                expandedSection === 'monthly' && styles.activeCategoryTitle
              ]}>
                Monthly Challenges
              </Text>
            </View>
            <View style={styles.challengeCountContainer}>
              <Text style={styles.challengeCount}>{monthlyChallenges.length}</Text>
            </View>
          </TouchableOpacity>
          
          <Animated.View style={[styles.challengesContainer, {height: monthlyHeight}]}>
            {monthlyChallenges.map((item, index) => renderChallengeItem(item, `monthly-${index}`))}
          </Animated.View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Complete challenges to progress in your journey</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200ea',
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  xpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  activeCategoryHeader: {
    backgroundColor: '#f0e6ff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderTopWidth: 3,
    borderTopColor: '#6200ea',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  activeCategoryTitle: {
    color: '#6200ea',
  },
  challengeCountContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  challengeCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  challengesContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  challengeCard: {
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  challengeCardGradient: {
    padding: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeType: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeTask: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rewardAndAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  completeButton: {
    backgroundColor: '#6200ea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontStyle: 'italic',
  }
});

export default ChallengeScreen;