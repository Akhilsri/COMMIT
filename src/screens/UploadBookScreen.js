import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { uploadBook } from "../firebaseUtils";

const UploadBookScreen = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Function to pick a PDF file
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf], // Allow only PDFs
      });

      if (result) {
        setFile(result[0]); // Store the selected file
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert("Cancelled", "No file selected.");
      } else {
        Alert.alert("Error", err.message);
      }
    }
  };

  // Function to handle book upload
  const handleUpload = async () => {
    if (file && title && author && category) {
      const success = await uploadBook(file.uri, title, author, description, category);
      if (success) Alert.alert("Success", "Book uploaded successfully!");
    } else {
      Alert.alert("Error", "Please fill all fields and select a file!");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Title:</Text>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Author:</Text>
      <TextInput value={author} onChangeText={setAuthor} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Description:</Text>
      <TextInput value={description} onChangeText={setDescription} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Category:</Text>
      <TextInput value={category} onChangeText={setCategory} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Button title="Pick a PDF" onPress={pickDocument} />
      <Button title="Upload Book" onPress={handleUpload} />
    </View>
  );
};

export default UploadBookScreen;
