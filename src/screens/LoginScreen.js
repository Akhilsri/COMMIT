import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUpScreen')}
        style={styles.backButton}>
        <Image
          source={require('../../assets/images/back.png')}
          style={styles.backImage}
        />
      </TouchableOpacity>

      {/* Header Image */}
      <Image
        source={require('../../assets/images/1.png')}
        style={styles.headerImage}
      />

      {/* Form */}
      <View style={styles.form}>
        {/* Email */}
        <View style={styles.input}>
          <Icon name="email" color="gray" size={25} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.textInput}
          />
        </View>

        {/* Password */}
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
            <Icon
              name={passwordVisible ? 'eye' : 'eye-off'}
              color="gray"
              size={25}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={styles.loginText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7dec1',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 2,
  },
  backImage: {
    width: 30,
    height: 30,
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
  forgotPassword: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
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
});

export default LoginScreen;
