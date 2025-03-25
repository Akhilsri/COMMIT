import { db, storage } from "./firebaseConfig"; // Import Firebase setup
import { collection, addDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

// Function to upload PDF & store metadata in Firestore
export const uploadBook = async (fileUri, title, author, description, category) => {
  try {
    // Convert file URI to Blob for Firebase upload
    let blob;
    if (Platform.OS === "ios") {
      blob = await (await fetch(fileUri)).blob();
    } else {
      const result = await RNFetchBlob.fs.readFile(fileUri, "base64");
      blob = new Blob([result], { type: "application/pdf" });
    }

    // Create reference in Firebase Storage
    const storageRef = ref(storage, `books/${title}.pdf`);

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Wait for upload to complete
    await uploadTask;

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    await addDoc(collection(db, "books"), {
      title,
      author,
      description,
      downloadURL,
      category,
    });

    console.log("Book uploaded successfully!");
    return true;
  } catch (error) {
    console.error("Error uploading book:", error);
    return false;
  }
};
