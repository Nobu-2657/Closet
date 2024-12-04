import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import HomeScreen from './after_register/home'; 
import ClosetScreen from './after_register/closet';
import CameraScreen from './after_register/camera';
import Login from './before_register/login';
import Register from './before_register/register';

// 型定義
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Closet: undefined;
  Camera: undefined;
};

type TabNavigatorParamList = {
  ホーム: undefined;
  レジスター: undefined;
  クローゼット: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabNavigatorParamList>();

function TabNavigator() {
  const navigation = useNavigation();

  const handlePlusButtonPress = () => {
    navigation.navigate('Camera' as never);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'ホーム') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'クローゼット') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'レジスター') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            return (
              <TouchableOpacity onPress={handlePlusButtonPress}>
                <Ionicons name={iconName} size={size} color={color} />
              </TouchableOpacity>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarStyle: route.name === 'レジスター' ? { display: 'none' } : undefined,
      })}
    >
      <Tab.Screen options={{headerShown: false}} name="ホーム" component={HomeScreen} />
      <Tab.Screen 
        options={{headerShown: false}} 
        name="レジスター" 
        component={CameraScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handlePlusButtonPress();
          },
        }}
      />
      <Tab.Screen options={{headerShown: false}} name="クローゼット" component={ClosetScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen options={{headerShown: false}} name="Login" component={Login} />
        <Stack.Screen options={{headerShown: false}} name="Register" component={Register} />
        <Stack.Screen options={{headerShown: false}} name="Main" component={TabNavigator} />
        <Stack.Screen options={{headerShown: false}} name="Closet" component={ClosetScreen} />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
  );
}