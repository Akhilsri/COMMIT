import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert, StyleSheet, ScrollView, Text } from "react-native";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CreateBlogScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(""); // Category for the blog
  const [imageUrl, setImageUrl] = useState(""); // Image URL for the blog's cover
  const [tags, setTags] = useState(""); // Tags for the blog
  const [userId, setUserId] = useState(null);
  const [authorName, setAuthorName] = useState("Anonymous"); // Default value

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserName(user.uid);
      } else {
        setUserId(null);
        setAuthorName("Anonymous");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const fetchUserName = async (uid) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming each userId is unique, so only one document should be returned
        const userData = querySnapshot.docs[0].data();
        setAuthorName(userData.fullName || "Anonymous"); // Use fullName from user collection
      } else {
        console.log("No user found with this UID:", uid);
        setAuthorName("Anonymous");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setAuthorName("Anonymous");
    }
  };


  const handleUpload = async () => {
    if (!title || !content || !category || !imageUrl) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "Not authenticated. Please sign in.");
      return;
    }

    // Convert tags string to an array (you can separate by commas or spaces)
    const tagList = tags.split(",").map(tag => tag.trim());

    try {
      await addDoc(collection(db, "blogs"), {
        title,
        content,
        category,
        imageUrl,
        tags: tagList,
        authorId: userId,
        authorName: authorName,
        authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg", // Replace with actual user avatar if implemented
        createdAt: Timestamp.now(),
        likes: 0,
        comments: [],
        views: 0,
        featured: false, // Optional: set true if you want to mark it as a featured blog
      });
      Alert.alert("Success", "Blog uploaded successfully!");
      setTitle("");
      setContent("");
      setCategory("");
      setImageUrl("");
      setTags("");
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
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Technology, Lifestyle)"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="Tags (comma-separated)"
        value={tags}
        onChangeText={setTags}
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
    marginTop: 30,
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
