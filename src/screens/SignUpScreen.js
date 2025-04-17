import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/2.png')}
        style={styles.headerImage}
      />

      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.input}>
          <Icon name="email" color="gray" size={25} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            style={styles.textInput}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Field */}
        <View style={styles.input}>
          <Icon name="form-textbox-password" color="gray" size={25} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!passwordVisible}
            style={[styles.textInput, { flex: 1 }]}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye' : 'eye-off'} color="gray" size={25} />
          </TouchableOpacity>
        </View>

        {/* SignUp Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
          <Text style={styles.loginText}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.registerText}>
            Already have an account? <Text style={styles.registerLink}>Login</Text>
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text>By signing in you agree to our</Text>
          <Text style={styles.linkText}> Terms & Conditions</Text>
          <Text>and</Text>
          <Text style={styles.linkText}> Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7dec1',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  form: {
    padding: 20,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F47C26',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  textInput: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#6BCE4F',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  registerLink: {
    color: 'green',
  },
  termsContainer: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: 'blue',
  },
});

export default SignUpScreen;
