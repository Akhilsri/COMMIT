import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { wp, hp } from "../helpers/common";
import BackButton from "../../assets/icons/BackButton";

const OnboardingScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ff914d" barStyle="light-content" />

      <Image
        source={require("../../assets/images/buddha.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to Commit</Text>

      <Text style={styles.subtitle}>
        Overcome addiction through structured progress, AI insights, and
        community support.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SignUpScreen")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <BackButton direction="right" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff914d",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(5),
  },
  image: {
    width: wp(90),
    height: hp(40),
    marginBottom: hp(4),
  },
  title: {
    fontSize: hp(3.7),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: hp(2),
  },
  subtitle: {
    fontSize: hp(2),
    color: "white",
    textAlign: "center",
    paddingHorizontal: wp(5),
    fontFamily: "Poppins-Regular",
    marginBottom: hp(5),
  },
  button: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ff914d",
    fontSize: hp(2.2),
    fontWeight: "bold",
    marginRight: 8,
  },
});

export default OnboardingScreen;
