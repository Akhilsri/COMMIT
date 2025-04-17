import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {collection, getDocs, addDoc} from 'firebase/firestore';
import {db} from '../firebaseConfig';

const CommunityScreen = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [enteredKey, setEnteredKey] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomKey, setNewRoomKey] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'chatRooms'));
        setChatRooms(
          querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to load chat rooms.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChatRooms();
  }, []);

  const enterChatRoom = () => {
    if (selectedRoom && enteredKey === selectedRoom.key) {
      navigation.navigate('ChatRoom', {roomId: selectedRoom.id});
      setEnteredKey('');
    } else {
      Alert.alert('Invalid Key', 'The key you entered is incorrect.');
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !newRoomKey.trim()) {
      Alert.alert('Missing fields', 'Name and key are required.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'chatRooms'), {
        name: newRoomName,
        description: newRoomDesc,
        key: newRoomKey,
        bannedUsers: [],
      });
      setModalVisible(false);
      setNewRoomName('');
      setNewRoomDesc('');
      setNewRoomKey('');
      setChatRooms(prev => [
        ...prev,
        {
          id: docRef.id,
          name: newRoomName,
          description: newRoomDesc,
          key: newRoomKey,
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Could not create room.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Chat Rooms</Text>
        <Text style={styles.subTitle}>Select a room to join</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.createButtonText}>+ Create Room</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.roomsContainer}>
            {chatRooms.map(room => (
              <TouchableOpacity
                key={room.id}
                onPress={() => setSelectedRoom(room)}
                style={[
                  styles.roomItem,
                  selectedRoom?.id === room.id && styles.selectedRoom,
                ]}>
                <Text
                  style={[
                    styles.roomTitle,
                    selectedRoom?.id === room.id && styles.selectedRoomText,
                  ]}>
                  {room.name || room.id}
                </Text>
                {room.description && (
                  <Text
                    style={[
                      styles.roomDescription,
                      selectedRoom?.id === room.id && styles.selectedRoomText,
                    ]}>
                    {room.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {selectedRoom && (
        <View style={styles.keyInputContainer}>
          <Text style={styles.selectedRoomPrompt}>
            Enter key for "{selectedRoom.name || selectedRoom.id}"
          </Text>
          <TextInput
            placeholder="Room Key"
            placeholderTextColor="#9ca3af"
            value={enteredKey}
            onChangeText={setEnteredKey}
            style={styles.keyInput}
            secureTextEntry
          />
          <TouchableOpacity
            onPress={enterChatRoom}
            style={styles.enterButton}
            disabled={!enteredKey.trim()}>
            <Text style={styles.enterButtonText}>Enter Room</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal for creating room */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Chat Room</Text>
            <TextInput
              placeholder="Room Name"
              style={styles.modalInput}
              value={newRoomName}
              onChangeText={setNewRoomName}
            />
            <TextInput
              placeholder="Description (optional)"
              style={styles.modalInput}
              value={newRoomDesc}
              onChangeText={setNewRoomDesc}
            />
            <TextInput
              placeholder="Room Key"
              style={styles.modalInput}
              value={newRoomKey}
              onChangeText={setNewRoomKey}
              secureTextEntry
            />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity onPress={createRoom} style={styles.modalButton}>
                <Text style={{color: 'white'}}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, {backgroundColor: 'gray'}]}>
                <Text style={{color: 'white'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb', marginTop: 30},
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  headerTitle: {fontSize: 24, fontWeight: 'bold', color: '#111'},
  subTitle: {color: '#666', marginTop: 4},
  createButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 6,
  },
  createButtonText: {color: 'white', fontWeight: 'bold'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {color: '#999', marginTop: 10},
  scrollView: {flex: 1},
  roomsContainer: {padding: 16},
  roomItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedRoom: {backgroundColor: '#6366f1'},
  roomTitle: {fontSize: 18, fontWeight: '600', color: '#111'},
  roomDescription: {fontSize: 14, color: '#666', marginTop: 4},
  selectedRoomText: {color: 'white'},
  keyInputContainer: {padding: 16, backgroundColor: '#fff'},
  selectedRoomPrompt: {fontSize: 16, fontWeight: '500', marginBottom: 8},
  keyInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  enterButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enterButtonText: {color: 'white', fontWeight: 'bold'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 12},
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
});

export default CommunityScreen;
