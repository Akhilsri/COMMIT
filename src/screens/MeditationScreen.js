import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MeditationScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showEmergency, setShowEmergency] = useState(false);

  // List of available moods
  const moods = [
    { id: 'calm', name: 'Calm', icon: 'spa', color: '#a5d6a7' },
    { id: 'happy', name: 'Happy', icon: 'sentiment-very-satisfied', color: '#ffcc80' },
    { id: 'focused', name: 'Focused', icon: 'center-focus-strong', color: '#90caf9' },
    { id: 'sleepy', name: 'Sleepy', icon: 'nights-stay', color: '#b39ddb' },
    { id: 'anxious', name: 'Anxious', icon: 'waves', color: '#ef9a9a' },
  ];

  // Emergency contacts for India (specifically women's safety)
  const emergencyContacts = [
    { name: 'Women Helpline (All India)', number: '1091' },
    { name: 'Police', number: '100' },
    { name: 'Emergency Disaster Management', number: '108' },
    { name: 'National Commission for Women', number: '011-26942369' },
    { name: 'Childline', number: '1098' },
    { name: 'Domestic Abuse Helpline', number: '181' },
    { name: 'National Human Rights Commission', number: '011-24651330' },
    { name: 'Anti-Stalking Helpline', number: '1091' },
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  // Render mood selection screen
  const renderMoodSelection = () => {
    return (
      <View style={styles.moodContainer}>
        <Text style={styles.heading}>How are you feeling today?</Text>
        <Text style={styles.subHeading}>Select your mood to find the perfect meditation music</Text>
        
        <TouchableOpacity 
          style={styles.sosButton}
          onPress={() => setShowEmergency(true)}
        >
          <Icon name="emergency" size={24} color="#fff" />
          <Text style={styles.sosButtonText}>EMERGENCY</Text>
        </TouchableOpacity>

        <View style={styles.moodGrid}>
          {moods.map(mood => (
            <TouchableOpacity
              key={mood.id}
              style={[styles.moodCard, { backgroundColor: mood.color }]}
              onPress={() => handleMoodSelect(mood)}
            >
              <Icon name={mood.icon} size={40} color="#fff" />
              <Text style={styles.moodName}>{mood.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render emergency contacts screen
  const renderEmergencyContacts = () => {
    return (
      <ScrollView style={styles.emergencyContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowEmergency(false)}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.emergencyHeading}>Emergency Contacts</Text>
        <Text style={styles.emergencySubHeading}>Immediate help for women in distress</Text>

        {emergencyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
            onPress={() => handleCall(contact.number)}
          >
            <View style={styles.contactInfo}>
              <Icon name="contact-phone" size={24} color="#e53935" />
              <View style={styles.contactText}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
            </View>
            <Icon name="call" size={24} color="#4CAF50" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render selected mood (placeholder for player)
  const renderSelectedMood = () => {
    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedMood(null)}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.musicInfo}>
          <View style={[styles.coverArt, { backgroundColor: selectedMood.color }]}>
            <Icon name={selectedMood.icon} size={60} color="#fff" />
          </View>
          
          <Text style={styles.musicTitle}>You selected: {selectedMood.name}</Text>
          <Text style={styles.musicArtist}>Music player functionality coming soon</Text>
          
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: selectedMood.color }]} 
          >
            <Icon name="play-arrow" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {showEmergency ? renderEmergencyContacts() : 
       selectedMood ? renderSelectedMood() : renderMoodSelection()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  moodContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  subHeading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  moodGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moodName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  playerContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  musicInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverArt: {
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  musicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  musicArtist: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  sosButton: {
    backgroundColor: '#e53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emergencyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  emergencyHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#e53935',
    marginTop: 40,
  },
  emergencySubHeading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default MeditationScreen;