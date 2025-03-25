import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet,StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {wp,hp} from '../helpers/common'
import BackButton from "../../assets/icons/BackButton";

const OnboardingScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#ff914d'} />
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
    paddingHorizontal: 10,
  },
  image: {
    width: wp(90),
    height: hp(40),
    marginBottom: 20,
  },
  title: {
    fontSize: hp(3.7),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: hp(2),
    color: "white",
    textAlign: "left",
    marginVertical: 10,
    paddingHorizontal: 15,
    fontFamily:'Poppins-Regular'
  },
  button: {
    flex:1,
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 20,
    alignItems:'center',
    maxHeight:hp(9),
    marginBottom:hp(5)
  },
  buttonText: {
    color: "#ff914d",
    fontSize: 18,
    fontWeight: "bold",
  }
});

export default OnboardingScreen;
