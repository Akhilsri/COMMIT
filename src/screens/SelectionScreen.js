import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../../assets/icons/BackButton";
import { wp, hp } from "../helpers/common";
import { useUser } from "../context/UserContext";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";

const SelectionScreen = () => {
  const navigation = useNavigation();
  const [clicked, setClicked] = useState(false);
  const [clicked2, setClicked2] = useState(false);
  const [reductionDays, setReductionDays] = useState(null);
  const {userData2,setUserData } = useUser();

  const getLocalDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust to local timezone
    return now.toISOString().split("T")[0]; // Extract YYYY-MM-DD
  };

  const calculateEndDate = (startDate, reductionDays) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + reductionDays); // Add reductionDays
    return start.toISOString().split("T")[0]; // Return as 'YYYY-MM-DD'
  };
  

 
  
  const handleNext = async () => {
    const startDate = getLocalDate();
    const endDate = calculateEndDate(startDate, reductionDays);
  
    if (clicked2 || (clicked && reductionDays)) {
      const newUserData = {
        phase: clicked ? "reduction" : "commitment", 
        reductionDays: clicked ? reductionDays : null,
        startDate: startDate,
        endDate: endDate,
        streak: 0,
      };
  
      setUserData(newUserData); // Update context for immediate use
  
      try {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser; // Get the logged-in user
        
        if (!user) {
          console.error("No user is logged in.");
          return;
        }
  
        // Create or update document with the same ID as the user's UID
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, newUserData, { merge: true });
  
        console.log("User data saved successfully!");
        navigation.navigate("BottomTabNavigator");
  
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    } else {
      Alert.alert("Please choose an option and duration if selecting Reduction Phase");
    }
  };
  



  const handleClick = () => {
    if (clicked2) setClicked2(false);
    setClicked(!clicked);
    if (!clicked) setReductionDays(null);
  };

  const handleClick2 = () => {
    if (clicked) {
      setClicked(false);
      setReductionDays(null);
    }
    setClicked2(!clicked2);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"#F47C26"} />

      {/* Heading */}
      <Text style={styles.questionText}>Question</Text>
      <Text style={styles.mainHeading}>
        Why <Text style={{ color: "white" }}>are you here?</Text>
      </Text>

      {/* Option 1: Reduction Phase */}
      <TouchableOpacity onPress={handleClick}>
        <View style={styles.optionContainer}>
          <View style={styles.optionNumber}>
            <Text style={styles.optionNumberText}>1</Text>
          </View>
          <View style={[styles.optionTextContainer, { backgroundColor: clicked ? "green" : "white" }]}>
            <Text style={[styles.optionText, { color: clicked ? "white" : "black" }]}>I want to gradually reduce my porn addiction.</Text>
            <View style={styles.phaseBox}>
              <Text style={styles.phaseText}>
                Reduction Phase: Track and understand your habits.
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Reduction Phase Duration Selection */}
      {clicked && (
        <View style={styles.reductionOptions}>
          <Text style={styles.reductionText}>Select Duration:</Text>
          {[7, 15, 21].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.reductionButton,
                reductionDays === days ? styles.reductionButtonSelected : {}
              ]}
              onPress={() => setReductionDays(days)}
            >
              <Text style={[
                styles.reductionButtonText,
                reductionDays === days ? { color: "white" } : {}
              ]}>{days} Days</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Option 2: Commitment Phase */}
      <TouchableOpacity onPress={handleClick2}>
        <View style={styles.optionContainer}>
          <View style={styles.optionNumber}>
            <Text style={styles.optionNumberText}>2</Text>
          </View>
          <View style={[styles.optionTextContainer, { backgroundColor: clicked2 ? "green" : "white" }]}>
            <Text style={[styles.optionText, { color: clicked2 ? "white" : "black" }]}>I want to completely quit and commit now.</Text>
            <View style={styles.phaseBox}>
              <Text style={styles.phaseText}>
                Commitment Phase: Set clean streak goals means no masturbation.
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 6L15 12L9 18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {/* Footer Quote */}
      <Text style={styles.footerText}>
        ~Swami Vivekananda said that if you save your semen for more than 12 years in a row,
        you can achieve picture memory like him~
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F47C26",
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginTop: hp(9),
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD966",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  optionNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F47C26",
  },
  optionTextContainer: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  phaseBox: {
    backgroundColor: "#C95C1C",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  phaseText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  reductionOptions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    alignItems:'center',
    marginHorizontal:10
  },
  reductionText: {
    fontSize: 13,
    color: "white",
    fontWeight: "bold",
    marginBottom: 5,
  },
  reductionButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "white",
    
  },
  reductionButtonSelected: {
    backgroundColor: "green",
  },
  reductionButtonText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E64A19",
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 40,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});

export default SelectionScreen;