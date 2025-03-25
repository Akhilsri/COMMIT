import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from "../../assets/svg/home.svg";
import Community from "../../assets/svg/users.svg";
import Book from "../../assets/svg/book-open.svg";
import User from "../../assets/svg/user.svg";
import { UserProvider } from "../context/UserContext";

import { AuthProvider, AuthContext } from '../context/AuthContext';
import SelectionScreen from '../screens/SelectionScreen';
import OnBoardingScreen from '../screens/OnBoardingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import BooksScreen from '../screens/BooksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookReader from '../screens/BookReader';
import CreateBlogScreen from "../screens/CreateBlogScreen";
import BlogDetailsScreen from '../screens/BlogDetailsScreen';
import { useUser } from "../context/UserContext";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import ChallengesScreen from '../screens/ChallengeScreen';
import ChatRoom from '../screens/ChatRoom';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#D96B4E', },
        tabBarShowLabel: true,
        tabBarActiveTintColor: 'Blue',
        tabBarInactiveTintColor: 'white',
        headerStyle: { marginTop: 10 }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: () => <Icon width={25} height={25} style={{ marginTop: 5 }} />,
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: () => <Community width={25} height={25} style={{ marginTop: 5 }} />,
          
        }}
      />
      <Tab.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{
          tabBarIcon: () => <Book width={25} height={25} style={{ marginTop: 5 }} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <User width={25} height={25} style={{ marginTop: 5 }} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  const { user, loading } = React.useContext(AuthContext);
  const { setUserData } = useUser();
  const [initialScreen, setInitialScreen] = React.useState(null);
  const [isCheckingUserData, setIsCheckingUserData] = React.useState(true);

  

  React.useEffect(() => {
    const checkUserData = async () => {
      try {
        if (user) { // Ensure user exists before proceeding
          const userRef = doc(db, "users", user.uid);
          // console.log(user.uid);
          
          const docSnap = await getDoc(userRef);
          console.log(docSnap.data());
          
          

          if (docSnap.exists() && docSnap.data()) {
            setUserData(docSnap.data());
            setInitialScreen("BottomTabNavigator");
          }
          
        }
      } catch (error) {
        console.error("Error checking userData2:", error);
      } finally {
        setIsCheckingUserData(false); // Corrected from setLoading(false)
      }
    };

    checkUserData();
  }, [user]); // Dependency added to re-run when user changes

  if (loading || isCheckingUserData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator  >
      {user ? (
        <>
          <Stack.Screen
            name="SelectionScreen"
            component={SelectionScreen}
            options={{ headerShown: false }}
          />
            <Stack.Screen
              name="BottomTabNavigator"
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
          <Stack.Screen name="BookReader" component={BookReader} options={{ headerShown: false }} />
          <Stack.Screen name="CreateBlogScreen" component={CreateBlogScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BlogDetails" component={BlogDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SelectionScreen" component={SelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}


export default function Appji() {
  return (
    <AuthProvider>
      <UserProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </UserProvider>
    </AuthProvider>
  );
}
