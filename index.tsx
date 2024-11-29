import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './after_register/home'; 
import ClosetScreen from './after_register/closet';
import CameraScreen from './after_register/camera';
import Login from './before_register/login';
import Register from './before_register/register';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'ホーム') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'クローゼット') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } //else if (route.name === 'プロフィール') {
            //iconName = focused ? 'person' : 'person-outline';
          //}

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen options={{headerShown: false}} name="ホーム" component={HomeScreen} />
      <Tab.Screen options={{headerShown: false}} name="クローゼット" component={ClosetScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen options={{headerShown: false}} name="Login" component={Login} />
      <Stack.Screen options={{headerShown: false}} name="Register" component={Register} />
      <Stack.Screen options={{headerShown: false}} name="Main" component={TabNavigator} />
      <Stack.Screen options={{headerShown: false}} name="Closet" component={ClosetScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
    </Stack.Navigator>
  );
};