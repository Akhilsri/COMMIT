import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const ChatRoom = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isUserModerator, setIsUserModerator] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [longPressedMessage, setLongPressedMessage] = useState(null);

  useEffect(() => {
    const checkModeratorStatus = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().isModerator) {
        setIsUserModerator(true);
      }

      const roomRef = doc(db, "chatRooms", roomId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists() && roomSnap.data().bannedUsers) {
        setBannedUsers(roomSnap.data().bannedUsers);
      }
    };

    checkModeratorStatus();
  }, [roomId]);

  useEffect(() => {
    const q = query(collection(db, `chatRooms/${roomId}/messages`), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (bannedUsers.includes(auth.currentUser.uid)) {
      Alert.alert("You have been banned from this chat room");
    }
  }, [bannedUsers]);

  const sendMessage = async () => {
    if (messageText.trim() === "") return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userName = userSnap.data().fullName || "Anonymous";

      if (bannedUsers.includes(auth.currentUser.uid)) {
        Alert.alert("You cannot send messages because you are banned");
        return;
      }

      await addDoc(collection(db, `chatRooms/${roomId}/messages`), {
        senderId: auth.currentUser.uid,
        senderName: userName,
        text: messageText,
        timestamp: new Date(),
        isPinned: false,
      });

      setMessageText("");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!isUserModerator) return;

    try {
      await deleteDoc(doc(db, `chatRooms/${roomId}/messages`, messageId));
      Alert.alert("Message deleted");
    } catch (error) {
      Alert.alert("Error deleting message", error.message);
    }
  };

  const banUser = async (userId) => {
    if (!isUserModerator) return;

    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, {
        bannedUsers: [...bannedUsers, userId],
      });
      Alert.alert("User banned successfully");
    } catch (error) {
      Alert.alert("Error banning user", error.message);
    }
  };

  const togglePinMessage = async (messageId, currentPinState) => {
    if (!isUserModerator) return;

    try {
      const messageRef = doc(db, `chatRooms/${roomId}/messages`, messageId);
      await updateDoc(messageRef, {
        isPinned: !currentPinState,
      });
    } catch (error) {
      Alert.alert("Error pinning message", error.message);
    }
  };

  const handleLongPress = (message) => {
    if (!isUserModerator) return;

    setLongPressedMessage(message);

    Alert.alert(
      "Moderation Actions",
      "Choose an action to perform",
      [
        {
          text: "Delete Message",
          onPress: () => deleteMessage(message.id),
        },
        {
          text: "Ban User",
          onPress: () => banUser(message.senderId),
        },
        {
          text: message.isPinned ? "Unpin Message" : "Pin Message",
          onPress: () => togglePinMessage(message.id, message.isPinned),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === auth.currentUser.uid;
    const safeText = typeof item.text === "string" ? item.text : "Invalid message";

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
          item.isPinned && styles.pinnedMessage,
        ]}
      >
        {item.isPinned && (
          <View style={styles.pinIndicator}>
            <Text style={styles.pinIcon}>📌</Text>
          </View>
        )}
        <Text style={styles.senderName}>{item.senderName || "Unknown"}</Text>
        <Text>{safeText}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp?.toDate?.() &&
            new Date(item.timestamp.toDate()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </Text>
      </TouchableOpacity>
    );
  };

  const pinnedMessages = messages.filter((msg) => msg.isPinned);

  return (
    <View style={styles.container}>
      {isUserModerator && (
        <View style={styles.moderatorBadge}>
          <Text style={styles.moderatorText}>Moderator Mode</Text>
        </View>
      )}

      {pinnedMessages.length > 0 && (
        <View style={styles.pinnedSection}>
          <Text style={styles.pinnedHeader}>Pinned Messages</Text>
          {pinnedMessages.map((message) => (
            <View key={message.id} style={styles.pinnedMessageCompact}>
              <Text style={styles.pinIcon}>📌</Text>
              <Text numberOfLines={1} style={styles.pinnedMessageText}>
                {typeof message.text === "string" ? message.text : "Invalid message"}
              </Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          editable={!bannedUsers.includes(auth.currentUser.uid)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  moderatorBadge: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 10,
  },
  moderatorText: {
    color: "white",
    fontWeight: "bold",
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: "80%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  pinnedMessage: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  pinIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  pinIcon: {
    fontSize: 14,
  },
  pinnedSection: {
    backgroundColor: "#FFF8E1",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  pinnedHeader: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  pinnedMessageCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  pinnedMessageText: {
    marginLeft: 5,
    flex: 1,
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
  },
});

export default ChatRoom;
