import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions
} from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "react-native-image-picker"; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const profileImageAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        
        // Start animations when data is loaded
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(profileImageAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Signed Out", "You have been successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account", 
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(auth.currentUser);
              Alert.alert("Account Deleted", "Your account has been permanently deleted.");
            } catch (error) {
              console.error("Error deleting account:", error);
            }
          },
        },
      ]
    );
  };

  const handleChangeProfilePic = async () => {
    const options = { mediaType: "photo", quality: 1 };
    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      const imageUrl = response.assets[0].uri;
      const user = auth.currentUser;
      await updateDoc(doc(db, "users", user.uid), { profilePic: imageUrl });
      setUserData((prev) => ({ ...prev, profilePic: imageUrl }));
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.profileHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity 
          onPress={handleChangeProfilePic}
          style={styles.profileImageContainer}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: profileImageAnim }] }}>
            <Image
              source={{ uri: userData?.profilePic || "https://plus.unsplash.com/premium_photo-1739580360043-f2c498c1d861?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
              style={styles.profileImage}
            />
            <View style={styles.cameraIconContainer}>
              <Icon name="camera" size={18} color="#FFFFFF" />
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.username}>{userData?.username || "Username"}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </Animated.View>

      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.statCard}>
          <Icon name="fire" size={24} color="#FF7043" style={styles.statIcon} />
          <Text style={styles.statValue}>{userData?.streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="alert-circle" size={24} color="#F44336" style={styles.statIcon} />
          <Text style={styles.statValue}>{userData?.relapseCount || 0}</Text>
          <Text style={styles.statLabel}>Relapses</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="trophy" size={24} color="#FFD700" style={styles.statIcon} />
          <Text style={styles.statValue}>{userData?.badges?.length || 0}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Icon name="medal" size={22} color="#6C63FF" />
            <Text style={styles.detailTitle}>Achievements</Text>
          </View>
          <View style={styles.badgeContainer}>
            {userData?.badges && userData.badges.length > 0 ? (
              userData.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noBadgesText}>Complete challenges to earn badges</Text>
            )}
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Icon name="account-group" size={22} color="#6C63FF" />
            <Text style={styles.detailTitle}>Community Phase</Text>
          </View>
          <View style={styles.phaseContainer}>
            <Text style={styles.phaseText}>{userData?.currentPhase || "Not Started"}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    marginTop:30
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#6C63FF',
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    width: (width - 60) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: '#6C63FF',
    fontWeight: '500',
    fontSize: 14,
  },
  noBadgesText: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  phaseContainer: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  phaseText: {
    color: '#6C63FF',
    fontWeight: '600',
    fontSize: 16,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  signOutButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  }
});

export default ProfileScreen;