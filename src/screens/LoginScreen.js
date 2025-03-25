import React, {useState} from 'react';
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
import Svg, {Path} from 'react-native-svg';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebaseConfig';
import {useNavigation} from '@react-navigation/native';
import BackButton from '../../assets/icons/BackButton';

const LoginScreen = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [clicked, setClicked] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      //   Alert.alert("Success", "Logged in successfully!");
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Orange Header */}

      <TouchableOpacity
        onPress={() => navigation.navigate('SignUpScreen')}
        style={{position: 'absolute', left: 10, top: 10, zIndex: 2}}>
        <Image
          source={require('../../assets/images/back.png')}
          style={{width: 30, height: 30}}
        />
      </TouchableOpacity>

      <Image
        source={require('../../assets/images/1.png')}
        style={{width: '100%', height: 200}}
      />

      {/* Input Fields */}
      <View style={styles.form}>
        <View style={styles.input}>
          <Icon name="email" color="gray" size={25} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
          />
        </View>

        <View style={styles.input}>
          <Icon name="form-textbox-password" color="gray" size={25} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '92%',
            }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={clicked == false ? true : false}
            />
            <TouchableOpacity onPress={() => setClicked(!clicked)}>
              {clicked == false ? (
                <Icon name="eye-off" color="gray" size={25} />
              ) : (
                <Icon name="eye" color="gray" size={25} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() =>
              setPasswordVisible(!passwordVisible)
            }></TouchableOpacity>
        </View>

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

        {/* Register Link */}
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
  container: {flex: 1, backgroundColor: '#f7dec1'},
  header: {
    backgroundColor: '#F47C26',
    paddingHorizontal: 20,
    paddingVertical: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  backButton: {position: 'absolute', left: 20, top: 30, padding: 10},
  heading: {fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 40},
  form: {padding: 20},
  label: {fontSize: 14, fontWeight: 'bold', color: 'black', marginTop: 15},
  input: {
    borderWidth: 2,
    borderColor: '#F47C26',
    borderRadius: 20,
    padding: 12,
    marginTop: 5,
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: {position: 'absolute', right: 15},
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
  loginText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  registerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  registerLink: {color: 'green'},
});

export default LoginScreen;
