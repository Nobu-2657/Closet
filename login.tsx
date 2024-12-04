import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import config from '../../config';
import CustomButton from '../after_register/customButton';
import { Ionicons } from '@expo/vector-icons'; // Expoを使用している場合

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  userEdit: undefined;
};
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type Props = {
  navigation: LoginScreenNavigationProp;
};

const Login = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    }

    const handleLogin = async () => {
      try {
        const response = await fetch(`http://${config.serverIP}:3000/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          if (data.user) {
            if (data.user.displayName) {
              await AsyncStorage.setItem('displayName', data.user.displayName);
            }
            if (data.user.id) {
              await AsyncStorage.setItem('userId', data.user.id);
            }
          }
          if (data.token) {
            await AsyncStorage.setItem('userToken', data.token);
          }
          navigation.navigate('Main');
        } else {
          Alert.alert('エラー', data.message || 'ログインに失敗しました');
        }
      } catch (error) {
        console.error('ログインエラー:', error);
        Alert.alert('エラー', 'ログイン中に問題が発生しました。');
      }
    };

    return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
            source={require('../images/ClosEt_logo.png')} // ロゴのパスを指定
            style={styles.logo} 
            resizeMode="contain" 
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="パスワード"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.visibilityToggle}>
          <Ionicons 
            name={showPassword ? 'eye-off' : 'eye'} 
            size={24} 
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <CustomButton title="ログイン" onPress={handleLogin} />
      {message ? <Text>{message}</Text> : null}
      <CustomButton 
        title="新規登録はこちら"
        onPress={() => navigation.navigate('Register')}
        whiteBackground={true}
      />
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center', // ロゴを中央揃え
    },
    logo: {
      width: 300, // ロゴの幅を指定
      height: 100, // ロゴの高さを指定
      marginBottom: 80, // ロゴとタイトルの間にスペースを追加
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        width: '80%',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      width: '80%',
    },
    passwordInput: {
      flex: 1,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      paddingHorizontal: 10,
      borderRadius: 10,
    },
    visibilityToggle: {
      padding: 10,
      position: 'absolute',
      right: 0,
    },
});

export default Login;