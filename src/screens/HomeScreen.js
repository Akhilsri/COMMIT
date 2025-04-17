import React, {useEffect, useState, useCallback} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import {Calendar} from 'react-native-calendars';
import {useUser} from '../context/UserContext';
import * as Progress from 'react-native-progress';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import {db} from '../firebaseConfig';
import {getAuth} from 'firebase/auth';
import {getFirestore, setDoc, updateDoc, arrayUnion} from 'firebase/firestore';
import PornWatchBarChart from '../components/BarGraph';
import MasturbationBarChart from '../components/MasturbationChart';
import MotivationCard from '../components/MotivationCard';
import AIInsights from '../components/AIInsights';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const {userData2} = useUser();
  const [userData, setUserData] = useState({});
  const [logsData, setLogsData] = useState([]);
  const [hoursWatched, setHoursWatched] = useState('');
  const [masturbated, setMasturbated] = useState(null);
  const [watchTime, setWatchTime] = useState('');
  const [mood, setMood] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  const userId = user ? user.uid : null;

  // Fetch user data and logs from Firebase
  const fetchUserDataWithLogs = useCallback(async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('User data not found!');
        return;
      }

      const userData3 = userSnap.data();

      // Fetch logs
      const logsRef = collection(db, 'users', userId, 'logs');
      const logsSnap = await getDocs(logsRef);

      // Map logs, ensuring at least an empty array is set
      const logsData3 =
        logsSnap.docs.length > 0
          ? logsSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
          : [];

      // Update states
      setUserData(userData3);
      setLogsData(logsData3);
    } catch (error) {
      console.error('Error fetching user data with logs:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    // Set up real-time listener for user data
    const userUnsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });
    
    // Set up real-time listener for logs
    const logsUnsubscribe = onSnapshot(
      collection(db, 'users', userId, 'logs'),
      (snapshot) => {
        const logsData3 = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogsData(logsData3);
      }
    );
    
    // Clean up listeners on unmount
    return () => {
      userUnsubscribe();
      logsUnsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    fetchUserDataWithLogs();
  }, [fetchUserDataWithLogs]);

  useEffect(() => {
    if (!userId || !userData?.streak || !userData?.phase) return;
  
    const today = new Date().toLocaleDateString('en-CA');
  
    // If lastUpdatedDate is not set, use today's date
    if (!userData.lastUpdatedDate) {
      updateDoc(doc(db, 'users', userId), {
        lastUpdatedDate: today
      });
      return;
    }

    const updateBadgeStatus = async (userId, daysClean) => {
      const userRef = firestore().collection('users').doc(userId);
      const doc = await userRef.get();
      const currentAchievements = doc.data().achievements || {};
    
      if (daysClean >= 7 && !currentAchievements['badge_7day']) {
        await userRef.update({
          [`achievements.badge_7day`]: true
        });
        // Optionally show a modal/notification: 🎉 You earned a badge!
      }
    };
    
  
    // If a new day has started, update the streak
    if (userData.lastUpdatedDate !== today) {
      updateDoc(doc(db, 'users', userId), {
        streak: userData.streak + 1, // Increase streak by 1
        lastUpdatedDate: today       // Update last updated date
      })
      .then(() => console.log('Streak updated successfully'))
      .catch(error => console.error('Error updating streak:', error));
    }
  }, [userId, userData?.streak, userData?.lastUpdatedDate]);
  

  const progressValue =
    userData?.streak && userData?.reductionDays
      ? Math.min(userData.streak / userData.reductionDays, 1)
      : 0;

  const watchTimeOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const openModal = day => {
    const today = new Date().toLocaleDateString('en-CA');

    if (day.dateString !== today) {
      Alert.alert('Restricted', 'You can only log data for today.');
      return;
    }

    setSelectedDate(day.dateString);
    setModalVisible(true);
    setHoursWatched('');
    setMasturbated(null);
    setWatchTime('');
    setMood('');
  };

  const saveData = async () => {
    if (!hoursWatched || !masturbated || !watchTime || !mood) {
      Alert.alert('Please fill all fields !');
      return;
    }
    setLoading(true);
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error('User not authenticated');
        return;
      }
  
      const db = getFirestore();
      const logDocRef = doc(db, 'users', user.uid, 'logs', selectedDate);
  
      const newLog = {
        date: selectedDate,
        hoursWatched: Number(hoursWatched),
        masturbated: masturbated,
        mood: mood,
        timestamp: new Date(),
        watchTime: watchTime,
      };
  
      // Check if document exists
      const docSnap = await getDoc(logDocRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(logDocRef, {
          logs: arrayUnion(newLog)
        });
      } else {
        // Create new document
        await setDoc(logDocRef, {
          logs: [newLog]
        });
      }
      
      setModalVisible(false);
      
      // No need to manually refetch - the listener will update the UI
      
    } catch (error) {
      console.error('Error saving log:', error);
      Alert.alert('Error', 'Failed to save your log. Please try again.');
    }
    setLoading(false);
  };

  // Marked dates based on logsData length
  const getDotsForDate = logCount =>
    Array.from({length: logCount}, (_, index) => ({
      key: `dot${index + 1}`,
      color: '#6c5ce7',
    }));

    const getMarkedDates = React.useMemo(() => {
      const result = {};
      
      // First, add all logged days
      logsData.forEach(log => {
        if (!log.logs || log.logs.length === 0) return;
        
        const logDate = log.id;
        const logCount = log.logs.length;
        
        result[logDate] = {
          selected: true,
          selectedColor: '#ff7675',
          dots: getDotsForDate(logCount),
        };
      });
      
      // Check for missing days in the phase
      if (userData?.phase === 'reduction' || userData?.phase === 'committing') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Explicitly parse dates using Date constructor
        const startDate = userData?.startDate 
          ? new Date(userData.startDate) 
          : null;
        const endDate = userData?.endDate 
          ? new Date(userData.endDate) 
          : null;
        
        // Only proceed if both dates are valid
        if (startDate && endDate) {
          // Set to beginning of day for accurate comparisons
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          
          // Determine the actual end date (minimum of endDate and today)
          const loopEndDate = endDate < today ? endDate : today;
          
          // Create a copy of startDate to avoid modifying the original
          let currentDate = new Date(startDate.getTime());
          
          // Adjust the start of the loop to be exactly the startDate
          while (currentDate <= loopEndDate) {
            // Format date as YYYY-MM-DD to match stored date format
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Only mark if the date doesn't already have a log entry
            // AND the date matches exactly or is after the startDate
            if (!result[dateStr] && dateStr >= userData.startDate) {
              result[dateStr] = {
                selected: true,
                selectedColor: '#2ecc71', // Green color for missing log days
              };
            }
            
            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }
    
      return result;
    }, [logsData, userData?.phase, userData?.startDate, userData?.endDate]);

    const markedDates = getMarkedDates;
  

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      style={styles.scrollView}
    >
      <SafeAreaProvider>
        <LinearGradient
          colors={['#a29bfe', '#6c5ce7']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerGradient}
        >
        
          <Text style={styles.phaseTitle}>
            {userData2.phase === 'reduction'
              ? 'Reduction Phase'
              : 'Committing Phase'}
          </Text>

          <TouchableOpacity onPress={()=>navigation.navigate("MeditationScreen")} activeOpacity={0.7}>
      <View
        style={{
          backgroundColor: 'white',
          paddingVertical: 10,
          paddingHorizontal: 25,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          // Shadow for iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          // Elevation for Android
          elevation: 5,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'red',
          }}
        >
          ⚡SOS
        </Text>
      </View>
    </TouchableOpacity>
          
        </LinearGradient>

        <View style={styles.container}>
          {/* Add AI Insights component near the top */}
          
          
          <MotivationCard userData={userData} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <View style={styles.progressContainer}>
              <Progress.Circle
                size={100}
                progress={progressValue}
                showsText={true}
                formatText={() => `${userData?.streak || 0}`}
                thickness={8}
                color="#6c5ce7"
                unfilledColor="#e0e0e0"
                borderWidth={0}
                textStyle={styles.progressText}
              />
              <Text style={styles.progressLabel}>{`${userData?.streak || 0}/${userData?.reductionDays || 0} Days`}</Text>
              <Text style={styles.progressSubtitle}>Keep Going Strong!</Text>
            </View>
          </View>

          <View style={styles.calendarCard}>
            <Text style={styles.cardTitle}>Track Your Journey</Text>
            <Calendar
              onDayPress={openModal}
              markedDates={markedDates}
              markingType="multi-dot"
              theme={calendarTheme}
              // Make arrows larger and more visible
              renderArrow={(direction) => (
                <Icon 
                  name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
                  size={24} 
                  color="#6c5ce7" 
                />
              )}
              // Customize month format if needed
              monthFormat={'MMMM yyyy'}
            />
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#ff7675'}]} />
                <Text style={styles.legendText}>Logged Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#6c5ce7'}]} />
                <Text style={styles.legendText}>Multiple Entries</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#2ecc71'}]} />
                <Text style={styles.legendText}>Clean Day</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>Usage Statistics</Text>
            <PornWatchBarChart />
            <MasturbationBarChart />
            
          </View>
          <AIInsights userData={userData} logsData={logsData} />

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Log Entry for {selectedDate}
                  </Text>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="#6c5ce7" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hours Watched:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Enter hours"
                    value={hoursWatched}
                    onChangeText={setHoursWatched}
                    placeholderTextColor="#a0a0a0"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Masturbated?</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        masturbated === 'Yes' && styles.selectedButton,
                      ]}
                      onPress={() => setMasturbated('Yes')}>
                      <Text style={[
                        styles.choiceButtonText,
                        masturbated === 'Yes' && styles.selectedButtonText
                      ]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        masturbated === 'No' && styles.selectedButton,
                      ]}
                      onPress={() => setMasturbated('No')}>
                      <Text style={[
                        styles.choiceButtonText,
                        masturbated === 'No' && styles.selectedButtonText
                      ]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Watch Time:</Text>
                  <View style={styles.timeButtonContainer}>
                    {watchTimeOptions.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.timeButton,
                          watchTime === option && styles.selectedButton,
                        ]}
                        onPress={() => setWatchTime(option)}>
                        <Text style={[
                          styles.timeButtonText,
                          watchTime === option && styles.selectedButtonText
                        ]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mood:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="How are you feeling today?"
                    value={mood}
                    onChangeText={setMood}
                    placeholderTextColor="#a0a0a0"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={saveData}
                  activeOpacity={0.8}
                >
                  {!loading ? (
                    <Text style={styles.saveButtonText}>Save Entry</Text>
                  ) : (
                    <View style={styles.savingContainer}>
                      <Text style={styles.saveButtonText}>Saving</Text>
                      <Progress.Circle size={20} indeterminate color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaProvider>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f8f9fa',
    marginTop:30
  },
  container: {
    flex: 1, 
    padding: 20,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    marginBottom: 20,
  },
  phaseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  progressText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  progressLabel: {
    marginTop: 12,
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
  },
  progressSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f5f6fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  inputGroup: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
  },
  choiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  selectedButtonText: {
    color: 'white',
  },
  timeButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});



const calendarTheme = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#555',
  selectedDayBackgroundColor: '#6c5ce7',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#fd79a8',
  dayTextColor: '#444',
  textDisabledColor: '#d9e1e8',
  dotColor: '#6c5ce7',
  selectedDotColor: '#ffffff',
  arrowColor: '#6c5ce7',
  monthTextColor: '#333',
  textDayFontFamily: 'System',
  textMonthFontFamily: 'System',
  textDayHeaderFontFamily: 'System',
  textDayFontWeight: '400',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '600',
  textDayFontSize: 16,
  textMonthFontSize: 18,  // Increased size for month name
  textDayHeaderFontSize: 14,
  
  // Modern header styling
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginBottom: 10,
      backgroundColor: '#f8f8f8',
      borderRadius: 10,
    },
    monthText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    arrow: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: '#e0e0e0',
      margin: 0,
    },
    week: {
      marginTop: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    SOS:{
      fontWeight:'bold'
    },
    box:{
      backgroundColor:'white'
    }
  }
};

export default HomeScreen