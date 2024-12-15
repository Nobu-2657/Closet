import React, { useEffect } from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import HomeScreen from './after_register/home'; 
import ClosetScreen from './after_register/closet';
import CameraScreen from './after_register/camera';
import Login from './before_register/login';
import Register from './before_register/register';
import OutfitSelection from './after_register/outfitSelectionScreen';
import Feedback from './after_register/feedbackScreen';

// 型定義
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Closet: undefined;
  Camera: undefined;
  OutfitSelection: undefined;
  FeedbackScreen: undefined;
};

type TabNavigatorParamList = {
  ホーム: undefined;
  レジスター: undefined;
  クローゼット: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabNavigatorParamList>();

function TabNavigator() {
  const navigation = useNavigation<NavigationProp>();

  const handlePlusButtonPress = () => {
    navigation.navigate('Camera' as never);
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });  

  const scheduleDailyNotification = async () => {
    try {
      //await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'フィードバックのお時間です！',
          body: '今日着た服についてフィードバックをお願いします。',
          data: { screen: 'FeedbackScreen' },
        },
        trigger: {
        //type: 'calendar',
        hour: 8,
        minute: 38,
        repeats: true,
      } as Notifications.NotificationTriggerInput,
      });
      console.log('Notification scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const getScheduledNotifications = async () => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(notifications);
  };

  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Notification permission denied');
          return;
        }
      }
      //await scheduleDailyNotification();
      //await getScheduledNotifications();
    };
  
    setupNotifications();
  }, []);  
  
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen as keyof RootStackParamList;
      if (screen && screen === 'FeedbackScreen') {
        navigation.navigate('FeedbackScreen');
      }
    });

    return () => subscription.remove();
  }, [navigation]);

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
        <Stack.Screen options={{ headerShown: false}} name="OutfitSelection" component={OutfitSelection} />
        <Stack.Screen options={{ headerShown: true, title: 'フィードバック' }} name="FeedbackScreen" component={Feedback} />
      </Stack.Navigator>
  );
}