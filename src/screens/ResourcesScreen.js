import { View, Text } from 'react-native'
import React from 'react'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import { NavigationContainer } from '@react-navigation/native'
import BooksScreen from './BooksScreen'
import BlogsScreen from './BlogsScreen'
import ChallengeScreen from './ChallengeScreen'

const Tab = createMaterialTopTabNavigator()

const ResourcesScreen = () => {
  return (
    
      <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:'blue',
        tabBarInactiveTintColor:'gray',
        tabBarStyle:{marginTop:32}
      }}
      >
        <Tab.Screen name="Books"  component={BooksScreen} />
        <Tab.Screen name="Challenges"  component={ChallengeScreen} />
        <Tab.Screen name="Blogs"  component={BlogsScreen} />
      </Tab.Navigator>
      
   
  )
}

export default ResourcesScreen