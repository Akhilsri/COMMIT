import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

const MotivationCard = ({ userData }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMotivation = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await fetch('https://motivationapi-qeom2m6pvq-uc.a.run.app/motivation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          streak: userData.streak,
          name: userData.name || '',
          goal: userData.goal || ''
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Fetch Error:", error);
      setError(true);
      setMessage("Stay strong! Every day is a new opportunity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMotivation();
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.heading}>AI Dost - Personal Motivator</Text>
      </View>
      
      <View style={styles.cardContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Finding inspiration...</Text>
          </View>
        ) : (
          <>
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
              {error && <Text style={styles.errorHint}>Showing fallback message</Text>}
            </View>
            
            <View style={styles.statsContainer}>
              <Text style={styles.streakText}>
                {userData.streak === 1 
                  ? '1 day streak! 🔥' 
                  : `${userData.streak} day streak! 🔥🔥`}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>
                {refreshing ? 'Refreshing...' : 'New Motivation'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 16,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#2980B9',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  cardContent: {
    padding: 10,
    minHeight: 150,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  messageContainer: {
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2980B9',
  },
  refreshButton: {
    backgroundColor: '#2980B9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default MotivationCard;