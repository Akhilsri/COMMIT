import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import firestore from "firebase/firestore";
import storage from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

export const fetchBooks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "books"));
    const booksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return booksList;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

export const addBlog = async (title, content, imageUri, userId) => {
  try {
    // Upload image to Firebase Storage
    const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
    const storageRef = storage().ref(`blog_images/${userId}/${filename}`);
    await storageRef.putFile(imageUri);
    const imageUrl = await storageRef.getDownloadURL();

    // Add blog to Firestore
    await firestore().collection("blogs").add({
      title,
      content,
      imageUrl,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      likes: [],
    });

    console.log("Blog added successfully!");
  } catch (error) {
    console.error("Error adding blog:", error);
  }
};

// Function to fetch blogs
export const getBlogs = async () => {
  try {
    const snapshot = await firestore().collection("blogs").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
};

export const fetchBlogs = async () => {
  try {
    console.log("Fetching blogs..."); // Debug log

    const querySnapshot = await getDocs(collection(db, "blogs"));

    if (querySnapshot.empty) {
      console.log("No blogs found in Firestore.");
    }

    const blogsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched blogs:", blogsList); // Debug log

    return blogsList;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
};

const fetchLogs = async () => {
  try {
    const userDocRef = doc(db, 'users', 'USER_ID'); // Replace USER_ID with actual user ID
    const logsCollectionRef = collection(userDocRef, 'logs');
    const snapshot = await getDocs(logsCollectionRef);

    const fetchedData = {};
    snapshot.forEach(doc => {
      const {date, ...logData} = doc.data();
      if (!fetchedData[date]) fetchedData[date] = [];
      fetchedData[date].push(logData);
    });

    setUserData(fetchedData);
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

export const getAIInsights = async () => {
  const auth = getAuth(); // Ensure Firebase Auth is initialized
  const user = auth.currentUser;

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  try {
    const functions = getFunctions();
    const generateInsights = httpsCallable(functions, "generateInsights");

    const userData = {
      streak: 5, // Example streak
      reductionDays: 30,
      goal: "Reduce usage",
    };

    const logsData = [
      {
        date: "2025-03-21",
        watchTime: "10:00 PM",
        hoursWatched: 1,
        mood: "Stressed",
        masturbated: "Yes",
        triggers: "Loneliness",
        notes: "Had a tough day at work.",
      },
      {
        date: "2025-03-22",
        watchTime: "11:30 PM",
        hoursWatched: 2,
        mood: "Bored",
        masturbated: "No",
        triggers: "Scrolling social media",
        notes: "",
      },
    ];

    const response = await generateInsights({ userData, logsData });
    console.log("AI Insights:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching insights:", error.message);
    return null;
  }
};
