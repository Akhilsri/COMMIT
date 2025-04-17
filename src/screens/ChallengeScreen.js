import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
  Platform,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  limit
} from 'firebase/firestore';
import { app, auth } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const db = getFirestore(app);
const { width, height } = Dimensions.get('window');

// Responsive sizing helper
const scale = size => (width / 375) * size;

const CHALLENGE_TYPES = {
  daily: {
    colors: ['#654ea3', '#5a55ae'],
    icon: 'calendar-today',
    title: 'Daily'
  },
  weekly: {
    colors: ['#2193b0', '#6dd5ed'],
    icon: 'calendar-week',
    title: 'Weekly'
  },
  monthly: {
    colors: ['#ee9ca7', '#ffdde1'],
    icon: 'calendar-month',
    title: 'Monthly'
  }
};

const ChallengeScreen = () => {
  const [challenges, setChallenges] = useState({
    daily: null,
    weekly: null,
    monthly: null
  });
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [userLevel, setUserLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    const fetchChallengesAndUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        // Subscribe to user data updates
        const userRef = doc(db, "users", user.uid);
        const userUnsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserXP(userData.xp || 0);
            
            // Calculate level based on XP (example formula)
            const level = Math.floor(Math.sqrt(userData.xp / 100)) + 1;
            setUserLevel(level);
            
            // Get streak data
            setStreakDays(userData.streakDays || 0);
          }
        });

        // Subscribe to completed challenges
        const completedRef = collection(db, "users", user.uid, "completedChallenges");
        const completedUnsubscribe = onSnapshot(completedRef, (snapshot) => {
          const completed = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCompletedChallenges(completed);
        });

        // Fetch one challenge of each type
        const fetchedChallenges = {};
        const sections = ['daily', 'weekly', 'monthly'];
        
        for (const section of sections) {
          const challengesQuery = query(
            collection(db, `${section}Challenges`),
            limit(3) // Fetch 3 challenges of each type
          );
          
          const snap = await getDocs(challengesQuery);
          fetchedChallenges[section] = snap.empty ? [] : 
            snap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
        }
        
        setChallenges(fetchedChallenges);
        setLoading(false);

        return () => {
          userUnsubscribe();
          completedUnsubscribe();
        };
      } catch (error) {
        console.error("Failed to fetch challenges or user data:", error);
        setLoading(false);
      }
    };

    fetchChallengesAndUserData();
  }, []);

  const isChallengeCompleted = (challenge) => {
    if (!challenge) return false;
    return completedChallenges.some(
      comp => comp.task === challenge.task
    );
  };

  const markAsCompleted = async (challenge, type) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      if (isChallengeCompleted(challenge)) {
        Alert.alert("Already Completed", "You already completed this challenge.");
        return;
      }

      // Add to user's completedChallenges subcollection
      const completedRef = collection(db, "users", user.uid, "completedChallenges");
      await addDoc(completedRef, {
        ...challenge,
        type,
        completedAt: new Date().toISOString()
      });

      // Update XP
      const newXP = userXP + (challenge.reward || 0);
      
      // Update streak if it's a daily challenge
      let updatedData = { xp: newXP };
      if (type === 'daily') {
        updatedData.streakDays = streakDays + 1;
        updatedData.lastCompletedDate = new Date().toISOString().split('T')[0];
      }
      
      await updateDoc(doc(db, "users", user.uid), updatedData);

      Alert.alert("Success", `Completed '${challenge.task}' and earned ${challenge.reward} XP!`);
    } catch (err) {
      console.error("Error completing challenge:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const renderChallengeCard = (challenge, type, index) => {
    if (!challenge) return null;

    const typeInfo = CHALLENGE_TYPES[type];
    const completed = isChallengeCompleted(challenge);
    const difficultyColor = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#F44336'
    }[challenge.difficulty?.toLowerCase()] || '#4CAF50';

    // Slide in animation with delay based on index
    const slideAnim = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [50 * (index + 1), 0]
    });

    return (
      <Animated.View 
        style={[
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
          { marginBottom: scale(12) }
        ]}
        key={challenge.id || index}
      >
        <LinearGradient
          colors={typeInfo.colors}
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 0}}
          style={[styles.challengeCard, completed && styles.completedCardOverlay]}
        >
          <View style={styles.cardTop}>
            <View style={styles.challengeIconContainer}>
              <Icon name={typeInfo.icon} size={scale(18)} color="#FFF" />
            </View>
            
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle} numberOfLines={2} ellipsizeMode="tail">
                {challenge.task}
              </Text>
              <View style={styles.challengeMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                  <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
                </View>
                <View style={styles.rewardContainer}>
                  <Icon name="star" size={scale(12)} color="#FFD700" />
                  <Text style={styles.rewardText}>{challenge.reward} XP</Text>
                </View>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => markAsCompleted(challenge, type)}
            style={[
              styles.completeButton,
              completed && styles.completedButton
            ]}
            disabled={completed}
          >
            {completed ? (
              <View style={styles.buttonContent}>
                <Icon name="check-circle" size={scale(16)} color="#FFF" />
                <Text style={styles.completeButtonText}>Completed</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.completeButtonText}>Complete</Text>
                <Icon name="arrow-right" size={scale(16)} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const renderTab = (type) => {
    const typeInfo = CHALLENGE_TYPES[type];
    const isActive = activeTab === type;
    
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(type)}
      >
        <Icon 
          name={typeInfo.icon} 
          size={scale(18)} 
          color={isActive ? '#FFF' : '#4A4A4A'} 
        />
        <Text style={[
          styles.tabText, 
          isActive && styles.activeTabText
        ]}>
          {typeInfo.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const calculateLevelProgress = () => {
    const currentLevelXP = (userLevel - 1) * (userLevel - 1) * 100;
    const nextLevelXP = userLevel * userLevel * 100;
    const requiredXP = nextLevelXP - currentLevelXP;
    const currentProgress = userXP - currentLevelXP;
    
    return (currentProgress / requiredXP) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading your challenges...</Text>
      </SafeAreaView>
    );
  }

  const activeChallenges = challenges[activeTab] || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }]
          }
        ]}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}
        >
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {auth.currentUser?.email?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{userLevel}</Text>
                </View>
              </View>
              
              <View style={styles.userStats}>
                <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                  {auth.currentUser?.displayName || 'Challenger'}
                </Text>
                <View style={styles.xpContainer}>
                  <Text style={styles.xpText}>{userXP} XP</Text>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${calculateLevelProgress()}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="cog" size={scale(20)} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsCards}>
            <View style={styles.statCard}>
              <Icon name="trophy" size={scale(20)} color="#FFD700" />
              <Text style={styles.statValue}>{completedChallenges.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="fire" size={scale(20)} color="#FF6B6B" />
              <Text style={styles.statValue}>{streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="numeric" size={scale(20)} color="#4ECDC4" />
              <Text style={styles.statValue}>{userLevel}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      <View style={styles.tabsContainer}>
        {renderTab('daily')}
        {renderTab('weekly')}
        {renderTab('monthly')}
      </View>
      
      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.challengesHeader}>
          <Text style={styles.challengesTitle}>
            {CHALLENGE_TYPES[activeTab].title} Challenges
          </Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Icon name="refresh" size={scale(18)} color="#6366F1" />
          </TouchableOpacity>
        </View>
        
        {activeChallenges.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Icon name="calendar-remove" size={scale(50)} color="#DDD" />
            <Text style={styles.emptyStateText}>
              No {activeTab} challenges available
            </Text>
            <TouchableOpacity style={styles.refreshButtonLarge}>
              <Text style={styles.refreshButtonText}>Refresh Challenges</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.challengesContainer}>
            {activeChallenges.map((challenge, index) => 
              renderChallengeCard(challenge, activeTab, index)
            )}
          </View>
        )}
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Challenge Tips</Text>
          <View style={styles.tipCard}>
            <Icon name="lightbulb-outline" size={scale(18)} color="#6366F1" />
            <Text style={styles.tipText}>
              Complete daily challenges consistently to maintain your streak 
              and earn bonus rewards!
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: scale(16),
    fontSize: scale(14),
    color: '#6366F1',
    fontWeight: '500'
  },
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      }
    })
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : scale(16),
    paddingBottom: scale(16),
    paddingHorizontal: scale(16),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(12)
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: scale(10)
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#FFF',
    fontSize: scale(18),
    fontWeight: 'bold'
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF'
  },
  levelText: {
    color: '#FFF',
    fontSize: scale(10),
    fontWeight: 'bold'
  },
  userStats: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: scale(16),
    fontWeight: 'bold',
    marginBottom: 2
  },
  xpContainer: {
    width: '100%',
  },
  xpText: {
    color: '#FFF',
    fontSize: scale(12),
    marginBottom: 2
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    width: '100%'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 1.5
  },
  settingsButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8)
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: scale(8),
    marginHorizontal: -scale(4)
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(8),
    paddingHorizontal: scale(6),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: scale(10),
    marginHorizontal: scale(4)
  },
  statValue: {
    color: '#FFF',
    fontSize: scale(16),
    fontWeight: 'bold',
    marginTop: scale(4),
    marginBottom: 0
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: scale(10)
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2
      },
      android: {
        elevation: 1
      }
    })
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(8),
    borderRadius: scale(8),
    marginHorizontal: scale(3)
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#4A4A4A',
    marginLeft: scale(4)
  },
  activeTabText: {
    color: '#FFF'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(32)
  },
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12)
  },
  challengesTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#111827'
  },
  refreshButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(32),
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    marginBottom: scale(20)
  },
  emptyStateText: {
    fontSize: scale(14),
    color: '#6B7280',
    marginTop: scale(12),
    marginBottom: scale(16)
  },
  refreshButtonLarge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(8)
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: scale(13)
  },
  challengesContainer: {
    marginBottom: scale(20)
  },
  challengeCard: {
    borderRadius: scale(12),
    padding: scale(14),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 2
      }
    })
  },
  completedCardOverlay: {
    opacity: 0.8,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: scale(12)
  },
  challengeIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(10)
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#FFF',
    marginBottom: scale(6),
    lineHeight: scale(18)
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  difficultyBadge: {
    paddingHorizontal: scale(6),
    paddingVertical: scale(3),
    borderRadius: scale(6),
    marginRight: scale(6),
    marginBottom: scale(4)
  },
  difficultyText: {
    color: '#FFF',
    fontSize: scale(10),
    fontWeight: 'bold'
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: scale(6),
    paddingVertical: scale(3),
    borderRadius: scale(6),
    marginBottom: scale(4)
  },
  rewardText: {
    color: '#FFF',
    fontSize: scale(10),
    fontWeight: '600',
    marginLeft: scale(3)
  },
  completeButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: scale(10),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center'
  },
  completedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.6)'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: scale(14),
    marginHorizontal: scale(6)
  },
  tipsContainer: {
    marginBottom: scale(16)
  },
  tipsTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: scale(10)
  },
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: scale(12),
    padding: scale(14),
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2
      },
      android: {
        elevation: 1
      }
    })
  },
  tipText: {
    color: '#4B5563',
    fontSize: scale(12),
    lineHeight: scale(18),
    marginLeft: scale(10),
    flex: 1
  }
});

export default ChallengeScreen;