import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import config from '../../config';
import CustomButton from '../after_register/customButton';
import { Ionicons } from '@expo/vector-icons'; // Expoを使用している場合

type RootStackParamList = {
  Login: undefined;
  NewLogin: undefined;
  Main: undefined;
  userEdit: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type Props = {
  navigation: HomeScreenNavigationProp;
};

const Register = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return false;
    }
  
    if (emailError || passwordError) {
      Alert.alert('エラー', '入力内容に誤りがあります。修正してください。');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch(`http://${config.serverIP}:3000/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '登録に失敗しました');
      }

      // 表示名をAsyncStorageに保存
      await AsyncStorage.setItem('displayName', displayName);

      Alert.alert('成功', `登録が完了しました！表示名: ${displayName}`);
      navigation.navigate('Main');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('エラー', '登録中にエラーが発生しました: ' + error.message);
      } else {
        Alert.alert('エラー', '予期せぬエラーが発生しました');
      }
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
        placeholder="表示名"
        value={displayName}
        onChangeText={setDisplayName}
      />
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
      <CustomButton title="新規登録" onPress={handleRegister} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginTop: 120,
    marginBottom: 80, // ロゴとタイトルの間にスペースを追加
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white'
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

export default Register;
