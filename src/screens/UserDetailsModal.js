import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from "../context/UserContext";

const UserDetailsModal = ({ navigation, route }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [activeField, setActiveField] = useState(null);
  const { setUserData } = useUser();

  // Destructure refresh callback from route params
  const { refreshUserData } = route.params || {};

  // Access other parameters passed to modal
  const { startDate, endDate, phase, reductionDays, streak, xp, profilePic, achievements } = route.params || {};

  useEffect(() => {
    const checkUserDetails = async () => {
      const userDetailsCompleted = await AsyncStorage.getItem('userDetailsCompleted');
      if (!userDetailsCompleted) {
        setIsModalVisible(true); // Show modal if details are not completed
      } else {
        // If details already completed, navigate to main app
        navigation.navigate('BottomTabNavigator');
      }
    };
    checkUserDetails();
  }, []);

  const handleSubmit = async () => {
    if (fullName && country && dob && gender) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          showToast("User not authenticated!");
          return;
        }

        const userDetails = {
          fullName,
          country,
          dob,
          gender,
          startDate,
          endDate,
          phase,
          reductionDays,
          streak,
          xp,
          profilePic,
          achievements,
          createdAt: new Date().toISOString()
        };

        // Save user details to Firestore
        await setDoc(doc(db, "users", user.uid), userDetails);

        // Save completion flag locally
        await AsyncStorage.setItem('userDetailsCompleted', 'true');

        // Update user context with new details
        setUserData(userDetails);

        // Trigger refresh in RootStack to update navigation
        if (refreshUserData) refreshUserData();

        setIsModalVisible(false);

      } catch (error) {
        console.error("Error saving user details:", error);
        showToast("Failed to save details. Please try again.");
      }
    } else {
      showToast('Please fill in all fields.');
    }
  };

  const showToast = (message) => {
    alert(message);
  };

  const renderInputField = (label, value, setValue, icon, placeholder, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color="#FF8C00" />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            activeField === label && styles.activeInput
          ]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={setValue}
          onFocus={() => setActiveField(label)}
          onBlur={() => setActiveField(null)}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={false}>
      <StatusBar backgroundColor="#FF8C00" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon name="person-circle-outline" size={60} color="#FF8C00" />
              </View>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Help us personalize your experience
              </Text>
            </View>

            <View style={styles.formContainer}>
              {renderInputField('Full Name', fullName, setFullName, 'person-outline', 'Enter your full name')}
              {renderInputField('Country', country, setCountry, 'earth-outline', 'Enter your country')}
              {renderInputField('Date of Birth', dob, setDob, 'calendar-outline', 'YYYY-MM-DD')}
              {renderInputField('Gender', gender, setGender, 'male-female-outline', 'Enter your gender')}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Save & Continue</Text>
              <Icon name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.privacyText}>
              Your information is protected by our privacy policy
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15,
  },
  headerIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF4EA',
    borderRadius: 12,
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  activeInput: {
    borderColor: '#FF8C00',
    backgroundColor: '#FFF',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
  },
  privacyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginBottom: 20,
  }
});

export default UserDetailsModal;
