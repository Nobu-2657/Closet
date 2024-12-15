import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import config from '../../config';
import CustomButton from '../after_register/customButton';
import { AntDesign, Ionicons } from '@expo/vector-icons'; // Expoを使用している場合

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
  const [displayNameError, setDisplayNameError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    if (!text.trim()) {
      setDisplayNameError('表示名を入力してください');
    } else {
      setDisplayNameError('');
    }
  };

  const handleEmailChange = async (text: string) => {
    setEmail(text);
    if (!text.trim()) {
      setEmailError('メールアドレスを入力してください');
    } else if (!validateEmail(text)) {
      setEmailError('有効なメールアドレスを入力してください');
    } else {
      try {
        const response = await fetch(`http://${config.serverIP}:3000/api/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: text }),
        });
        const data = await response.json();
        if (!response.ok) {
          setEmailError('このメールアドレスは既に登録されています');
        } else {
          setEmailError('');
        }
      } catch (error) {
        setEmailError('メールアドレスの確認中にエラーが発生しました');
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError('パスワードを入力してください');
    } else if (!validatePassword(text)) {
      setPasswordError('パスワードは8文字以上である必要があります');
    } else {
      setPasswordError('');
    }
  };

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

      // 登録成功時の処理
      if (result.user) {
        // 表示名をAsyncStorageに保存
        await AsyncStorage.setItem('displayName', displayName);
        
        // ユーザーIDをAsyncStorageに保存
        if (result.user.id) {
          await AsyncStorage.setItem('userId', result.user.id);
        }
        
        // トーク��がある場合は保存
        if (result.token) {
          await AsyncStorage.setItem('userToken', result.token);
        }
      }

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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Login')}
      >
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Image 
            source={require('../images/ClosEt_logo.png')} // ロゴのパスを指定
            style={styles.logo} 
            resizeMode="contain" 
        />
      </View>
      <TextInput
        style={[styles.input, displayNameError ? styles.inputError : null]}
        placeholder="表示名"
        value={displayName}
        onChangeText={handleDisplayNameChange}
      />
      {displayNameError ? <Text style={styles.errorText}>{displayNameError}</Text> : null}

      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="メールアドレス"
        value={email}
        onChangeText={handleEmailChange}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, passwordError ? styles.inputError : null]}
          placeholder="パスワード"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={handlePasswordChange}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.visibilityToggle}>
          <Ionicons 
            name={showPassword ? 'eye-off' : 'eye'} 
            size={24} 
            color="gray"
          />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <CustomButton title="新規登録" onPress={handleRegister} />
      {message ? <Text>{message}</Text> : null}
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
});

export default Register;
