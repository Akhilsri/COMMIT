import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  StyleSheet,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const CommunityScreen = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [enteredKey, setEnteredKey] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "chatRooms"));
        setChatRooms(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        Alert.alert("Error", "Failed to load chat rooms. Please try again later.");
        console.error("Error fetching chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChatRooms();
  }, []);

  const enterChatRoom = () => {
    if (selectedRoom && enteredKey === selectedRoom.key) {
      navigation.navigate("ChatRoom", { roomId: selectedRoom.id });
      setEnteredKey("");
    } else {
      Alert.alert("Invalid Key", "The key you entered is incorrect.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Chat Rooms</Text>
        <Text style={styles.subTitle}>Select a room to join the conversation</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading chat rooms...</Text>
        </View>
      ) : chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chat rooms available</Text>
        </View>
      ) : (
        <>
        <Text style={styles.newComers} >New Comers key : 123</Text>
        <ScrollView style={styles.scrollView}>
          <View style={styles.roomsContainer}>
            {chatRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                onPress={() => setSelectedRoom(room)}
                style={[
                  styles.roomItem,
                  selectedRoom?.id === room.id && styles.selectedRoom
                ]}
              >
                <Text style={[
                  styles.roomTitle,
                  selectedRoom?.id === room.id && styles.selectedRoomText
                ]}>
                  {room.name || room.id}
                </Text>
                {room.description && (
                  <Text style={[
                    styles.roomDescription,
                    selectedRoom?.id === room.id && styles.selectedRoomText
                  ]}>
                    {room.description}
                  </Text>
                )}
                {selectedRoom?.id === room.id && (
                  <Text style={styles.selectedLabel}>Selected</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        </>
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
            disabled={!enteredKey.trim()}
          >
            <Text style={styles.enterButtonText}>Enter Room</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedRoom(null);
              setEnteredKey("");
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    marginTop:30
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  roomsContainer: {
    padding: 16,
  },
  roomItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedRoom: {
    backgroundColor: "#6366f1",
    borderWidth: 0,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  roomDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  selectedRoomText: {
    color: "#ffffff",
  },
  selectedLabel: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    color: "#6366f1",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  keyInputContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  selectedRoomPrompt: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 12,
  },
  keyInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },
  enterButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  enterButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
  newComers:{
    marginHorizontal:90,
    fontWeight:'bold',
    marginTop:10,
    color:'green'
  }
});

export default CommunityScreen;