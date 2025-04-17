import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import LinearGradient from 'react-native-linear-gradient';

const firebaseConfig = {
    apiKey: "AIzaSyC60SeFRPsZ0vaR4MRCSMWNjGUVOIGb5NA",
    authDomain: "commit-d5ed2.firebaseapp.com",
    projectId: "commit-d5ed2",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "1:535322125668:android:644184000309dac1b74671",
  };

// Initialize Firebase if it hasn't been already
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BadgeScreen = () => {
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all badges
        const badgesCollection = collection(db, 'badges');
        const snapshot = await getDocs(badgesCollection);
        const badgeData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort badges by category and then by order
        badgeData.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.displayOrder - b.displayOrder;
        });
        
        setBadges(badgeData);

        // Fetch earned badges
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userBadges = userData.achievements || {};
          setEarnedBadges(userBadges);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const renderBadgeItem = ({ item }) => {
    const isUnlocked = earnedBadges[item.id] === true;;
    const icon = isUnlocked ? item.iconUnlocked : item.iconLocked;
    const progress = earnedBadges[item.id] ? 100 : (earnedBadges[`${item.id}_progress`] || 0);

    return (
      <TouchableOpacity 
        style={styles.badgeItem}
        onPress={() => setSelectedBadge(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.badgeImageContainer, isUnlocked ? styles.unlockedBadge : styles.lockedBadge]}>
          <Image source={{ uri: icon }} style={styles.badgeImage} />
          {/* {!isUnlocked && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )} */}
        </View>
        <Text style={[styles.title, isUnlocked ? styles.unlockedText : styles.lockedText]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBadgeDetails = () => {
    if (!selectedBadge) return null;
    
    const isUnlocked = earnedBadges[selectedBadge.id];
    const progress = earnedBadges[`${selectedBadge.id}_progress`] || 0;
    const icon = isUnlocked ? selectedBadge.iconUnlocked : selectedBadge.iconLocked;
    
    return (
      <View style={styles.detailsContainer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setSelectedBadge(null)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.detailsContent}>
          <View style={[styles.detailsBadgeContainer, isUnlocked ? styles.unlockedBadge : styles.lockedBadge]}>
            <Image source={{ uri: icon }} style={styles.detailsBadgeImage} />
          </View>
          
          <Text style={styles.detailsTitle}>{selectedBadge.title}</Text>
          
          <Text style={styles.detailsDescription}>
            {isUnlocked ? selectedBadge.description : selectedBadge.hint || "Keep exploring to unlock this badge!"}
          </Text>
          
          {!isUnlocked && (
            <View style={styles.detailsProgressContainer}>
              <View style={styles.detailsProgressBackground}>
                <View style={[styles.detailsProgressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% Complete</Text>
            </View>
          )}
          
          {isUnlocked && selectedBadge.dateEarned && (
            <Text style={styles.earnedDate}>
              Earned on: {new Date(selectedBadge.dateEarned).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading badges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8e2de2', '#4a00e0']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Achievement Badges</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.values(earnedBadges).filter(value => value === true).length}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{badges.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={badges}
        keyExtractor={item => item.id}
        numColumns={3}
        renderItem={renderBadgeItem}
        contentContainerStyle={styles.grid}
      />

      {selectedBadge && renderBadgeDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 16,
  },
  grid: {
    padding: 15,
  },
  badgeItem: {
    alignItems: 'center',
    margin: 8,
    width: '30%',
  },
  badgeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth:2,
    borderColor:"green"
  },
  badgeImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  lockedBadge: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
    borderColor:'black'
  },
  unlockedBadge: {
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  unlockedText: {
    color: '#333',
  },
  lockedText: {
    color: '#757575',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a00e0',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    minHeight: '50%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#757575',
  },
  detailsContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  detailsBadgeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailsBadgeImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  detailsDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  detailsProgressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  detailsProgressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  detailsProgressBar: {
    height: '100%',
    backgroundColor: '#4a00e0',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },
  earnedDate: {
    marginTop: 10,
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
});

export default BadgeScreen;