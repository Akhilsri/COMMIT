import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, ScrollView } from "react-native";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const CreateBlogScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleUpload = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Title and content cannot be empty!");
      return;
    }

    try {
      await addDoc(collection(db, "blogs"), {
        title,
        content,
        author: "Anonymous", // Replace with actual username if implemented
        createdAt: Timestamp.now(),
        likes: 0,
        comments: [],
      });
      Alert.alert("Success", "Blog uploaded successfully!");
      setTitle("");
      setContent("");
      navigation.goBack();
    } catch (error) {
      console.error("Error uploading blog:", error);
      Alert.alert("Error", "Failed to upload blog!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Blog Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your blog here..."
        multiline
        numberOfLines={5}
        value={content}
        onChangeText={setContent}
      />
      <Button title="Upload Blog" onPress={handleUpload} color="#6200ea" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
});

export default CreateBlogScreen;
