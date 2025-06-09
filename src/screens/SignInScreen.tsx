<<<<<<< HEAD
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type NavProps = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<NavProps>();

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, senha)
      .then(() => {
        console.log('Usuário autenticado');
        navigation.navigate('Main');
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Erro ao autenticar', 'Verifique seu e-mail e senha.');
      });
  };

  const handleCadastro = () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha e-mail e senha para cadastrar.');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, senha)
      .then(() => {
        Alert.alert('Cadastro realizado', 'Usuário criado com sucesso!');
        navigation.navigate('Main');
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Erro ao cadastrar', 'Verifique os dados informados.');
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require('../assets/logo.png')} // ajuste se necessário
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={handleCadastro}>
          <Text style={styles.registerText}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
=======
import React, {useState} from 'react';
import {View, Image} from 'react-native';
import auth from '@react-native-firebase/auth';

import {styles} from './styles';

import logo from '../assets/logo.png';
import {MyButton} from '../components/MyButton';
import {MyTextInput} from '../components/MyTextInput';
import {MyLink} from '../components/MyLink';

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function signUp() {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  }

  function signIn() {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('user is authenticated');
      })
      .catch(error => {
        console.error(error);
      });
  }

  return (
    <View style={[styles.container, {justifyContent: 'center'}]}>
      <Image resizeMode="contain" source={logo} style={{width: 200}} />
      <MyTextInput placeholder="e-mail" value={email} onChangeText={setEmail} />
      <MyTextInput
        placeholder="senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <MyButton onPress={signIn} title="Entrar no App" />

      <MyLink title="Cadastrar" onPress={signUp} />
    </View>
  );
}
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
