import React, {useState} from 'react';
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
import Svg, {Path} from 'react-native-svg';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebaseConfig';
import {useNavigation} from '@react-navigation/native';
import BackButton from '../../assets/icons/BackButton';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clicked, setClicked] = useState(false);
  const [loading,setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Alert.alert("Success", "Account created!");
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/2.png')}
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

      

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
        <Text style={{color:'white',fontWeight:'bold',fontSize:16}} >{loading ? 'Signing in...' : 'SignUp'}</Text>
        </TouchableOpacity>

        {/* Social Login
        <View style={styles.socialLoginContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or login with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}> Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}> Facebook</Text>
          </TouchableOpacity>
        </View> */}

        {/* Register Link */}
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.registerText}>
            Already have an account?{' '}
            <Text style={styles.registerLink}>Login</Text>
          </Text>
        </TouchableOpacity>
        <View
          style={{
            marginTop: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>By signing in you agree to our</Text>
          <Text style={{color: 'blue'}}> Terms & Conditions</Text>
          <Text>and</Text>
          <Text style={{color: 'blue'}}> Privacy Policy</Text>
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
  header: {
    backgroundColor: '#F47C26',
    paddingHorizontal: 20,
    paddingVertical: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 30,
    padding: 10,
  },
  logoContainer: {
    position: 'absolute',
    right: 20,
    top: 30,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 40,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: '#F47C26',
    borderRadius: 20,
    padding: 12,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
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
  socialLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'black',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: 'black',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6BCE4F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  socialText: {
    color: 'white',
    fontSize: 14,
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

export default SignUpScreen;
